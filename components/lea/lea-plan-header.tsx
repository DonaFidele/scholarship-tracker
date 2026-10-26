'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { LeaMilestoneChip } from '@/components/lea/lea-milestone-chip'
import type { LeaPlan, MilestoneStatus } from '@/lib/types'

export function LeaPlanHeader({
  plan,
  onMilestoneStatusChange,
  onEditGoal,
}: {
  plan: LeaPlan
  onMilestoneStatusChange: (id: string, status: MilestoneStatus) => void
  onEditGoal?: () => void
}) {
  const total = plan.milestones.length
  const done = plan.milestones.filter((m) => m.status === 'fait').length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  const groups = useMemo(() => {
    const map = new Map<string, LeaPlan['milestones']>()
    for (const m of plan.milestones) {
      map.set(m.semester_label, [...(map.get(m.semester_label) ?? []), m])
    }
    return Array.from(map, ([label, milestones]) => ({ label, milestones }))
  }, [plan.milestones])

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold leading-snug text-balance">
              {plan.target_title}
            </h2>
            <p className="text-sm text-muted-foreground">
              Plan sur {plan.horizon_semesters} semestre
              {plan.horizon_semesters > 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={onEditGoal}
          >
            Modifier mon objectif
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium tabular-nums">
              {done} / {total} étapes
            </span>
          </div>
          <Progress
            value={percent}
            aria-label={`Progression du plan : ${done} étapes faites sur ${total}`}
          />
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-2"
          role="group"
          aria-label="Étapes du plan par semestre"
        >
          {groups.map((group) => (
            <div key={group.label} className="flex shrink-0 flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {group.label}
              </span>
              <div className="flex gap-2">
                {group.milestones.map((m) => (
                  <LeaMilestoneChip
                    key={m.id}
                    milestone={m}
                    onStatusChange={onMilestoneStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
