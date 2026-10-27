'use client'

import { useState } from 'react'
import { cn } from 'cn'
import { ChevronDown, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { MilestoneNode, type SemesterTarget } from '@/components/lea/milestone-node'
import {
  MAX_OBJECTIVES_PER_SEMESTER,
  MIN_OBJECTIVES_PER_SEMESTER,
  type SemesterGroup as SemesterGroupData,
} from '@/lib/milestone-helpers'
import { addMilestone, type PlanUpdater } from '@/lib/plan-actions'
import type { MilestoneStatus } from '@/lib/types'

function AddObjectiveInline({
  semesterIndex,
  onUpdate,
}: {
  semesterIndex: number
  onUpdate: (updater: PlanUpdater) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-fit border-dashed"
        onClick={() => setOpen(true)}
      >
        <Plus data-icon="inline-start" />
        Ajouter un objectif
      </Button>
    )
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault()
        const trimmed = title.trim()
        if (!trimmed) return
        onUpdate((plan) => addMilestone(plan, trimmed, semesterIndex))
        setTitle('')
        setOpen(false)
      }}
    >
      <Input
        value={title}
        autoFocus
        placeholder="Ex. : passer le test d’anglais"
        aria-label={`Nouvel objectif pour le semestre ${semesterIndex}`}
        className="h-9 flex-1"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setTitle('')
            setOpen(false)
          }
        }}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-9" disabled={!title.trim()}>
          Ajouter
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => {
            setTitle('')
            setOpen(false)
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}

export function SemesterGroup({
  group,
  currentSemesterIndex,
  open,
  onOpenChange,
  isDraft,
  highlightedId,
  semesterTargets,
  onStatusChange,
  onUpdate,
}: {
  group: SemesterGroupData
  currentSemesterIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  isDraft: boolean
  highlightedId: string | null
  semesterTargets: SemesterTarget[]
  onStatusChange: (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => void
  onUpdate: (updater: PlanUpdater) => void
}) {
  const total = group.milestones.length
  const done = group.milestones.filter((m) => m.status === 'fait').length
  const full = total >= MAX_OBJECTIVES_PER_SEMESTER
  const empty = total < MIN_OBJECTIVES_PER_SEMESTER
  const canDelete = total > MIN_OBJECTIVES_PER_SEMESTER
  const moveTargets = semesterTargets.filter((t) => t.index !== group.index)
  const isCurrent = group.index === currentSemesterIndex

  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'rounded-xl border bg-card',
        isCurrent ? 'border-indigo-500/40' : 'border-border',
        empty && 'border-amber-500/50',
      )}
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{group.label}</span>
          {isCurrent ? <Badge variant="secondary">Maintenant</Badge> : null}
          <span className="text-xs text-muted-foreground tabular-nums">
            {isDraft
              ? `${total}/${MAX_OBJECTIVES_PER_SEMESTER} objectifs`
              : `${done}/${total} terminé${done > 1 ? 's' : ''}`}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-4 border-t border-border px-4 pt-4 pb-4">
          {empty ? (
            <p className="text-sm text-pretty text-amber-700 dark:text-amber-300">
              Ce semestre n’a pas encore d’objectif. Ajoute-en au moins un.
            </p>
          ) : (
            <ol className="flex flex-col">
              {group.milestones.map((milestone, i) => (
                <MilestoneNode
                  key={milestone.id}
                  milestone={milestone}
                  currentSemesterIndex={currentSemesterIndex}
                  isLast={i === group.milestones.length - 1}
                  isDraft={isDraft}
                  highlighted={highlightedId === milestone.id}
                  canDelete={canDelete}
                  moveTargets={moveTargets}
                  onStatusChange={onStatusChange}
                  onUpdate={onUpdate}
                />
              ))}
            </ol>
          )}
          {full ? (
            <p className="text-xs text-muted-foreground">
              {MAX_OBJECTIVES_PER_SEMESTER} objectifs maximum par semestre — utilise
              les sous-objectifs pour détailler.
            </p>
          ) : (
            <AddObjectiveInline semesterIndex={group.index} onUpdate={onUpdate} />
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
