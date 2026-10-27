import { PlanProgress } from '@/components/lea/plan-progress'

export function PlanValidatedBar({
  done,
  total,
  percent,
}: {
  done: number
  total: number
  percent: number
}) {
  return (
    <div className="flex flex-col gap-2">
      <PlanProgress done={done} total={total} percent={percent} />
      <p className="text-xs text-pretty text-muted-foreground">
        Change le statut d’un objectif avec sa pastille. Clique sur un titre pour
        le renommer, ou utilise « ⋯ » pour le déplacer, le supprimer ou ajouter
        des sous-objectifs.
      </p>
    </div>
  )
}
