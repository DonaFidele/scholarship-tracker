'use client'
import { Check } from 'lucide-react'
import { cn } from 'cn'
import { Label } from '@/components/ui/label'
import type { Profile } from '@/lib/types'
import { COUNTRIES, CURRENT_LEVELS, FIELDS, LANGUAGES, TARGET_LEVELS, TESTS } from '@/lib/profile-options'

export function ChipGroup({ options, value, onChange, multiple = false, columns = false }: { options: readonly { value: string; label: string }[] | readonly string[]; value: string | string[] | null; onChange: (value: string | string[]) => void; multiple?: boolean; columns?: boolean }) {
  const values = Array.isArray(value) ? value : value ? [value] : []
  return <div className={cn('flex flex-wrap gap-2', columns && 'grid grid-cols-2')}>{options.map((option) => { const item = typeof option === 'string' ? { value: option, label: option } : option; const selected = values.includes(item.value); return <button type="button" key={item.value} aria-pressed={selected} onClick={() => { if (multiple) onChange(selected ? values.filter((v) => v !== item.value) : [...values, item.value]); else onChange(item.value) }} className={cn('flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-muted')}>{selected && <Check className="size-4" />}{item.label}</button> })}</div>
}

export function ProfileFormFields({ profile, onChange, compact = false }: { profile: Profile; onChange: (profile: Profile) => void; compact?: boolean }) {
 const set = (patch: Partial<Profile>) => onChange({ ...profile, ...patch })
 return <div className="flex flex-col gap-6">
  <section className="flex flex-col gap-2"><Label>Niveau actuel</Label><ChipGroup options={CURRENT_LEVELS} value={profile.current_level} onChange={(v) => set({ current_level: v as Profile['current_level'] })} /></section>
  <section className="flex flex-col gap-2"><Label>Diplôme visé</Label><ChipGroup options={TARGET_LEVELS} value={profile.target_level} onChange={(v) => set({ target_level: v as Profile['target_level'] })} /></section>
  <section className="flex flex-col gap-2"><Label>Domaine d&apos;études</Label><ChipGroup options={FIELDS} value={profile.field} onChange={(v) => set({ field: v as Profile['field'] })} columns /></section>
  <section className="flex flex-col gap-2"><Label>Pays souhaités</Label><ChipGroup options={['Peu importe', ...COUNTRIES]} value={profile.destinations.length ? profile.destinations : 'Peu importe'} multiple onChange={(v) => { const list = Array.isArray(v) ? v : [v]; set({ destinations: list.includes('Peu importe') ? [] : list.slice(0, 10) }) }} /></section>
  <section className="flex flex-col gap-3"><Label>Langues</Label><ChipGroup options={LANGUAGES} value={profile.languages} multiple onChange={(v) => set({ languages: v as Profile['languages'] })} /><Label>Tests passés</Label><ChipGroup options={TESTS} value={profile.tests} multiple onChange={(v) => set({ tests: v as Profile['tests'] })} /><p className="text-sm text-muted-foreground">Aucun test ? Pas de souci, beaucoup de bourses n&apos;en exigent pas.</p></section>
 </div>
}
