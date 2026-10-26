'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LeaPlanCard({ hasActivePlan }: { hasActivePlan: boolean }) {
  const [dismissed, setDismissed] = useState(false)
  if (hasActivePlan || dismissed) return null

  return (
    <Card>
      <CardContent className="relative flex flex-col gap-3 pr-12">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-3 size-8"
          aria-label="Masquer cette suggestion"
          onClick={() => setDismissed(true)}
        >
          <X />
        </Button>
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Sparkles className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-medium text-balance">
              Léa a préparé ton premier plan
            </h2>
            <p className="text-pretty text-sm text-muted-foreground">
              Dis-lui ton objectif, elle t’aide à construire un plan étape par
              étape.
            </p>
          </div>
        </div>
        <Button
          className="h-10 w-fit"
          nativeButton={false}
          render={<Link href="/lea" />}
        >
          Discuter avec Léa
        </Button>
      </CardContent>
    </Card>
  )
}
