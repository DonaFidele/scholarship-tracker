'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Plus, Search, Star } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { levelLabels } from '@/components/scholarship/metadata-badges'
import { StatCards } from '@/components/applications/stat-cards'
import { ApplicationTable } from '@/components/applications/application-table'
import { ApplicationCards } from '@/components/applications/application-cards'
import { daysLeft } from '@/lib/deadline'
import type {
  ApplicationStatus,
  ApplicationWithChecklist,
  Level,
} from '@/lib/types'

type FilterKey = 'all' | 'todo' | 'in_progress' | 'submitted' | 'done'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'todo', label: 'À faire' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'submitted', label: 'Envoyées' },
  { key: 'done', label: 'Terminées' },
]

function matchesFilter(app: ApplicationWithChecklist, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'done':
      return app.status === 'accepted' || app.status === 'rejected'
    default:
      return app.status === filter
  }
}

/** Soonest deadline first; expired and undated applications sink to the bottom. */
function sortByDeadline(
  a: ApplicationWithChecklist,
  b: ApplicationWithChecklist,
): number {
  const da = daysLeft(a.deadline)
  const db = daysLeft(b.deadline)

  const group = (d: number | null) => (d === null ? 2 : d < 0 ? 1 : 0)
  const ga = group(da)
  const gb = group(db)
  if (ga !== gb) return ga - gb
  if (ga === 0) return (da as number) - (db as number)
  if (ga === 1) return (db as number) - (da as number)
  return 0
}

const NONE = '__all__'

export function ApplicationsView({
  applications,
  onStatusChange,
  onDeadlineChange,
  onDelete,
  onToggleFavorite,
  onOpenApplication,
  onAddClick,
}: {
  applications: ApplicationWithChecklist[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onDeadlineChange: (id: string, deadline: string | null) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string, value: boolean) => void
  onOpenApplication: (id: string) => void
  onAddClick: () => void
}) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [levelFilter, setLevelFilter] = useState<Level | typeof NONE>(NONE)

  const visible = useMemo(
    () =>
      applications
        .filter((a) => matchesFilter(a, filter))
        .filter((a) => (favoritesOnly ? a.is_favorite : true))
        .filter((a) => (levelFilter === NONE ? true : a.level === levelFilter))
        .sort(sortByDeadline),
    [applications, filter, favoritesOnly, levelFilter],
  )

  if (applications.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Header onAddClick={onAddClick} />
        <Empty className="rounded-xl border border-dashed border-border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bookmark />
            </EmptyMedia>
            <EmptyTitle>Aucune candidature pour l’instant</EmptyTitle>
            <EmptyDescription>
              Recherche des bourses et sauvegarde-les, ou ajoute-en une
              manuellement pour la suivre ici.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button render={<Link href="/search" />}>
                <Search data-icon="inline-start" />
                Rechercher des bourses
              </Button>
              <Button variant="outline" onClick={onAddClick}>
                <Plus data-icon="inline-start" />
                Ajouter manuellement
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Header onAddClick={onAddClick} />

      <StatCards applications={applications} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterKey)}
          className="w-full lg:w-auto"
        >
          <TabsList className="w-full justify-start overflow-x-auto lg:w-auto">
            {filters.map((f) => (
              <TabsTrigger key={f.key} value={f.key}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={favoritesOnly ? 'default' : 'outline'}
            size="sm"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            <Star
              className={cn('size-4', favoritesOnly && 'fill-current')}
              data-icon="inline-start"
            />
            Favoris
          </Button>
          <Select
            value={levelFilter}
            onValueChange={(v) => setLevelFilter(v as Level | typeof NONE)}
          >
            <SelectTrigger size="sm" className="w-[130px]" aria-label="Niveau">
              <SelectValue placeholder="Niveau">
                {(value) =>
                  value === NONE
                    ? 'Tous niveaux'
                    : levelLabels[value as Level]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Tous niveaux</SelectItem>
              <SelectItem value="licence">Licence</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="doctorat">Doctorat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Aucune candidature pour ces filtres.
        </p>
      ) : (
        <>
          <div className="hidden md:block">
            <ApplicationTable
              applications={visible}
              onStatusChange={onStatusChange}
              onDeadlineChange={onDeadlineChange}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onOpenApplication={onOpenApplication}
            />
          </div>
          <div className="md:hidden">
            <ApplicationCards
              applications={visible}
              onStatusChange={onStatusChange}
              onDeadlineChange={onDeadlineChange}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onOpenApplication={onOpenApplication}
            />
          </div>
        </>
      )}
    </div>
  )
}

function Header({ onAddClick }: { onAddClick: () => void }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Mes candidatures
        </h1>
        <p className="text-muted-foreground text-pretty">
          Suis l’avancement de chaque dossier et garde un œil sur les deadlines.
        </p>
      </div>
      <Button onClick={onAddClick} className="shrink-0">
        <Plus data-icon="inline-start" />
        Ajouter une bourse
      </Button>
    </header>
  )
}
