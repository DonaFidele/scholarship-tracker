import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const maxDuration = 60

const DAY_MS = 86_400_000
const DEFAULT_REMINDER_DAYS = [7, 3, 1]

type ApplicationRow = {
  id: string
  user_id: string
  name: string
  deadline: string
  status: 'todo' | 'in_progress'
}

type Reminder = ApplicationRow & {
  daysBefore: number
  documentsReady: number
  documentsTotal: number
}

type UserSettingsRow = {
  user_id: string
  email_reminders: boolean | null
  reminder_days: number[] | null
}

function getTodayInBenin(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Porto-Novo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

function differenceInDays(later: string, earlier: string): number {
  const parse = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return Date.UTC(year, month - 1, day)
  }
  return (parse(later) - parse(earlier)) / DAY_MS
}

function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

function maskEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  return `${local.slice(0, 1)}***@${domain}`
}

function jsonError(status: number, message: string) {
  return NextResponse.json(
    { error: message, checked: 0, users: 0, sent: 0, skipped: 0, errors: 1 },
    { status },
  )
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return jsonError(500, 'Configuration cron manquante.')
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return jsonError(401, 'Non autorisé.')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const resendApiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !from || !appUrl) {
    console.error('Cron reminders configuration is incomplete')
    return jsonError(500, 'Configuration des rappels incomplète.')
  }

  const dryRun = new URL(request.url).searchParams.get('dry') === '1'
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const resend = new Resend(resendApiKey)
  const today = getTodayInBenin()
  const through = addDays(today, 7)
  const { data: applications, error: applicationsError } = await admin
    .from('applications')
    .select('id, user_id, name, deadline, status')
    .in('status', ['todo', 'in_progress'])
    .not('deadline', 'is', null)
    .gte('deadline', today)
    .lte('deadline', through)

  if (applicationsError) {
    console.error('Cron reminders could not load applications', applicationsError)
    return jsonError(500, 'Impossible de charger les candidatures.')
  }

  const rows = (applications ?? []) as ApplicationRow[]
  const checked = rows.length
  const dateCandidates = rows.flatMap((application) => {
    const daysBefore = differenceInDays(application.deadline, today)
    return [7, 3, 1].includes(daysBefore)
      ? [{ ...application, daysBefore }]
      : []
  })
  let skipped = rows.length - dateCandidates.length
  if (dateCandidates.length === 0) {
    return NextResponse.json({ checked, users: 0, sent: 0, skipped, errors: 0, ...(dryRun ? { dryRun: true, details: [] } : {}) })
  }

  const userIds = [...new Set(dateCandidates.map((application) => application.user_id))]
  const applicationIds = dateCandidates.map((application) => application.id)
  const [{ data: settingsRows, error: settingsError }, { data: logs, error: logsError }] = await Promise.all([
    admin.from('user_settings').select('user_id, email_reminders, reminder_days').in('user_id', userIds),
    admin.from('reminder_log').select('application_id, deadline, days_before').in('application_id', applicationIds),
  ])
  if (settingsError || logsError) {
    console.error('Cron reminders could not load settings or logs', settingsError ?? logsError)
    return jsonError(500, 'Impossible de charger les préférences de rappel.')
  }

  const settingsByUser = new Map<string, UserSettingsRow>(
    ((settingsRows ?? []) as UserSettingsRow[]).map((setting) => [setting.user_id, setting]),
  )
  const logged = new Set(
    (logs ?? []).map((entry) => JSON.stringify([entry.application_id, entry.deadline, entry.days_before])),
  )
  const reminders: Reminder[] = []
  for (const candidate of dateCandidates) {
    const setting = settingsByUser.get(candidate.user_id)
    const enabled = setting?.email_reminders ?? true
    const days = setting?.reminder_days ?? DEFAULT_REMINDER_DAYS
    if (!enabled || !days.includes(candidate.daysBefore)) {
      skipped += 1
      continue
    }
    if (logged.has(JSON.stringify([candidate.id, candidate.deadline, candidate.daysBefore]))) {
      skipped += 1
      continue
    }
    reminders.push({ ...candidate, documentsReady: 0, documentsTotal: 0 })
  }

  if (reminders.length === 0) {
    return NextResponse.json({ checked, users: 0, sent: 0, skipped, errors: 0, ...(dryRun ? { dryRun: true, details: [] } : {}) })
  }

  const reminderAppIds = [...new Set(reminders.map((reminder) => reminder.id))]
  const { data: checklistRows, error: checklistError } = await admin
    .from('checklist_items')
    .select('application_id, is_done')
    .in('application_id', reminderAppIds)
  if (checklistError) {
    console.error('Cron reminders could not load checklists', checklistError)
    return jsonError(500, 'Impossible de charger les dossiers.')
  }
  const progress = new Map<string, { ready: number; total: number }>()
  for (const item of checklistRows ?? []) {
    const current = progress.get(item.application_id) ?? { ready: 0, total: 0 }
    current.total += 1
    if (item.is_done) current.ready += 1
    progress.set(item.application_id, current)
  }
  for (const reminder of reminders) {
    const current = progress.get(reminder.id) ?? { ready: 0, total: 0 }
    reminder.documentsReady = current.ready
    reminder.documentsTotal = current.total
  }

  const grouped = new Map<string, Reminder[]>()
  for (const reminder of reminders) {
    const group = grouped.get(reminder.user_id) ?? []
    group.push(reminder)
    grouped.set(reminder.user_id, group)
  }

  const users = grouped.size
  if (dryRun) {
    const details = []
    for (const [userId, userReminders] of grouped) {
      const { data: userData, error } = await admin.auth.admin.getUserById(userId)
      if (error) {
        console.error('Cron reminders could not read account', { userId, error })
        details.push({ email: '***', scholarships: userReminders.map(toPublicReminder) })
      } else {
        details.push({ email: maskEmail(userData.user.email), scholarships: userReminders.map(toPublicReminder) })
      }
    }
    return NextResponse.json({ checked, users, sent: 0, skipped, errors: 0, dryRun: true, details })
  }

  let sent = 0
  let errors = 0
  for (const [userId, userReminders] of grouped) {
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
    const email = userData.user?.email
    if (userError || !email) {
      errors += 1
      console.error('Cron reminders skipped a user without email', { userId, error: userError })
      continue
    }

    const subject = userReminders.length === 1
      ? `⏰ ${safeSubject(userReminders[0].name)} : J-${userReminders[0].daysBefore}`
      : `⏰ ${userReminders.length} bourses arrivent à échéance`
    const html = buildEmail(userReminders, appUrl)
    const { error: sendError } = await resend.emails.send({ from, to: email, subject, html })
    if (sendError) {
      errors += 1
      console.error('Cron reminders email failed', { userId, error: sendError })
      continue
    }

    sent += 1
    const { error: logError } = await admin.from('reminder_log').insert(
      userReminders.map((reminder) => ({
        user_id: userId,
        application_id: reminder.id,
        deadline: reminder.deadline,
        days_before: reminder.daysBefore,
      })),
    )
    if (logError) {
      errors += 1
      console.error('Cron reminders could not write reminder log', { userId, error: logError })
    }
  }

  return NextResponse.json({ checked, users, sent, skipped, errors })
}

