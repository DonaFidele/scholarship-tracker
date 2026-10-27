import type {
  LeaPlan,
  MilestoneEvent,
  MilestoneEventType,
  MilestoneStatus,
  PlanMilestone,
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

const statusEvent: Partial<Record<MilestoneStatus, MilestoneEventType>> = {
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

export function changeStatus(
  plan: LeaPlan,
  id: string,
  status: MilestoneStatus,
  reason: string | null,
): LeaPlan {
  return updateMilestone(plan, id, (m) => {
    const type = statusEvent[status]
    return {
      ...m,
      status,
      events: type ? [...m.events, makeEvent(type, { reason })] : m.events,
    }
  })
}

export function editMilestone(
  plan: LeaPlan,
  id: string,
  newTitle: string,
  semesterLabel: string,
  semesterIndex: number,
  reason: string | null,
): LeaPlan {
  return updateMilestone(plan, id, (m) => {
    const titleChanged = newTitle !== m.title
    const moved = semesterIndex !== m.semester_index
    const events = [...m.events]
    if (titleChanged || moved) {
      events.push(
        makeEvent('ajustee', {
          previous_title: m.title,
          new_title: newTitle,
          reason: reason ?? (moved ? `Déplacée vers ${semesterLabel}` : null),
        }),
      )
    }
    return {
      ...m,
      title: newTitle,
      semester_label: semesterLabel,
      semester_index: semesterIndex,
      events,
    }
  })
}

export function deleteMilestone(plan: LeaPlan, id: string): LeaPlan {
  return { ...plan, milestones: plan.milestones.filter((m) => m.id !== id) }
}

export function addMilestone(
  plan: LeaPlan,
  title: string,
  semesterLabel: string,
  semesterIndex: number,
): LeaPlan {
  const milestone: PlanMilestone = {
    id: nextId('ms'),
    title,
    semester_label: semesterLabel,
    semester_index: semesterIndex,
    status: 'a_faire',
    related_field: null,
    added_after_validation: plan.stage === 'validated',
    events: [makeEvent('creee')],
  }
  return { ...plan, milestones: [...plan.milestones, milestone] }
}
