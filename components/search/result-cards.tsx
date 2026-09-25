'use client'

import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DeadlineBadge } from '@/components/deadline-badge'
import { SaveButton } from '@/components/search/save-button'
import {
  BeninBadge,
  CoverageBadge,
  FeeWarningBadge,
  LevelBadge,
} from '@/components/scholarship/metadata-badges'
import { formatDateFr } from '@/lib/format'
import type { Scholarship } from '@/lib/types'

export function ResultCards({
  results,
  savedLinks,
  savingLink,
  onSave,
}: {
  results: Scholarship[]
  savedLinks: string[]
  savingLink: string | null
  onSave: (scholarship: Scholarship) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {results.map((s) => (
        <Card key={s.link ?? s.name}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-pretty font-medium leading-snug">{s.name}</h3>
              <DeadlineBadge deadline={s.deadline} className="mt-0.5 shrink-0" />
            </div>
            {(s.level || s.coverage || s.asks_fee === true) && (
              <div className="flex flex-wrap items-center gap-1.5">
                <LevelBadge value={s.level} />
                <CoverageBadge value={s.coverage} />
                <FeeWarningBadge show={s.asks_fee} />
              </div>
            )}
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Montant</dt>
                <dd className="text-right">{s.amount ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Deadline</dt>
                <dd className="text-right">
                  {s.deadline ? formatDateFr(s.deadline) : 'Non précisée'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Pays</dt>
                <dd className="flex items-center gap-2 text-right">
                  <span>{s.country ?? '—'}</span>
                  {s.benin_eligible && s.benin_eligible !== 'unknown' && (
                    <BeninBadge value={s.benin_eligible} />
                  )}
                </dd>
              </div>
            </dl>
            {s.link ? (
              <a
                href={s.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Voir la source
                <ExternalLink className="size-3.5" />
              </a>
            ) : null}
            <SaveButton
              saved={savedLinks.includes(s.link ?? s.name)}
              saving={savingLink === (s.link ?? s.name)}
              onClick={() => onSave(s)}
              className="h-10 w-full"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}