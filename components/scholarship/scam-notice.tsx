'use client'

import { useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/**
 * Compact anti-scam reminder. Dismissible for the current session only
 * (local state, no persistence).
 */
export function ScamNotice() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <Alert className="border-amber-500/30 bg-amber-500/10 text-foreground">
      <ShieldAlert className="text-amber-600 dark:text-amber-400" />
      <AlertDescription className="pr-6 text-muted-foreground">
        Une vraie bourse ne demande jamais de payer pour postuler. Méfie-toi des
        frais de dossier, des demandes de virement et des offres reçues par
        WhatsApp.
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
