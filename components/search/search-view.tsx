'use client'

import { useState } from 'react'
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
import { ResultTable } from '@/components/search/result-table'
import { ResultCards } from '@/components/search/result-cards'
import type { Scholarship, SearchStatus } from '@/lib/types'

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
  status,
  savedLinks,
  savingLink,
  onSearch,
  onSave,
}: {
  results: Scholarship[]
  status: SearchStatus
  savedLinks: string[]
  savingLink: string | null
  onSearch: (query: string) => void
  onSave: (scholarship: Scholarship) => void
}) {
  const [query, setQuery] = useState('')

  const runChip = (chip: string) => {
    setQuery(chip)
    onSearch(chip)
  }

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
        <div className="flex flex-col gap-3">
          <div className="hidden md:block">
            <ResultTable
              results={results}
              savedLinks={savedLinks}
              savingLink={savingLink}
              onSave={onSave}
            />
          </div>
          <div className="md:hidden">
            <ResultCards
              results={results}
              savedLinks={savedLinks}
              savingLink={savingLink}
              onSave={onSave}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Résultats générés automatiquement. Vérifie toujours les montants et
            les dates limites sur le site officiel de chaque bourse.
          </p>
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
