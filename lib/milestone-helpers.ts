import type {
  LeaPlan,
  MilestoneEvent,
  MilestoneEventType,
  MilestoneStatus,
  PlanMilestone,
} from '@/lib/types'

export const statusLabels: Record<MilestoneStatus, string> = {
  a_faire: 'à faire',
  en_cours: 'en cours',
  fait: 'terminée',
  rate: 'ratée',
}

export const eventLabels: Record<MilestoneEventType, string> = {
  creee: 'Créée',
  ajustee: 'Ajustée',
  marquee_en_cours: 'Marquée en cours',
  marquee_faite: 'Marquée terminée',
  marquee_ratee: 'Marquée ratée',
}

/** True only if the milestone is still open and its semester is already behind us. */
export function isLate(
  milestone: Pick<PlanMilestone, 'status' | 'semester_index'>,
  currentSemesterIndex: number,
): boolean {
  return (
    (milestone.status === 'a_faire' || milestone.status === 'en_cours') &&
    milestone.semester_index < currentSemesterIndex
  )
}

export function planCounts(plan: LeaPlan): {
  done: number
  total: number
  remaining: number
  late: number
  percent: number
} {
  const total = plan.milestones.length
  const done = plan.milestones.filter((m) => m.status === 'fait').length
  const late = plan.milestones.filter((m) =>
    isLate(m, plan.current_semester_index),
  ).length
  return {
    done,
    total,
    remaining: total - done,
    late,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

export type SemesterGroup = {
  index: number
  label: string
  milestones: PlanMilestone[]
}

export function groupBySemester(milestones: PlanMilestone[]): SemesterGroup[] {
  const map = new Map<number, SemesterGroup>()
  for (const m of milestones) {
    const group = map.get(m.semester_index)
    if (group) group.milestones.push(m)
    else
      map.set(m.semester_index, {
        index: m.semester_index,
        label: m.semester_label,
        milestones: [m],
      })
  }
  return Array.from(map.values()).sort((a, b) => a.index - b.index)
}

export function sortEventsByDate(events: MilestoneEvent[]): MilestoneEvent[] {
  return [...events].sort((a, b) => a.at.localeCompare(b.at))
}

/** Title the milestone had when the given event happened. */
export function titleAtEvent(
  milestone: PlanMilestone,
  event: MilestoneEvent,
): string {
  const ordered = sortEventsByDate(milestone.events)
  const position = ordered.findIndex((e) => e.id === event.id)
  const nextAdjustment = ordered
    .slice(position + 1)
    .find((e) => e.type === 'ajustee')
  return nextAdjustment?.previous_title ?? milestone.title
}

export function addedAt(milestone: PlanMilestone): string | null {
  return milestone.events.find((e) => e.type === 'creee')?.at ?? null
}

export function semesterOptions(horizon: number, current: number) {
  const count = Math.max(horizon, current)
  return Array.from({ length: count }, (_, i) => ({
    value: String(i + 1),
    label: `Semestre ${i + 1}`,
  }))
}
