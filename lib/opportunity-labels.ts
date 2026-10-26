import type {
  OpportunityCost,
  OpportunityMode,
  OpportunityType,
} from '@/lib/types'

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  'leadership',
  'volontariat',
  'mentorat',
  'stage',
  'fellowship',
  'competition',
]

export const typeLabels: Record<OpportunityType, string> = {
  leadership: 'Leadership',
  volontariat: 'Volontariat',
  mentorat: 'Mentorat',
  stage: 'Stage',
  fellowship: 'Fellowship',
  competition: 'Compétition',
}

export const modeLabels: Record<OpportunityMode, string> = {
  en_ligne: 'En ligne',
  presentiel: 'Présentiel',
  hybride: 'Hybride',
}

export const costLabels: Record<OpportunityCost, string> = {
  gratuit: 'Gratuit',
  payant: 'Payant',
}
