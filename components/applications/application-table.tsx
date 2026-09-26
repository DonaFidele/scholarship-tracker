'use client'

import { cn } from 'cn'
import { ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusSelect } from '@/components/applications/status-select'
import { DeadlineCell } from '@/components/applications/deadline-cell'
import { DeleteDialog } from '@/components/applications/delete-dialog'
import { DossierProgress } from '@/components/applications/dossier-progress'
import { FavoriteToggle } from '@/components/applications/favorite-toggle'
import { MetadataBadges } from '@/components/scholarship/metadata-badges'
import { daysLeft } from '@/lib/deadline'
import type { ApplicationStatus, ApplicationWithChecklist } from '@/lib/types'

/** Stops row-level click handlers from firing when using inline controls. */
function stop(e: React.MouseEvent) {
  e.stopPropagation()
}

export function ApplicationTable({
  applications,
  onStatusChange,
  onDeadlineChange,
  onDelete,
  onToggleFavorite,
  onOpenApplication,
}: {
  applications: ApplicationWithChecklist[]
  onStatusChange: (id: string, status: ApplicationStatus) => void
  onDeadlineChange: (id: string, deadline: string | null) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string, value: boolean) => void
  onOpenApplication: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10">
              <span className="sr-only">Favori</span>
            </TableHead>
            <TableHead className="w-[26%]">Bourse</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Dossier</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((a) => {
            const days = daysLeft(a.deadline)
            const expired = days !== null && days < 0
            const urgent = days !== null && days >= 0 && days <= 3
            return (
              <TableRow
                key={a.id}
                onClick={() => onOpenApplication(a.id)}
                className={cn(
                  'cursor-pointer border-l-2 border-l-transparent',
                  expired && 'opacity-60',
                  urgent && 'border-l-red-500',
                )}
              >
                <TableCell onClick={stop}>
                  <FavoriteToggle
                    value={a.is_favorite}
                    onToggle={(v) => onToggleFavorite(a.id, v)}
                  />
                </TableCell>
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        stop(e)
                        onOpenApplication(a.id)
                      }}
                      className="w-fit text-left font-medium hover:text-primary hover:underline"
                    >
                      {a.name}
                    </button>
                    <MetadataBadges
                      level={a.level}
                      coverage={a.coverage}
                      benin={a.benin_eligible}
                      asksFee={a.asks_fee}
                    />
                    {a.country && (
                      <span className="text-xs text-muted-foreground">
                        {a.country}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  {a.amount ?? '—'}
                </TableCell>
                <TableCell onClick={stop}>
                  <DeadlineCell
                    deadline={a.deadline}
                    onChange={(d) => onDeadlineChange(a.id, d)}
                  />
                </TableCell>
                <TableCell>
                  <DossierProgress
                    items={a.checklist_items}
                    className="w-28"
                  />
                </TableCell>
                <TableCell onClick={stop}>
                  <StatusSelect
                    value={a.status}
                    onChange={(s) => onStatusChange(a.id, s)}
                  />
                </TableCell>
                <TableCell className="text-right" onClick={stop}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenApplication(a.id)}
                    >
                      Ouvrir
                      <ChevronRight data-icon="inline-end" />
                    </Button>
                    <DeleteDialog
                      name={a.name}
                      onConfirm={() => onDelete(a.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
