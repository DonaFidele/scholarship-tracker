'use client'

import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { ResultCards } from '@/components/search/result-cards'
import { ResultTable } from '@/components/search/result-table'
import type { RankedResult, Scholarship } from '@/lib/types'

export function ResultGroup({
  title,
  icon,
  results,
  savedLinks,
  savingLink,
  onSave,
}: {
  title?: string
  icon?: ReactNode
  results: RankedResult[]
  savedLinks: string[]
  savingLink: string | null
  onSave: (scholarship: Scholarship) => void
}) {
  if (results.length === 0) return null
  return (
    <section className="flex flex-col gap-3">
      {title && (
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {icon}
          {title}
          <Badge variant="secondary">{results.length}</Badge>
        </h2>
      )}
      <div className="hidden md:block">
        <ResultTable results={results} savedLinks={savedLinks} savingLink={savingLink} onSave={onSave} />
      </div>
      <div className="md:hidden">
        <ResultCards results={results} savedLinks={savedLinks} savingLink={savingLink} onSave={onSave} />
      </div>
    </section>
  )
}
