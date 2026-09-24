'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function DeleteDialog({
  name,
  onConfirm,
  trigger,
}: {
  name: string
  onConfirm: () => void
  /** Optional custom trigger. Falls back to an icon-only button. */
  trigger?: React.ReactElement
}) {
  return (
    <Dialog>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : (
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Supprimer ${name}`}
            />
          }
        >
          <Trash2 />
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer cette candidature ?</DialogTitle>
          <DialogDescription>
            « {name} » sera définitivement retirée de ta liste. Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Annuler</DialogClose>
          <DialogClose
            render={<Button variant="destructive" onClick={onConfirm} />}
          >
            Supprimer
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
