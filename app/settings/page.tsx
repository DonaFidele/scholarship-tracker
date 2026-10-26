'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { SettingsView } from '@/components/settings/settings-view'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_USER_SETTINGS, getSettings, saveSettings } from '@/lib/settings'
import type { UserSettings } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = useMemo(
    () => (typeof window === 'undefined' ? null : createClient()),
    [],
  )
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applicationsCount, setApplicationsCount] = useState(0)

  useEffect(() => {
    let active = true
    void (async () => {
      if (!supabase) {
        if (active) setLoading(false)
        return
      }

      try {
        const [{ data: { user }, error: userError }, { count }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('applications').select('*', { count: 'exact', head: true }),
        ])
        if (!active) return
        if (userError || !user) {
          router.replace('/login')
          return
        }
        setUserId(user.id)
        setEmail(user.email ?? '')
        setApplicationsCount(count ?? 0)
        try {
          setSettings(await getSettings(user.id))
        } catch {
          toast.error('Impossible de charger tes paramètres.')
        }
      } catch {
        if (active) toast.error('Impossible de charger ton profil.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router, supabase])

  const handleSave = useCallback(async (next: UserSettings) => {
    if (!userId) return
    if (next.email_reminders && next.reminder_days.length === 0) {
      toast.error('Choisis au moins un jour de rappel')
      return
    }
    setSaving(true)
    try {
      const sorted = { ...next, reminder_days: [...next.reminder_days].sort((a, b) => b - a) }
      await saveSettings(userId, sorted)
      setSettings(sorted)
      toast.success('Paramètres enregistrés')
    } catch {
      toast.error('Impossible d’enregistrer tes paramètres.')
    } finally {
      setSaving(false)
    }
  }, [userId])

  const handleSignOut = async () => {
    if (!supabase) {
      toast.error('La connexion est indisponible. Réessaie.')
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Impossible de se déconnecter. Réessaie.')
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-svh">
      <Navbar active="settings" applicationsCount={applicationsCount} />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 pb-24 md:pb-8">
        {loading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-xl" />
          </div>
        ) : (
          <SettingsView key={`${settings.email_reminders}-${settings.reminder_days.join(',')}`} settings={settings} email={email} saving={saving} onSave={handleSave} onSignOut={handleSignOut} />
        )}
      </main>
    </div>
  )
}
