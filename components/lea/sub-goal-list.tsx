'use client'

import { useState } from 'react'
import { cn } from 'cn'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  addSubGoal,
  deleteSubGoal,
  renameSubGoal,
  toggleSubGoal,
  type PlanUpdater,
} from '@/lib/plan-actions'
import type { PlanMilestone, SubGoal } from '@/lib/types'

function isSubmitKey(e: React.KeyboardEvent) {
  return e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229
}

function SubGoalRow({
  milestoneId,
  subGoal,
  canCheck,
  onUpdate,
}: {
  milestoneId: string
  subGoal: SubGoal
  canCheck: boolean
  onUpdate: (updater: PlanUpdater) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(subGoal.title)

  const commit = () => {
    const trimmed = title.trim()
    if (trimmed && trimmed !== subGoal.title) {
      onUpdate((plan) => renameSubGoal(plan, milestoneId, subGoal.id, trimmed))
    } else {
      setTitle(subGoal.title)
    }
    setEditing(false)
  }

  return (
    <li className="group flex min-h-8 items-center gap-2">
      {canCheck ? (
        <Checkbox
          checked={subGoal.done}
          aria-label={`Sous-objectif terminé : ${subGoal.title}`}
          onCheckedChange={() =>
            onUpdate((plan) => toggleSubGoal(plan, milestoneId, subGoal.id))
          }
        />
      ) : (
        <span
          aria-hidden="true"
          className="mx-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"
        />
      )}
      {editing ? (
        <Input
          value={title}
          autoFocus
          aria-label="Titre du sous-objectif"
          className="h-8 flex-1"
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (isSubmitKey(e)) e.currentTarget.blur()
            if (e.key === 'Escape') {
              setTitle(subGoal.title)
              setEditing(false)
            }
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn(
            'min-w-0 flex-1 rounded-sm text-left text-sm leading-snug text-pretty outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50',
            subGoal.done
              ? 'text-muted-foreground line-through'
              : 'text-foreground/90',
          )}
          aria-label={`Renommer le sous-objectif : ${subGoal.title}`}
        >
          {subGoal.title}
        </button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100"
        aria-label={`Supprimer le sous-objectif : ${subGoal.title}`}
        onClick={() =>
          onUpdate((plan) => deleteSubGoal(plan, milestoneId, subGoal.id))
        }
      >
        <X />
      </Button>
    </li>
  )
}

export function SubGoalList({
  milestone,
  canCheck,
  adding,
  onAddingChange,
  onUpdate,
}: {
  milestone: PlanMilestone
  canCheck: boolean
  adding: boolean
  onAddingChange: (adding: boolean) => void
  onUpdate: (updater: PlanUpdater) => void
}) {
  const [title, setTitle] = useState('')
  const subGoals = milestone.sub_goals
  const done = subGoals.filter((s) => s.done).length

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onUpdate((plan) => addSubGoal(plan, milestone.id, trimmed))
    setTitle('')
  }

  if (subGoals.length === 0 && !adding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-fit px-1.5 text-muted-foreground"
        onClick={() => onAddingChange(true)}
      >
        <Plus data-icon="inline-start" />
        Ajouter un sous-objectif
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border/70 bg-muted/30 px-2.5 py-2">
      {subGoals.length > 0 ? (
        <p className="text-xs text-muted-foreground tabular-nums">
          Sous-objectifs{canCheck ? ` · ${done}/${subGoals.length}` : ''}
        </p>
      ) : null}
      <ul className="flex flex-col">
        {subGoals.map((subGoal) => (
          <SubGoalRow
            key={subGoal.id}
            milestoneId={milestone.id}
            subGoal={subGoal}
            canCheck={canCheck}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
      {adding ? (
        <form
          className="flex items-center gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Input
            value={title}
            autoFocus
            placeholder="Ex. : demander une lettre au prof de maths"
            aria-label="Nouveau sous-objectif"
            className="h-8 flex-1 bg-background"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setTitle('')
                onAddingChange(false)
              }
            }}
          />
          <Button type="submit" size="sm" disabled={!title.trim()}>
            Ajouter
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setTitle('')
              onAddingChange(false)
            }}
          >
            Fermer
          </Button>
        </form>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-fit px-1.5 text-muted-foreground"
          onClick={() => onAddingChange(true)}
        >
          <Plus data-icon="inline-start" />
          Ajouter un sous-objectif
        </Button>
      )}
    </div>
  )
}
