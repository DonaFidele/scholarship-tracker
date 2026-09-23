'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Search } from 'lucide-react'
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
import { StatCards } from '@/components/applications/stat-cards'
import { ApplicationTable } from '@/components/applications/application-table'
import { ApplicationCards } from '@/components/applications/application-cards'
import { daysLeft } from '@/lib/deadline'
import type { Application, ApplicationStatus } from '@/lib/types'

type FilterKey = 'all' | 'todo' | 'in_progress' | 'submitted' | 'done'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'todo', label: 'À faire' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'submitted', label: 'Envoyées' },
  { key: 'done', label: 'Terminées' },
]

function matchesFilter(app: Application, filter: FilterKey): boolean {
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
function sortByDeadline(a: Application, b: Application): number {
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

export function ApplicationsView({
  applications,
  onStatusChange,
  onDeadlineChange,
  onDelete,
}: {
  applications: Application[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onDeadlineChange: (id: string, deadline: string | null) => void
  onDelete: (id: string) => void
}) {
  const [filter, setFilter] = useState<FilterKey>('all')

  const visible = useMemo(
    () =>
      applications
        .filter((a) => matchesFilter(a, filter))
        .sort(sortByDeadline),
    [applications, filter],
  )

  if (applications.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <Empty className="rounded-xl border border-dashed border-border py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bookmark />
            </EmptyMedia>
            <EmptyTitle>Aucune candidature pour l’instant</EmptyTitle>
            <EmptyDescription>
              Recherche des bourses et sauvegarde-les pour les suivre ici.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/search" />}>
              <Search data-icon="inline-start" />
              Rechercher des bourses
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Header />

      <StatCards applications={applications} />

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as FilterKey)}
        className="w-full"
      >
        <TabsList className="w-full justify-start overflow-x-auto md:w-auto">
          {filters.map((f) => (
            <TabsTrigger key={f.key} value={f.key}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Aucune candidature dans cette catégorie.
        </p>
      ) : (
        <>
          <div className="hidden md:block">
            <ApplicationTable
              applications={visible}
              onStatusChange={onStatusChange}
              onDeadlineChange={onDeadlineChange}
              onDelete={onDelete}
            />
          </div>
          <div className="md:hidden">
            <ApplicationCards
              applications={visible}
              onStatusChange={onStatusChange}
              onDeadlineChange={onDeadlineChange}
              onDelete={onDelete}
            />
          </div>
        </>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Mes candidatures
      </h1>
      <p className="text-muted-foreground text-pretty">
        Suis l’avancement de chaque dossier et garde un œil sur les deadlines.
      </p>
    </header>
  )
}
