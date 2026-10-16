'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { Profile } from '@/lib/types'
import { ProfileFormFields } from './profile-form-fields'
export function ProfileView({ profile, saving, onSave }: { profile: Profile; saving: boolean; onSave: (profile: Profile) => void }) { const [draft, setDraft] = useState(profile); const changed = JSON.stringify(draft) !== JSON.stringify(profile); return <div className="flex flex-col gap-6 pb-24 md:pb-0"><header><h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1><p className="text-muted-foreground">Ces infos servent uniquement à te recommander des bourses.</p></header><Card><CardHeader><CardTitle>Préférences d&apos;études</CardTitle></CardHeader><CardContent><ProfileFormFields profile={draft} onChange={setDraft} /></CardContent></Card><div className="sticky bottom-0 z-30 -mx-4 border-t bg-background/95 px-4 py-3 md:static md:mx-0 md:flex md:justify-end md:border-0 md:bg-transparent"><Button disabled={!changed || saving} onClick={() => { onSave(draft); toast.success('Profil enregistré') }}>{saving && <Spinner data-icon="inline-start" />}Enregistrer</Button></div></div> }
