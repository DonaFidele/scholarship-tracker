'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'
import { ProfileView } from '@/components/profile/profile-view'
import type { Profile } from '@/lib/types'
const mockProfile: Profile = { current_level: 'master_1', target_level: 'master', field: 'finance', destinations: ['Canada', 'France'], languages: ['francais', 'anglais'], tests: ['ielts'] }
export default function ProfilePage() { const [profile, setProfile] = useState(mockProfile); const [saving, setSaving] = useState(false); return <div className="min-h-svh"><Navbar active="profile" applicationsCount={0} /><main className="mx-auto w-full max-w-5xl px-4 py-8"><ProfileView profile={profile} saving={saving} onSave={(next) => { setSaving(true); window.setTimeout(() => { setProfile(next); setSaving(false); toast.success('Profil enregistré') }, 500) }} /></main></div> }
