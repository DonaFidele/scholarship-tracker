'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { SearchView } from '@/components/search/search-view'
import { getMockApplications, mockSearchResults } from '@/lib/mock-data'
import type { Scholarship, SearchStatus } from '@/lib/types'

export default function SearchPage() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<Scholarship[]>([])
  const [savedLinks, setSavedLinks] = useState<string[]>([])
  const [savingLink, setSavingLink] = useState<string | null>(null)
  // Mock saved applications, used only for the navbar counter here.
  const [applicationsCount] = useState(() => getMockApplications().length)

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleSearch = (query: string) => {
    const q = query.trim()
    if (!q) return
    setStatus('loading')
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      const normalized = q.toLowerCase()
      if (normalized.includes('erreur')) {
        setResults([])
        setStatus('error')
        return
      }
      if (normalized.includes('vide')) {
        setResults([])
        setStatus('success')
        return
      }
      setResults(mockSearchResults)
      setStatus('success')
    }, 1100)
  }

  const handleSave = (scholarship: Scholarship) => {
    if (savedLinks.includes(scholarship.link)) {
      toast.info('Cette bourse est déjà dans tes candidatures.')
      return
    }
    setSavingLink(scholarship.link)
    setTimeout(() => {
      setSavedLinks((prev) => [...prev, scholarship.link])
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
