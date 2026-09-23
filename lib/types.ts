export type Scholarship = {
  name: string
  amount: string | null
  /** Format "YYYY-MM-DD" */
  deadline: string | null
  country: string | null
  link: string
}

export type ApplicationStatus =
  | 'todo'
  | 'in_progress'
  | 'submitted'
  | 'accepted'
  | 'rejected'

export type Application = Scholarship & {
  id: string
  status: ApplicationStatus
  notes: string | null
  created_at: string
}

export type SearchStatus = 'idle' | 'loading' | 'error' | 'success'
