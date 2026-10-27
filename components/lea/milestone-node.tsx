'use client'

import { useState } from 'react'
import { cn } from 'cn'
import {
  ArrowRightLeft,
  Check,
  ClockAlert,
  Ellipsis,
  History,
  ListPlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MilestoneHistoryStack } from '@/components/lea/milestone-history-stack'
import { MilestoneRatePrompt } from '@/components/lea/milestone-rate-prompt'
import { MilestoneStatusMenu } from '@/components/lea/milestone-status-menu'
import { SubGoalList } from '@/components/lea/sub-goal-list'
import { formatDateFr } from '@/lib/format'
import { addedAt, isLate } from '@/lib/milestone-helpers'
import {
  deleteMilestone,
  editMilestone,
  type PlanUpdater,
} from '@/lib/plan-actions'
import type { MilestoneStatus, PlanMilestone } from '@/lib/types'

const circleStyles: Record<MilestoneStatus, string> = {
  fait: 'bg-emerald-500 text-background',
  en_cours: 'bg-indigo-500 text-background',
  a_faire: 'border-2 border-muted-foreground/50 bg-background',
  rate: 'bg-amber-500 text-background',
}

export type SemesterTarget = { index: number; label: string; full: boolean }

export function MilestoneNode({
  milestone,
  currentSemesterIndex,
  isLast,
  isDraft,
  highlighted,
  canDelete,
  moveTargets,
  onStatusChange,
  onUpdate,
}: {
  milestone: PlanMilestone
  currentSemesterIndex: number
  isLast: boolean
  isDraft: boolean
  highlighted: boolean
  canDelete: boolean
  moveTargets: SemesterTarget[]
  onStatusChange: (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => void
  onUpdate: (updater: PlanUpdater) => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState(milestone.title)
  const [addingSubGoal, setAddingSubGoal] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [rateOpen, setRateOpen] = useState(false)

  const { status } = milestone
  const late = !isDraft && isLate(milestone, currentSemesterIndex)
  const created = addedAt(milestone)

  const commitTitle = () => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== milestone.title) {
      onUpdate((plan) =>
        editMilestone(plan, milestone.id, trimmed, milestone.semester_index, null),
      )
    } else {
      setTitle(milestone.title)
    }
    setEditingTitle(false)
  }

  const handleStatusSelect = (next: MilestoneStatus) => {
    if (next === status) return
    if (next === 'rate') {
      setRateOpen(true)
      return
    }
    setRateOpen(false)
    onStatusChange(milestone.id, next)
  }

  return (
    <li
      id={`milestone-${milestone.id}`}
      className={cn('relative flex scroll-mt-24 gap-3', !isLast && 'pb-6')}
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
          'relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full',
          circleStyles[status],
          late && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-background',
        )}
      >
        {status === 'en_cours' ? (
          <span className="size-2 rounded-full bg-background" />
        ) : null}
        {status === 'fait' ? <Check className="size-3.5" /> : null}
        {status === 'rate' ? <X className="size-3.5" /> : null}
      </span>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-2 rounded-lg transition-colors',
          highlighted && 'bg-accent ring-4 ring-accent',
        )}
      >
        <div className="flex items-start gap-2">
          {editingTitle ? (
            <Input
              value={title}
              autoFocus
              aria-label="Titre de l’objectif"
              className="h-8 flex-1"
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.currentTarget.blur()
                }
                if (e.key === 'Escape') {
                  setTitle(milestone.title)
                  setEditingTitle(false)
                }
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className={cn(
                'min-w-0 flex-1 rounded-sm pt-1 text-left text-sm leading-snug font-medium text-pretty outline-none hover:underline hover:decoration-muted-foreground/50 hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring/50',
                status === 'rate' && 'text-muted-foreground line-through',
              )}
              aria-label={`Modifier le titre : ${milestone.title}`}
            >
              {milestone.title}
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 text-muted-foreground"
                  aria-label={`Gérer l’objectif ${milestone.title}`}
                />
              }
            >
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuItem onClick={() => setEditingTitle(true)}>
                <Pencil />
                Renommer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddingSubGoal(true)}>
                <ListPlus />
                Ajouter un sous-objectif
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger disabled={!canDelete}>
                  <ArrowRightLeft />
                  Déplacer vers…
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {moveTargets.map((target) => (
                    <DropdownMenuItem
                      key={target.index}
                      disabled={target.full}
                      onClick={() =>
                        onUpdate((plan) =>
                          editMilestone(
                            plan,
                            milestone.id,
                            milestone.title,
                            target.index,
                            null,
                          ),
                        )
                      }
                    >
                      {target.label}
                      {target.full ? (
                        <span className="ml-auto text-xs text-muted-foreground">
                          complet
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {!isDraft ? (
                <DropdownMenuItem onClick={() => setHistoryOpen((v) => !v)}>
                  <History />
                  {historyOpen ? 'Masquer l’historique' : 'Voir l’historique'}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={!canDelete}
                onClick={() => onUpdate((plan) => deleteMilestone(plan, milestone.id))}
              >
                <Trash2 />
                {canDelete ? 'Supprimer' : 'Seul objectif du semestre'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isDraft || late || (milestone.added_after_validation && created) ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {!isDraft ? (
              <MilestoneStatusMenu
                title={milestone.title}
                status={status}
                onSelect={handleStatusSelect}
              />
            ) : null}
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
                Ajouté le {formatDateFr(created)}
              </Badge>
            ) : null}
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
                onUpdate((plan) =>
                  editMilestone(
                    plan,
                    milestone.id,
                    newTitle,
                    milestone.semester_index,
                    reason,
                  ),
                )
                onStatusChange(milestone.id, 'a_faire', reason)
                setTitle(newTitle)
                setRateOpen(false)
              }}
            />
          ) : null}
        </div>

        <SubGoalList
          milestone={milestone}
          canCheck={!isDraft}
          adding={addingSubGoal}
          onAddingChange={setAddingSubGoal}
          onUpdate={onUpdate}
        />

        {historyOpen ? <MilestoneHistoryStack milestone={milestone} /> : null}
      </div>
    </li>
  )
}
