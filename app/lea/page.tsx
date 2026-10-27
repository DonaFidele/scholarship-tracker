import type { Metadata } from 'next'
import { LeaPageClient } from '@/components/lea/lea-page-client'

export const metadata: Metadata = {
  title: 'Léa | Scholarship Tracker',
  description: 'Construis ton plan étape par étape avec Léa.',
}

export default async function LeaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; demo?: string | string[] }>
}) {
  const { q, demo } = await searchParams
  const prefillQuery = Array.isArray(q) ? q[0] : q
  const demoValue = Array.isArray(demo) ? demo[0] : demo
  return (
    <LeaPageClient prefillQuery={prefillQuery} demo={demoValue === '1'} />
  )
}
