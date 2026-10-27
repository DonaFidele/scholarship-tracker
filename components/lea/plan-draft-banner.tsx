'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function PlanDraftBanner({
  missingSemesters,
  onValidatePlan,
  onRequestNewProposal,
}: {
  missingSemesters: number[]
  onValidatePlan: () => void
  onRequestNewProposal: (reason: string | null) => void
}) {
  const [asking, setAsking] = useState(false)
  const [reason, setReason] = useState('')
  const fieldId = useId()

  const submit = () => {
    onRequestNewProposal(reason.trim() === '' ? null : reason.trim())
    setAsking(false)
    setReason('')
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-pretty">
          Brouillon — ajuste tes objectifs, puis valide ton parcours.
        </p>
        <p className="text-xs text-pretty text-muted-foreground">
          1 à 3 objectifs par semestre, avec des sous-objectifs si besoin. Tu
          pourras encore tout modifier après validation.
        </p>
        {missingSemesters.length > 0 ? (
          <p role="status" className="text-xs font-medium text-amber-700 dark:text-amber-300">
            {missingSemesters.length === 1
              ? `Le semestre ${missingSemesters[0]} n’a aucun objectif.`
              : `Les semestres ${missingSemesters.join(', ')} n’ont aucun objectif.`}
          </p>
        ) : null}
      </div>
      {asking ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={fieldId}>
            Qu’est-ce qui ne te convient pas ? (optionnel)
          </Label>
          <Textarea
            id={fieldId}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="bg-background"
          />
          <div className="flex flex-wrap gap-2">
            <Button className="h-9" onClick={submit}>
              Envoyer la demande
            </Button>
            <Button
              variant="ghost"
              className="h-9"
              onClick={() => {
                setAsking(false)
                setReason('')
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            className="h-9"
            disabled={missingSemesters.length > 0}
            onClick={onValidatePlan}
          >
            Valider ce parcours
          </Button>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => setAsking(true)}
          >
            Demander une autre proposition
          </Button>
        </div>
      )}
    </div>
  )
}
