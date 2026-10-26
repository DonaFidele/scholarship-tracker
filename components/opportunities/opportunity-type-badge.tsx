import {
  Award,
  Briefcase,
  Crown,
  HeartHandshake,
  Trophy,
  Users,
} from 'lucide-react'
import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import { typeLabels } from '@/lib/opportunity-labels'
import type { OpportunityType } from '@/lib/types'

const config: Record<OpportunityType, { icon: typeof Crown; className: string }> = {
  leadership: {
    icon: Crown,
    className:
      'border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  },
  volontariat: {
    icon: HeartHandshake,
    className:
      'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  mentorat: {
    icon: Users,
    className:
      'border-sky-500/30 bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  },
  stage: {
    icon: Briefcase,
    className:
      'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
  fellowship: {
    icon: Award,
    className:
      'border-violet-500/30 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  },
  competition: {
    icon: Trophy,
    className:
      'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  },
}

export function OpportunityTypeBadge({
  type,
  className,
}: {
  type: OpportunityType
  className?: string
}) {
  const { icon: Icon, className: colorClass } = config[type]
  return (
    <Badge variant="outline" className={cn('w-fit gap-1', colorClass, className)}>
      <Icon className="size-3" aria-hidden="true" />
      {typeLabels[type]}
    </Badge>
  )
}
