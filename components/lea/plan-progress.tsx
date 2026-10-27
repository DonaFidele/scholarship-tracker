import { cn } from 'cn'
import { Progress } from '@/components/ui/progress'

export function PlanProgress({
  done,
  total,
  percent,
  className,
}: {
  done: number
  total: number
  percent: number
  className?: string
}) {
  if (total === 0) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        Aucune étape
      </span>
    )
  }

  const allDone = done === total

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <p className="text-sm font-medium tabular-nums">
        {done} sur {total} étapes terminées — {percent}%
      </p>
      {/* Progress renders its own track + indicator, so style them via data-slot instead of adding a second bar. */}
      <Progress
        value={percent}
        aria-label={`${done} étapes terminées sur ${total}`}
        className={cn(
          'w-full [&_[data-slot=progress-track]]:h-2',
          allDone
            ? '[&_[data-slot=progress-indicator]]:bg-emerald-500'
            : '[&_[data-slot=progress-indicator]]:bg-indigo-500',
        )}
      />
    </div>
  )
}
