'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { SearchView } from '@/components/search/search-view'
import { getMockApplications } from '@/lib/mock-data'
import type { Scholarship, SearchStatus } from '@/lib/types'

export default function SearchPage() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<Scholarship[]>([])
  const [savedLinks, setSavedLinks] = useState<string[]>([])
  const [savingLink, setSavingLink] = useState<string | null>(null)
  // Mock saved applications, used only for the navbar counter here.
  const [applicationsCount] = useState(() => getMockApplications().length)

  const handleSearch = async (query: string) => {
    const q = query.trim()
    if (!q) return
    setStatus('loading')
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data: { results?: Scholarship[]; error?: string } =
        await response.json()
      if (!response.ok || !Array.isArray(data.results)) {
        throw new Error(data.error ?? 'La recherche a échoué.')
      }
      setResults(data.results)
      setStatus('success')
    } catch {
      setResults([])
      setStatus('error')
    }
  }

  const handleSave = (scholarship: Scholarship) => {
    const key = scholarship.link ?? scholarship.name
    if (savedLinks.includes(key)) {
      toast.info('Cette bourse est déjà dans tes candidatures.')
      return
    }
    setSavingLink(key)
    setTimeout(() => {
      setSavedLinks((prev) => [...prev, key])
      setSavingLink(null)
      toast.success('Bourse sauvegardée dans tes candidatures.')
    }, 900)
  }

  return (
    <div className="min-h-svh">
      <Navbar active="search" applicationsCount={applicationsCount} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <SearchView
          results={results}
          status={status}
          savedLinks={savedLinks}
          savingLink={savingLink}
          onSearch={handleSearch}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}
