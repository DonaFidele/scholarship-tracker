'use client'

import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  coverageLabels,
  levelLabels,
} from '@/components/scholarship/metadata-badges'
import { formatDateFr } from '@/lib/format'
import type {
  Application,
  BeninEligibility,
  ScholarshipDetails,
} from '@/lib/types'

/** Keys the apply-details patch may contain. */
type DetailsPatchKey =
  | 'level'
  | 'coverage'
  | 'benin_eligible'
  | 'asks_fee'
  | 'opens_at'
  | 'deadline'
  | 'results_at'
  | 'apply_link'
  | 'covered_costs'
  | 'eligibility_notes'

type DetailsPatch = Partial<Pick<Application, DetailsPatchKey>>

const beninLabels: Record<BeninEligibility, string> = {
  yes: 'Oui',
  no: 'Non',
  unknown: 'À vérifier',
}

/** Removes accents + case so document labels compare fairly. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

type Field = {
  key: DetailsPatchKey
  label: string
  proposed: unknown
  proposedText: string
  currentText: string | null
  isEmpty: boolean
  isDifferent: boolean
}

export function DetailsProposalCard({
  application,
  proposal,
  applying,
  onApply,
  onDismiss,
}: {
  application: Application
  proposal: ScholarshipDetails
  applying: boolean
  onApply: (patch: DetailsPatch, documentsToAdd: string[]) => void
  onDismiss: () => void
}) {
  const fields = useMemo<Field[]>(() => {
    const list: Field[] = []
    const push = (
      key: DetailsPatchKey,
      label: string,
      show: boolean,
      proposed: unknown,
      proposedText: string,
      current: unknown,
      currentText: string | null,
      currentEmpty: boolean,
    ) => {
      if (!show) return
      list.push({
        key,
        label,
        proposed,
        proposedText,
        currentText: currentEmpty ? null : currentText,
        isEmpty: currentEmpty,
        isDifferent: !currentEmpty && current !== proposed,
      })
    }

    push(
      'level',
      'Niveau',
      proposal.level !== null,
      proposal.level,
      proposal.level ? levelLabels[proposal.level] : '',
      application.level,
      application.level ? levelLabels[application.level] : null,
      application.level === null,
    )
    push(
      'coverage',
      'Couverture',
      proposal.coverage !== null,
      proposal.coverage,
      proposal.coverage ? coverageLabels[proposal.coverage] : '',
      application.coverage,
      application.coverage ? coverageLabels[application.coverage] : null,
      application.coverage === null,
    )
    push(
      'benin_eligible',
      'Bénin éligible',
      proposal.benin_eligible !== 'unknown',
      proposal.benin_eligible,
      beninLabels[proposal.benin_eligible],
      application.benin_eligible,
      beninLabels[application.benin_eligible],
      application.benin_eligible === 'unknown',
    )
    push(
      'asks_fee',
      'Frais demandés',
      proposal.asks_fee === true,
      proposal.asks_fee,
      'Oui',
      application.asks_fee,
      application.asks_fee === null
        ? null
        : application.asks_fee
          ? 'Oui'
          : 'Non',
      application.asks_fee === null,
    )
    push(
      'opens_at',
      'Ouverture',
      proposal.opens_at !== null,
      proposal.opens_at,
      formatDateFr(proposal.opens_at),
      application.opens_at,
      formatDateFr(application.opens_at) || null,
      !application.opens_at,
    )
    push(
      'deadline',
      'Date limite',
      proposal.deadline !== null,
      proposal.deadline,
      formatDateFr(proposal.deadline),
      application.deadline,
      formatDateFr(application.deadline) || null,
      !application.deadline,
    )
    push(
      'results_at',
      'Résultats',
      proposal.results_at !== null,
      proposal.results_at,
      formatDateFr(proposal.results_at),
      application.results_at,
      formatDateFr(application.results_at) || null,
      !application.results_at,
    )
    push(
      'apply_link',
      'Lien de candidature',
      proposal.apply_link !== null,
      proposal.apply_link,
      proposal.apply_link ?? '',
      application.apply_link,
      application.apply_link,
      !application.apply_link,
    )
    push(
      'covered_costs',
      'Frais couverts',
      proposal.covered_costs !== null,
      proposal.covered_costs,
      proposal.covered_costs ?? '',
      application.covered_costs,
      application.covered_costs,
      !application.covered_costs,
    )
    push(
      'eligibility_notes',
      'Conditions d’éligibilité',
      proposal.eligibility_summary !== null,
      proposal.eligibility_summary,
      proposal.eligibility_summary ?? '',
      application.eligibility_notes,
      application.eligibility_notes,
      !application.eligibility_notes,
    )
    return list
  }, [application, proposal])

  const existingLabels = useMemo(
    () => new Set(application.checklist_items.map((it) => normalize(it.label))),
    [application.checklist_items],
  )

  const documents = useMemo(
    () =>
      proposal.required_documents.map((label) => ({
        label,
        alreadyPresent: existingLabels.has(normalize(label)),
      })),
    [proposal.required_documents, existingLabels],
  )

  const [selectedFields, setSelectedFields] = useState<Set<DetailsPatchKey>>(
    () => new Set(fields.filter((f) => f.isEmpty).map((f) => f.key)),
  )
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(
    () =>
      new Set(
        documents.filter((d) => !d.alreadyPresent).map((d) => d.label),
      ),
  )

  const toggleField = (key: DetailsPatchKey, checked: boolean) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const toggleDoc = (label: string, checked: boolean) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev)
      if (checked) next.add(label)
      else next.delete(label)
      return next
    })
  }

  const handleApply = () => {
    const patch: DetailsPatch = {}
    for (const field of fields) {
      if (selectedFields.has(field.key)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(patch as any)[field.key] = field.proposed
      }
    }
    const docs = documents
      .filter((d) => !d.alreadyPresent && selectedDocs.has(d.label))
      .map((d) => d.label)
    onApply(patch, docs)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-indigo-500/40 bg-indigo-500/5 p-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-4 text-indigo-500" />
        <h4 className="font-medium">Détails trouvés</h4>
      </div>

      <ul className="flex flex-col gap-2">
        {fields.map((field) => {
          const id = `detail-field-${field.key}`
          return (
            <li key={field.key} className="flex items-start gap-2.5">
              <Checkbox
                id={id}
                checked={selectedFields.has(field.key)}
                onCheckedChange={(c) => toggleField(field.key, c === true)}
                className="mt-0.5"
              />
              <div className="flex flex-1 flex-col">
                <Label htmlFor={id} className="font-normal">
                  <span className="text-muted-foreground">{field.label} : </span>
                  <span className="font-medium">{field.proposedText}</span>
                </Label>
                {field.isDifferent && field.currentText && (
                  <span className="text-xs text-muted-foreground">
                    Remplace : {field.currentText}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {documents.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-indigo-500/20 pt-3">
          <p className="text-sm font-medium">Documents requis trouvés</p>
          <ul className="flex flex-col gap-2">
            {documents.map((doc) => {
              const id = `detail-doc-${normalize(doc.label).replace(/\s+/g, '-')}`
              return (
                <li key={doc.label} className="flex items-start gap-2.5">
                  <Checkbox
                    id={id}
                    checked={
                      doc.alreadyPresent ? false : selectedDocs.has(doc.label)
                    }
                    disabled={doc.alreadyPresent}
                    onCheckedChange={(c) => toggleDoc(doc.label, c === true)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={id}
                    className="flex-1 font-normal data-[disabled]:opacity-100"
                  >
                    {doc.label}
                    {doc.alreadyPresent && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        · Déjà dans ta liste
                      </span>
                    )}
                  </Label>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-pretty">
        Extrait automatiquement. Vérifie sur le site officiel avant de décider.
      </p>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleApply}
          disabled={applying}
        >
          {applying && <Spinner data-icon="inline-start" />}
          Appliquer la sélection
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          disabled={applying}
        >
          Ignorer
        </Button>
      </div>
    </div>
  )
}
