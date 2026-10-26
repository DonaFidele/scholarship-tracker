import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Recommendation } from '@/lib/types'

export function RecommendationNote({ recommendation }: { recommendation: Recommendation | null }) {
  if (!recommendation?.recommended) return null
  const reasons = recommendation.reasons.slice(0, 4)
  return (
    <div className="flex flex-col gap-1">
      <Badge className="w-fit gap-1">
        <Sparkles className="size-3" aria-hidden="true" />
        Recommandé pour toi
      </Badge>
      {reasons.length > 0 && <p className="text-xs text-muted-foreground">{reasons.join(' · ')}</p>}
    </div>
  )
}
