'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlanDraftBanner } from '@/components/lea/plan-draft-banner'
import { PlanHistoryBook } from '@/components/lea/plan-history-book'
import { PlanValidatedBar } from '@/components/lea/plan-validated-bar'
import { SemesterGroup } from '@/components/lea/semester-group'
import {
  MAX_OBJECTIVES_PER_SEMESTER,
  buildSemesters,
  emptySemesters,
  planCounts,
} from '@/lib/milestone-helpers'
import type { PlanUpdater } from '@/lib/plan-actions'
import type { LeaPlan, MilestoneStatus, PlanMilestone } from '@/lib/types'

type Tab = 'parcours' | 'historique'

export function PlanPipelineSheet({
  plan,
  open,
  onOpenChange,
  onValidatePlan,
  onRequestNewProposal,
  onMilestoneStatusChange,
  onPlanUpdate,
  onMilestoneCompleted,
}: {
  plan: LeaPlan
  open: boolean
  onOpenChange: (open: boolean) => void
  onValidatePlan: () => void
  onRequestNewProposal: (reason: string | null) => void
  onMilestoneStatusChange: (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => void
  onPlanUpdate: (updater: PlanUpdater) => void
  onMilestoneCompleted: (milestone: PlanMilestone) => void
}) {
  const [tab, setTab] = useState<Tab>('parcours')
  const [openGroups, setOpenGroups] = useState<Set<number>>(
    () =>
      new Set([
        plan.current_semester_index,
        ...(plan.stage === 'draft' ? emptySemesters(plan) : []),
      ]),
  )
  const [pendingJump, setPendingJump] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const isDraft = plan.stage === 'draft'
  const counts = planCounts(plan)
  const groups = useMemo(() => buildSemesters(plan), [plan])
  const missing = useMemo(() => emptySemesters(plan), [plan])
  const semesterTargets = useMemo(
    () =>
      groups.map((g) => ({
        index: g.index,
        label: g.label,
        full: g.milestones.length >= MAX_OBJECTIVES_PER_SEMESTER,
      })),
    [groups],
  )

  const jumpToMilestone = (id: string) => {
    const milestone = plan.milestones.find((m) => m.id === id)
    if (!milestone) return
    setOpenGroups((prev) => new Set(prev).add(milestone.semester_index))
    setTab('parcours')
    setPendingJump(id)
  }

  useEffect(() => {
    if (!pendingJump) return
    const target = pendingJump
    const timeout = setTimeout(() => {
      const element = document.getElementById(`milestone-${target}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlightedId(target)
      setPendingJump(null)
    }, 80)
    return () => clearTimeout(timeout)
  }, [pendingJump])

  useEffect(() => {
    if (!highlightedId) return
    const timeout = setTimeout(() => setHighlightedId(null), 2200)
    return () => clearTimeout(timeout)
  }, [highlightedId])

  const handleStatusChange = (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => {
    const milestone = plan.milestones.find((m) => m.id === id)
    onMilestoneStatusChange(id, status, reason)
    if (milestone && status === 'fait') onMilestoneCompleted(milestone)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-xl p-0 sm:inset-y-0 sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:max-w-lg sm:rounded-none"
      >
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          className="gap-0"
        >
          <SheetHeader className="gap-3 border-b border-border p-4 pr-14">
            <SheetTitle className="text-lg leading-snug text-balance">
              {plan.target_title}
            </SheetTitle>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SheetDescription className="text-xs">
                Plan sur {plan.horizon_semesters} semestres · semestre actuel :{' '}
                {plan.current_semester_index}
              </SheetDescription>
              <TabsList>
                <TabsTrigger value="parcours" className="px-3">
                  Parcours
                </TabsTrigger>
                <TabsTrigger value="historique" className="px-3">
                  Historique
                </TabsTrigger>
              </TabsList>
            </div>
            {isDraft ? (
              <PlanDraftBanner
                missingSemesters={missing}
                onValidatePlan={onValidatePlan}
                onRequestNewProposal={onRequestNewProposal}
              />
            ) : (
              <PlanValidatedBar
                done={counts.done}
                total={counts.total}
                percent={counts.percent}
              />
            )}
          </SheetHeader>

          <TabsContent value="parcours" className="flex flex-col gap-3 p-4">
            {groups.map((group) => (
              <SemesterGroup
                key={group.index}
                group={group}
                currentSemesterIndex={plan.current_semester_index}
                open={openGroups.has(group.index)}
                onOpenChange={(next) =>
                  setOpenGroups((prev) => {
                    const copy = new Set(prev)
                    if (next) copy.add(group.index)
                    else copy.delete(group.index)
                    return copy
                  })
                }
                isDraft={isDraft}
                highlightedId={highlightedId}
                semesterTargets={semesterTargets}
                onStatusChange={handleStatusChange}
                onUpdate={onPlanUpdate}
              />
            ))}
          </TabsContent>

          <TabsContent value="historique" className="p-4">
            <PlanHistoryBook
              plan={plan}
              onJumpToMilestone={jumpToMilestone}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
