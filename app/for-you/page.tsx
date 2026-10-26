'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { ForYouView } from '@/components/for-you/for-you-view'
import { createClient } from '@/lib/supabase/client'
import { MOCK_FOR_YOU_RESULTS } from '@/lib/mock-ranked-results'
import { scholarshipKey } from '@/lib/scholarship-key'
import type { Scholarship } from '@/lib/types'

export default function ForYouPage() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [savedLinks, setSavedLinks] = useState<string[]>([])
  const [savingLink, setSavingLink] = useState<string | null>(null)
  const [applicationsCount, setApplicationsCount] = useState(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const supabase = useMemo(
    () => (typeof window === 'undefined' ? null : createClient()),
    [],
  )

  useEffect(() => {
    if (!supabase) return
    let active = true
    const load = async () => {
      const { data, error, count } = await supabase
        .from('applications')
        .select('link', { count: 'exact' })
      if (error) {
        toast.error('Impossible de charger tes candidatures.')
        return
      }
      if (active) {
        setSavedLinks(
          (data ?? [])
            .map((row) => row.link)
            .filter((link): link is string => typeof link === 'string'),
        )
        setApplicationsCount(count ?? 0)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [supabase])

  useEffect(() => () => clearTimeout(saveTimer.current), [])

  const handleSave = (scholarship: Scholarship) => {
    const key = scholarshipKey(scholarship)
    if (savedLinks.includes(key)) return
    setSavingLink(key)
    saveTimer.current = setTimeout(() => {
      setSavingLink(null)
      setSavedLinks((prev) => [...prev, key])
      setApplicationsCount((count) => count + 1)
      toast.success('Bourse sauvegardée')
    }, 600)
  }

  return (
    <div className="min-h-svh">
      <Navbar active="for-you" applicationsCount={applicationsCount} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        <ForYouView
          results={MOCK_FOR_YOU_RESULTS}
          dismissedIds={dismissedIds}
          savedLinks={savedLinks}
          savingLink={savingLink}
          profileComplete={false}
          onSave={handleSave}
          onDismiss={(id) => setDismissedIds((prev) => [...prev, id])}
          onUndoDismiss={(id) =>
            setDismissedIds((prev) => prev.filter((x) => x !== id))
          }
        />
      </main>
    </div>
  )
}
