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
import { MilestoneAddForm } from '@/components/lea/milestone-add-form'
import { PlanDraftBanner } from '@/components/lea/plan-draft-banner'
import { PlanGlobalHistory } from '@/components/lea/plan-global-history'
import { PlanValidatedBar } from '@/components/lea/plan-validated-bar'
import { SemesterGroup } from '@/components/lea/semester-group'
import {
  groupBySemester,
  planCounts,
  semesterOptions,
} from '@/lib/milestone-helpers'
import type { LeaPlan, MilestoneStatus, PlanMilestone } from '@/lib/types'

type Tab = 'parcours' | 'historique'

export function PlanPipelineSheet({
  plan,
  open,
  onOpenChange,
  adjusting,
  onToggleAdjustMode,
  onValidatePlan,
  onRequestNewProposal,
  onMilestoneStatusChange,
  onMilestoneEdit,
  onMilestoneDelete,
  onMilestoneAdd,
  onMilestoneCompleted,
}: {
  plan: LeaPlan
  open: boolean
  onOpenChange: (open: boolean) => void
  adjusting: boolean
  onToggleAdjustMode: () => void
  onValidatePlan: () => void
  onRequestNewProposal: (reason: string | null) => void
  onMilestoneStatusChange: (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => void
  onMilestoneEdit: (
    id: string,
    newTitle: string,
    semesterLabel: string,
    semesterIndex: number,
    reason?: string | null,
  ) => void
  onMilestoneDelete: (id: string) => void
  onMilestoneAdd: (
    title: string,
    semesterLabel: string,
    semesterIndex: number,
  ) => void
  onMilestoneCompleted: (milestone: PlanMilestone) => void
}) {
  const [tab, setTab] = useState<Tab>('parcours')
  const [closedGroups, setClosedGroups] = useState<Set<number>>(new Set())
  const [pendingJump, setPendingJump] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  const isDraft = plan.stage === 'draft'
  const editing = isDraft || adjusting
  const canTrack = !isDraft && !adjusting
  const counts = planCounts(plan)
  const groups = useMemo(() => groupBySemester(plan.milestones), [plan.milestones])
  const semesterItems = useMemo(
    () => semesterOptions(plan.horizon_semesters, plan.current_semester_index),
    [plan.horizon_semesters, plan.current_semester_index],
  )

  const jumpToMilestone = (id: string) => {
    const milestone = plan.milestones.find((m) => m.id === id)
    if (!milestone) return
    setClosedGroups((prev) => {
      const next = new Set(prev)
      next.delete(milestone.semester_index)
      return next
    })
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
                  Historique global
                </TabsTrigger>
              </TabsList>
            </div>
            {isDraft ? (
              <PlanDraftBanner
                onValidatePlan={onValidatePlan}
                onRequestNewProposal={onRequestNewProposal}
              />
            ) : (
              <PlanValidatedBar
                done={counts.done}
                total={counts.total}
                percent={counts.percent}
                adjusting={adjusting}
                onToggleAdjustMode={onToggleAdjustMode}
              />
            )}
          </SheetHeader>

          <TabsContent value="parcours" className="flex flex-col gap-5 p-4">
            {groups.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Aucune étape pour l’instant.
              </p>
            ) : null}
            {groups.map((group) => (
              <SemesterGroup
                key={group.index}
                group={group}
                currentSemesterIndex={plan.current_semester_index}
                open={!closedGroups.has(group.index)}
                onOpenChange={(next) =>
                  setClosedGroups((prev) => {
                    const copy = new Set(prev)
                    if (next) copy.delete(group.index)
                    else copy.add(group.index)
                    return copy
                  })
                }
                editing={editing}
                canTrack={canTrack}
                highlightedId={highlightedId}
                semesterItems={semesterItems}
                onStatusChange={handleStatusChange}
                onEdit={onMilestoneEdit}
                onDelete={onMilestoneDelete}
              />
            ))}
            {editing ? (
              <MilestoneAddForm
                semesterItems={semesterItems}
                defaultSemesterIndex={plan.current_semester_index}
                onAdd={onMilestoneAdd}
              />
            ) : null}
          </TabsContent>

          <TabsContent value="historique" className="p-4">
            <PlanGlobalHistory
              plan={plan}
              onJumpToMilestone={jumpToMilestone}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
