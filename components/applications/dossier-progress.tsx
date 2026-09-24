import { cn } from 'cn'
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress'
import type { ChecklistItem } from '@/lib/types'

/** Returns done/total counts for a checklist. */
export function dossierCounts(items: ChecklistItem[]): {
  done: number
  total: number
  allDone: boolean
} {
  const total = items.length
  const done = items.filter((i) => i.is_done).length
  return { done, total, allDone: total > 0 && done === total }
}

export function DossierProgress({
  items,
  className,
  trackClassName,
}: {
  items: ChecklistItem[]
  className?: string
  trackClassName?: string
}) {
  const { done, total, allDone } = dossierCounts(items)

  if (total === 0) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>
        Aucun document
      </span>
    )
  }

  const value = Math.round((done / total) * 100)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        {done}/{total}
      </span>
      <Progress
        value={value}
        aria-label={`${done} document sur ${total} prêt`}
        className="w-full"
      >
        <ProgressTrack className={cn('h-1.5', trackClassName)}>
          <ProgressIndicator
            className={cn(allDone ? 'bg-emerald-500' : 'bg-indigo-500')}
          />
        </ProgressTrack>
      </Progress>
    </div>
  )
}
