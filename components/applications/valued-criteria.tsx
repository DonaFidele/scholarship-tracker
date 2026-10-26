import { OpportunityTypeBadge } from '@/components/opportunities/opportunity-type-badge'
import type { OpportunityType } from '@/lib/types'

export function ValuedCriteria({
  criteria,
}: {
  criteria: OpportunityType[] | null | undefined
}) {
  if (!criteria || criteria.length === 0) return null

  return (
    <section className="flex flex-col gap-2" aria-labelledby="valued-criteria-title">
      <h3 id="valued-criteria-title" className="text-sm font-medium">
        Ce que cette bourse valorise
      </h3>
      <ul className="flex flex-wrap gap-1.5">
        {criteria.slice(0, 4).map((type) => (
          <li key={type}>
            <a
              href={`/prepare-toi?type=${type}`}
              className="inline-flex rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <OpportunityTypeBadge type={type} className="hover:opacity-80" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
