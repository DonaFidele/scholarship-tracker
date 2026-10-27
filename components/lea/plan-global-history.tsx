'use client'

import { useMemo } from 'react'
import { MilestoneEventBody } from '@/components/lea/milestone-event-body'
import { MilestoneEventIcon } from '@/components/lea/milestone-event-icon'
import { formatDateFr } from '@/lib/format'
import type { LeaPlan, MilestoneEvent, PlanMilestone } from '@/lib/types'

type Entry = { milestone: PlanMilestone; event: MilestoneEvent }

const DIVIDER_THRESHOLD = 5

export function PlanGlobalHistory({
  plan,
  onJumpToMilestone,
}: {
  plan: LeaPlan
  onJumpToMilestone: (id: string) => void
}) {
  const entries = useMemo<Entry[]>(
    () =>
      plan.milestones
        .flatMap((milestone) =>
          milestone.events.map((event) => ({ milestone, event })),
        )
        .sort((a, b) => b.event.at.localeCompare(a.event.at)),
    [plan.milestones],
  )

  const days = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const entry of entries) {
      const key = entry.event.at.slice(0, 10)
      map.set(key, [...(map.get(key) ?? []), entry])
    }
    return Array.from(map, ([day, items]) => ({ day, items }))
  }, [entries])

  const hasActivity = entries.some((e) => e.event.type !== 'creee')

  if (!hasActivity) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-pretty text-muted-foreground">
        Ton parcours commence tout juste. Chaque étape que tu valides ou ajustes
        apparaîtra ici.
      </p>
    )
  }

  const showDividers = entries.length > DIVIDER_THRESHOLD

  return (
    <div className="flex flex-col gap-4">
      {days.map(({ day, items }) => (
        <section key={day} className="flex flex-col gap-2">
          {showDividers ? (
            <h3 className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
              <span>{formatDateFr(items[0].event.at)}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </h3>
          ) : null}
          <ol className="flex flex-col gap-3">
            {items.map(({ milestone, event }) => (
              <li key={event.id} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                >
                  <MilestoneEventIcon type={event.type} className="size-3.5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <button
                      type="button"
                      onClick={() => onJumpToMilestone(milestone.id)}
                      aria-label={`Aller à l’étape ${milestone.title}`}
                      className="max-w-full truncate rounded-full border border-border bg-muted px-2 py-0.5 text-xs transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {milestone.title}
                    </button>
                    {!showDividers ? (
                      <time
                        dateTime={event.at}
                        className="text-xs text-muted-foreground"
                      >
                        {formatDateFr(event.at)}
                      </time>
                    ) : null}
                  </div>
                  <MilestoneEventBody milestone={milestone} event={event} />
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
