'use client'

import { cn } from 'cn'
import { Card, CardContent } from '@/components/ui/card'
import { StatusSelect } from '@/components/applications/status-select'
import { DeadlineCell } from '@/components/applications/deadline-cell'
import { DeleteDialog } from '@/components/applications/delete-dialog'
import { DeadlineBadge } from '@/components/deadline-badge'
import { DossierProgress } from '@/components/applications/dossier-progress'
import { FavoriteToggle } from '@/components/applications/favorite-toggle'
import { MetadataBadges } from '@/components/scholarship/metadata-badges'
import { daysLeft } from '@/lib/deadline'
import type { ApplicationStatus, ApplicationWithChecklist } from '@/lib/types'

/** Stops the card-level click from firing when using inline controls. */
function stop(e: React.MouseEvent) {
  e.stopPropagation()
}

export function ApplicationCards({
  applications,
  onStatusChange,
  onDeadlineChange,
  onDelete,
  onToggleFavorite,
  onOpenApplication,
}: {
  applications: ApplicationWithChecklist[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onDeadlineChange: (id: string, deadline: string | null) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string, value: boolean) => void
  onOpenApplication: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      {applications.map((a) => {
        const days = daysLeft(a.deadline)
        const expired = days !== null && days < 0
        const urgent = days !== null && days >= 0 && days <= 3
        return (
          <Card
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpenApplication(a.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenApplication(a.id)
              }
            }}
            className={cn(
              'cursor-pointer border-l-2 border-l-transparent transition-colors hover:border-border hover:bg-muted/30',
              expired && 'opacity-60',
              urgent && 'border-l-red-500',
            )}
          >
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div onClick={stop}>
                  <FavoriteToggle
                    value={a.is_favorite}
                    onToggle={(v) => onToggleFavorite(a.id, v)}
                    className="-ml-2 -mt-2"
                  />
                </div>
                <DeadlineBadge deadline={a.deadline} className="mt-0.5 shrink-0" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-medium leading-snug">{a.name}</span>
                <MetadataBadges
                  level={a.level}
                  coverage={a.coverage}
                  benin={a.benin_eligible}
                  asksFee={a.asks_fee}
                />
                {a.country && (
                  <span className="text-xs text-muted-foreground">
                    {a.country}
                  </span>
                )}
              </div>

              {a.amount && (
                <p className="text-sm text-muted-foreground">{a.amount}</p>
              )}

              <DossierProgress items={a.checklist_items} />

              <div className="flex flex-col gap-2" onClick={stop}>
                <span className="text-xs font-medium text-muted-foreground">
                  Date limite
                </span>
                <DeadlineCell
                  deadline={a.deadline}
                  onChange={(d) => onDeadlineChange(a.id, d)}
                />
              </div>

              <div
                className="flex items-center justify-between gap-2"
                onClick={stop}
              >
                <StatusSelect
                  value={a.status}
                  onChange={(s) => onStatusChange(a.id, s)}
                />
                <DeleteDialog name={a.name} onConfirm={() => onDelete(a.id)} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
