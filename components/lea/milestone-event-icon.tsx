import {
  Check,
  Clock,
  Plus,
  RefreshCw,
  RotateCcw,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { MilestoneEventType } from '@/lib/types'

const icons: Record<MilestoneEventType, LucideIcon> = {
  creee: Plus,
  ajustee: RefreshCw,
  marquee_en_cours: Clock,
  marquee_faite: Check,
  marquee_ratee: X,
  remise_a_faire: RotateCcw,
}

export function MilestoneEventIcon({
  type,
  className,
}: {
  type: MilestoneEventType
  className?: string
}) {
  const Icon = icons[type]
  return <Icon aria-hidden="true" className={className} />
}
