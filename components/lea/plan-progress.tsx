import { cn } from 'cn'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '@/components/ui/progress'

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
      <Progress
        value={percent}
        aria-label={`${done} étapes terminées sur ${total}`}
        className="w-full"
      >
        <ProgressTrack className="h-1.5">
          <ProgressIndicator
            className={cn(allDone ? 'bg-emerald-500' : 'bg-indigo-500')}
          />
        </ProgressTrack>
      </Progress>
    </div>
  )
}
