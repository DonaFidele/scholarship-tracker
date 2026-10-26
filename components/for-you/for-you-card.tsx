'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { ExternalLink, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeadlineBadge } from '@/components/deadline-badge'
import { SaveButton } from '@/components/search/save-button'
import { RecommendationNote } from '@/components/search/recommendation-note'
import { SourceTag } from '@/components/for-you/source-tag'
import {
  BeninBadge,
  CoverageBadge,
  FeeWarningBadge,
  LevelBadge,
} from '@/components/scholarship/metadata-badges'
import { formatDateFr } from '@/lib/format'
import { scholarshipKey } from '@/lib/scholarship-key'
import type { RankedResult, Scholarship } from '@/lib/types'

const FADE_OUT_MS = 200

export function ForYouCard({
  result,
  saved,
  saving,
  onSave,
  onDismiss,
}: {
  result: RankedResult
  saved: boolean
  saving: boolean
  onSave: (scholarship: Scholarship) => void
  onDismiss: (id: string) => void
}) {
  const s = result
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleDismiss = () => {
    setLeaving(true)
    timer.current = setTimeout(() => onDismiss(scholarshipKey(s)), FADE_OUT_MS)
  }

  return (
    <li
      className={cn(
        'transition-opacity duration-200 motion-reduce:transition-none',
        leaving && 'pointer-events-none opacity-0',
      )}
    >
      <Card
        className={cn(
          'h-full',
          s.recommendation?.recommended && 'border-l-2 border-l-primary bg-primary/10',
        )}
      >
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SourceTag source={s.source} />
          </div>
          <RecommendationNote recommendation={s.recommendation} />
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
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          ) : null}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <SaveButton
              saved={saved}
              saving={saving}
              onClick={() => onSave(s)}
              className="h-10 flex-1"
            />
            <Button
              variant="ghost"
              className="h-10"
              aria-label={`Pas intéressé par ${s.name}`}
              onClick={handleDismiss}
            >
              <X data-icon="inline-start" />
              Pas intéressé
            </Button>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}