function toPublicReminder(reminder: Reminder) {
  return {
    name: reminder.name,
    days_before: reminder.daysBefore,
    deadline: reminder.deadline,
    documents_ready: reminder.documentsReady,
    documents_total: reminder.documentsTotal,
  }
}

function safeSubject(value: string): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, ' ').trim()
}

function buildEmail(reminders: Reminder[], appUrl: string): string {
  const items = reminders.map((reminder) => `
    <li style="margin:0 0 20px">
      <strong>${escapeHtml(reminder.name)}</strong> — J-${reminder.daysBefore}<br>
      Date limite : ${escapeHtml(formatDate(reminder.deadline))}<br>
      Progression du dossier : ${reminder.documentsReady}/${reminder.documentsTotal} documents prêts
    </li>`).join('')
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;line-height:1.6">
    <div style="max-width:600px;margin:32px auto;padding:24px;background:#fff;border-radius:12px">
      <p>Bonjour,</p>
      <p>${reminders.length === 1 ? 'Une bourse approche de sa date limite :' : 'Voici les bourses qui approchent de leur date limite :'}</p>
      <ul style="padding-left:20px">${items}</ul>
      <p><a href="${escapeHtml(`${appUrl}/applications`)}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Voir mes candidatures</a></p>
      <p style="color:#64748b">Vérifie toujours la date limite sur le site officiel.</p>
      <hr style="border:0;border-top:1px solid #e2e8f0;margin:24px 0">
      <p style="font-size:12px;color:#64748b"><a href="${escapeHtml(`${appUrl}/settings`)}">Gérer mes rappels</a></p>
    </div>
  </body></html>`
}
