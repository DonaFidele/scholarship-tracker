'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { ApplicationsView } from '@/components/applications/applications-view'
import { getMockApplications } from '@/lib/mock-data'
import type { Application, ApplicationStatus } from '@/lib/types'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>(() =>
    getMockApplications(),
  )

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    )
    toast.success('Statut mis à jour.')
  }

  const handleDeadlineChange = (id: string, deadline: string | null) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, deadline } : a)),
    )
    toast.success('Deadline mise à jour.')
  }

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
    toast.success('Candidature supprimée.')
  }

  return (
    <div className="min-h-svh">
      <Navbar active="applications" applicationsCount={applications.length} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <ApplicationsView
          applications={applications}
          onStatusChange={handleStatusChange}
          onDeadlineChange={handleDeadlineChange}
          onDelete={handleDelete}
        />
      </main>
    </div>
  )
}
