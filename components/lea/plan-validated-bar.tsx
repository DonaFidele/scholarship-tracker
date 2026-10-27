'use client'

import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlanProgress } from '@/components/lea/plan-progress'

export function PlanValidatedBar({
  done,
  total,
  percent,
  adjusting,
  onToggleAdjustMode,
}: {
  done: number
  total: number
  percent: number
  adjusting: boolean
  onToggleAdjustMode: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <PlanProgress done={done} total={total} percent={percent} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          aria-live="polite"
          className="text-xs text-pretty text-muted-foreground"
        >
          {adjusting
            ? 'Mode ajustement : renomme, déplace, supprime ou ajoute des étapes.'
            : ''}
        </p>
        <Button
          variant={adjusting ? 'secondary' : 'ghost'}
          size="sm"
          className="ml-auto text-muted-foreground"
          aria-pressed={adjusting}
          onClick={onToggleAdjustMode}
        >
          <Settings2 />
          {adjusting ? 'Terminer l’ajustement' : 'Ajuster mon parcours'}
        </Button>
      </div>
    </div>
  )
}
