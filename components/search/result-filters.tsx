'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Coverage, Level } from '@/lib/types'

export type LevelFilter = Level | 'all'
export type CoverageFilter = Coverage | 'all'

export function ResultFilters({
  level,
  coverage,
  hideClosedBenin,
  onLevelChange,
  onCoverageChange,
  onHideClosedBeninChange,
}: {
  level: LevelFilter
  coverage: CoverageFilter
  hideClosedBenin: boolean
  onLevelChange: (value: LevelFilter) => void
  onCoverageChange: (value: CoverageFilter) => void
  onHideClosedBeninChange: (value: boolean) => void
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="flex w-max min-w-full items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-level" className="text-xs">
            Niveau
          </Label>
          <Select
            value={level}
            onValueChange={(v) => onLevelChange(v as LevelFilter)}
          >
            <SelectTrigger id="filter-level" size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="licence">Licence</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="doctorat">Doctorat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-coverage" className="text-xs">
            Couverture
          </Label>
          <Select
            value={coverage}
            onValueChange={(v) => onCoverageChange(v as CoverageFilter)}
          >
            <SelectTrigger id="filter-coverage" size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="full">Complète</SelectItem>
              <SelectItem value="partial">Partielle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 whitespace-nowrap pb-1.5">
          <Switch
            id="filter-hide-benin"
            checked={hideClosedBenin}
            onCheckedChange={onHideClosedBeninChange}
          />
          <Label htmlFor="filter-hide-benin" className="text-sm font-normal">
            Masquer les bourses fermées au Bénin
          </Label>
        </div>
      </div>
    </div>
  )
}
