'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  OPPORTUNITY_TYPES,
  costLabels,
  modeLabels,
  typeLabels,
} from '@/lib/opportunity-labels'
import type {
  OpportunityCost,
  OpportunityMode,
  OpportunitySuggestion,
  OpportunityType,
} from '@/lib/types'

const NONE = '__none__'
const DESCRIPTION_MAX = 400

const typeItems = OPPORTUNITY_TYPES.map((t) => ({ value: t, label: typeLabels[t] }))
const modeItems = (Object.keys(modeLabels) as OpportunityMode[]).map((m) => ({
  value: m,
  label: modeLabels[m],
}))
const costItems = [
  { value: NONE, label: 'Non précisé' },
  { value: 'gratuit', label: costLabels.gratuit },
  { value: 'payant', label: costLabels.payant },
]

const empty = {
  name: '',
  type: 'leadership' as OpportunityType,
  description: '',
  link: '',
  duration: '',
  mode: 'en_ligne' as OpportunityMode,
  cost: NONE as OpportunityCost | typeof NONE,
}

export function SuggestOpportunityDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: OpportunitySuggestion) => void
}) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setForm(empty)
      setErrors({})
    }
    onOpenChange(nextOpen)
  }

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Le nom du programme est obligatoire.'
    if (!form.description.trim()) next.description = 'Ajoute une courte description.'
    if (form.link.trim() && !/^https?:\/\/.+/i.test(form.link.trim())) {
      next.link = 'Entre une URL valide (commençant par http).'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      link: form.link.trim() || null,
      duration: form.duration.trim() || null,
      mode: form.mode,
      cost: form.cost === NONE ? null : form.cost,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="p-4">
          <DialogTitle>Proposer un programme</DialogTitle>
          <DialogDescription>
            Tu connais un programme utile ? Partage-le, nous le vérifierons avant
            publication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="suggest-name">Nom du programme *</Label>
            <Input
              id="suggest-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'suggest-name-error' : undefined}
              placeholder="Ex : Programme de mentorat Alumni"
              autoFocus
            />
            {errors.name && (
              <p id="suggest-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="suggest-type">Type</Label>
            <Select
              items={typeItems}
              value={form.type}
              onValueChange={(v) => update('type', v as OpportunityType)}
            >
              <SelectTrigger id="suggest-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="suggest-description">Description *</Label>
            <Textarea
              id="suggest-description"
              value={form.description}
              maxLength={DESCRIPTION_MAX}
              onChange={(e) => update('description', e.target.value)}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'suggest-description-error' : undefined
              }
              placeholder="À qui s’adresse-t-il, que fait-on, comment s’inscrire…"
              className="min-h-24"
            />
            {errors.description && (
              <p
                id="suggest-description-error"
                className="text-sm text-destructive"
              >
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="suggest-link">Lien (optionnel)</Label>
            <Input
              id="suggest-link"
              type="url"
              inputMode="url"
              value={form.link}
              onChange={(e) => update('link', e.target.value)}
              aria-invalid={!!errors.link}
              aria-describedby={errors.link ? 'suggest-link-error' : undefined}
              placeholder="https://…"
            />
            {errors.link && (
              <p id="suggest-link-error" className="text-sm text-destructive">
                {errors.link}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="suggest-duration">Durée</Label>
              <Input
                id="suggest-duration"
                value={form.duration}
                onChange={(e) => update('duration', e.target.value)}
                placeholder="Ex : 6 mois"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="suggest-mode">Format</Label>
              <Select
                items={modeItems}
                value={form.mode}
                onValueChange={(v) => update('mode', v as OpportunityMode)}
              >
                <SelectTrigger id="suggest-mode" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="suggest-cost">Coût</Label>
              <Select
                items={costItems}
                value={form.cost}
                onValueChange={(v) =>
                  update('cost', v as OpportunityCost | typeof NONE)
                }
              >
                <SelectTrigger id="suggest-cost" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {costItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <DialogClose render={<Button type="button" variant="ghost" />}>
              Annuler
            </DialogClose>
            <Button type="submit">Envoyer la suggestion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
