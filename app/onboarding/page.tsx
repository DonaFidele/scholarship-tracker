'use client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { OnboardingView } from '@/components/profile/onboarding-view'
import type { Profile } from '@/lib/types'
const empty: Profile = { current_level: null, target_level: null, field: null, destinations: [], languages: [], tests: [] }
export default function OnboardingPage() { const router = useRouter(); return <OnboardingView initialProfile={empty} saving={false} error={null} onComplete={() => { toast.success('Ton profil est prêt'); router.push('/search') }} onSkip={() => router.push('/search')} /> }
