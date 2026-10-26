'use client'

import { LeaChatInput } from '@/components/lea/lea-chat-input'
import { LeaChatThread } from '@/components/lea/lea-chat-thread'
import { LeaIntroCard } from '@/components/lea/lea-intro-card'
import { LeaPlanHeader } from '@/components/lea/lea-plan-header'
import type {
  LeaChatState,
  LeaMessage,
  LeaPlan,
  MilestoneStatus,
} from '@/lib/types'

export function LeaView({
  plan,
  messages,
  chatState,
  creatingPlan,
  prefillQuery,
  onCreatePlan,
  onSendMessage,
  onRetryLastMessage,
  onMilestoneStatusChange,
}: {
  plan: LeaPlan | null
  messages: LeaMessage[]
  chatState: LeaChatState
  creatingPlan: boolean
  prefillQuery?: string
  onCreatePlan: (title: string, horizonSemesters: number) => void
  onSendMessage: (text: string) => void
  onRetryLastMessage: () => void
  onMilestoneStatusChange: (id: string, status: MilestoneStatus) => void
}) {
  if (!plan) {
    return (
      <LeaIntroCard creatingPlan={creatingPlan} onCreatePlan={onCreatePlan} />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <LeaPlanHeader
        plan={plan}
        onMilestoneStatusChange={onMilestoneStatusChange}
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
    </div>
  )
}
