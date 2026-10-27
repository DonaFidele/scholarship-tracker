import { ArrowRight } from 'lucide-react'
import { eventLabels, titleAtEvent } from '@/lib/milestone-helpers'
import type { MilestoneEvent, PlanMilestone } from '@/lib/types'

export function MilestoneEventBody({
  milestone,
  event,
}: {
  milestone: PlanMilestone
  event: MilestoneEvent
}) {
  const label = eventLabels[event.type]
  const titleChanged =
    event.type === 'ajustee' &&
    event.previous_title &&
    event.previous_title !== event.new_title

  return (
    <div className="flex min-w-0 flex-col gap-0.5 text-sm">
      {event.type === 'creee' ? (
        <p className="text-pretty">
          <span className="font-medium">{label}</span>
          {' — '}
          {titleAtEvent(milestone, event)}
        </p>
      ) : event.type === 'ajustee' ? (
        <>
          <p className="font-medium">{label}</p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-pretty">
            {titleChanged ? (
              <>
                <span className="text-muted-foreground line-through">
                  <span className="sr-only">Ancien titre : </span>
                  {event.previous_title}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground"
                />
                <span>
                  <span className="sr-only">Nouveau titre : </span>
                  {event.new_title}
                </span>
              </>
            ) : (
              <span>{event.new_title}</span>
            )}
          </p>
        </>
      ) : (
        <p className="font-medium">{label}</p>
      )}
      {event.reason ? (
        <p className="text-pretty text-xs italic text-muted-foreground">
          {event.reason}
        </p>
      ) : null}
    </div>
  )
}
