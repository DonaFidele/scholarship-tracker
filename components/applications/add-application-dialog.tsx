'use client'

import { useEffect, useState } from 'react'
import { cn } from 'cn'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { StatusSelect } from '@/components/applications/status-select'
import type { ApplicationStatus, Scholarship } from '@/lib/types'

type AddPayload = Scholarship & { status: ApplicationStatus }

const empty = {
  name: '',
  link: '',
  amount: '',
  country: '',
  deadline: '',
  status: 'todo' as ApplicationStatus,
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

  // Reset the form each time the dialog is opened.
  useEffect(() => {
    if (open) {
      setForm(empty)
      setErrors({})
    }
  }, [open])

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
      status: form.status,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
