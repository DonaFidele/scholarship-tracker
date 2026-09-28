'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import type { UserSettings } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

const reminderOptions = [
  { days: 7, label: '7 jours avant' },
  { days: 3, label: '3 jours avant' },
  { days: 1, label: '1 jour avant' },
]

export function SettingsView({
  settings,
  email,
  saving,
  onSave,
  onSignOut,
}: {
  settings: UserSettings
  email: string
  saving: boolean
  onSave: (settings: UserSettings) => void
  onSignOut: () => void
}) {
  const [draft, setDraft] = useState<UserSettings>(settings)


  const changed =
    draft.email_reminders !== settings.email_reminders ||
    reminderOptions.some(({ days }) => draft.reminder_days.includes(days) !== settings.reminder_days.includes(days))

  const toggleDay = (day: number, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      reminder_days: checked
        ? [...current.reminder_days, day]
        : current.reminder_days.filter((value) => value !== day),
    }))
  }

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-0">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Paramètres</h1>
      </header>

      <Card>
        <CardHeader><CardTitle>Rappels par email</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="email-reminders" className="cursor-pointer">Recevoir des rappels par email</Label>
            <Switch id="email-reminders" checked={draft.email_reminders} onCheckedChange={(checked) => setDraft((current) => ({ ...current, email_reminders: checked }))} />
          </div>
          <div className="flex flex-col gap-3" aria-disabled={!draft.email_reminders}>
            {reminderOptions.map(({ days, label }) => (
              <Label key={days} className="flex items-center gap-3 text-sm">
                <Checkbox checked={draft.reminder_days.includes(days)} disabled={!draft.email_reminders} onCheckedChange={(checked) => toggleDay(days, checked === true)} />
                {label}
              </Label>
            ))}
          </div>
          <CardDescription>
            Tu reçois au maximum 1 email par jour, qui regroupe toutes les bourses concernées. Seules les candidatures « À faire » et « En cours » sont concernées.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Compte</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <Label htmlFor="account-email">Adresse email</Label>
            <p id="account-email" className="text-sm text-muted-foreground">{email}</p>
          </div>
          <Button variant="outline" onClick={onSignOut}>
            <LogOut data-icon="inline-start" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 z-30 -mx-4 mt-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:flex md:justify-end md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <Button disabled={!changed || saving} onClick={() => onSave({ ...draft, reminder_days: [...draft.reminder_days] })}>
          {saving && <Spinner data-icon="inline-start" />}
          Enregistrer
        </Button>
      </div>
    </div>
  )
}
