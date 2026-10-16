'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { SearchView } from '@/components/search/search-view'
import { createClient } from '@/lib/supabase/client'
import type { Scholarship, SearchStatus } from '@/lib/types'

export default function SearchPage() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [results, setResults] = useState<Scholarship[]>([])
  const [savedLinks, setSavedLinks] = useState<string[]>([])
  const [savingLink, setSavingLink] = useState<string | null>(null)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const requestId = useRef(0)
  const supabase = useMemo(
    () => (typeof window === 'undefined' ? null : createClient()),
    [],
  )

  useEffect(() => {
    if (!supabase) return
    let active = true
    const load = async () => {
      const { data, error, count } = await supabase.from('applications').select('link', { count: 'exact' })
      if (error) { toast.error('Impossible de charger tes candidatures.'); return }
      if (active) {
        setSavedLinks((data ?? []).map((row) => row.link).filter((link): link is string => typeof link === 'string'))
        setApplicationsCount(count ?? 0)
      }
    }
    void load()
    return () => { active = false }
  }, [supabase])

  const handleSearch = async (query: string) => {
    const q = query.trim()
    if (!q || status === 'loading') return
    const currentRequest = ++requestId.current
    setStatus('loading')
    try {
      const response = await fetch('/api/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data: { results?: Scholarship[]; error?: string } = await response.json()
      if (!response.ok || !Array.isArray(data.results)) throw new Error(data.error ?? 'La recherche a échoué.')
      if (currentRequest !== requestId.current) return
      setResults(data.results)
      setStatus('success')
    } catch {
      if (currentRequest !== requestId.current) return
      setResults([])
      setStatus('error')
    }
  }

  const handleSave = async (scholarship: Scholarship) => {
    const key = scholarship.link
    if (!key) { toast.error('Cette bourse ne possède pas de lien à sauvegarder.'); return }
    if (savedLinks.includes(key)) { toast.info('Déjà dans tes candidatures'); return }
    setSavingLink(key)
    const { error } = await supabase.from('applications').insert({
      name: scholarship.name, link: scholarship.link, amount: scholarship.amount,
      country: scholarship.country, deadline: scholarship.deadline,
      level: scholarship.level, coverage: scholarship.coverage,
      benin_eligible: scholarship.benin_eligible, asks_fee: scholarship.asks_fee,
    })
    setSavingLink(null)
    if (error) {
      if (error.code === '23505') toast.info('Déjà dans tes candidatures')
      else toast.error('Impossible de sauvegarder cette bourse.')
      return
    }
    setSavedLinks((prev) => [...prev, key])
    setApplicationsCount((count) => count + 1)
    toast.success('Bourse sauvegardée')
  }

  return (
    <div className="min-h-svh">
      <Navbar active="search" applicationsCount={applicationsCount} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <SearchView results={results} status={status} savedLinks={savedLinks} savingLink={savingLink} onSearch={handleSearch} onSave={handleSave} />
      </main>
    </div>
  )
}
