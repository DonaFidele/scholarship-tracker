'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cn } from 'cn'
import {
  ExternalLink,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '@/components/ui/progress'
import { DeadlineBadge } from '@/components/deadline-badge'
import { StatusSelect } from '@/components/applications/status-select'
import { FavoriteToggle } from '@/components/applications/favorite-toggle'
import { DetailsProposalCard } from '@/components/applications/details-proposal-card'
import { dossierCounts } from '@/components/applications/dossier-progress'
import { ValuedCriteria } from '@/components/applications/valued-criteria'
import { MetadataBadges } from '@/components/scholarship/metadata-badges'
import { formatDateFr } from '@/lib/format'
import type {
  Application,
  ApplicationStatus,
  ApplicationWithChecklist,
  BeninEligibility,
  Coverage,
  Level,
  ScholarshipDetails,
} from '@/lib/types'

const NOTES_MAX = 2000
const COVERED_MAX = 1000
const ELIGIBILITY_MAX = 2000

type InfoPatch = Partial<
  Pick<
    Application,
    | 'level'
    | 'coverage'
    | 'benin_eligible'
    | 'opens_at'
    | 'results_at'
    | 'apply_link'
    | 'covered_costs'
    | 'eligibility_notes'
  >
>

type DetailsPatch = Partial<
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

type DetailsState = 'idle' | 'loading' | 'error' | 'ready'

const NONE = '__none__'

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
  onApplyDetails: (patch: DetailsPatch, documentsToAdd: string[]) => void
  onDismissDetails: () => void
}) {
  const [newItem, setNewItem] = useState('')

  // Local mirrors so typing feels instant; synced from props when a new app opens.
  const [notes, setNotes] = useState('')
  const [applyLink, setApplyLink] = useState('')
  const [coveredCosts, setCoveredCosts] = useState('')
  const [eligibility, setEligibility] = useState('')
  const lastAppId = useRef<string | null>(null)

  useEffect(() => {
    if (application && application.id !== lastAppId.current) {
      setNotes(application.notes ?? '')
      setApplyLink(application.apply_link ?? '')
      setCoveredCosts(application.covered_costs ?? '')
      setEligibility(application.eligibility_notes ?? '')
      lastAppId.current = application.id
      setNewItem('')
    }
    if (!open) {
      lastAppId.current = null
    }
  }, [application, open])

  if (!application) return null

  const app = application
  const hasLink = Boolean(app.link || app.apply_link)
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
          <Button
            variant="ghost"
            size="sm"
            className="h-auto w-fit justify-start py-1.5 text-left whitespace-normal text-primary"
            nativeButton={false}
            render={
              <Link
                href={`/lea?q=${encodeURIComponent(`Comment me préparer pour ${app.name} ?`)}`}
              />
            }
          >
            <Sparkles data-icon="inline-start" />
            Demander à Léa comment me préparer pour celle-ci
          </Button>
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
          {/* Fee warning */}
          {app.asks_fee === true && (
            <Alert variant="destructive">
              <ShieldAlert />
              <AlertTitle>Attention aux frais de candidature</AlertTitle>
              <AlertDescription>
                Cette page mentionne des frais de candidature. Méfie-toi : une
                vraie bourse ne demande jamais de payer pour postuler.
              </AlertDescription>
            </Alert>
          )}

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

          {/* Informations clés */}
          <section className="flex flex-col gap-3">
            <h3 className="font-medium">Informations clés</h3>

            {/* Fetch details */}
            {hasLink ? (
              <Button
                variant="outline"
                onClick={onFetchDetails}
                disabled={detailsState === 'loading'}
                className="w-full"
              >
                {detailsState === 'loading' ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Sparkles data-icon="inline-start" />
                )}
                Récupérer les détails depuis le site officiel
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger render={<span className="w-full" />}>
                  <Button
                    variant="outline"
                    disabled
                    className="pointer-events-none w-full"
                  >
                    <Sparkles data-icon="inline-start" />
                    Récupérer les détails depuis le site officiel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Aucun lien disponible</TooltipContent>
              </Tooltip>
            )}

            {detailsState === 'loading' && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Analyse de la page…
              </p>
            )}

            {detailsState === 'error' && (
              <p className="text-sm text-destructive">
                {detailsError ?? 'Analyse impossible.'}{' '}
                <button
                  type="button"
                  onClick={onFetchDetails}
                  className="font-medium underline underline-offset-2"
                >
                  Réessayer
                </button>
              </p>
            )}

            {detailsState === 'ready' && detailsProposal && (
              <DetailsProposalCard
                application={app}
                proposal={detailsProposal}
                applying={applyingDetails}
                onApply={onApplyDetails}
                onDismiss={onDismissDetails}
              />
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="detail-level">Niveau</Label>
                <Select
                  value={app.level ?? NONE}
                  onValueChange={(v) =>
                    onInfoChange(app.id, {
                      level: v === NONE ? null : (v as Level),
                    })
                  }
                >
                  <SelectTrigger id="detail-level">
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
                <Label htmlFor="detail-coverage">Couverture</Label>
                <Select
                  value={app.coverage ?? NONE}
                  onValueChange={(v) =>
                    onInfoChange(app.id, {
                      coverage: v === NONE ? null : (v as Coverage),
                    })
                  }
                >
                  <SelectTrigger id="detail-coverage">
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
                <Label htmlFor="detail-benin">Bénin éligible</Label>
                <Select
                  value={app.benin_eligible}
                  onValueChange={(v) =>
                    onInfoChange(app.id, {
                      benin_eligible: v as BeninEligibility,
                    })
                  }
                >
                  <SelectTrigger id="detail-benin">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">À vérifier</SelectItem>
                    <SelectItem value="yes">Oui</SelectItem>
                    <SelectItem value="no">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="detail-results">Date des résultats</Label>
                <Input
                  id="detail-results"
                  type="date"
                  value={app.results_at ?? ''}
                  onChange={(e) =>
                    onInfoChange(app.id, { results_at: e.target.value || null })
                  }
                />
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
                    Ouvrir
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="detail-covered">Frais couverts</Label>
              <Textarea
                id="detail-covered"
                rows={2}
                maxLength={COVERED_MAX}
                value={coveredCosts}
                onChange={(e) => setCoveredCosts(e.target.value)}
                onBlur={() => commit('covered_costs', coveredCosts)}
                placeholder="Ex : scolarité, logement, billet d’avion…"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="detail-eligibility">
                Conditions d’éligibilité
              </Label>
              <Textarea
                id="detail-eligibility"
                rows={4}
                maxLength={ELIGIBILITY_MAX}
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                onBlur={() => commit('eligibility_notes', eligibility)}
                placeholder="Nationalité, âge, diplôme requis…"
              />
            </div>

            <p className="text-xs text-muted-foreground text-pretty">
              {app.details_checked_at
                ? `Vérifié le ${formatDateFr(app.details_checked_at.slice(0, 10))}.`
                : 'Jamais vérifié.'}{' '}
              Ces informations peuvent être incomplètes. Vérifie sur le site
              officiel.
            </p>
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

            {allDone && total > 0 && (
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

          <ValuedCriteria
            criteria={app.valued_criteria ?? detailsProposal?.valued_criteria}
          />

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
