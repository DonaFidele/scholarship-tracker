'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { ApplicationsView } from '@/components/applications/applications-view'
import { ApplicationDetailSheet } from '@/components/applications/application-detail-sheet'
import { AddApplicationDialog } from '@/components/applications/add-application-dialog'
import { getMockApplications } from '@/lib/mock-data'
import type {
  ApplicationStatus,
  ApplicationWithChecklist,
  Scholarship,
} from '@/lib/types'

let idCounter = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithChecklist[]>(
    () => getMockApplications(),
  )
  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [notesSaveState, setNotesSaveState] = useState<
    'idle' | 'saving' | 'saved'
  >('idle')
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = useMemo(
    () => applications.find((a) => a.id === openId) ?? null,
    [applications, openId],
  )

  const patch = (
    id: string,
    fn: (a: ApplicationWithChecklist) => ApplicationWithChecklist,
  ) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? fn(a) : a)))

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    patch(id, (a) => ({ ...a, status }))
    toast.success('Statut mis à jour.')
  }

  const handleDeadlineChange = (id: string, deadline: string | null) => {
    patch(id, (a) => ({ ...a, deadline }))
    toast.success('Deadline mise à jour.')
  }

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
    if (openId === id) setOpenId(null)
    toast.success('Candidature supprimée.')
  }

  const handleToggleItem = (id: string, itemId: string, done: boolean) => {
    patch(id, (a) => {
      const items = a.checklist_items.map((it) =>
        it.id === itemId ? { ...it, is_done: done } : it,
      )
      const allDone =
        items.length > 0 && items.every((it) => it.is_done)
      const wasAllDone =
        a.checklist_items.length > 0 &&
        a.checklist_items.every((it) => it.is_done)
      if (allDone && !wasAllDone) {
        toast.success('Dossier complet 🎉')
      }
      return { ...a, checklist_items: items }
    })
  }

  const handleAddItem = (id: string, label: string) => {
    patch(id, (a) => {
      const maxOrder = a.checklist_items.reduce(
        (m, it) => Math.max(m, it.sort_order),
        -1,
      )
      return {
        ...a,
        checklist_items: [
          ...a.checklist_items,
          {
            id: uid('item'),
            application_id: a.id,
            label,
            is_done: false,
            sort_order: maxOrder + 1,
          },
        ],
      }
    })
  }

  const handleDeleteItem = (id: string, itemId: string) => {
    patch(id, (a) => ({
      ...a,
      checklist_items: a.checklist_items.filter((it) => it.id !== itemId),
    }))
  }

  const handleNotesChange = (id: string, notes: string) => {
    patch(id, (a) => ({ ...a, notes }))
    setNotesSaveState('saving')
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => {
      setNotesSaveState('saved')
    }, 600)
  }

  const handleAdd = (data: Scholarship & { status: ApplicationStatus }) => {
    setAdding(true)
    setAddError(null)
    // Simulate a short async persist for realistic UX.
    setTimeout(() => {
      const newApp: ApplicationWithChecklist = {
        id: uid('app'),
        name: data.name,
        link: data.link,
        amount: data.amount,
        country: data.country,
        deadline: data.deadline,
        status: data.status,
        notes: '',
        created_at: new Date().toISOString(),
        checklist_items: [],
      }
      setApplications((prev) => [newApp, ...prev])
      setAdding(false)
      setAddOpen(false)
      toast.success('Bourse ajoutée à ta liste.')
    }, 400)
  }

  return (
    <div className="min-h-svh">
      <Navbar active="applications" applicationsCount={applications.length} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <ApplicationsView
          applications={applications}
          onStatusChange={handleStatusChange}
          onDeadlineChange={handleDeadlineChange}
          onDelete={handleDelete}
          onOpenApplication={setOpenId}
          onAddClick={() => setAddOpen(true)}
        />
      </main>

      <ApplicationDetailSheet
        application={selected}
        open={openId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenId(null)
            setNotesSaveState('idle')
          }
        }}
        onToggleItem={(itemId, done) =>
          selected && handleToggleItem(selected.id, itemId, done)
        }
        onAddItem={(label) => selected && handleAddItem(selected.id, label)}
        onDeleteItem={(itemId) =>
          selected && handleDeleteItem(selected.id, itemId)
        }
        onNotesChange={(notes) =>
          selected && handleNotesChange(selected.id, notes)
        }
        notesSaveState={notesSaveState}
        onStatusChange={handleStatusChange}
        onDeadlineChange={handleDeadlineChange}
        onDelete={handleDelete}
      />

      <AddApplicationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        submitting={adding}
        error={addError}
      />
    </div>
  )
}
