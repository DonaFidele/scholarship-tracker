'use client'

import { cn } from 'cn'
import { ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusSelect } from '@/components/applications/status-select'
import { DeadlineCell } from '@/components/applications/deadline-cell'
import { DeleteDialog } from '@/components/applications/delete-dialog'
import { daysLeft } from '@/lib/deadline'
import type { Application, ApplicationStatus } from '@/lib/types'

export function ApplicationTable({
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
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[30%]">Bourse</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Deadline</TableHead>
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
                className={cn(
                  'border-l-2 border-l-transparent',
                  expired && 'opacity-60',
                  urgent && 'border-l-red-500',
                )}
              >
                <TableCell className="whitespace-normal">
                  <div className="flex flex-col gap-0.5">
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit items-center gap-1.5 font-medium hover:text-primary hover:underline"
                    >
                      {a.name}
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                    </a>
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
                <TableCell>
                  <DeadlineCell
                    deadline={a.deadline}
                    onChange={(d) => onDeadlineChange(a.id, d)}
                  />
                </TableCell>
                <TableCell>
                  <StatusSelect
                    value={a.status}
                    onChange={(s) => onStatusChange(a.id, s)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DeleteDialog name={a.name} onConfirm={() => onDelete(a.id)} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
