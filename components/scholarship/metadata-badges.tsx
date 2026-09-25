'use client'

import { cn } from 'cn'
import { TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { BeninEligibility, Coverage, Level } from '@/lib/types'

export const levelLabels: Record<Level, string> = {
  licence: 'Licence',
  master: 'Master',
  doctorat: 'Doctorat',
  autre: 'Autre',
}

export const coverageLabels: Record<Coverage, string> = {
  full: 'Bourse complète',
  partial: 'Bourse partielle',
}

const beninConfig: Record<
  BeninEligibility,
  { label: string; className: string }
> = {
  yes: {
    label: 'Bénin : éligible',
    className:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  no: {
    label: 'Bénin : exclu',
    className:
      'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
  },
  unknown: {
    label: 'Bénin : à vérifier',
    className: 'border-border bg-muted/50 text-muted-foreground',
  },
}

export function LevelBadge({ value }: { value: Level | null }) {
  if (!value) return null
  return (
    <Badge variant="outline" className="font-normal">
      {levelLabels[value]}
    </Badge>
  )
}

export function CoverageBadge({ value }: { value: Coverage | null }) {
  if (!value) return null
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-normal',
        value === 'full'
          ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
          : 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
      )}
    >
      {coverageLabels[value]}
    </Badge>
  )
}

export function BeninBadge({ value }: { value: BeninEligibility }) {
  const cfg = beninConfig[value]
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="outline"
            tabIndex={0}
            className={cn('cursor-help font-normal', cfg.className)}
          >
            {cfg.label}
          </Badge>
        }
      />
      <TooltipContent>
        Déduit automatiquement de la page. Vérifie toujours les conditions sur
        le site officiel.
      </TooltipContent>
    </Tooltip>
  )
}

export function FeeWarningBadge({ show }: { show: boolean | null }) {
  if (show !== true) return null
  return (
    <Badge
      variant="outline"
      className="gap-1 font-normal border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
    >
      <TriangleAlert className="size-3" />
      Frais demandés
    </Badge>
  )
}

/** Row of metadata badges shared by search results and applications. */
export function MetadataBadges({
  level,
  coverage,
  benin,
  asksFee,
  className,
}: {
  level: Level | null
  coverage: Coverage | null
  benin?: BeninEligibility
  asksFee: boolean | null
  className?: string
}) {
  const showBenin = benin !== undefined && benin !== 'unknown'
  const hasAny = level || coverage || showBenin || asksFee === true
  if (!hasAny) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <LevelBadge value={level} />
      <CoverageBadge value={coverage} />
      {showBenin && <BeninBadge value={benin} />}
      <FeeWarningBadge show={asksFee} />
    </div>
  )
}
