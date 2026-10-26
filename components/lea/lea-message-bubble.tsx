import { Sparkles } from 'lucide-react'
import { cn } from 'cn'
import type { LeaMessage } from '@/lib/types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function LeaMessageBubble({
  message,
  showDisclaimer = false,
}: {
  message: LeaMessage
  showDisclaimer?: boolean
}) {
  const isUser = message.role === 'user'
  return (
    <li className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <Sparkles className="size-4" />
        </span>
      )}
      <div
        className={cn(
          'flex max-w-[85%] flex-col gap-1',
          isUser ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'rounded-br-sm bg-primary/15 text-foreground'
              : 'rounded-bl-sm bg-muted text-foreground',
          )}
        >
          <span className="sr-only">{isUser ? 'Toi : ' : 'Léa : '}</span>
          {message.content}
        </div>
        <time
          dateTime={message.created_at}
          suppressHydrationWarning
          className="text-xs text-muted-foreground"
        >
          {formatTime(message.created_at)}
        </time>
        {!isUser && showDisclaimer && (
          <p className="text-xs text-muted-foreground">
            Vérifie toujours les exigences précises sur le site officiel.
          </p>
        )}
      </div>
    </li>
  )
}
