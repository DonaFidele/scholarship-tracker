'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  OPPORTUNITY_TYPES,
  costLabels,
  modeLabels,
  typeLabels,
} from '@/lib/opportunity-labels'
import type { OpportunityCost, OpportunityMode, OpportunityType } from '@/lib/types'

export type OpportunityTypeFilter = OpportunityType | 'all'
export type OpportunityModeFilter = OpportunityMode | 'all'
export type OpportunityCostFilter = OpportunityCost | 'all'

const typeItems = [
  { value: 'all', label: 'Tous' },
  ...OPPORTUNITY_TYPES.map((t) => ({ value: t, label: typeLabels[t] })),
]

const modeItems = [
  { value: 'all', label: 'Tous' },
  ...(Object.keys(modeLabels) as OpportunityMode[]).map((m) => ({
    value: m,
    label: modeLabels[m],
  })),
]

const costItems: { value: OpportunityCostFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'gratuit', label: costLabels.gratuit },
  { value: 'payant', label: costLabels.payant },
]

export function OpportunityFilters({
  type,
  mode,
  cost,
  onTypeChange,
  onModeChange,
  onCostChange,
}: {
  type: OpportunityTypeFilter
  mode: OpportunityModeFilter
  cost: OpportunityCostFilter
  onTypeChange: (value: OpportunityTypeFilter) => void
  onModeChange: (value: OpportunityModeFilter) => void
  onCostChange: (value: OpportunityCostFilter) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-type">Type</Label>
        <Select
          items={typeItems}
          value={type}
          onValueChange={(v) => onTypeChange(v as OpportunityTypeFilter)}
        >
          <SelectTrigger id="filter-type" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-mode">Format</Label>
        <Select
          items={modeItems}
          value={mode}
          onValueChange={(v) => onModeChange(v as OpportunityModeFilter)}
        >
          <SelectTrigger id="filter-mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span id="filter-cost-label" className="text-sm font-medium">
          Coût
        </span>
        <div
          role="group"
          aria-labelledby="filter-cost-label"
          className="flex gap-1.5"
        >
          {costItems.map((item) => (
            <Button
              key={item.value}
              type="button"
              variant={cost === item.value ? 'default' : 'outline'}
              className="h-9 flex-1"
              aria-pressed={cost === item.value}
              onClick={() => onCostChange(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
