export type Level = 'licence' | 'master' | 'doctorat' | 'autre'
export type CurrentLevel = 'licence_1' | 'licence_2' | 'licence_3' | 'master_1' | 'master_2' | 'diplome' | 'autre'
export type FieldKey = 'economie' | 'finance' | 'gestion' | 'comptabilite_audit' | 'marketing_commerce' | 'statistiques_data' | 'informatique' | 'droit_sciences_po' | 'sante' | 'ingenierie' | 'agriculture_environnement' | 'lettres_sciences_humaines' | 'autre'
export type Profile = { current_level: CurrentLevel | null; target_level: Level | null; field: FieldKey | null; destinations: string[]; languages: ('francais' | 'anglais')[]; tests: ('ielts' | 'toefl' | 'tcf_delf' | 'gre_gmat')[] }
export type Recommendation = { recommended: boolean; score: number; reasons: string[] }
export type CatalogSource = 'curated' | 'community'
export type SearchResult = Scholarship & {
  fields: string[]
  source: CatalogSource
  /** ISO date of the last catalog verification. */
  last_checked_at: string | null
}
export type RankedResult = SearchResult & { recommendation: Recommendation | null }

export type Coverage = 'full' | 'partial'

export type BeninEligibility = 'yes' | 'no' | 'unknown'

export type Scholarship = {
  name: string
  amount: string | null
  /** Format "YYYY-MM-DD" */
  deadline: string | null
  country: string | null
  /** May be null when the source URL is unknown. */
  link: string | null
  level: Level | null
  coverage: Coverage | null
  benin_eligible: BeninEligibility
  asks_fee: boolean | null
}

export type ApplicationStatus =
  | 'todo'
  | 'in_progress'
  | 'submitted'
  | 'accepted'
  | 'rejected'

export type ChecklistItem = {
  id: string
  label: string
  is_done: boolean
  sort_order: number
}

export type ApplicationInfo = {
  apply_link: string | null
  /** Format "YYYY-MM-DD" */
  opens_at: string | null
  /** Format "YYYY-MM-DD" */
  results_at: string | null
  is_favorite: boolean
  eligibility_notes: string | null
  covered_costs: string | null
  /** ISO timestamp of the last automatic detail extraction. */
  details_checked_at: string | null
}

export type OpportunityType =
  | 'leadership'
  | 'volontariat'
  | 'mentorat'
  | 'stage'
  | 'fellowship'
  | 'competition'

export type OpportunityMode = 'en_ligne' | 'presentiel' | 'hybride'

export type OpportunityCost = 'gratuit' | 'payant'

export type Opportunity = {
  id: string
  name: string
  type: OpportunityType
  description: string
  duration: string | null
  mode: OpportunityMode
  country: string | null
  cost: OpportunityCost | null
  link: string | null
  what_it_brings: string
  source: CatalogSource
}

export type OpportunitySuggestion = Pick<
  Opportunity,
  'name' | 'type' | 'description' | 'link' | 'duration' | 'mode' | 'cost'
>

export type Application = Scholarship &
  ApplicationInfo & {
    id: string
    status: ApplicationStatus
    notes: string | null
    created_at: string
    /** Criteria this scholarship values; absent until the data is available. */
    valued_criteria?: OpportunityType[] | null
  }

export type ApplicationWithChecklist = Application & {
  checklist_items: ChecklistItem[]
}

export type ScholarshipDetails = {
  level: Level | null
  coverage: Coverage | null
  benin_eligible: BeninEligibility
  asks_fee: boolean | null
  /** Format "YYYY-MM-DD" */
  opens_at: string | null
  /** Format "YYYY-MM-DD" */
  deadline: string | null
  /** Format "YYYY-MM-DD" */
  results_at: string | null
  apply_link: string | null
  eligibility_summary: string | null
  covered_costs: string | null
  required_documents: string[]
  valued_criteria?: OpportunityType[] | null
}

export type UserSettings = {
  email_reminders: boolean
  /** Subset of [7, 3, 1]. */
  reminder_days: number[]
}

export type SearchStatus = 'idle' | 'loading' | 'error' | 'success'

export type DetailsState = 'idle' | 'loading' | 'error' | 'ready'

export type MilestoneStatus = 'a_faire' | 'en_cours' | 'fait' | 'rate'

export type MilestoneEventType =
  | 'creee'
  | 'ajustee'
  | 'marquee_en_cours'
  | 'marquee_faite'
  | 'marquee_ratee'
  | 'remise_a_faire'

export type SubGoal = {
  id: string
  title: string
  done: boolean
}

export type MilestoneEvent = {
  id: string
  type: MilestoneEventType
  /** ISO date. */
  at: string
  /** Set only for "ajustee". */
  previous_title: string | null
  /** Set only for "ajustee". */
  new_title: string | null
  /** Optional note (why adjusted, why failed). */
  reason: string | null
}

export type PlanMilestone = {
  id: string
  title: string
  /** e.g. "Semestre 2". */
  semester_label: string
  /** 1-based, used for ordering and "late" detection. */
  semester_index: number
  status: MilestoneStatus
  related_field: FieldKey | null
  added_after_validation: boolean
  events: MilestoneEvent[]
  sub_goals: SubGoal[]
}

export type PlanStage = 'draft' | 'validated'

export type LeaPlan = {
  id: string
  target_title: string
  horizon_semesters: number
  /** Used to compute "late". */
  current_semester_index: number
  stage: PlanStage
  milestones: PlanMilestone[]
}

export type LeaMessageRole = 'user' | 'lea'

export type LeaMessage = {
  id: string
  role: LeaMessageRole
  content: string
  /** ISO timestamp. */
  created_at: string
}

export type LeaChatState = 'idle' | 'sending' | 'error'
