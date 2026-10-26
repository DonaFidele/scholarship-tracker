'use client'

import { useState, type KeyboardEvent } from 'react'
import { SendHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { LeaChatState } from '@/lib/types'

export function LeaChatInput({
  chatState,
  initialValue = '',
  onSendMessage,
}: {
  chatState: LeaChatState
  initialValue?: string
  onSendMessage: (text: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  const sending = chatState === 'sending'
  const canSend = value.trim().length > 0 && !sending

  const send = () => {
    if (!canSend) return
    onSendMessage(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    send()
  }

  return (
    <div className="sticky bottom-16 z-30 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-xl md:border">
      <form
        className="flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Textarea
          value={value}
          rows={1}
          aria-label="Ton message pour Léa"
          placeholder="Écris ton message à Léa…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-28 min-h-10 resize-none overflow-y-auto"
        />
        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0"
          disabled={!canSend}
          aria-label="Envoyer le message"
        >
          <SendHorizontal />
        </Button>
      </form>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Entrée pour envoyer, Maj + Entrée pour un retour à la ligne.
      </p>
    </div>
  )
}
