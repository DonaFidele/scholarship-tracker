'use client'

import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { MilestoneEventCard } from '@/components/lea/milestone-event-card'
import { sortEventsByDate } from '@/lib/milestone-helpers'
import type { PlanMilestone } from '@/lib/types'

const MAX_LAYERS = 4
const OFFSET_X = 6
const OFFSET_Y = 8

export function MilestoneHistoryStack({
  milestone,
}: {
  milestone: PlanMilestone
}) {
  const [expanded, setExpanded] = useState(false)
  const events = useMemo(
    () => sortEventsByDate(milestone.events).reverse(),
    [milestone.events],
  )

  if (events.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Aucun événement pour cette étape.
      </p>
    )
  }

  if (events.length === 1) {
    return <MilestoneEventCard milestone={milestone} event={events[0]} />
  }

  if (expanded) {
    return (
      <div className="flex flex-col gap-2">
        <ol
          aria-label="Historique de l’étape, du plus récent au plus ancien"
          className="flex flex-col gap-2"
        >
          {events.map((event) => (
            <li key={event.id}>
              <MilestoneEventCard milestone={milestone} event={event} />
            </li>
          ))}
        </ol>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
          aria-expanded={true}
          onClick={() => setExpanded(false)}
        >
          Replier l’historique
        </Button>
      </div>
    )
  }

  const layers = events.slice(0, MAX_LAYERS)
  const depth = layers.length - 1
  const expand = () => setExpanded(true)

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={false}
        aria-label={`Historique de l’étape : ${events.length} événements. Appuie sur Entrée pour tout afficher.`}
        onClick={expand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            expand()
          }
        }}
        className="cursor-pointer rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{ paddingBottom: depth * OFFSET_Y, paddingRight: depth * OFFSET_X }}
      >
        <div className="grid">
          {layers.map((event, i) => {
            const elevation = layers.length - i
            return (
              <div
                key={event.id}
                aria-hidden={i > 0}
                className={cn(
                  'rounded-lg border border-border bg-card transition-transform motion-reduce:transition-none',
                  i > 0 && 'pointer-events-none',
                )}
                style={{
                  gridArea: '1 / 1',
                  zIndex: elevation,
                  transform: `translate(${i * OFFSET_X}px, ${i * OFFSET_Y}px)`,
                  boxShadow: `0 ${elevation}px ${elevation * 3}px rgb(0 0 0 / ${0.06 + elevation * 0.03})`,
                }}
              >
                {i === 0 ? (
                  <MilestoneEventCard
                    milestone={milestone}
                    event={event}
                    bare
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
      {events.length > MAX_LAYERS ? (
        <Button
          variant="link"
          size="sm"
          className="h-auto w-fit px-0"
          onClick={expand}
        >
          Tout voir ({events.length})
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {events.length} événements · appuie pour déplier
        </p>
      )}
    </div>
  )
}
