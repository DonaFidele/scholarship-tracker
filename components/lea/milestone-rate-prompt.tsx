'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Step = 'ask' | 'leave' | 'adjust'

export function MilestoneRatePrompt({
  title,
  onLeave,
  onAdjust,
  onCancel,
}: {
  title: string
  onLeave: (reason: string | null) => void
  onAdjust: (newTitle: string, reason: string | null) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState<Step>('ask')
  const [newTitle, setNewTitle] = useState(title)
  const [reason, setReason] = useState('')
  const titleId = useId()
  const reasonId = useId()

  const cleanReason = reason.trim() === '' ? null : reason.trim()

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-3">
      {step === 'ask' ? (
        <>
          <p className="text-sm text-pretty">
            Rater une étape ne ferme pas la porte. Les parcours qui réussissent
            sont ceux qui s’ajustent, pas ceux qui vont tout droit. Qu’est-ce
            qu’on change maintenant ?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setStep('adjust')}>
              Ajuster cette étape
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setStep('leave')}
            >
              Laisser ratée pour l’instant
            </Button>
            <Button size="sm" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (step === 'adjust') {
              const trimmed = newTitle.trim()
              if (trimmed === '') return
              onAdjust(trimmed, cleanReason)
            } else {
              onLeave(cleanReason)
            }
          }}
        >
          {step === 'adjust' ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={titleId}>Nouveau titre de l’étape</Label>
              <Input
                id={titleId}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-background"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={reasonId}>
              {step === 'adjust'
                ? 'Pourquoi ce changement ? (optionnel)'
                : 'Qu’est-ce qui a coincé ? (optionnel)'}
            </Label>
            <Input
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              {step === 'adjust' ? 'Enregistrer l’ajustement' : 'Confirmer'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setStep('ask')}
            >
              Retour
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
