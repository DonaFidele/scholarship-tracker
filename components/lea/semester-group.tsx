'use client'

import { cn } from 'cn'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { MilestoneNode } from '@/components/lea/milestone-node'
import type { SemesterGroup as SemesterGroupData } from '@/lib/milestone-helpers'
import type { MilestoneStatus } from '@/lib/types'

export function SemesterGroup({
  group,
  currentSemesterIndex,
  open,
  onOpenChange,
  editing,
  canTrack,
  highlightedId,
  semesterItems,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  group: SemesterGroupData
  currentSemesterIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: boolean
  canTrack: boolean
  highlightedId: string | null
  semesterItems: { value: string; label: string }[]
  onStatusChange: (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => void
  onEdit: (
    id: string,
    newTitle: string,
    semesterLabel: string,
    semesterIndex: number,
    reason?: string | null,
  ) => void
  onDelete: (id: string) => void
}) {
  const done = group.milestones.filter((m) => m.status === 'fait').length
  const total = group.milestones.length

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md py-1.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {group.label}
          <span className="font-normal text-muted-foreground tabular-nums">
            — {done}/{total} faites
          </span>
          {group.index === currentSemesterIndex ? (
            <Badge variant="secondary">Semestre actuel</Badge>
          ) : null}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="flex flex-col pt-3 pl-0.5">
          {group.milestones.map((milestone, i) => (
            <MilestoneNode
              key={milestone.id}
              milestone={milestone}
              currentSemesterIndex={currentSemesterIndex}
              isLast={i === group.milestones.length - 1}
              editing={editing}
              canTrack={canTrack}
              highlighted={highlightedId === milestone.id}
              semesterItems={semesterItems}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ol>
      </CollapsibleContent>
    </Collapsible>
  )
}
