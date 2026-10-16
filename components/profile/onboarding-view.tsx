'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import type { Profile } from '@/lib/types'
import { ProfileFormFields } from './profile-form-fields'

const questions = ['Où en es-tu aujourd’hui ?', 'Quel diplôme vises-tu avec une bourse ?', 'Quel est ton domaine d’études ?', 'Dans quels pays voudrais-tu étudier ?', 'Quelles langues et quels tests as-tu ?']

export function OnboardingView({ initialProfile, saving, error, onComplete, onSkip }: { initialProfile: Profile; saving: boolean; error: string | null; onComplete: (profile: Profile) => void; onSkip: () => void }) {
  const [draft, setDraft] = useState(initialProfile)
  const [step, setStep] = useState(1)
  const [skipOpen, setSkipOpen] = useState(false)
  const canContinue = step !== 2 || Boolean(draft.target_level)
  return <main className="mx-auto flex min-h-svh max-w-lg flex-col gap-6 px-4 py-6">
    <header className="flex items-center justify-between"><Link href="/search" className="flex items-center gap-2 font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><GraduationCap className="size-5" /></span>Scholarship Tracker</Link><Button variant="ghost" size="sm" onClick={() => setSkipOpen(true)}>Passer pour l&apos;instant</Button></header>
    <div><h1 className="text-2xl font-semibold">Bienvenue</h1><p className="text-muted-foreground">Réponds à 5 questions pour qu&apos;on te propose les bonnes bourses. Moins d&apos;une minute.</p></div>
    <div className="flex flex-col gap-2"><Progress value={step * 20} /><span className="text-sm text-muted-foreground">Étape {step} sur 5</span></div>
    <Card><CardHeader><CardTitle>{questions[step - 1]}</CardTitle></CardHeader><CardContent><ProfileFormFields profile={draft} onChange={setDraft} step={step as 1 | 2 | 3 | 4 | 5} /></CardContent></Card>
    {error && <p className="text-sm text-destructive">{error}</p>}
    <div className="flex justify-between"><Button variant="ghost" className={step === 1 ? 'invisible' : ''} onClick={() => setStep((value) => value - 1)}>Retour</Button><Button disabled={saving || !canContinue} onClick={() => step === 5 ? onComplete(draft) : setStep((value) => value + 1)}>{saving && <Spinner data-icon="inline-start" />}{step === 5 ? 'Terminer' : 'Continuer'}</Button></div>
    <p className="flex items-center gap-2 text-sm text-muted-foreground"><Lock className="size-4" />Ton profil reste privé. Tu peux le modifier ou le supprimer à tout moment.</p>
    <Dialog open={skipOpen} onOpenChange={setSkipOpen}><DialogContent><DialogHeader><DialogTitle>Passer cette étape ?</DialogTitle><DialogDescription>Tu pourras compléter ton profil plus tard. Sans profil, on ne pourra pas te recommander de bourses.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setSkipOpen(false)}>Retour</Button><Button onClick={onSkip}>Passer</Button></DialogFooter></DialogContent></Dialog>
  </main>
}
