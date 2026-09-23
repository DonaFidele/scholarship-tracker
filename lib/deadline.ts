export type DeadlineTone = 'muted' | 'expired' | 'danger' | 'warning' | 'ok'

/**
 * Number of days between today and the deadline (UTC-based so server and
 * client render identically). Returns null when no valid deadline is set.
 */
export function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null

  const parts = deadline.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null

  const [year, month, day] = parts
  const target = Date.UTC(year, month - 1, day)

  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())

  return Math.round((target - today) / 86_400_000)
}

export function deadlineState(days: number | null): {
  label: string
  tone: DeadlineTone
} {
  if (days === null) return { label: 'Non précisée', tone: 'muted' }
  if (days < 0) return { label: 'Expirée', tone: 'expired' }
  if (days <= 3) return { label: `J-${days}`, tone: 'danger' }
  if (days <= 7) return { label: `J-${days}`, tone: 'warning' }
  return { label: `J-${days}`, tone: 'ok' }
}
