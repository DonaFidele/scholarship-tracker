'use client'

import { useState } from 'react'
import { cn } from 'cn'
import { ChevronDown } from 'lucide-react'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import { Spinner } from '@/components/ui/spinner'
import { StatusSelect } from '@/components/applications/status-select'
import type {
  ApplicationInfo,
  ApplicationStatus,
  Coverage,
  Level,
  Scholarship,
} from '@/lib/types'

type AddPayload = Scholarship &
  { status: ApplicationStatus } & Partial<
    Pick<ApplicationInfo, 'apply_link' | 'opens_at' | 'results_at'>
  >

const NONE = '__none__'

const empty = {
  name: '',
  link: '',
  amount: '',
  country: '',
  deadline: '',
  status: 'todo' as ApplicationStatus,
  level: NONE as Level | typeof NONE,
  coverage: NONE as Coverage | typeof NONE,
  opens_at: '',
  results_at: '',
  apply_link: '',
}

export function AddApplicationDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AddPayload) => void
  submitting: boolean
  error: string | null
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
    if (!form.name.trim()) {
      next.name = 'Le nom de la bourse est obligatoire.'
    }
    if (form.link.trim() && !/^https?:\/\/.+/i.test(form.link.trim())) {
      next.link = 'Entre une URL valide (commençant par http).'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!validate()) return
    onSubmit({
      name: form.name.trim(),
      link: form.link.trim() || null,
      amount: form.amount.trim() || null,
      country: form.country.trim() || null,
      deadline: form.deadline || null,
      level: form.level === NONE ? null : form.level,
      coverage: form.coverage === NONE ? null : form.coverage,
      benin_eligible: 'unknown',
      asks_fee: null,
      status: form.status,
      apply_link: form.apply_link.trim() || null,
      opens_at: form.opens_at || null,
      results_at: form.results_at || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="p-4">
          <DialogTitle>Ajouter une bourse</DialogTitle>
          <DialogDescription>
            Une bourse trouvée ailleurs ? Ajoute-la ici pour la suivre.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-name">Nom de la bourse *</Label>
            <Input
              id="add-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'add-name-error' : undefined}
              placeholder="Ex : Bourse d’excellence Eiffel"
              autoFocus
            />
            {errors.name && (
              <p id="add-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-link">Lien (optionnel)</Label>
            <Input
              id="add-link"
              type="url"
              inputMode="url"
              value={form.link}
              onChange={(e) => update('link', e.target.value)}
              aria-invalid={!!errors.link}
              aria-describedby={errors.link ? 'add-link-error' : undefined}
              placeholder="https://…"
            />
            {errors.link && (
              <p id="add-link-error" className="text-sm text-destructive">
                {errors.link}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-amount">Montant (optionnel)</Label>
            <Input
              id="add-amount"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              placeholder="Ex : Frais complets + 1 500 $/mois"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-country">Pays (optionnel)</Label>
              <Input
                id="add-country"
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                placeholder="Ex : Canada"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="add-deadline">Date limite (optionnel)</Label>
              <Input
                id="add-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => update('deadline', e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Statut</Label>
            <StatusSelect
              value={form.status}
              onChange={(status) => update('status', status)}
              className="w-full"
            />
          </div>

          <Collapsible className="flex flex-col gap-4 rounded-lg border border-border p-3">
            <CollapsibleTrigger
              render={
                <button
                  type="button"
                  className="group flex items-center justify-between gap-2 text-sm font-medium"
                />
              }
            >
              Plus de détails (optionnel)
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-level">Niveau</Label>
                  <Select
                    value={form.level}
                    onValueChange={(v) =>
                      update('level', v as Level | typeof NONE)
                    }
                  >
                    <SelectTrigger id="add-level" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Non précisé</SelectItem>
                      <SelectItem value="licence">Licence</SelectItem>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="doctorat">Doctorat</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-coverage">Couverture</Label>
                  <Select
                    value={form.coverage}
                    onValueChange={(v) =>
                      update('coverage', v as Coverage | typeof NONE)
                    }
                  >
                    <SelectTrigger id="add-coverage" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Non précisée</SelectItem>
                      <SelectItem value="full">Complète</SelectItem>
                      <SelectItem value="partial">Partielle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-opens">Ouverture des candidatures</Label>
                  <Input
                    id="add-opens"
                    type="date"
                    value={form.opens_at}
                    onChange={(e) => update('opens_at', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-results">Date des résultats</Label>
                  <Input
                    id="add-results"
                    type="date"
                    value={form.results_at}
                    onChange={(e) => update('results_at', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="add-apply-link">Lien de candidature</Label>
                <Input
                  id="add-apply-link"
                  type="url"
                  inputMode="url"
                  value={form.apply_link}
                  onChange={(e) => update('apply_link', e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className={cn('mt-2')}>
            <DialogClose
              render={
                <Button type="button" variant="ghost" disabled={submitting} />
              }
            >
              Annuler
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner data-icon="inline-start" />}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
