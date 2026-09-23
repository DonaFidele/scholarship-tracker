'use client'

import { CalendarClock, Loader, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { daysLeft } from '@/lib/deadline'
import type { Application } from '@/lib/types'

export function StatCards({ applications }: { applications: Application[] }) {
  const urgent = applications.filter((a) => {
    const d = daysLeft(a.deadline)
    return d !== null && d >= 0 && d <= 7
  }).length
  const inProgress = applications.filter((a) => a.status === 'in_progress').length
  const submitted = applications.filter((a) => a.status === 'submitted').length

  const stats = [
    {
      label: 'Deadlines urgentes',
      value: urgent,
      hint: '≤ 7 jours',
      icon: CalendarClock,
      accent: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'En cours',
      value: inProgress,
      hint: 'à finaliser',
      icon: Loader,
      accent: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Dossiers envoyés',
      value: submitted,
      hint: 'en attente',
      icon: Send,
      accent: 'text-blue-600 dark:text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <span className="text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {stat.hint}
                </span>
              </div>
              <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                <Icon className={stat.accent} />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
