'use client'

import { useMemo, useState } from 'react'
import { cn } from 'cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MilestoneEventBody } from '@/components/lea/milestone-event-body'
import { MilestoneEventIcon } from '@/components/lea/milestone-event-icon'
import { formatDateFr } from '@/lib/format'
import {
  buildSemesters,
  planCounts,
  sortEventsByDate,
  statusLabels,
  type SemesterGroup,
} from '@/lib/milestone-helpers'
import type { LeaPlan, PlanMilestone } from '@/lib/types'

type Chapter = {
  group: SemesterGroup
  milestones: PlanMilestone[]
  done: number
  eventCount: number
}

type Turn = { page: number; direction: 'next' | 'previous' }

const COVER_PAGE = 0

const pageEdgeShadow =
  '2px 2px 0 var(--border), 3px 3px 0 var(--card), 5px 5px 0 var(--border)'

function plural(count: number, one: string, many: string) {
  return count > 1 ? many : one
}

function firstEventAt(milestone: PlanMilestone) {
  return sortEventsByDate(milestone.events)[0]?.at ?? ''
}

function CoverPage({
  plan,
  chapters,
  currentPage,
  onGoTo,
}: {
  plan: LeaPlan
  chapters: Chapter[]
  currentPage: number
  onGoTo: (page: number) => void
}) {
  const counts = planCounts(plan)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Journal de parcours
        </p>
        <h3 className="text-2xl leading-tight font-semibold text-balance">
          {plan.target_title}
        </h3>
        <p className="text-sm text-pretty text-muted-foreground">
          Chaque étape créée, ajustée ou terminée s’écrit ici, semestre par
          semestre.{' '}
          {counts.total > 0
            ? `${counts.done} objectif${plural(counts.done, '', 's')} sur ${counts.total} ${plural(counts.done, 'terminé', 'terminés')}.`
            : null}
        </p>
      </header>

      <Button size="sm" className="w-fit" onClick={() => onGoTo(currentPage)}>
        Reprendre au semestre {currentPage}
      </Button>

      <nav aria-label="Sommaire">
        <h4 className="mb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Sommaire
        </h4>
        <ul className="flex flex-col">
          {chapters.map(({ group, milestones }) => {
            const isCurrent = group.index === currentPage
            return (
              <li key={group.index}>
                <button
                  type="button"
                  onClick={() => onGoTo(group.index)}
                  className="flex w-full items-baseline gap-2 rounded-md py-2 text-left outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="text-sm font-medium">{group.label}</span>
                  {isCurrent ? (
                    <span className="text-xs text-primary">maintenant</span>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="flex-1 border-b border-dotted border-border"
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {milestones.length > 0
                      ? `${milestones.length} objectif${plural(milestones.length, '', 's')}`
                      : 'à écrire'}
                    {' · p. '}
                    {group.index}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

function ChapterPage({
  chapter,
  isCurrent,
  onJumpToMilestone,
}: {
  chapter: Chapter
  isCurrent: boolean
  onJumpToMilestone: (id: string) => void
}) {
  const { group, milestones, done, eventCount } = chapter

  return (
    <article className="flex flex-col">
      <header className="flex flex-col gap-1">
        <p className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Chapitre {group.index}
          {isCurrent ? <Badge variant="secondary">Maintenant</Badge> : null}
        </p>
        <h3 className="text-2xl leading-tight font-semibold text-balance">
          {group.label}
        </h3>
        {milestones.length > 0 ? (
          <p className="text-sm text-muted-foreground">
            {done} sur {milestones.length}{' '}
            {plural(done, 'terminé', 'terminés')} · {eventCount}{' '}
            {plural(eventCount, 'événement', 'événements')}
          </p>
        ) : null}
      </header>

      {milestones.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-pretty text-muted-foreground">
          Ce chapitre reste à écrire. Ajoute un objectif à ce semestre depuis
          l’onglet Parcours.
        </p>
      ) : (
        milestones.map((milestone) => (
          <section key={milestone.id} className="mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <button
                type="button"
                onClick={() => onJumpToMilestone(milestone.id)}
                aria-label={`Aller à l’étape ${milestone.title}`}
                className="rounded-sm text-left text-sm font-semibold text-pretty underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {milestone.title}
              </button>
              <span className="text-xs text-muted-foreground">
                {statusLabels[milestone.status]}
              </span>
            </div>
            <ol className="ml-3 flex flex-col gap-4 border-l border-border">
              {sortEventsByDate(milestone.events).map((event) => (
                <li key={event.id} className="relative flex flex-col gap-0.5 pl-6">
                  <span
                    aria-hidden="true"
                    className="absolute top-0 -left-3 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                  >
                    <MilestoneEventIcon type={event.type} className="size-3.5" />
                  </span>
                  <time
                    dateTime={event.at}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDateFr(event.at)}
                  </time>
                  <MilestoneEventBody milestone={milestone} event={event} />
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </article>
  )
}

export function PlanHistoryBook({
  plan,
  onJumpToMilestone,
}: {
  plan: LeaPlan
  onJumpToMilestone: (id: string) => void
}) {
  const chapters = useMemo<Chapter[]>(
    () =>
      buildSemesters(plan).map((group) => {
        const milestones = [...group.milestones].sort((a, b) =>
          firstEventAt(a).localeCompare(firstEventAt(b)),
        )
        return {
          group,
          milestones,
          done: milestones.filter((m) => m.status === 'fait').length,
          eventCount: milestones.reduce((n, m) => n + m.events.length, 0),
        }
      }),
    [plan],
  )

  const lastPage = chapters.length
  const currentPage = Math.min(Math.max(plan.current_semester_index, 1), lastPage)
  const [turn, setTurn] = useState<Turn>({
    page: currentPage,
    direction: 'next',
  })
  const page = Math.min(turn.page, lastPage)

  const goTo = (target: number) =>
    setTurn((prev) => ({
      page: target,
      direction: target >= prev.page ? 'next' : 'previous',
    }))
  const goPrevious = () => page > COVER_PAGE && goTo(page - 1)
  const goNext = () => page < lastPage && goTo(page + 1)

  const hasActivity = plan.milestones.some((m) =>
    m.events.some((e) => e.type !== 'creee'),
  )

  if (!hasActivity) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-pretty text-muted-foreground">
        Ton parcours commence tout juste. Chaque étape que tu valides ou ajustes
        apparaîtra ici.
      </p>
    )
  }

  const chapter = page > COVER_PAGE ? chapters[page - 1] : null
  const pageTitle = chapter ? chapter.group.label : 'Sommaire'

  return (
    <section
      aria-label="Livre de ton parcours"
      aria-roledescription="livre"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') goNext()
        if (e.key === 'ArrowLeft') goPrevious()
      }}
      className="mr-1.5 mb-1.5"
    >
      <p className="sr-only" aria-live="polite">
        Page {page + 1} sur {lastPage + 1} : {pageTitle}
      </p>
      <div
        className="relative overflow-hidden rounded-l-md rounded-r-xl border border-border bg-card"
        style={{ boxShadow: pageEdgeShadow }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-6 border-r border-border bg-gradient-to-r from-foreground/10 to-transparent"
        />
        <div className="min-h-96 py-6 pr-5 pl-10">
          <div
            key={page}
            className={cn(
              'animate-in fade-in duration-300 motion-reduce:animate-none',
              turn.direction === 'next'
                ? 'slide-in-from-right-4'
                : 'slide-in-from-left-4',
            )}
          >
            {chapter ? (
              <ChapterPage
                chapter={chapter}
                isCurrent={chapter.group.index === plan.current_semester_index}
                onJumpToMilestone={onJumpToMilestone}
              />
            ) : (
              <CoverPage
                plan={plan}
                chapters={chapters}
                currentPage={currentPage}
                onGoTo={goTo}
              />
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border py-2 pr-3 pl-10">
          <Button
            variant="ghost"
            size="sm"
            disabled={page === COVER_PAGE}
            onClick={goPrevious}
            aria-label="Page précédente"
          >
            <ChevronLeft data-icon="inline-start" />
            <span className="max-sm:sr-only">Précédent</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === COVER_PAGE}
            onClick={() => goTo(COVER_PAGE)}
            className="text-xs text-muted-foreground tabular-nums"
          >
            {page === COVER_PAGE ? 'Sommaire' : `Sommaire · p. ${page}/${lastPage}`}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={page === lastPage}
            onClick={goNext}
            aria-label="Page suivante"
          >
            <span className="max-sm:sr-only">Suivant</span>
            <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </section>
  )
}
