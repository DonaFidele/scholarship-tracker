'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { SearchX, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ProfilePrompt } from '@/components/search/profile-prompt'
import type { LevelFilter } from '@/components/search/result-filters'
import { ForYouCard } from '@/components/for-you/for-you-card'
import { ForYouChips } from '@/components/for-you/for-you-chips'
import { UndoToast } from '@/components/for-you/undo-toast'
import { scholarshipKey } from '@/lib/scholarship-key'
import type { RankedResult, Scholarship } from '@/lib/types'

const UNDO_DELAY_MS = 5000

export function ForYouView({
  results,
  dismissedIds,
  savedLinks,
  savingLink,
  profileComplete,
  onSave,
  onDismiss,
  onUndoDismiss,
}: {
  results: RankedResult[]
  dismissedIds: string[]
  savedLinks: string[]
  savingLink: string | null
  profileComplete: boolean
  onSave: (scholarship: Scholarship) => void
  onDismiss: (id: string) => void
  onUndoDismiss: (id: string) => void
}) {
  const [level, setLevel] = useState<LevelFilter>('all')
  const [country, setCountry] = useState('all')
  const [fullOnly, setFullOnly] = useState(false)
  const [promptDismissed, setPromptDismissed] = useState(false)
  const [lastDismissedId, setLastDismissedId] = useState<string | null>(null)

  useEffect(() => {
    if (!lastDismissedId) return
    const timer = setTimeout(() => setLastDismissedId(null), UNDO_DELAY_MS)
    return () => clearTimeout(timer)
  }, [lastDismissedId])

  const handleDismiss = (id: string) => {
    onDismiss(id)
    setLastDismissedId(id)
  }

  const handleUndo = () => {
    if (lastDismissedId) onUndoDismiss(lastDismissedId)
    setLastDismissedId(null)
  }

  const resetFilters = () => {
    setLevel('all')
    setCountry('all')
    setFullOnly(false)
  }

  const visibleResults = useMemo(
    () => results.filter((s) => !dismissedIds.includes(scholarshipKey(s))),
    [results, dismissedIds],
  )

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          results
            .map((s) => s.country)
            .filter((c): c is string => typeof c === 'string'),
        ),
      ).sort((a, b) => a.localeCompare(b, 'fr')),
    [results],
  )

  const filteredResults = useMemo(
    () =>
      visibleResults
        .filter((s) => {
          if (level !== 'all' && s.level !== level) return false
          if (country !== 'all' && s.country !== country) return false
          if (fullOnly && s.coverage !== 'full') return false
          return true
        })
        .sort(
          (a, b) =>
            (b.recommendation?.score ?? 0) - (a.recommendation?.score ?? 0),
        ),
    [visibleResults, level, country, fullOnly],
  )

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Pour toi
        </h1>
        <p className="text-pretty text-muted-foreground">
          Des bourses sélectionnées pour ton profil, sans avoir à chercher.
        </p>
      </header>

      {!profileComplete && !promptDismissed && (
        <ProfilePrompt onDismiss={() => setPromptDismissed(true)} />
      )}

      {visibleResults.length > 0 && (
        <ForYouChips
          level={level}
          country={country}
          fullOnly={fullOnly}
          countries={countries}
          onLevelChange={setLevel}
          onCountryChange={setCountry}
          onFullOnlyChange={setFullOnly}
        />
      )}

      {visibleResults.length === 0 ? (
        <Empty className="rounded-xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Sparkles />
            </EmptyMedia>
            <EmptyTitle>Tu as tout vu pour le moment</EmptyTitle>
            <EmptyDescription>
              Tu as vu toutes les suggestions du moment. Reviens bientôt, ou
              lance une recherche.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/search" />}>
              Lancer une recherche
            </Button>
          </EmptyContent>
        </Empty>
      ) : filteredResults.length === 0 ? (
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
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredResults.map((s) => (
              <ForYouCard
                key={scholarshipKey(s)}
                result={s}
                saved={savedLinks.includes(scholarshipKey(s))}
                saving={savingLink === scholarshipKey(s)}
                onSave={onSave}
                onDismiss={handleDismiss}
              />
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Vérifie toujours les montants et les dates limites sur le site
            officiel de chaque bourse.
          </p>
        </div>
      )}

      <UndoToast visible={lastDismissedId !== null} onUndo={handleUndo} />
    </div>
  )
}
