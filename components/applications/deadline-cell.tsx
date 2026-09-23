'use client'

import { cn } from 'cn'
import { Input } from '@/components/ui/input'
import { DeadlineBadge } from '@/components/deadline-badge'

export function DeadlineCell({
  deadline,
  onChange,
  className,
}: {
  deadline: string | null
  onChange: (deadline: string | null) => void
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Input
        type="date"
        value={deadline ?? ''}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
        className="h-8 w-[150px]"
        aria-label="Modifier la date limite"
      />
      <DeadlineBadge deadline={deadline} />
    </div>
  )
}
