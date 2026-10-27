'use client'

import { LeaChatInput } from '@/components/lea/lea-chat-input'
import { LeaChatThread } from '@/components/lea/lea-chat-thread'
import { LeaIntroCard } from '@/components/lea/lea-intro-card'
import { LeaPlanSummaryCard } from '@/components/lea/lea-plan-summary-card'
import { LeaQuickReplies } from '@/components/lea/lea-quick-replies'
import { PlanPipelineSheet } from '@/components/lea/plan-pipeline-sheet'
import { nextMilestone, planCounts } from '@/lib/milestone-helpers'
import type { PlanUpdater } from '@/lib/plan-actions'
import type {
  LeaChatState,
  LeaMessage,
  LeaPlan,
  MilestoneStatus,
  PlanMilestone,
} from '@/lib/types'

function quickReplies(plan: LeaPlan): string[] {
  if (plan.stage === 'draft') {
    return [
      'Pourquoi cet ordre d’étapes ?',
      'C’est trop chargé pour moi',
      'Il manque quelque chose ?',
    ]
  }
  const next = nextMilestone(plan)
  const { late } = planCounts(plan)
  const replies: string[] = []
  if (next) replies.push(`Comment je m’y prends pour « ${next.title} » ?`)
  if (late > 0) replies.push('Je suis en retard, on réorganise ?')
  replies.push('Qu’est-ce qui rendrait mon dossier plus fort ?')
  return replies
}

export function LeaView({
  plan,
  messages,
  chatState,
  creatingPlan,
  prefillQuery,
  pipelineOpen,
  onPipelineOpenChange,
  onCreatePlan,
  onSendMessage,
  onRetryLastMessage,
  onValidatePlan,
  onRequestNewProposal,
  onMilestoneStatusChange,
  onPlanUpdate,
  onMilestoneCompleted,
}: {
  plan: LeaPlan | null
  messages: LeaMessage[]
  chatState: LeaChatState
  creatingPlan: boolean
  prefillQuery?: string
  pipelineOpen: boolean
  onPipelineOpenChange: (open: boolean) => void
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
  onPlanUpdate: (updater: PlanUpdater) => void
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
        onStatusChange={(id, status) => onMilestoneStatusChange(id, status)}
        onMilestoneCompleted={onMilestoneCompleted}
      />
      <div className="flex flex-col gap-3 pt-2">
        <h2 className="text-sm font-semibold">Discuter avec Léa</h2>
        <LeaChatThread
          messages={messages}
          chatState={chatState}
          onRetryLastMessage={onRetryLastMessage}
        />
      </div>
      <LeaQuickReplies
        suggestions={quickReplies(plan)}
        disabled={chatState === 'sending'}
        onPick={onSendMessage}
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
        onValidatePlan={onValidatePlan}
        onRequestNewProposal={onRequestNewProposal}
        onMilestoneStatusChange={onMilestoneStatusChange}
        onPlanUpdate={onPlanUpdate}
        onMilestoneCompleted={onMilestoneCompleted}
      />
    </div>
  )
}
