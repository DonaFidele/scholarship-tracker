'use client'

import { cn } from 'cn'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatusSelect } from '@/components/applications/status-select'
import { DeadlineCell } from '@/components/applications/deadline-cell'
import { DeleteDialog } from '@/components/applications/delete-dialog'
import { DeadlineBadge } from '@/components/deadline-badge'
import { daysLeft } from '@/lib/deadline'
import type { Application, ApplicationStatus } from '@/lib/types'

export function ApplicationCards({
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
    <div className="flex flex-col gap-3">
      {applications.map((a) => {
        const days = daysLeft(a.deadline)
        const expired = days !== null && days < 0
        const urgent = days !== null && days >= 0 && days <= 3
        return (
          <Card
            key={a.id}
            className={cn(
              'border-l-2 border-l-transparent',
              expired && 'opacity-60',
              urgent && 'border-l-red-500',
            )}
          >
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 font-medium leading-snug hover:text-primary hover:underline"
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
                <DeadlineBadge deadline={a.deadline} className="mt-0.5 shrink-0" />
              </div>

              {a.amount && (
                <p className="text-sm text-muted-foreground">{a.amount}</p>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Date limite
                </span>
                <DeadlineCell
                  deadline={a.deadline}
                  onChange={(d) => onDeadlineChange(a.id, d)}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <StatusSelect
                  value={a.status}
                  onChange={(s) => onStatusChange(a.id, s)}
                />
                <DeleteDialog name={a.name} onConfirm={() => onDelete(a.id)} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
