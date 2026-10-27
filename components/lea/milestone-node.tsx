'use client'

import { useId, useState } from 'react'
import { cn } from 'cn'
import { Check, ClockAlert, Ellipsis, History, Play, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MilestoneEditRow } from '@/components/lea/milestone-edit-row'
import { MilestoneHistoryStack } from '@/components/lea/milestone-history-stack'
import { MilestoneRatePrompt } from '@/components/lea/milestone-rate-prompt'
import { formatDateFr } from '@/lib/format'
import { addedAt, isLate, statusLabels } from '@/lib/milestone-helpers'
import type { MilestoneStatus, PlanMilestone } from '@/lib/types'

const circleStyles: Record<MilestoneStatus, string> = {
  fait: 'bg-emerald-500 text-background',
  en_cours: 'bg-indigo-500 text-background',
  a_faire: 'border-2 border-muted-foreground/50 bg-background',
  rate: 'bg-muted-foreground text-background',
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function MilestoneNode({
  milestone,
  currentSemesterIndex,
  isLast,
  editing,
  canTrack,
  highlighted,
  semesterItems,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  milestone: PlanMilestone
  currentSemesterIndex: number
  isLast: boolean
  editing: boolean
  canTrack: boolean
  highlighted: boolean
  semesterItems: { value: string; label: string }[]
  onStatusChange: (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => void
  onEdit: (
    id: string,
    newTitle: string,
    semesterLabel: string,
    semesterIndex: number,
    reason?: string | null,
  ) => void
  onDelete: (id: string) => void
}) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)
  const historyId = useId()

  const { status } = milestone
  const late = isLate(milestone, currentSemesterIndex)
  const created = addedAt(milestone)

  return (
    <li
      id={`milestone-${milestone.id}`}
      className={cn('relative flex scroll-mt-24 gap-3', !isLast && 'pb-5')}
    >
      {!isLast ? (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-7 bottom-0 left-[11px] w-0.5',
            status === 'fait' ? 'bg-emerald-500' : 'bg-border',
          )}
        />
      ) : null}

      <span
        aria-hidden="true"
        className={cn(
          'relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
          circleStyles[status],
          late &&
            'ring-2 ring-amber-500 ring-offset-2 ring-offset-background',
          late && status === 'a_faire' && 'border-amber-500',
        )}
      >
        {status === 'en_cours' ? (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-indigo-500/50 motion-reduce:animate-none"
            />
            <span
              aria-hidden="true"
              className="relative size-2 rounded-full bg-background"
            />
          </>
        ) : null}
        {status === 'fait' ? (
          <Check aria-hidden="true" className="size-3.5" />
        ) : null}
        {status === 'rate' ? (
          <X aria-hidden="true" className="size-3.5" />
        ) : null}
        {late ? (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-background"
          >
            <ClockAlert className="size-2.5" />
          </span>
        ) : null}
      </span>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-2 rounded-lg transition-colors',
          highlighted && 'bg-accent ring-4 ring-accent',
        )}
      >
        {editing ? (
          <MilestoneEditRow
            milestone={milestone}
            semesterItems={semesterItems}
            onEdit={(title, label, index) =>
              onEdit(milestone.id, title, label, index)
            }
            onDelete={() => onDelete(milestone.id)}
          />
        ) : (
          <p
            className={cn(
              'text-sm leading-snug font-medium text-pretty',
              status === 'rate' && 'text-muted-foreground line-through',
            )}
          >
            {milestone.title}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">
            {capitalize(statusLabels[status])}
          </span>
          {late ? (
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/50 text-amber-700 dark:text-amber-300"
            >
              <ClockAlert aria-hidden="true" className="size-3" />
              En retard
            </Badge>
          ) : null}
          {milestone.added_after_validation && created ? (
            <Badge variant="outline" className="text-muted-foreground">
              Ajoutée le {formatDateFr(created)}
            </Badge>
          ) : null}
        </div>

        {canTrack ? (
          <div className="flex flex-wrap items-center gap-1">
            {status === 'a_faire' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(milestone.id, 'en_cours')}
              >
                <Play data-icon="inline-start" />
                Je commence
              </Button>
            ) : null}
            {status === 'en_cours' ? (
              <Button
                size="sm"
                onClick={() => onStatusChange(milestone.id, 'fait')}
              >
                <Check data-icon="inline-start" />
                C’est fait
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    aria-label={`Plus d’actions pour l’étape ${milestone.title}`}
                  />
                }
              >
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {status === 'a_faire' ? (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(milestone.id, 'fait')}
                  >
                    <Check />
                    Déjà terminée
                  </DropdownMenuItem>
                ) : null}
                {status === 'a_faire' || status === 'en_cours' ? (
                  <DropdownMenuItem onClick={() => setRateOpen(true)}>
                    <X />
                    Je n’ai pas pu la faire
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem onClick={() => setHistoryOpen((v) => !v)}>
                  <History />
                  {historyOpen ? 'Masquer l’historique' : 'Voir l’historique'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        <div aria-live="polite" className="empty:hidden">
          {rateOpen ? (
            <MilestoneRatePrompt
              title={milestone.title}
              onCancel={() => setRateOpen(false)}
              onLeave={(reason) => {
                onStatusChange(milestone.id, 'rate', reason)
                setRateOpen(false)
              }}
              onAdjust={(newTitle, reason) => {
                onStatusChange(milestone.id, 'rate', reason)
                onEdit(
                  milestone.id,
                  newTitle,
                  milestone.semester_label,
                  milestone.semester_index,
                  reason,
                )
                setRateOpen(false)
              }}
            />
          ) : null}
        </div>

        <div id={historyId}>
          {historyOpen ? <MilestoneHistoryStack milestone={milestone} /> : null}
        </div>
      </div>
    </li>
  )
}
