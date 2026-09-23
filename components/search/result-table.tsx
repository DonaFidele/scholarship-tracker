'use client'

import { ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeadlineBadge } from '@/components/deadline-badge'
import { SaveButton } from '@/components/search/save-button'
import { formatDateFr } from '@/lib/format'
import type { Scholarship } from '@/lib/types'

export function ResultTable({
  results,
  savedLinks,
  savingLink,
  onSave,
}: {
  results: Scholarship[]
  savedLinks: string[]
  savingLink: string | null
  onSave: (scholarship: Scholarship) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[38%]">Bourse</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Pays</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((s) => (
            <TableRow key={s.link}>
              <TableCell className="whitespace-normal">
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium hover:text-primary hover:underline"
                >
                  {s.name}
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                </a>
              </TableCell>
              <TableCell className="whitespace-normal text-muted-foreground">
                {s.amount ?? '—'}
              </TableCell>
              <TableCell>
                {s.deadline ? (
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatDateFr(s.deadline)}
                    </span>
                    <DeadlineBadge deadline={s.deadline} />
                  </span>
                ) : (
                  <span className="text-muted-foreground">Non précisée</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {s.country ?? '—'}
              </TableCell>
              <TableCell className="text-right">
                <SaveButton
                  saved={savedLinks.includes(s.link)}
                  saving={savingLink === s.link}
                  onClick={() => onSave(s)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
