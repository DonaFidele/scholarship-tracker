'use client'

import { useEffect, useRef, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { LeaView } from '@/components/lea/lea-view'
import {
  getMockLeaDraftPlan,
  getMockLeaMessages,
  getMockLeaPlan,
} from '@/lib/mock-data'
import { changeStatus, type PlanUpdater } from '@/lib/plan-actions'
import type {
  LeaChatState,
  LeaMessage,
  LeaPlan,
  MilestoneStatus,
  PlanMilestone,
} from '@/lib/types'

const MOCK_REPLY =
  'Bonne question. En général, je te conseille de noter les exigences officielles du programme visé, puis de les répartir sur tes semestres. Dis-moi quelle étape tu veux attaquer en premier.'

export function LeaPageClient({
  prefillQuery,
  demo = false,
}: {
  prefillQuery?: string
  demo?: boolean
}) {
  const [plan, setPlan] = useState<LeaPlan | null>(() =>
    demo ? getMockLeaPlan() : null,
  )
  const [messages, setMessages] = useState<LeaMessage[]>(() =>
    demo ? getMockLeaMessages() : [],
  )
  const [chatState, setChatState] = useState<LeaChatState>('idle')
  const [creatingPlan, setCreatingPlan] = useState(false)
  const [pipelineOpen, setPipelineOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const draftVariant = useRef(0)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const appendLea = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `lea-${prev.length + 1}`,
        role: 'lea',
        content,
        created_at: new Date().toISOString(),
      },
    ])
  }

  const handleCreatePlan = (title: string, horizonSemesters: number) => {
    setCreatingPlan(true)
    timer.current = setTimeout(() => {
      draftVariant.current = 0
      setPlan(getMockLeaDraftPlan(title, horizonSemesters, 0))
      setMessages(getMockLeaMessages().slice(0, 1))
      setCreatingPlan(false)
      setPipelineOpen(true)
    }, 900)
  }

  const reply = () => {
    setChatState('sending')
    timer.current = setTimeout(() => {
      appendLea(MOCK_REPLY)
      setChatState('idle')
    }, 1400)
  }

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${prev.length + 1}`,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      },
    ])
    reply()
  }

  const handleValidatePlan = () => {
    setPlan((prev) => (prev ? { ...prev, stage: 'validated' } : prev))
    appendLea(
      'Ton parcours est validé. Je te suivrai étape par étape, et on pourra l’ajuster quand tu veux.',
    )
  }

  const handleRequestNewProposal = (reason: string | null) => {
    draftVariant.current += 1
    const variant = draftVariant.current
    setPlan((prev) =>
      prev
        ? getMockLeaDraftPlan(prev.target_title, prev.horizon_semesters, variant)
        : prev,
    )
    appendLea(
      reason
        ? `J’ai préparé une autre proposition en tenant compte de : « ${reason} ». Regarde-la dans ton parcours.`
        : 'J’ai préparé une autre proposition. Regarde-la dans ton parcours.',
    )
  }

  const handleStatusChange = (
    id: string,
    status: MilestoneStatus,
    reason?: string | null,
  ) => {
    setPlan((prev) => (prev ? changeStatus(prev, id, status, reason ?? null) : prev))
  }

  const handlePlanUpdate = (updater: PlanUpdater) => {
    setPlan((prev) => (prev ? updater(prev) : prev))
  }

  const handleCompleted = (milestone: PlanMilestone) => {
    appendLea(
      `Bravo, tu as terminé « ${milestone.title} » ! On passe à la suite ?`,
    )
  }

  return (
    <div className="min-h-svh">
      <Navbar active="lea" applicationsCount={0} />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-28 md:pb-8">
        <LeaView
          plan={plan}
          messages={messages}
          chatState={chatState}
          creatingPlan={creatingPlan}
          prefillQuery={prefillQuery}
          pipelineOpen={pipelineOpen}
          onPipelineOpenChange={setPipelineOpen}
          onCreatePlan={handleCreatePlan}
          onSendMessage={handleSend}
          onRetryLastMessage={reply}
          onValidatePlan={handleValidatePlan}
          onRequestNewProposal={handleRequestNewProposal}
          onMilestoneStatusChange={handleStatusChange}
          onPlanUpdate={handlePlanUpdate}
          onMilestoneCompleted={handleCompleted}
        />
      </main>
    </div>
  )
}
