'use client'

import { useMemo, useState } from 'react'
import { Plus, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import {
  OpportunityFilters,
  type OpportunityCostFilter,
  type OpportunityModeFilter,
  type OpportunityTypeFilter,
} from '@/components/opportunities/opportunity-filters'
import { OpportunityTrustNotice } from '@/components/opportunities/opportunity-trust-notice'
import { SuggestOpportunityDialog } from '@/components/opportunities/suggest-opportunity-dialog'
import type { Opportunity, OpportunitySuggestion } from '@/lib/types'

export function PrepareView({
  opportunities,
  onSuggest,
}: {
  opportunities: Opportunity[]
  onSuggest: (data: OpportunitySuggestion) => void
}) {
  const [type, setType] = useState<OpportunityTypeFilter>('all')
  const [mode, setMode] = useState<OpportunityModeFilter>('all')
  const [cost, setCost] = useState<OpportunityCostFilter>('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(
    () =>
      opportunities.filter(
        (o) =>
          (type === 'all' || o.type === type) &&
          (mode === 'all' || o.mode === mode) &&
          (cost === 'all' || o.cost === cost),
      ),
    [opportunities, type, mode, cost],
  )

  const resetFilters = () => {
    setType('all')
    setMode('all')
    setCost('all')
  }

  const handleSuggest = (data: OpportunitySuggestion) => {
    onSuggest(data)
    setDialogOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Construis ton profil avant de postuler
          </h1>
          <p className="max-w-2xl text-pretty text-muted-foreground">
            Des programmes concrets pour développer le leadership, le volontariat
            et l’expérience que les bourses recherchent.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-10 shrink-0 self-start"
          onClick={() => setDialogOpen(true)}
        >
          <Plus data-icon="inline-start" />
          Proposer un programme
        </Button>
      </header>

      <OpportunityTrustNotice />

      <OpportunityFilters
        type={type}
        mode={mode}
        cost={cost}
        onTypeChange={setType}
        onModeChange={setMode}
        onCostChange={setCost}
      />

      {filtered.length === 0 ? (
        <Empty className="rounded-xl border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>Aucun programme avec ces filtres</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={resetFilters}>
              Réinitialiser les filtres
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} programme{filtered.length > 1 ? 's' : ''}
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </ul>
        </>
      )}

      <SuggestOpportunityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSuggest}
      />
    </div>
  )
}
