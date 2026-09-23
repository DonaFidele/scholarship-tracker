'use client'

import { cn } from 'cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApplicationStatus } from '@/lib/types'

export const statusOptions: {
  value: ApplicationStatus
  label: string
  dot: string
}[] = [
  { value: 'todo', label: 'À faire', dot: 'bg-muted-foreground/50' },
  { value: 'in_progress', label: 'En cours', dot: 'bg-amber-500' },
  { value: 'submitted', label: 'Dossier envoyé', dot: 'bg-blue-500' },
  { value: 'accepted', label: 'Accepté', dot: 'bg-emerald-500' },
  { value: 'rejected', label: 'Refusé', dot: 'bg-red-500' },
]

export function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: ApplicationStatus
  onChange: (status: ApplicationStatus) => void
  className?: string
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as ApplicationStatus)}
    >
      <SelectTrigger
        size="sm"
        className={cn('w-[150px]', className)}
        aria-label="Modifier le statut"
      >
        <SelectValue>
          {(value: ApplicationStatus) => {
            const opt = statusOptions.find((o) => o.value === value)
            if (!opt) return null
            return (
              <span className="flex items-center gap-2">
                <span
                  className={cn('size-2 shrink-0 rounded-full', opt.dot)}
                  aria-hidden="true"
                />
                {opt.label}
              </span>
            )
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span
              className={cn('size-2 shrink-0 rounded-full', opt.dot)}
              aria-hidden="true"
            />
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
