'use client'

import { useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function OpportunityTrustNotice() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <Alert className="border-amber-500/30 bg-amber-500/10 text-foreground">
      <ShieldAlert className="text-amber-600 dark:text-amber-400" />
      <AlertDescription className="pr-6 text-muted-foreground">
        Un vrai programme de volontariat ou de leadership ne demande jamais de
        frais d’inscription élevés. Vérifie toujours la légitimité avant de
        t’engager.
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setDismissed(true)}
        aria-label="Masquer l’avertissement"
        className="absolute right-2 top-2 text-muted-foreground"
      >
        <X />
      </Button>
    </Alert>
  )
}
