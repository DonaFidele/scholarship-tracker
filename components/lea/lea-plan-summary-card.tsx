import { ClockAlert, Route } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlanProgress } from '@/components/lea/plan-progress'
import { planCounts } from '@/lib/milestone-helpers'
import type { LeaPlan } from '@/lib/types'

export function LeaPlanSummaryCard({
  plan,
  onOpenPipeline,
}: {
  plan: LeaPlan
  onOpenPipeline: () => void
}) {
  const counts = planCounts(plan)
  const isDraft = plan.stage === 'draft'

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg leading-snug font-semibold text-balance">
              {plan.target_title}
            </h2>
            {isDraft ? (
              <Badge
                variant="outline"
                className="border-amber-500/50 text-amber-700 dark:text-amber-300"
              >
                Brouillon
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Plan sur {plan.horizon_semesters} semestre
            {plan.horizon_semesters > 1 ? 's' : ''}
          </p>
        </div>

        {isDraft ? (
          <p className="text-sm text-pretty text-muted-foreground">
            {counts.total} étapes proposées. Relis-les, ajuste ce qui ne te
            convient pas, puis valide ton parcours.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <PlanProgress
              done={counts.done}
              total={counts.total}
              percent={counts.percent}
            />
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {counts.remaining} étape{counts.remaining > 1 ? 's' : ''}{' '}
                restante{counts.remaining > 1 ? 's' : ''}
              </span>
              {counts.late > 0 ? (
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                  <ClockAlert aria-hidden="true" className="size-3.5" />
                  {counts.late} en retard
                </span>
              ) : null}
            </p>
          </div>
        )}

        <Button className="h-9 w-fit" onClick={onOpenPipeline}>
          <Route />
          Voir mon parcours complet
        </Button>
      </CardContent>
    </Card>
  )
}
