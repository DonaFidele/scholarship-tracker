import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Scholarship } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 30

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const GENERIC_SEARCH_ERROR =
  'Une erreur est survenue pendant la recherche.'
const UPSTREAM_ERROR = 'Le service de recherche est temporairement indisponible.'

type TavilyResult = {
  title?: string
  url?: string
  content?: string
}

type GeminiScholarship = {
  name?: unknown
  amount?: unknown
  deadline?: unknown
  country?: unknown
  source?: unknown
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
      return NextResponse.json(
        { error: 'Requête invalide.' },
        { status: 400 },
      )
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
    const geminiKey = process.env.GEMINI_API_KEY
    if (!tavilyKey || !geminiKey) {
      console.error('Missing TAVILY_API_KEY or GEMINI_API_KEY')
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

Règles:
- N'INVENTE RIEN. Si une information n'est pas dans l'extrait, mets null.
- Ignore les pages qui ne décrivent pas une bourse précise.
- Réponds uniquement avec un JSON de la forme: {"scholarships":[...]}

Extraits:
${extracts}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
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
    )

    if (!geminiRes.ok) {
      console.error(
        'Gemini generateContent failed',
        geminiRes.status,
        await geminiRes.text(),
      )
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    let geminiJson: unknown
    try {
      geminiJson = await geminiRes.json()
    } catch (err) {
      console.error('Gemini response is not JSON', err)
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    const rawText = extractGeminiText(geminiJson)
    if (!rawText) {
      console.error('Gemini response missing text', geminiJson)
      return NextResponse.json({ error: UPSTREAM_ERROR }, { status: 502 })
    }

    let extracted: GeminiScholarship[]
    try {
      extracted = parseGeminiScholarships(rawText)
    } catch (err) {
      console.error('Gemini JSON parse failed', err, rawText)
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
      })
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('Unexpected search error', err)
    return NextResponse.json({ error: GENERIC_SEARCH_ERROR }, { status: 500 })
  }
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

function parseGeminiScholarships(text: string): GeminiScholarship[] {
  const parsed: unknown = JSON.parse(text)
  if (Array.isArray(parsed)) return parsed as GeminiScholarship[]
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as { scholarships?: unknown; results?: unknown }
    if (Array.isArray(obj.scholarships)) return obj.scholarships as GeminiScholarship[]
    if (Array.isArray(obj.results)) return obj.results as GeminiScholarship[]
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
