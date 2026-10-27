import { ArrowRight, Check, ClockAlert, Play, Route } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PlanProgress } from '@/components/lea/plan-progress'
import { isLate, nextMilestone, planCounts } from '@/lib/milestone-helpers'
import type { LeaPlan, MilestoneStatus, PlanMilestone } from '@/lib/types'

export function LeaPlanSummaryCard({
  plan,
  onOpenPipeline,
  onStatusChange,
  onMilestoneCompleted,
}: {
  plan: LeaPlan
  onOpenPipeline: () => void
  onStatusChange: (id: string, status: MilestoneStatus) => void
  onMilestoneCompleted: (milestone: PlanMilestone) => void
}) {
  const counts = planCounts(plan)
  const isDraft = plan.stage === 'draft'
  const next = isDraft ? null : nextMilestone(plan)
  const nextLate = next ? isLate(next, plan.current_semester_index) : false

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Ton parcours
          </p>
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
        </div>

        {isDraft ? (
          <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed text-pretty">
              Léa t’a proposé {counts.total} étapes sur{' '}
              {plan.horizon_semesters} semestres. Relis-les, change ce qui ne te
              va pas, puis valide : c’est toi qui décides.
            </p>
            <Button className="w-fit" onClick={onOpenPipeline}>
              Relire et valider mon parcours
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        ) : (
          <>
            <PlanProgress
              done={counts.done}
              total={counts.total}
              percent={counts.percent}
            />

            {next ? (
              <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Ta prochaine étape
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{next.semester_label}</span>
                  {nextLate ? (
                    <Badge
                      variant="outline"
                      className="gap-1 border-amber-500/50 text-amber-700 dark:text-amber-300"
                    >
                      <ClockAlert aria-hidden="true" className="size-3" />
                      En retard
                    </Badge>
                  ) : null}
                </div>
                <p className="text-base leading-snug font-medium text-pretty">
                  {next.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {next.status === 'en_cours' ? (
                    <Button
                      onClick={() => {
                        onStatusChange(next.id, 'fait')
                        onMilestoneCompleted(next)
                      }}
                    >
                      <Check data-icon="inline-start" />
                      C’est fait
                    </Button>
                  ) : (
                    <Button onClick={() => onStatusChange(next.id, 'en_cours')}>
                      <Play data-icon="inline-start" />
                      Je commence
                    </Button>
                  )}
                  <Button variant="ghost" onClick={onOpenPipeline}>
                    <Route data-icon="inline-start" />
                    Voir tout le parcours
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 rounded-lg bg-emerald-500/10 p-4">
                <p className="text-sm leading-relaxed text-pretty">
                  Toutes tes étapes sont terminées. Bravo, tu peux être fier·e
                  du chemin parcouru !
                </p>
                <Button
                  variant="outline"
                  className="w-fit"
                  onClick={onOpenPipeline}
                >
                  <Route data-icon="inline-start" />
                  Revoir mon parcours
                </Button>
              </div>
            )}

            {counts.late > 1 ? (
              <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                <ClockAlert aria-hidden="true" className="size-3.5" />
                {counts.late} étapes ont pris du retard. Pas de panique, demande
                à Léa de t’aider à réorganiser.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  )
}
