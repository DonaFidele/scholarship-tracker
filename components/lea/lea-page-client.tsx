'use client'

import { useEffect, useRef, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { LeaView } from '@/components/lea/lea-view'
import { getMockLeaMessages, getMockLeaPlan } from '@/lib/mock-data'
import type {
  LeaChatState,
  LeaMessage,
  LeaPlan,
  MilestoneStatus,
} from '@/lib/types'

const MOCK_REPLY =
  'Bonne question. En général, je te conseille de noter les exigences officielles du programme visé, puis de les répartir sur tes semestres. Dis-moi quelle étape tu veux attaquer en premier.'

export function LeaPageClient({ prefillQuery }: { prefillQuery?: string }) {
  const [plan, setPlan] = useState<LeaPlan | null>(null)
  const [messages, setMessages] = useState<LeaMessage[]>([])
  const [chatState, setChatState] = useState<LeaChatState>('idle')
  const [creatingPlan, setCreatingPlan] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const handleCreatePlan = (title: string, horizonSemesters: number) => {
    setCreatingPlan(true)
    timer.current = setTimeout(() => {
      setPlan({
        ...getMockLeaPlan(),
        target_title: title,
        horizon_semesters: horizonSemesters,
      })
      setMessages(getMockLeaMessages().slice(0, 1))
      setCreatingPlan(false)
    }, 900)
  }

  const reply = () => {
    setChatState('sending')
    timer.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `lea-${prev.length + 1}`,
          role: 'lea',
          content: MOCK_REPLY,
          created_at: new Date().toISOString(),
        },
      ])
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

  const handleMilestoneStatus = (id: string, status: MilestoneStatus) => {
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((m) =>
              m.id === id ? { ...m, status } : m,
            ),
          }
        : prev,
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
          onCreatePlan={handleCreatePlan}
          onSendMessage={handleSend}
          onRetryLastMessage={reply}
          onMilestoneStatusChange={handleMilestoneStatus}
        />
      </main>
    </div>
  )
}
