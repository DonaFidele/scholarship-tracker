'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, GraduationCap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import type { Profile } from '@/lib/types'
import { ProfileFormFields } from './profile-form-fields'

const questions = [
  { eyebrow: 'Ton parcours', title: "Où en es-tu aujourd’hui ?", description: 'Cela nous aide à trouver des bourses adaptées à ton niveau actuel.', step: 1 as const },
  { eyebrow: 'Ton objectif', title: 'Quel diplôme vises-tu ?', description: 'Choisis le niveau que tu souhaites préparer grâce à une bourse.', step: 2 as const },
  { eyebrow: 'Ton domaine', title: 'Qu’est-ce que tu veux étudier ?', description: 'Sélectionne le domaine qui correspond le mieux à ton projet.', step: 3 as const },
  { eyebrow: 'Ta destination', title: 'Où voudrais-tu étudier ?', description: 'Choisis un ou plusieurs pays. Tu peux aussi garder toutes les options ouvertes.', step: 4 as const },
  { eyebrow: 'Tes langues', title: 'Quelles langues parles-tu ?', description: 'Les langues peuvent ouvrir l’accès à davantage de programmes.', step: 5 as const },
  { eyebrow: 'Tes tests', title: 'As-tu passé un test de langue ?', description: 'Pas de test ? Aucun souci, beaucoup de bourses n’en exigent pas.', step: 6 as const },
]

export function OnboardingView({ initialProfile, saving, error, onComplete, onSkip }: { initialProfile: Profile; saving: boolean; error: string | null; onComplete: (profile: Profile) => void; onSkip: () => void }) {
  const [draft, setDraft] = useState(initialProfile)
  const [step, setStep] = useState(1)
  const [skipOpen, setSkipOpen] = useState(false)
  const question = questions[step - 1]
  const canContinue = step !== 2 || Boolean(draft.target_level)

  const next = () => step === questions.length ? onComplete(draft) : setStep((value) => value + 1)

  return <main className="mx-auto flex min-h-svh max-w-3xl flex-col px-5 py-6 sm:px-8 sm:py-8">
    <header className="flex items-center justify-between">
      <Link href="/search" className="flex items-center gap-2 font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="size-5" /></span>Scholarship Tracker</Link>
      <Button variant="ghost" size="sm" onClick={() => setSkipOpen(true)}>Passer pour l&apos;instant</Button>
    </header>

    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-10 sm:py-16">
      <div className="mb-8 space-y-5">
        <div className="flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-medium text-primary">Construisons ton profil</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Quelques questions pour commencer.</h1></div><span className="shrink-0 text-sm font-medium text-muted-foreground">{step} / {questions.length}</span></div>
        <Progress value={(step / questions.length) * 100} className="h-1.5" />
      </div>

      <Card className="border-border/70 shadow-xl shadow-black/5">
        <CardHeader className="gap-3 border-b border-border/60 pb-6"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{question.eyebrow}</p><CardTitle className="text-2xl sm:text-3xl">{question.title}</CardTitle><CardDescription className="text-base leading-relaxed">{question.description}</CardDescription></CardHeader>
        <CardContent className="min-h-[280px] pt-8"><ProfileFormFields profile={draft} onChange={setDraft} step={question.step} /></CardContent>
      </Card>
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-8 flex items-center justify-between gap-3"><Button variant="ghost" className={step === 1 ? 'invisible' : ''} onClick={() => setStep((value) => value - 1)}><ArrowLeft className="mr-2 size-4" />Retour</Button><Button size="lg" disabled={saving || !canContinue} onClick={next}>{saving && <Spinner data-icon="inline-start" />}{step === questions.length ? 'Enregistrer mon profil' : 'Continuer'}{step !== questions.length && <ArrowRight className="ml-2 size-4" />}</Button></div>
      <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground"><Lock className="size-4" />Ton profil reste privé et sera toujours modifiable.</p>
    </div>

    <Dialog open={skipOpen} onOpenChange={setSkipOpen}><DialogContent><DialogHeader><DialogTitle>Passer pour l&apos;instant ?</DialogTitle><DialogDescription>Tu pourras compléter ton profil plus tard depuis tes paramètres. Sans ces informations, les recommandations seront moins personnalisées.</DialogDescription></DialogHeader><DialogFooter><Button variant="ghost" onClick={() => setSkipOpen(false)}>Retour</Button><Button onClick={onSkip}>Passer</Button></DialogFooter></DialogContent></Dialog>
  </main>
}
