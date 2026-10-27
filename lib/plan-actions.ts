import {
  MAX_OBJECTIVES_PER_SEMESTER,
  MIN_OBJECTIVES_PER_SEMESTER,
  objectivesInSemester,
  semesterLabel,
} from '@/lib/milestone-helpers'
import type {
  LeaPlan,
  MilestoneEvent,
  MilestoneEventType,
  MilestoneStatus,
  PlanMilestone,
  SubGoal,
} from '@/lib/types'

let counter = 0
function nextId(prefix: string) {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter}`
}

function makeEvent(
  type: MilestoneEventType,
  patch: Partial<MilestoneEvent> = {},
): MilestoneEvent {
  return {
    id: nextId('evt'),
    type,
    at: new Date().toISOString(),
    previous_title: null,
    new_title: null,
    reason: null,
    ...patch,
  }
}

const statusEvent: Record<MilestoneStatus, MilestoneEventType> = {
  a_faire: 'remise_a_faire',
  en_cours: 'marquee_en_cours',
  fait: 'marquee_faite',
  rate: 'marquee_ratee',
}

function updateMilestone(
  plan: LeaPlan,
  id: string,
  update: (m: PlanMilestone) => PlanMilestone,
): LeaPlan {
  return {
    ...plan,
    milestones: plan.milestones.map((m) => (m.id === id ? update(m) : m)),
  }
}

function updateSubGoals(
  plan: LeaPlan,
  milestoneId: string,
  update: (subGoals: SubGoal[]) => SubGoal[],
): LeaPlan {
  return updateMilestone(plan, milestoneId, (m) => ({
    ...m,
    sub_goals: update(m.sub_goals),
  }))
}

export function canAddObjective(plan: LeaPlan, semesterIndex: number) {
  return objectivesInSemester(plan, semesterIndex) < MAX_OBJECTIVES_PER_SEMESTER
}

export function canRemoveObjective(plan: LeaPlan, milestone: PlanMilestone) {
  return (
    objectivesInSemester(plan, milestone.semester_index) >
    MIN_OBJECTIVES_PER_SEMESTER
  )
}

export function changeStatus(
  plan: LeaPlan,
  id: string,
  status: MilestoneStatus,
  reason: string | null,
): LeaPlan {
  return updateMilestone(plan, id, (m) =>
    m.status === status
      ? m
      : {
          ...m,
          status,
          events: [...m.events, makeEvent(statusEvent[status], { reason })],
        },
  )
}

export function editMilestone(
  plan: LeaPlan,
  id: string,
  newTitle: string,
  semesterIndex: number,
  reason: string | null,
): LeaPlan {
  const current = plan.milestones.find((m) => m.id === id)
  if (!current) return plan
  const moved = semesterIndex !== current.semester_index
  if (moved && (!canAddObjective(plan, semesterIndex) || !canRemoveObjective(plan, current))) {
    return plan
  }
  return updateMilestone(plan, id, (m) => {
    const titleChanged = newTitle !== m.title
    const events = [...m.events]
    if (titleChanged || moved) {
      events.push(
        makeEvent('ajustee', {
          previous_title: m.title,
          new_title: newTitle,
          reason:
            reason ?? (moved ? `Déplacé vers ${semesterLabel(semesterIndex)}` : null),
        }),
      )
    }
    return {
      ...m,
      title: newTitle,
      semester_label: semesterLabel(semesterIndex),
      semester_index: semesterIndex,
      events,
    }
  })
}

export function deleteMilestone(plan: LeaPlan, id: string): LeaPlan {
  const milestone = plan.milestones.find((m) => m.id === id)
  if (!milestone || !canRemoveObjective(plan, milestone)) return plan
  return { ...plan, milestones: plan.milestones.filter((m) => m.id !== id) }
}

export function addMilestone(
  plan: LeaPlan,
  title: string,
  semesterIndex: number,
): LeaPlan {
  if (!canAddObjective(plan, semesterIndex)) return plan
  const milestone: PlanMilestone = {
    id: nextId('ms'),
    title,
    semester_label: semesterLabel(semesterIndex),
    semester_index: semesterIndex,
    status: 'a_faire',
    related_field: null,
    added_after_validation: plan.stage === 'validated',
    events: [makeEvent('creee')],
    sub_goals: [],
  }
  return { ...plan, milestones: [...plan.milestones, milestone] }
}

export function addSubGoal(plan: LeaPlan, milestoneId: string, title: string) {
  return updateSubGoals(plan, milestoneId, (list) => [
    ...list,
    { id: nextId('sg'), title, done: false },
  ])
}

export function toggleSubGoal(plan: LeaPlan, milestoneId: string, subGoalId: string) {
  return updateSubGoals(plan, milestoneId, (list) =>
    list.map((s) => (s.id === subGoalId ? { ...s, done: !s.done } : s)),
  )
}

export function renameSubGoal(
  plan: LeaPlan,
  milestoneId: string,
  subGoalId: string,
  title: string,
) {
  return updateSubGoals(plan, milestoneId, (list) =>
    list.map((s) => (s.id === subGoalId ? { ...s, title } : s)),
  )
}

export function deleteSubGoal(plan: LeaPlan, milestoneId: string, subGoalId: string) {
  return updateSubGoals(plan, milestoneId, (list) =>
    list.filter((s) => s.id !== subGoalId),
  )
}

export type PlanUpdater = (plan: LeaPlan) => LeaPlan
