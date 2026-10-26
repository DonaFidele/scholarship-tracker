'use client'

import { cn } from 'cn'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { LevelFilter } from '@/components/search/result-filters'

const levelLabels: Record<LevelFilter, string> = {
  all: 'Tous',
  licence: 'Licence',
  master: 'Master',
  doctorat: 'Doctorat',
  autre: 'Autre',
}

const chipClass = 'h-8 rounded-full'
const activeChipClass = 'border-primary/50 bg-primary/10 text-primary'

function MenuChip({
  label,
  valueLabel,
  active,
  value,
  onValueChange,
  options,
}: {
  label: string
  valueLabel: string
  active: boolean
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(chipClass, !active && 'text-muted-foreground', active && activeChipClass)}
          />
        }
      >
        {active ? `${label} : ${valueLabel}` : label}
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ForYouChips({
  level,
  country,
  fullOnly,
  countries,
  onLevelChange,
  onCountryChange,
  onFullOnlyChange,
}: {
  level: LevelFilter
  country: string
  fullOnly: boolean
  countries: string[]
  onLevelChange: (value: LevelFilter) => void
  onCountryChange: (value: string) => void
  onFullOnlyChange: (value: boolean) => void
}) {
  return (
    <div
      role="group"
      aria-label="Filtres rapides"
      className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      <div className="flex w-max items-center gap-2">
        <MenuChip
          label="Niveau"
          valueLabel={levelLabels[level]}
          active={level !== 'all'}
          value={level}
          onValueChange={(v) => onLevelChange(v as LevelFilter)}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'licence', label: 'Licence' },
            { value: 'master', label: 'Master' },
            { value: 'doctorat', label: 'Doctorat' },
          ]}
        />
        <MenuChip
          label="Pays"
          valueLabel={country}
          active={country !== 'all'}
          value={country}
          onValueChange={onCountryChange}
          options={[
            { value: 'all', label: 'Tous' },
            ...countries.map((c) => ({ value: c, label: c })),
          ]}
        />
        <Button
          variant="outline"
          size="sm"
          aria-pressed={fullOnly}
          className={cn(chipClass, !fullOnly && 'text-muted-foreground', fullOnly && activeChipClass)}
          onClick={() => onFullOnlyChange(!fullOnly)}
        >
          Bourse complète
        </Button>
      </div>
    </div>
  )
}
