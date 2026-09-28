'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { ApplicationsView } from '@/components/applications/applications-view'
import { ApplicationDetailSheet } from '@/components/applications/application-detail-sheet'
import { AddApplicationDialog } from '@/components/applications/add-application-dialog'
import type {
  Application,
  ApplicationInfo,
  ApplicationStatus,
  ApplicationWithChecklist,
  Scholarship,
  ScholarshipDetails,
} from '@/lib/types'

let idCounter = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`

type InfoPatch = Partial<
  Pick<
    Application,
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
  >
>

// The apply-details patch carries only the fields the user checked.
type DetailsPatch = InfoPatch

type DetailsState = 'idle' | 'loading' | 'error' | 'ready'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithChecklist[]>([])
  const [applicationsCount, setApplicationsCount] = useState(0)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let active = true
    void supabase.from('applications').select('*, checklist_items(*)').order('deadline', { ascending: true, nullsFirst: false }).then(async ({ data, error }) => {
      if (!active) return
      if (error) { toast.error('Impossible de charger tes candidatures.'); return }
      setApplications((data ?? []).map((row) => ({ ...row, checklist_items: row.checklist_items ?? [] })) as ApplicationWithChecklist[])
      const { count } = await supabase.from('applications').select('*', { count: 'exact', head: true })
      if (active) setApplicationsCount(count ?? 0)
    })
    return () => { active = false }
  }, [supabase])
  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const [notesSaveState, setNotesSaveState] = useState<
    'idle' | 'saving' | 'saved'
  >('idle')

  // Details extraction flow.
  const [detailsState, setDetailsState] = useState<DetailsState>('idle')
  const [detailsError, setDetailsError] = useState<string | null>(null)
  const [detailsProposal, setDetailsProposal] =
    useState<ScholarshipDetails | null>(null)
  const [applyingDetails, setApplyingDetails] = useState(false)

  const selected = useMemo(
    () => applications.find((a) => a.id === openId) ?? null,
    [applications, openId],
  )

  const patch = (
    id: string,
    fn: (a: ApplicationWithChecklist) => ApplicationWithChecklist,
  ) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? fn(a) : a)))

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    const previous = applications.find((a) => a.id === id)
    if (!previous) return
    patch(id, (a) => ({ ...a, status }))
    const { error } = await supabase.from('applications').update({ status }).eq('id', id)
    if (error) { patch(id, (a) => ({ ...a, status: previous.status })); toast.error('Impossible de mettre à jour le statut.') }
    else toast.success('Statut mis à jour.')
  }

  const handleDeadlineChange = async (id: string, deadline: string | null) => {
    const previous = applications.find((a) => a.id === id)
    if (!previous) return
    patch(id, (a) => ({ ...a, deadline }))
    const { error } = await supabase.from('applications').update({ deadline }).eq('id', id)
    if (error) { patch(id, (a) => ({ ...a, deadline: previous.deadline })); toast.error('Impossible de mettre à jour la deadline.') }
    else toast.success('Deadline mise à jour.')
  }

  const handleDelete = async (id: string) => {
    const previous = applications.find((a) => a.id === id)
    if (!previous) return
    setApplications((prev) => prev.filter((a) => a.id !== id))
    if (openId === id) setOpenId(null)
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (error) { setApplications((prev) => [...prev, previous].sort((a, b) => (a.deadline ?? '9999').localeCompare(b.deadline ?? '9999'))); toast.error('Impossible de supprimer cette candidature.') }
    else { setApplicationsCount((count) => Math.max(0, count - 1)); toast.success('Candidature supprimée.') }
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

  const handleNotesChange = async (id: string, notes: string) => {
    const previous = applications.find((a) => a.id === id)?.notes ?? null
    patch(id, (a) => ({ ...a, notes }))
    setNotesSaveState('saving')
    const { error } = await supabase.from('applications').update({ notes }).eq('id', id)
    if (error) {
      patch(id, (a) => ({ ...a, notes: previous }))
      setNotesSaveState('idle')
      toast.error('Impossible d’enregistrer tes notes.')
    } else setNotesSaveState('saved')
  }

  const handleToggleFavorite = (id: string, value: boolean) => {
    patch(id, (a) => ({ ...a, is_favorite: value }))
    toast.success(value ? 'Ajouté aux favoris' : 'Retiré des favoris')
  }

  const handleInfoChange = (id: string, info: InfoPatch) => {
    patch(id, (a) => ({ ...a, ...info }))
    toast.success('Informations enregistrées')
  }

  const resetDetails = () => {
    setDetailsState('idle')
    setDetailsError(null)
    setDetailsProposal(null)
    setApplyingDetails(false)
  }

  const handleFetchDetails = (id: string) => {
    const app = applications.find((a) => a.id === id)
    if (!app) return
    setDetailsState('loading')
    setDetailsError(null)
    setDetailsProposal(null)
    setDetailsState('error')
    setDetailsError('L’analyse automatique des détails n’est pas disponible pour le moment.')
  }

  const handleApplyDetails: (id: string, detailsPatch: DetailsPatch, documentsToAdd: string[]) => void = () => {
    setApplyingDetails(false)
    setDetailsState('error')
    setDetailsError('Aucun détail analysé à appliquer.')
  }

  const handleAdd = async (data: Scholarship & { status: ApplicationStatus } & Partial<Pick<ApplicationInfo, 'apply_link' | 'opens_at' | 'results_at'>>) => {
    setAdding(true)
    setAddError(null)
    const { data: inserted, error } = await supabase.from('applications').insert({
      name: data.name, link: data.link, amount: data.amount, country: data.country,
      deadline: data.deadline, level: data.level, coverage: data.coverage,
      benin_eligible: data.benin_eligible, asks_fee: data.asks_fee,
      status: data.status, apply_link: data.apply_link ?? null,
      opens_at: data.opens_at ?? null, results_at: data.results_at ?? null,
    }).select('*, checklist_items(*)').single()
    setAdding(false)
    if (error || !inserted) {
      setAddError('Impossible d’ajouter cette bourse. Réessaie.')
      return
    }
    setApplications((prev) => [...prev, { ...inserted, checklist_items: inserted.checklist_items ?? [] } as ApplicationWithChecklist])
    setApplicationsCount((count) => count + 1)
    setAddOpen(false)
    toast.success('Bourse ajoutée à ta liste.')
  }

  return (
    <div className="min-h-svh">
      <Navbar active="applications" applicationsCount={applicationsCount} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <ApplicationsView
          applications={applications}
          onStatusChange={handleStatusChange}
          onDeadlineChange={handleDeadlineChange}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
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
            resetDetails()
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
        onToggleFavorite={handleToggleFavorite}
        onInfoChange={handleInfoChange}
        detailsState={detailsState}
        detailsError={detailsError}
        detailsProposal={detailsProposal}
        applyingDetails={applyingDetails}
        onFetchDetails={() => selected && handleFetchDetails(selected.id)}
        onApplyDetails={(detailsPatch, documentsToAdd) =>
          selected &&
          handleApplyDetails(selected.id, detailsPatch, documentsToAdd)
        }
        onDismissDetails={resetDetails}
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
