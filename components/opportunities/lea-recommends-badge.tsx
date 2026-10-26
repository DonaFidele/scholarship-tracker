import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function LeaRecommendsBadge() {
  return (
    <Badge
      variant="outline"
      className="w-fit gap-1 border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
    >
      <Sparkles className="size-3" aria-hidden="true" />
      Léa recommande
    </Badge>
  )
}
