'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '@/components/ui/progress'
import { DeadlineBadge } from '@/components/deadline-badge'
import { StatusSelect } from '@/components/applications/status-select'
import { dossierCounts } from '@/components/applications/dossier-progress'
import type { ApplicationStatus, ApplicationWithChecklist } from '@/lib/types'

const NOTES_MAX = 2000

export function ApplicationDetailSheet({
  application,
  open,
  onOpenChange,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onNotesChange,
  notesSaveState,
  onStatusChange,
  onDeadlineChange,
  onDelete,
}: {
  application: ApplicationWithChecklist | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleItem: (itemId: string, done: boolean) => void
  onAddItem: (label: string) => void
  onDeleteItem: (itemId: string) => void
  onNotesChange: (notes: string) => void
  notesSaveState: 'idle' | 'saving' | 'saved'
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onDeadlineChange: (id: string, date: string | null) => void
  onDelete: (id: string) => void
}) {
  const [newItem, setNewItem] = useState('')

  // Local mirror of notes so typing feels instant; synced from props on open.
  const [notes, setNotes] = useState('')
  const lastAppId = useRef<string | null>(null)

  useEffect(() => {
    if (application && application.id !== lastAppId.current) {
      setNotes(application.notes ?? '')
      lastAppId.current = application.id
      setNewItem('')
    }
    if (!open) {
      lastAppId.current = null
    }
  }, [application, open])

  if (!application) return null

  const items = [...application.checklist_items].sort(
    (a, b) => a.sort_order - b.sort_order,
  )
  const { done, total, allDone } = dossierCounts(items)
  const value = total > 0 ? Math.round((done / total) * 100) : 0

  const submitNewItem = () => {
    const label = newItem.trim()
    if (!label) return
    onAddItem(label)
    setNewItem('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-xl p-0 sm:inset-y-0 sm:right-0 sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <SheetHeader className="gap-2 border-b pr-14">
          <SheetTitle className="text-lg leading-snug text-balance">
            {application.name}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {[application.country, application.amount]
              .filter(Boolean)
              .join(' · ') || 'Détails non précisés'}
          </SheetDescription>
          {application.link && (
            <a
              href={application.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Voir le site officiel
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          {/* Deadline + status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="detail-deadline">Date limite</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="detail-deadline"
                  type="date"
                  value={application.deadline ?? ''}
                  onChange={(e) =>
                    onDeadlineChange(application.id, e.target.value || null)
                  }
                  className="w-auto"
                />
                {application.deadline && (
                  <DeadlineBadge deadline={application.deadline} />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Statut</Label>
              <StatusSelect
                value={application.status}
                onChange={(status) => onStatusChange(application.id, status)}
              />
            </div>
          </div>

          {/* Checklist */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Documents à préparer</h3>
              <span className="text-xs text-muted-foreground tabular-nums">
                {total > 0 ? `${done} sur ${total} prêts` : 'Aucun document'}
              </span>
            </div>

            {total > 0 && (
              <Progress value={value} aria-label={`${done} sur ${total} prêts`}>
                <ProgressTrack className="h-1.5">
                  <ProgressIndicator
                    className={cn(allDone ? 'bg-emerald-500' : 'bg-indigo-500')}
                  />
                </ProgressTrack>
              </Progress>
            )}

            <ul className="flex flex-col">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex min-h-11 items-center gap-3 border-b border-border/60 last:border-0"
                >
                  <Checkbox
                    checked={item.is_done}
                    onCheckedChange={(checked) =>
                      onToggleItem(item.id, checked === true)
                    }
                    aria-label={item.label}
                  />
                  <button
                    type="button"
                    onClick={() => onToggleItem(item.id, !item.is_done)}
                    className={cn(
                      'flex-1 cursor-pointer py-2 text-left text-sm font-normal',
                      item.is_done && 'text-muted-foreground line-through',
                    )}
                  >
                    {item.label}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer le document"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>

            {allDone && (
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Dossier complet 🎉
              </p>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === 'Enter' &&
                    !e.nativeEvent.isComposing &&
                    e.keyCode !== 229
                  ) {
                    e.preventDefault()
                    submitNewItem()
                  }
                }}
                placeholder="Ajouter un document (ex : Lettre de recommandation)"
                aria-label="Ajouter un document"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={submitNewItem}
                disabled={!newItem.trim()}
                aria-label="Ajouter le document"
              >
                <Plus />
              </Button>
            </div>
          </section>

          {/* Notes */}
          <section className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="detail-notes">Notes</Label>
            </div>
            <Textarea
              id="detail-notes"
              value={notes}
              maxLength={NOTES_MAX}
              onChange={(e) => {
                setNotes(e.target.value)
                onNotesChange(e.target.value)
              }}
              placeholder="Contacts, conditions, idées pour la lettre…"
              className="min-h-28"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="tabular-nums">
                {notes.length}/{NOTES_MAX}
              </span>
              <span aria-live="polite">
                {notesSaveState === 'saving'
                  ? 'Enregistrement…'
                  : notesSaveState === 'saved'
                    ? 'Enregistré'
                    : ''}
              </span>
            </div>
          </section>

          {/* Danger zone */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(application.id)}
            >
              <Trash2 data-icon="inline-start" />
              Supprimer cette candidature
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
