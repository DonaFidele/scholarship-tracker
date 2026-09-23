import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { daysLeft, deadlineState, type DeadlineTone } from '@/lib/deadline'

const toneClasses: Record<DeadlineTone, string> = {
  ok: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning:
    'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  danger:
    'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  expired: 'border-transparent bg-muted text-muted-foreground',
  muted: 'border-transparent bg-muted text-muted-foreground',
}

export function DeadlineBadge({
  deadline,
  className,
}: {
  deadline: string | null
  className?: string
}) {
  const { label, tone } = deadlineState(daysLeft(deadline))
  return (
    <Badge variant="secondary" className={cn(toneClasses[tone], className)}>
      {label}
    </Badge>
  )
}
