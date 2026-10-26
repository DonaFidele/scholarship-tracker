'use client'

import { useMemo, useState } from 'react'
import { AlertCircle, SearchX, Sparkles } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search/search-bar'
import { ResultGroup } from '@/components/search/result-group'
import { ProfilePrompt } from '@/components/search/profile-prompt'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  ResultFilters,
  type CoverageFilter,
  type LevelFilter,
} from '@/components/search/result-filters'
import { ScamNotice } from '@/components/scholarship/scam-notice'
import type { RankedResult, Scholarship, SearchStatus } from '@/lib/types'

const chips = [
  'Master en ingénierie au Canada',
  'Bourses pour étudiants internationaux en France',
  'Doctorat entièrement financé en Europe',
]

function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border p-4"
        >
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      ))}
    </div>
  )
}

export function SearchView({
  results,
  profileComplete,
  status,
  savedLinks,
  savingLink,
  onSearch,
  onSave,
}: {
  results: RankedResult[]
  profileComplete: boolean
  status: SearchStatus
  savedLinks: string[]
  savingLink: string | null
  onSearch: (query: string) => void
  onSave: (scholarship: Scholarship) => void
}) {
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [coverageFilter, setCoverageFilter] = useState<CoverageFilter>('all')
  const [hideClosedBenin, setHideClosedBenin] = useState(false)
  const [recommendedFirst, setRecommendedFirst] = useState(true)
  const [promptDismissed, setPromptDismissed] = useState(false)

  const runChip = (chip: string) => {
    setQuery(chip)
    onSearch(chip)
  }

  const resetFilters = () => {
    setLevelFilter('all')
    setCoverageFilter('all')
    setHideClosedBenin(false)
  }

  const filteredResults = useMemo(
    () =>
      results.filter((s) => {
        if (levelFilter !== 'all' && s.level !== levelFilter) return false
        if (coverageFilter !== 'all' && s.coverage !== coverageFilter)
          return false
        if (hideClosedBenin && s.benin_eligible === 'no') return false
        return true
      }),
    [results, levelFilter, coverageFilter, hideClosedBenin],
  )

  const recommendedResults = useMemo(
    () =>
      filteredResults
        .filter((s) => s.recommendation?.recommended)
        .sort((a, b) => (b.recommendation?.score ?? 0) - (a.recommendation?.score ?? 0)),
    [filteredResults],
  )
  const otherResults = useMemo(
    () => filteredResults.filter((s) => !s.recommendation?.recommended),
    [filteredResults],
  )

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Trouve ta prochaine bourse
        </h1>
        <p className="text-muted-foreground text-pretty">
          Décris le financement que tu cherches. On fait remonter les bourses
          qui correspondent, avec leurs deadlines.
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={() => onSearch(query)}
          disabled={status === 'loading'}
        />
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Button
              key={chip}
              variant="outline"
              size="sm"
              className="h-8 rounded-full text-muted-foreground"
              disabled={status === 'loading'}
              onClick={() => runChip(chip)}
            >
              {chip}
            </Button>
          ))}
        </div>
      </div>

      {!profileComplete && !promptDismissed && (
        <ProfilePrompt onDismiss={() => setPromptDismissed(true)} />
      )}

      {status !== 'loading' && <ScamNotice />}

      {status === 'loading' && <ResultsSkeleton />}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>La recherche a échoué</AlertTitle>
          <AlertDescription>
            Une erreur est survenue. Réessaie dans un instant.
          </AlertDescription>
        </Alert>
      )}

      {status === 'success' && results.length === 0 && (
        <Empty className="rounded-xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>Aucune bourse trouvée</EmptyTitle>
            <EmptyDescription>
              Essaie d’élargir ta recherche ou de reformuler ta demande.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {status === 'success' && results.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch id="recommended-first" checked={recommendedFirst} onCheckedChange={setRecommendedFirst} />
            <Label htmlFor="recommended-first" className="cursor-pointer">Recommandées d&apos;abord</Label>
          </div>
          <ResultFilters
            level={levelFilter}
            coverage={coverageFilter}
            hideClosedBenin={hideClosedBenin}
            onLevelChange={setLevelFilter}
            onCoverageChange={setCoverageFilter}
            onHideClosedBeninChange={setHideClosedBenin}
          />

          {filteredResults.length === 0 ? (
            <Empty className="rounded-xl border border-dashed border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle>Aucun résultat avec ces filtres</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {recommendedFirst ? (
                <>
                  <ResultGroup
                    title="Recommandées pour toi"
                    icon={<Sparkles className="size-5 text-primary" aria-hidden="true" />}
                    results={recommendedResults}
                    savedLinks={savedLinks}
                    savingLink={savingLink}
                    onSave={onSave}
                  />
                  <ResultGroup
                    title={recommendedResults.length > 0 ? 'Autres résultats' : undefined}
                    results={otherResults}
                    savedLinks={savedLinks}
                    savingLink={savingLink}
                    onSave={onSave}
                  />
                </>
              ) : (
                <ResultGroup
                  results={filteredResults}
                  savedLinks={savedLinks}
                  savingLink={savingLink}
                  onSave={onSave}
                />
              )}
              <p className="text-xs text-muted-foreground">
                Résultats générés automatiquement. Vérifie toujours les montants
                et les dates limites sur le site officiel de chaque bourse.
              </p>
            </div>
          )}
        </div>
      )}

      {status === 'idle' && (
        <Empty className="rounded-xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>Lance une recherche</EmptyTitle>
            <EmptyDescription>
              Saisis une requête ci-dessus ou choisis un exemple pour commencer.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap justify-center gap-2">
              {chips.map((chip) => (
                <Button
                  key={chip}
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full"
                  onClick={() => runChip(chip)}
                >
                  {chip}
                </Button>
              ))}
            </div>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
