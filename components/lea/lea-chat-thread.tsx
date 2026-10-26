'use client'

import { useEffect, useRef } from 'react'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeaMessageBubble } from '@/components/lea/lea-message-bubble'
import { LeaTypingIndicator } from '@/components/lea/lea-typing-indicator'
import type { LeaChatState, LeaMessage } from '@/lib/types'

export function LeaChatThread({
  messages,
  chatState,
  onRetryLastMessage,
}: {
  messages: LeaMessage[]
  chatState: LeaChatState
  onRetryLastMessage: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, chatState])

  const lastLeaId = [...messages].reverse().find((m) => m.role === 'lea')?.id

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="max-h-[55svh] min-h-48 overflow-y-auto rounded-xl border border-border p-4 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="sr-only" aria-live="polite">
        {chatState === 'sending' ? 'Léa est en train d’écrire…' : ''}
      </div>
      <ol aria-label="Conversation avec Léa" className="flex flex-col gap-4">
        {messages.map((m) => (
          <LeaMessageBubble
            key={m.id}
            message={m}
            showDisclaimer={m.id === lastLeaId}
          />
        ))}
        {chatState === 'sending' && <LeaTypingIndicator />}
        {chatState === 'error' && (
          <li
            role="alert"
            className="flex flex-wrap items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            Léa n’a pas pu répondre. Réessaie.
            <Button variant="outline" size="sm" onClick={onRetryLastMessage}>
              <RotateCw data-icon="inline-start" />
              Réessayer
            </Button>
          </li>
        )}
      </ol>
    </div>
  )
}
