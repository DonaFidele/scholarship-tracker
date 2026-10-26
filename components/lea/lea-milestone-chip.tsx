'use client'

import { cn } from 'cn'
import type { MilestoneStatus, PlanMilestone } from '@/lib/types'

const statusLabels: Record<MilestoneStatus, string> = {
  a_faire: 'à faire',
  en_cours: 'en cours',
  fait: 'fait',
}

const statusDot: Record<MilestoneStatus, string> = {
  a_faire: 'bg-muted-foreground/40',
  en_cours: 'bg-amber-500',
  fait: 'bg-emerald-500',
}

const nextStatus: Record<MilestoneStatus, MilestoneStatus> = {
  a_faire: 'en_cours',
  en_cours: 'fait',
  fait: 'a_faire',
}

export function LeaMilestoneChip({
  milestone,
  onStatusChange,
}: {
  milestone: PlanMilestone
  onStatusChange: (id: string, status: MilestoneStatus) => void
}) {
  const next = nextStatus[milestone.status]
  return (
    <button
      type="button"
      aria-label={`${milestone.title}, ${statusLabels[milestone.status]}. Passer à « ${statusLabels[next]} »`}
      onClick={() => onStatusChange(milestone.id, next)}
      className="flex min-h-9 w-56 shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className={cn('size-2.5 shrink-0 rounded-full', statusDot[milestone.status])}
      />
      <span className="line-clamp-2 text-pretty leading-snug">{milestone.title}</span>
    </button>
  )
}
