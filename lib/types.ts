export type Level = 'licence' | 'master' | 'doctorat' | 'autre'

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

export type Application = Scholarship &
  ApplicationInfo & {
    id: string
    status: ApplicationStatus
    notes: string | null
    created_at: string
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
}

export type UserSettings = {
  email_reminders: boolean
  /** Subset of [7, 3, 1]. */
  reminder_days: number[]
}

export type SearchStatus = 'idle' | 'loading' | 'error' | 'success'

export type DetailsState = 'idle' | 'loading' | 'error' | 'ready'
