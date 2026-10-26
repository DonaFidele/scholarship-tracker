import type { Metadata } from 'next'
import { LeaPageClient } from '@/components/lea/lea-page-client'

export const metadata: Metadata = {
  title: 'Léa | Scholarship Tracker',
  description: 'Construis ton plan étape par étape avec Léa.',
}

export default async function LeaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const { q } = await searchParams
  const prefillQuery = Array.isArray(q) ? q[0] : q
  return <LeaPageClient prefillQuery={prefillQuery} />
}
