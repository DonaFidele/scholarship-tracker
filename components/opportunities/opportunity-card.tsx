import { Clock, ExternalLink, MapPin, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SourceTag } from '@/components/for-you/source-tag'
import { OpportunityTypeBadge } from '@/components/opportunities/opportunity-type-badge'
import { costLabels, modeLabels } from '@/lib/opportunity-labels'
import type { Opportunity } from '@/lib/types'

export function OpportunityCard({ opportunity: o }: { opportunity: Opportunity }) {
  return (
    <li>
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <OpportunityTypeBadge type={o.type} />
            <SourceTag source={o.source} />
            {o.cost && (
              <Badge variant={o.cost === 'gratuit' ? 'secondary' : 'outline'}>
                {costLabels[o.cost]}
              </Badge>
            )}
          </div>
          <h3 className="text-pretty font-medium leading-snug">{o.name}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {o.description}
          </p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {o.duration && (
              <li className="flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {o.duration}
              </li>
            )}
            <li className="flex items-center gap-1">
              <Monitor className="size-3.5" aria-hidden="true" />
              {modeLabels[o.mode]}
            </li>
            {o.country && (
              <li className="flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" />
                {o.country}
              </li>
            )}
          </ul>
          <p className="text-sm">
            <span className="font-medium">Ce que ça t’apporte : </span>
            <span className="italic text-muted-foreground">{o.what_it_brings}</span>
          </p>
          {o.link && (
            <div className="mt-auto pt-1">
              <Button
                variant="outline"
                className="h-10 w-full sm:w-auto"
                nativeButton={false}
                render={
                  <a
                    href={o.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir le programme ${o.name} (nouvel onglet)`}
                  />
                }
              >
                Voir le programme
                <ExternalLink data-icon="inline-end" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </li>
  )
}
