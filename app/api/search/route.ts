import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Scholarship, Level, Coverage, BeninEligibility } from '@/lib/types'

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.8-flash'

export const runtime = 'nodejs'
export const maxDuration = 30

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const GENERIC_SEARCH_ERROR = 'Une erreur est survenue pendant la recherche.'
const UPSTREAM_ERROR = 'Le service de recherche est temporairement indisponible.'

const LEVELS: Level[] = ['licence', 'master', 'doctorat', 'autre']
const COVERAGES: Coverage[] = ['full', 'partial']

const STOPWORDS = new Set([
  'the', 'a', 'an', 'for', 'of', 'at', 'in', 'on', 'and', 'to',
  'scholarship', 'scholarships', 'program', 'programme', 'programs',
  'grant', 'award', 'fellowship', 'fund', 'funding', 'initiative',
  'process', 'application',
])

type TavilyResult = {
  title?: string
  url?: string
  content?: string
}

type ExtractedScholarship = {
  name?: unknown
  amount?: unknown
  deadline?: unknown
  country?: unknown
  source?: unknown
  level?: unknown
  coverage?: unknown
  benin_eligible?: unknown
  asks_fee?: unknown
}

type Provider = {
  name: string
  fetchOnce: () => Promise<Response>
  extractText: (json: unknown) => string | null
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
    }

    const query =
      typeof body === 'object' &&
      body !== null &&
      'query' in body &&
      typeof (body as { query: unknown }).query === 'string'
        ? (body as { query: string }).query.trim()
        : null

    if (!query || query.length < 3 || query.length > 200) {
      return NextResponse.json(
        { error: 'La requête doit contenir entre 3 et 200 caractères.' },
        { status: 400 },
      )
    }

    const tavilyKey = process.env.TAVILY_API_KEY
    if (!tavilyKey) {
      console.error('Missing TAVILY_API_KEY')
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    const tavilyRes = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tavilyKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${query} scholarship application deadline amount`,
        search_depth: 'advanced',
        max_results: 8,
        include_answer: false,
      }),
    })

    if (!tavilyRes.ok) {
      console.error('Tavily search failed', tavilyRes.status, await tavilyRes.text())
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    let tavilyJson: { results?: TavilyResult[] }
    try {
      tavilyJson = (await tavilyRes.json()) as { results?: TavilyResult[] }
    } catch (err) {
      console.error('Tavily response is not JSON', err)
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    const sources = (tavilyJson.results ?? []).filter(
      (r): r is TavilyResult & { url: string } =>
        typeof r.url === 'string' && r.url.length > 0,
    )

    if (sources.length === 0) {
      return NextResponse.json({ results: [] satisfies Scholarship[] })
    }

    const today = new Date().toISOString().slice(0, 10)
    const extracts = sources
      .map((source, i) => {
        const content = (source.content ?? '').slice(0, 1500)
        const title = source.title ?? ''
        return [
          `Extrait ${i + 1}`,
          `URL: ${source.url}`,
          `Titre: ${title}`,
          `Contenu: ${content}`,
        ].join('\n')
      })
      .join('\n\n')

    const prompt = `Tu es un extracteur de données. Date du jour: ${today}.

À partir des extraits web numérotés ci-dessous, extrais UNIQUEMENT les pages qui décrivent UNE bourse d'études précise (nom identifiable, pas un agrégateur, pas une page de catégorie, pas un article général).

Pour chaque bourse, renvoie un objet JSON avec:
- name: string (nom de la bourse)
- amount: string court ou null (montant / financement tel qu'écrit, sans inventer)
- deadline: string YYYY-MM-DD UNIQUEMENT si le jour, le mois ET l'année sont explicites dans l'extrait; sinon null. N'infère pas une année à partir de la date du jour. N'utilise pas de dates relatives.
- country: string ou null (pays / région de la bourse)
- source: number (numéro de l'extrait, commençant à 1)
- level: "licence" | "master" | "doctorat" | "autre" | null. Uniquement si le niveau est clairement indiqué dans l'extrait.
- coverage: "full" si la bourse couvre explicitement la scolarité ET une allocation de vie, ou est décrite comme "fully funded" / "full scholarship"; "partial" si elle est décrite comme partielle ou ne couvre qu'une partie; sinon null.
- benin_eligible: "yes" UNIQUEMENT si le Bénin est nommé explicitement, ou si le texte dit ouvert à toutes les nationalités / tous les pays, ou à un groupe dont le Bénin fait partie sans ambiguïté (ex: "pays africains", "pays en développement"). "no" UNIQUEMENT si le texte exclut explicitement le Bénin ou les Africains, ou réserve la bourse à une nationalité ou un pays précis dont le Bénin ne fait pas partie. Dans tous les autres cas: "unknown". EN CAS DE DOUTE: "unknown".
- asks_fee: true UNIQUEMENT si le texte indique explicitement que le candidat doit payer pour postuler (frais de dossier, de traitement, virement demandé); false si le texte dit explicitement qu'il n'y a pas de frais; sinon null.

Règles:
- N'INVENTE RIEN. Si une information n'est pas dans l'extrait, mets null (ou "unknown" pour benin_eligible).
- Ignore les pages qui ne décrivent pas une bourse précise.
- Réponds uniquement avec un JSON de la forme: {"scholarships":[...]}

Extraits:
${extracts}`

    const providers = buildProviders(prompt)

    if (providers.length === 0) {
      console.error('No AI provider configured')
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    let rawText: string | null = null

    for (const provider of providers) {
      const res = await tryProvider(provider.name, provider.fetchOnce)
      if (!res) continue

      let json: unknown
      try {
        json = await res.json()
      } catch (err) {
        console.error(`${provider.name} response is not JSON`, err)
        continue
      }

      const text = provider.extractText(json)
      if (text) {
        rawText = text
        console.log(`Extraction served by ${provider.name}`)
        break
      }
      console.error(`${provider.name} response missing text`, json)
    }

    if (!rawText) {
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    let extracted: ExtractedScholarship[]
    try {
      extracted = parseScholarshipsResponse(rawText)
    } catch (err) {
      console.error('AI response JSON parse failed', err, rawText)
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    const results: Scholarship[] = []
    const seenUrls = new Set<string>()

    for (const item of extracted) {
      const name = asNonEmptyString(item.name)
      const sourceIndex =
        typeof item.source === 'number'
          ? item.source
          : typeof item.source === 'string'
            ? Number(item.source)
            : NaN

      if (!name || !Number.isInteger(sourceIndex)) continue

      const source = sources[sourceIndex - 1]
      if (!source) continue

      const link = source.url
      if (seenUrls.has(link)) continue
      seenUrls.add(link)

      results.push({
        name,
        amount: asNonEmptyString(item.amount),
        deadline: normalizeDeadline(item.deadline),
        country: asNonEmptyString(item.country),
        link,
        level: asLevel(item.level),
        coverage: asCoverage(item.coverage),
        benin_eligible: asBeninEligibility(item.benin_eligible),
        asks_fee: asNullableBoolean(item.asks_fee),
      })
    }

    const deduped = dedupeScholarships(results)
    const active = deduped.filter((s) => !isExpired(s.deadline, today))

    return NextResponse.json({ results: active })
  } catch (err) {
    console.error('Unexpected search error', err)
    return NextResponse.json({ error: GENERIC_SEARCH_ERROR }, { status: 500 })
  }
}

function buildProviders(prompt: string): Provider[] {
  const providers: Provider[] = []

  const mistralKey = process.env.MISTRAL_API_KEY
  if (mistralKey) {
    providers.push({
      name: 'mistral',
      fetchOnce: buildOpenAiCompatibleRequest(
        'https://api.mistral.ai/v1/chat/completions',
        mistralKey,
        'mistral-small-latest',
        prompt,
        true,
      ),
      extractText: extractOpenAiCompatibleText,
    })
  }

  const cerebrasKey = process.env.CEREBRAS_API_KEY
  if (cerebrasKey) {
    providers.push({
      name: 'cerebras',
      fetchOnce: buildOpenAiCompatibleRequest(
        'https://api.cerebras.ai/v1/chat/completions',
        cerebrasKey,
        process.env.CEREBRAS_MODEL ?? 'llama3.1-8b',
        prompt,
        false,
      ),
      extractText: extractOpenAiCompatibleText,
    })
  }

  const groqKey = process.env.GROQ_API_KEY
  if (groqKey) {
    providers.push({
      name: 'groq',
      fetchOnce: buildOpenAiCompatibleRequest(
        'https://api.groq.com/openai/v1/chat/completions',
        groqKey,
        process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
        prompt,
        true,
      ),
      extractText: extractOpenAiCompatibleText,
    })
  }

  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    providers.push({
      name: 'gemini',
      fetchOnce: () =>
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0,
                responseMimeType: 'application/json',
              },
            }),
          },
        ),
      extractText: extractGeminiText,
    })
  }

  return providers
}

function buildOpenAiCompatibleRequest(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  useJsonMode: boolean,
): () => Promise<Response> {
  return () =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    })
}

async function tryProvider(
  name: string,
  fetchOnce: () => Promise<Response>,
): Promise<Response | null> {
  const delays = [1500, 3000]

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    let res: Response
    try {
      res = await fetchOnce()
    } catch (err) {
      console.error(`${name} fetch failed`, err)
      return null
    }

    if (res.ok) return res

    const status = res.status
    const bodyText = await res.text()
    const retryAfter = res.headers.get("retry-after")
    if (retryAfter) console.error(`${name} retry-after header:`, retryAfter)
    console.error(`${name} generateContent failed`, status, bodyText)

    const retryable = status === 429 || status === 503
    if (!retryable || attempt === delays.length) {
      return null
    }

    await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
  }

  return null
}

function extractGeminiText(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null
  const candidates = (data as { candidates?: unknown }).candidates
  if (!Array.isArray(candidates) || candidates.length === 0) return null
  const content = (candidates[0] as { content?: { parts?: unknown } }).content
  const parts = content?.parts
  if (!Array.isArray(parts) || parts.length === 0) return null
  const text = (parts[0] as { text?: unknown }).text
  return typeof text === 'string' && text.trim() ? text : null
}

function extractOpenAiCompatibleText(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null
  const choices = (data as { choices?: unknown }).choices
  if (!Array.isArray(choices) || choices.length === 0) return null
  const message = (choices[0] as { message?: { content?: unknown } }).message
  const content = message?.content
  return typeof content === 'string' && content.trim() ? content : null
}

function parseScholarshipsResponse(text: string): ExtractedScholarship[] {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON object found in AI response')
    parsed = JSON.parse(match[0])
  }

  if (Array.isArray(parsed)) return parsed as ExtractedScholarship[]
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as { scholarships?: unknown; results?: unknown }
    if (Array.isArray(obj.scholarships)) return obj.scholarships as ExtractedScholarship[]
    if (Array.isArray(obj.results)) return obj.results as ExtractedScholarship[]
  }
  return []
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.toLowerCase() === 'null') return null
  return trimmed
}

function normalizeDeadline(value: unknown): string | null {
  const raw = asNonEmptyString(value)
  if (!raw || !DATE_RE.test(raw)) return null
  if (Number.isNaN(Date.parse(raw))) return null
  return raw
}

function asLevel(value: unknown): Level | null {
  const raw = asNonEmptyString(value)
  if (!raw) return null
  return LEVELS.includes(raw as Level) ? (raw as Level) : null
}

function asCoverage(value: unknown): Coverage | null {
  const raw = asNonEmptyString(value)
  if (!raw) return null
  return COVERAGES.includes(raw as Coverage) ? (raw as Coverage) : null
}

function asBeninEligibility(value: unknown): BeninEligibility {
  const raw = asNonEmptyString(value)
  if (raw === 'yes' || raw === 'no') return raw
  return 'unknown'
}

function asNullableBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value
  return null
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(' ')
    .trim()
}

function dedupeScholarships(items: Scholarship[]): Scholarship[] {
  const byKey = new Map<string, Scholarship>()

  for (const item of items) {
    const key = `${normalizeName(item.name)}|${(item.country ?? '').toLowerCase()}`
    const existing = byKey.get(key)

    if (!existing) {
      byKey.set(key, item)
      continue
    }

    byKey.set(key, {
      ...existing,
      amount: existing.amount ?? item.amount,
      deadline: existing.deadline ?? item.deadline,
      country: existing.country ?? item.country,
      level: existing.level ?? item.level,
      coverage: existing.coverage ?? item.coverage,
      benin_eligible:
        existing.benin_eligible !== 'unknown' ? existing.benin_eligible : item.benin_eligible,
      asks_fee: existing.asks_fee ?? item.asks_fee,
    })
  }

  return Array.from(byKey.values())
}

function isExpired(deadline: string | null, today: string): boolean {
  return deadline !== null && deadline < today
}
