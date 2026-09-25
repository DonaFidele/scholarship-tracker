'use client'

import { cn } from 'cn'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Star toggle with a 44px touch target used to mark an application favorite. */
export function FavoriteToggle({
  value,
  onToggle,
  className,
}: {
  value: boolean
  onToggle: (value: boolean) => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onToggle(!value)}
      aria-pressed={value}
      aria-label={value ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={cn('size-11 shrink-0 text-muted-foreground', className)}
    >
      <Star
        className={cn(
          'size-5',
          value && 'fill-amber-400 text-amber-400',
        )}
      />
    </Button>
  )
}
