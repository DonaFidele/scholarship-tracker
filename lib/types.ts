export type Scholarship = {
  name: string
  amount: string | null
  /** Format "YYYY-MM-DD" */
  deadline: string | null
  country: string | null
  /** May be null when the source URL is unknown. */
  link: string | null
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

export type Application = Scholarship & {
  id: string
  status: ApplicationStatus
  notes: string | null
  created_at: string
}

export type ApplicationWithChecklist = Application & {
  checklist_items: ChecklistItem[]
}

export type UserSettings = {
  email_reminders: boolean
  /** Subset of [7, 3, 1]. */
  reminder_days: number[]
}

export type SearchStatus = 'idle' | 'loading' | 'error' | 'success'
