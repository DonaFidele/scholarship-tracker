import { ShieldCheck, Users } from 'lucide-react'
import { cn } from 'cn'
import { Badge } from '@/components/ui/badge'
import type { CatalogSource } from '@/lib/types'

export function SourceTag({
  source,
  className,
}: {
  source: CatalogSource
  className?: string
}) {
  if (source === 'curated') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'w-fit gap-1 border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
          className,
        )}
      >
        <ShieldCheck className="size-3" aria-hidden="true" />
        Vérifiée
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className={cn('w-fit gap-1 text-muted-foreground', className)}
    >
      <Users className="size-3" aria-hidden="true" />
      Trouvée par la communauté
    </Badge>
  )
}
