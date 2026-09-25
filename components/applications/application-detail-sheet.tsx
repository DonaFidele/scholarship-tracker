'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from 'cn'
import {
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '@/components/ui/progress'
import { DeadlineBadge } from '@/components/deadline-badge'
import { StatusSelect } from '@/components/applications/status-select'
import { FavoriteToggle } from '@/components/applications/favorite-toggle'
import { dossierCounts } from '@/components/applications/dossier-progress'
import {
  MetadataBadges,
  coverageLabels,
  levelLabels,
} from '@/components/scholarship/metadata-badges'
import { formatDateFr } from '@/lib/format'
import type {
  Application,
  ApplicationStatus,
  ApplicationWithChecklist,
  BeninEligibility,
  ScholarshipDetails,
} from '@/lib/types'

const NOTES_MAX = 2000

type InfoPatch = Partial<
  Pick<
    Application,
    | 'opens_at'
    | 'results_at'
    | 'apply_link'
    | 'covered_costs'
    | 'eligibility_notes'
  >
>

type DetailsState = 'idle' | 'loading' | 'error' | 'ready'

const beninProposalLabels: Record<BeninEligibility, string> = {
  yes: 'Éligible',
  no: 'Non éligible',
  unknown: 'À vérifier',
}

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
  onToggleFavorite,
  onInfoChange,
  detailsState,
  detailsError,
  detailsProposal,
  applyingDetails,
  onFetchDetails,
  onApplyDetails,
  onDismissDetails,
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
  onToggleFavorite: (id: string, value: boolean) => void
  onInfoChange: (id: string, info: InfoPatch) => void
  detailsState: DetailsState
  detailsError: string | null
  detailsProposal: ScholarshipDetails | null
  applyingDetails: boolean
  onFetchDetails: () => void
  onApplyDetails: (
    details: ScholarshipDetails,
    createChecklist: boolean,
  ) => void
  onDismissDetails: () => void
}) {
  const [newItem, setNewItem] = useState('')

  // Local mirror of notes so typing feels instant; synced from props on open.
  const [notes, setNotes] = useState('')
  // Local mirror of free-text info fields, committed on blur.
  const [applyLink, setApplyLink] = useState('')
  const [coveredCosts, setCoveredCosts] = useState('')
  const [eligibility, setEligibility] = useState('')
  const [createChecklist, setCreateChecklist] = useState(true)
  const lastAppId = useRef<string | null>(null)

  useEffect(() => {
    if (application && application.id !== lastAppId.current) {
      setNotes(application.notes ?? '')
      setApplyLink(application.apply_link ?? '')
      setCoveredCosts(application.covered_costs ?? '')
      setEligibility(application.eligibility_notes ?? '')
      setCreateChecklist(true)
      lastAppId.current = application.id
      setNewItem('')
    }
    if (!open) {
      lastAppId.current = null
    }
  }, [application, open])

  if (!application) return null

  const app = application
  const items = [...app.checklist_items].sort(
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

  const commit = (key: keyof InfoPatch, raw: string) => {
    const trimmed = raw.trim()
    const nextValue = trimmed === '' ? null : trimmed
    if ((app[key] ?? null) === nextValue) return
    onInfoChange(app.id, { [key]: nextValue })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-t-xl p-0 sm:inset-y-0 sm:right-0 sm:h-full sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <SheetHeader className="gap-2 border-b pr-14">
          <div className="flex items-start justify-between gap-2">
            <SheetTitle className="text-lg leading-snug text-balance">
              {app.name}
            </SheetTitle>
            <FavoriteToggle
              value={app.is_favorite}
              onToggle={(v) => onToggleFavorite(app.id, v)}
              className="-mr-2 -mt-1.5"
            />
          </div>
          <SheetDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {[app.country, app.amount].filter(Boolean).join(' · ') ||
              'Détails non précisés'}
          </SheetDescription>
          <MetadataBadges
            level={app.level}
            coverage={app.coverage}
            benin={app.benin_eligible}
            asksFee={app.asks_fee}
            className="mt-1"
          />
          {app.link && (
            <a
              href={app.link}
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
          {/* Auto details */}
          <AutoDetails
            hasLink={Boolean(app.link || app.apply_link)}
            checkedAt={app.details_checked_at}
            state={detailsState}
            error={detailsError}
            proposal={detailsProposal}
            applying={applyingDetails}
            createChecklist={createChecklist}
            onCreateChecklistChange={setCreateChecklist}
            onFetch={onFetchDetails}
            onApply={onApplyDetails}
            onDismiss={onDismissDetails}
          />

          {/* Deadline + status */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="detail-deadline">Date limite</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="detail-deadline"
                  type="date"
                  value={app.deadline ?? ''}
                  onChange={(e) =>
                    onDeadlineChange(app.id, e.target.value || null)
                  }
                  className="w-auto"
                />
                {app.deadline && <DeadlineBadge deadline={app.deadline} />}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Statut</Label>
              <StatusSelect
                value={app.status}
                onChange={(status) => onStatusChange(app.id, status)}
              />
            </div>
          </div>

          {/* Key dates + application link */}
          <section className="flex flex-col gap-3">
            <h3 className="font-medium">Informations clés</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="detail-opens">Ouverture des candidatures</Label>
                <Input
                  id="detail-opens"
                  type="date"
                  value={app.opens_at ?? ''}
                  onChange={(e) =>
                    onInfoChange(app.id, { opens_at: e.target.value || null })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="detail-results">Résultats attendus</Label>
                <Input
                  id="detail-results"
                  type="date"
                  value={app.results_at ?? ''}
                  onChange={(e) =>
                    onInfoChange(app.id, { results_at: e.target.value || null })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="detail-apply-link">Lien de candidature</Label>
              <Input
                id="detail-apply-link"
                type="url"
                inputMode="url"
                value={applyLink}
                onChange={(e) => setApplyLink(e.target.value)}
                onBlur={() => commit('apply_link', applyLink)}
                placeholder="https://…"
              />
              {app.apply_link && (
                <a
                  href={app.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  Ouvrir le formulaire
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="detail-covered">Frais couverts</Label>
              <Input
                id="detail-covered"
                value={coveredCosts}
                onChange={(e) => setCoveredCosts(e.target.value)}
                onBlur={() => commit('covered_costs', coveredCosts)}
                placeholder="Ex : Scolarité, voyage, allocation mensuelle"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="detail-eligibility">
                Conditions d’éligibilité
              </Label>
              <Textarea
                id="detail-eligibility"
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                onBlur={() => commit('eligibility_notes', eligibility)}
                placeholder="Nationalité, âge, diplôme requis…"
                className="min-h-20"
              />
            </div>
          </section>

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
              onClick={() => onDelete(app.id)}
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

function AutoDetails({
  hasLink,
  checkedAt,
  state,
  error,
  proposal,
  applying,
  createChecklist,
  onCreateChecklistChange,
  onFetch,
  onApply,
  onDismiss,
}: {
  hasLink: boolean
  checkedAt: string | null
  state: DetailsState
  error: string | null
  proposal: ScholarshipDetails | null
  applying: boolean
  createChecklist: boolean
  onCreateChecklistChange: (value: boolean) => void
  onFetch: () => void
  onApply: (details: ScholarshipDetails, createChecklist: boolean) => void
  onDismiss: () => void
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-4 text-indigo-500" />
            Compléter automatiquement
          </h3>
          <p className="text-xs text-muted-foreground text-pretty">
            {checkedAt
              ? `Dernière analyse le ${formatDateFr(checkedAt.slice(0, 10))}.`
              : 'Analyse la page officielle pour pré-remplir les informations.'}
          </p>
        </div>
        {(state === 'idle' || state === 'error') && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFetch}
            disabled={!hasLink}
            className="shrink-0"
          >
            {checkedAt ? (
              <RefreshCw data-icon="inline-start" />
            ) : (
              <Sparkles data-icon="inline-start" />
            )}
            {checkedAt ? 'Réanalyser' : 'Analyser'}
          </Button>
        )}
      </div>

      {!hasLink && state === 'idle' && (
        <p className="text-xs text-muted-foreground">
          Ajoute un lien officiel ou un lien de candidature pour activer
          l’analyse.
        </p>
      )}

      {state === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          Analyse de la page en cours…
        </div>
      )}

      {state === 'error' && error && (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Analyse impossible</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {state === 'ready' && proposal && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground text-pretty">
            Informations proposées à partir de la page. Vérifie-les avant de les
            appliquer.
          </p>
          <dl className="flex flex-col divide-y divide-border/60 rounded-lg border border-border/60 bg-background text-sm">
            <ProposalRow
              label="Niveau"
              value={proposal.level ? levelLabels[proposal.level] : null}
            />
            <ProposalRow
              label="Couverture"
              value={
                proposal.coverage ? coverageLabels[proposal.coverage] : null
              }
            />
            <ProposalRow
              label="Éligibilité Bénin"
              value={beninProposalLabels[proposal.benin_eligible]}
            />
            <ProposalRow
              label="Frais demandés"
              value={
                proposal.asks_fee === null
                  ? null
                  : proposal.asks_fee
                    ? 'Oui — prudence'
                    : 'Non'
              }
            />
            <ProposalRow
              label="Ouverture"
              value={formatDateFr(proposal.opens_at) || null}
            />
            <ProposalRow
              label="Date limite"
              value={formatDateFr(proposal.deadline) || null}
            />
            <ProposalRow
              label="Résultats"
              value={formatDateFr(proposal.results_at) || null}
            />
            <ProposalRow
              label="Frais couverts"
              value={proposal.covered_costs}
            />
            <ProposalRow
              label="Éligibilité"
              value={proposal.eligibility_summary}
            />
          </dl>

          {proposal.required_documents.length > 0 && (
            <label className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background p-3">
              <Checkbox
                checked={createChecklist}
                onCheckedChange={(c) => onCreateChecklistChange(c === true)}
                className="mt-0.5"
              />
              <span className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Créer la checklist des documents
                </span>
                <span className="text-xs text-muted-foreground">
                  {proposal.required_documents.join(', ')}
                </span>
              </span>
            </label>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onApply(proposal, createChecklist)}
              disabled={applying}
            >
              {applying && <Spinner data-icon="inline-start" />}
              Appliquer
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
      )}
    </section>
  )
}

function ProposalRow({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right text-pretty">
        {value ?? <span className="text-muted-foreground/60">Non trouvé</span>}
      </dd>
    </div>
  )
}
