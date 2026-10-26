'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

const CONFIRMATION_WORD = 'SUPPRIMER'

export function DangerZone({
  onDeleteAccount,
  deleting,
  deleteError,
}: {
  onDeleteAccount: () => void
  deleting: boolean
  deleteError: string | null
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')

  return (
    <Card className="border-destructive/60">
      <CardHeader>
        <CardTitle className="text-destructive">Zone sensible</CardTitle>
        <CardDescription>
          Cette action est définitive : ton compte, ton profil et toutes tes candidatures seront supprimés.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          <Trash2 data-icon="inline-start" />
          Supprimer mon compte et mes données
        </Button>
      </CardContent>

      <AlertDialog open={open} onOpenChange={(next) => { if (!deleting) { setOpen(next); if (!next) setTyped('') } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement ton compte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Toutes tes données seront effacées et ne pourront pas être récupérées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="delete-confirmation">
              Tape {CONFIRMATION_WORD} pour confirmer
            </Label>
            <Input
              id="delete-confirmation"
              value={typed}
              autoComplete="off"
              onChange={(event) => setTyped(event.target.value)}
              aria-invalid={deleteError ? true : undefined}
            />
            {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <Button variant="destructive" disabled={typed !== CONFIRMATION_WORD || deleting} onClick={onDeleteAccount}>
              {deleting && <Spinner data-icon="inline-start" />}
              Supprimer définitivement
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
