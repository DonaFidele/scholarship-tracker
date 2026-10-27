'use client'

import { cn } from 'cn'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MilestoneStatus } from '@/lib/types'

const options: { value: MilestoneStatus; label: string; dot: string }[] = [
  { value: 'a_faire', label: 'À faire', dot: 'bg-muted-foreground/60' },
  { value: 'en_cours', label: 'En cours', dot: 'bg-indigo-500' },
  { value: 'fait', label: 'Terminé', dot: 'bg-emerald-500' },
  { value: 'rate', label: 'Pas réussi', dot: 'bg-amber-500' },
]

export function MilestoneStatusMenu({
  title,
  status,
  onSelect,
}: {
  title: string
  status: MilestoneStatus
  onSelect: (status: MilestoneStatus) => void
}) {
  const current = options.find((o) => o.value === status) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 rounded-full px-2.5 text-xs"
            aria-label={`Statut de « ${title} » : ${current.label}. Changer le statut`}
          />
        }
      >
        <span aria-hidden="true" className={cn('size-2 rounded-full', current.dot)} />
        {current.label}
        <ChevronDown aria-hidden="true" className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuRadioGroup
          value={status}
          onValueChange={(value) => onSelect(value as MilestoneStatus)}
        >
          <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span
                aria-hidden="true"
                className={cn('size-2 rounded-full', option.dot)}
              />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
