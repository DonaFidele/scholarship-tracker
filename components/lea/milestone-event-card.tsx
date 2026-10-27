import { cn } from 'cn'
import { MilestoneEventBody } from '@/components/lea/milestone-event-body'
import { MilestoneEventIcon } from '@/components/lea/milestone-event-icon'
import { formatDateFr } from '@/lib/format'
import type { MilestoneEvent, PlanMilestone } from '@/lib/types'

export function MilestoneEventCard({
  milestone,
  event,
  bare = false,
}: {
  milestone: PlanMilestone
  event: MilestoneEvent
  /** Drop the border and background, for use inside a stacked layer. */
  bare?: boolean
}) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg p-3',
        !bare && 'border border-border bg-card',
      )}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <MilestoneEventIcon type={event.type} className="size-3.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <time dateTime={event.at} className="text-xs text-muted-foreground">
          {formatDateFr(event.at)}
        </time>
        <MilestoneEventBody milestone={milestone} event={event} />
      </div>
    </div>
  )
}
