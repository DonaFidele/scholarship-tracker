'use client'

import { cn } from 'cn'
import { Bookmark, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function SaveButton({
  saved,
  saving,
  onClick,
  className,
}: {
  saved: boolean
  saving: boolean
  onClick: () => void
  className?: string
}) {
  if (saved) {
    return (
      <Button
        variant="outline"
        disabled
        className={cn(
          'border-emerald-500/30 bg-emerald-50 text-emerald-700 disabled:opacity-100 dark:bg-emerald-500/10 dark:text-emerald-400',
          className,
        )}
      >
        <Check data-icon="inline-start" />
        Sauvegardée
      </Button>
    )
  }

  return (
    <Button
      variant={saving ? 'outline' : 'default'}
      disabled={saving}
      onClick={onClick}
      className={className}
    >
      {saving ? (
        <>
          <Spinner data-icon="inline-start" />
          Sauvegarde…
        </>
      ) : (
        <>
          <Bookmark data-icon="inline-start" />
          Sauvegarder
        </>
      )}
    </Button>
  )
}
