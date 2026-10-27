'use client'

import { LeaChatInput } from '@/components/lea/lea-chat-input'
import { LeaChatThread } from '@/components/lea/lea-chat-thread'
import { LeaIntroCard } from '@/components/lea/lea-intro-card'
import { LeaPlanSummaryCard } from '@/components/lea/lea-plan-summary-card'
import { PlanPipelineSheet } from '@/components/lea/plan-pipeline-sheet'
import type {
  LeaChatState,
  LeaMessage,
  LeaPlan,
  MilestoneStatus,
  PlanMilestone,
} from '@/lib/types'

export function LeaView({
  plan,
  messages,
  chatState,
  creatingPlan,
  prefillQuery,
  pipelineOpen,
  adjusting,
  onPipelineOpenChange,
  onToggleAdjustMode,
  onCreatePlan,
  onSendMessage,
  onRetryLastMessage,
  onValidatePlan,
  onRequestNewProposal,
  onMilestoneStatusChange,
  onMilestoneEdit,
  onMilestoneDelete,
  onMilestoneAdd,
  onMilestoneCompleted,
}: {
  plan: LeaPlan | null
  messages: LeaMessage[]
  chatState: LeaChatState
  creatingPlan: boolean
  prefillQuery?: string
  pipelineOpen: boolean
  adjusting: boolean
  onPipelineOpenChange: (open: boolean) => void
  onToggleAdjustMode: () => void
  onCreatePlan: (title: string, horizonSemesters: number) => void
  onSendMessage: (text: string) => void
  onRetryLastMessage: () => void
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
  if (!plan) {
    return (
      <LeaIntroCard creatingPlan={creatingPlan} onCreatePlan={onCreatePlan} />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <LeaPlanSummaryCard
        plan={plan}
        onOpenPipeline={() => onPipelineOpenChange(true)}
      />
      <LeaChatThread
        messages={messages}
        chatState={chatState}
        onRetryLastMessage={onRetryLastMessage}
      />
      <LeaChatInput
        chatState={chatState}
        initialValue={prefillQuery}
        onSendMessage={onSendMessage}
      />
      <PlanPipelineSheet
        plan={plan}
        open={pipelineOpen}
        onOpenChange={onPipelineOpenChange}
        adjusting={adjusting}
        onToggleAdjustMode={onToggleAdjustMode}
        onValidatePlan={onValidatePlan}
        onRequestNewProposal={onRequestNewProposal}
        onMilestoneStatusChange={onMilestoneStatusChange}
        onMilestoneEdit={onMilestoneEdit}
        onMilestoneDelete={onMilestoneDelete}
        onMilestoneAdd={onMilestoneAdd}
        onMilestoneCompleted={onMilestoneCompleted}
      />
    </div>
  )
}
