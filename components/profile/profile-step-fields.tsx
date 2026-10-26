'use client'

import { Label } from '@/components/ui/label'
import type { Profile } from '@/lib/types'
import { COUNTRIES, CURRENT_LEVELS, FIELDS, LANGUAGES, TARGET_LEVELS, TESTS } from '@/lib/profile-options'
import { ChipGroup } from './profile-form-fields'

export function ProfileStepFields({
  step,
  profile,
  onChange,
}: {
  step: number
  profile: Profile
  onChange: (profile: Profile) => void
}) {
  const set = (patch: Partial<Profile>) => onChange({ ...profile, ...patch })

  if (step === 1) {
    return (
      <div role="group" aria-label="Niveau actuel">
        <ChipGroup options={CURRENT_LEVELS} value={profile.current_level} onChange={(v) => set({ current_level: v as Profile['current_level'] })} />
      </div>
    )
  }
  if (step === 2) {
    return (
      <div role="group" aria-label="Diplôme visé" className="flex flex-col gap-2">
        <ChipGroup options={TARGET_LEVELS} value={profile.target_level} onChange={(v) => set({ target_level: v as Profile['target_level'] })} />
        <p className="text-sm text-muted-foreground">Cette réponse est obligatoire pour continuer.</p>
      </div>
    )
  }
  if (step === 3) {
    return (
      <div role="group" aria-label="Domaine d'études">
        <ChipGroup options={FIELDS} value={profile.field} columns onChange={(v) => set({ field: v as Profile['field'] })} />
      </div>
    )
  }
  if (step === 4) {
    return (
      <div role="group" aria-label="Pays souhaités" className="flex flex-col gap-2">
        <ChipGroup
          options={['Peu importe', ...COUNTRIES]}
          value={profile.destinations.length ? profile.destinations : 'Peu importe'}
          multiple
          onChange={(v) => {
            const list = Array.isArray(v) ? v : [v]
            const last = list[list.length - 1]
            if (last === 'Peu importe' || list.length === 0) return set({ destinations: [] })
            set({ destinations: list.filter((item) => item !== 'Peu importe').slice(0, 10) })
          }}
        />
        <p className="text-sm text-muted-foreground">Jusqu&apos;à 10 pays. {profile.destinations.length}/10 sélectionnés.</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Langues</Label>
        <ChipGroup options={LANGUAGES} value={profile.languages} multiple onChange={(v) => set({ languages: v as Profile['languages'] })} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Tests passés</Label>
        <ChipGroup options={TESTS} value={profile.tests} multiple onChange={(v) => set({ tests: v as Profile['tests'] })} />
      </div>
      <p className="text-sm text-muted-foreground">Aucun test ? Pas de souci, beaucoup de bourses n&apos;en exigent pas.</p>
    </div>
  )
}
