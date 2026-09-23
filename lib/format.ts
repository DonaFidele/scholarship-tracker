const frDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Formats "2026-03-12" as "12 mars 2026". Returns "" for null/invalid dates. */
export function formatDateFr(date: string | null): string {
  if (!date) return ''
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return ''
  return frDate.format(parsed)
}
