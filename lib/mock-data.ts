import type {
  LeaMessage,
  LeaPlan,
  MilestoneEvent,
  MilestoneEventType,
  PlanMilestone,
} from '@/lib/types'

function event(
  id: string,
  type: MilestoneEventType,
  at: string,
  patch: Partial<MilestoneEvent> = {},
): MilestoneEvent {
  return {
    id,
    type,
    at,
    previous_title: null,
    new_title: null,
    reason: null,
    ...patch,
  }
}

export function getMockLeaPlan(): LeaPlan {
  return {
    id: 'plan-ml-stanford',
    target_title: 'Master en Machine Learning à Stanford',
    horizon_semesters: 6,
    current_semester_index: 3,
    stage: 'validated',
    milestones: [
      {
        id: 'ms-1',
        title: 'Lister 5 programmes cibles',
        semester_label: 'Semestre 1',
        semester_index: 1,
        status: 'fait',
        related_field: null,
        added_after_validation: false,
        events: [
          event('ev-1a', 'creee', '2026-02-02T09:00:00.000Z'),
          event('ev-1b', 'ajustee', '2026-02-10T18:30:00.000Z', {
            previous_title: 'Lister 3 programmes cibles',
            new_title: 'Lister 5 programmes cibles',
            reason: 'Plus de choix pour pouvoir comparer les exigences.',
          }),
          event('ev-1c', 'marquee_faite', '2026-03-14T20:10:00.000Z'),
        ],
      },
      {
        id: 'ms-2',
        title: 'Consolider les bases en statistiques',
        semester_label: 'Semestre 1',
        semester_index: 1,
        status: 'en_cours',
        related_field: 'statistiques_data',
        added_after_validation: false,
        events: [
          event('ev-2a', 'creee', '2026-02-02T09:00:00.000Z'),
          event('ev-2b', 'marquee_en_cours', '2026-04-06T08:45:00.000Z'),
        ],
      },
      {
        id: 'ms-3',
        title: 'Premier projet personnel en apprentissage automatique',
        semester_label: 'Semestre 2',
        semester_index: 2,
        status: 'rate',
        related_field: 'informatique',
        added_after_validation: false,
        events: [
          event('ev-3a', 'creee', '2026-02-02T09:00:00.000Z'),
          event('ev-3b', 'marquee_en_cours', '2026-05-12T10:00:00.000Z'),
          event('ev-3c', 'marquee_ratee', '2026-07-20T19:20:00.000Z', {
            reason: 'Projet trop ambitieux pour le temps disponible.',
          }),
        ],
      },
      {
        id: 'ms-4',
        title: 'Échanger avec un mentor du domaine',
        semester_label: 'Semestre 3',
        semester_index: 3,
        status: 'en_cours',
        related_field: null,
        added_after_validation: false,
        events: [
          event('ev-4a', 'creee', '2026-02-02T09:00:00.000Z'),
          event('ev-4b', 'marquee_en_cours', '2026-10-05T14:00:00.000Z'),
        ],
      },
      {
        id: 'ms-5',
        title: 'Reprendre un projet plus petit en apprentissage automatique',
        semester_label: 'Semestre 3',
        semester_index: 3,
        status: 'a_faire',
        related_field: 'informatique',
        added_after_validation: true,
        events: [
          event('ev-5a', 'creee', '2026-07-22T11:15:00.000Z', {
            reason: 'Ajoutée après l’étape ratée du semestre 2.',
          }),
        ],
      },
      {
        id: 'ms-6',
        title: 'Passer le test d’anglais exigé',
        semester_label: 'Semestre 4',
        semester_index: 4,
        status: 'a_faire',
        related_field: null,
        added_after_validation: false,
        events: [event('ev-6a', 'creee', '2026-02-02T09:00:00.000Z')],
      },
      {
        id: 'ms-7',
        title: 'Rédiger la lettre de motivation',
        semester_label: 'Semestre 5',
        semester_index: 5,
        status: 'a_faire',
        related_field: null,
        added_after_validation: false,
        events: [event('ev-7a', 'creee', '2026-02-02T09:00:00.000Z')],
      },
      {
        id: 'ms-8',
        title: 'Déposer les candidatures',
        semester_label: 'Semestre 6',
        semester_index: 6,
        status: 'a_faire',
        related_field: null,
        added_after_validation: false,
        events: [event('ev-8a', 'creee', '2026-02-02T09:00:00.000Z')],
      },
    ],
  }
}

const draftTemplates: { title: string; semester: number }[][] = [
  [
    { title: 'Lister 5 programmes cibles', semester: 1 },
    { title: 'Consolider les bases en statistiques', semester: 1 },
    { title: 'Premier projet personnel en apprentissage automatique', semester: 2 },
    { title: 'Échanger avec un mentor du domaine', semester: 3 },
    { title: 'Passer le test d’anglais exigé', semester: 4 },
    { title: 'Rédiger la lettre de motivation', semester: 5 },
    { title: 'Déposer les candidatures', semester: 6 },
  ],
  [
    { title: 'Comparer les exigences de 3 programmes', semester: 1 },
    { title: 'Suivre un cours en ligne d’algèbre linéaire', semester: 1 },
    { title: 'Participer à une compétition de données', semester: 2 },
    { title: 'Obtenir une lettre de recommandation', semester: 3 },
    { title: 'Préparer et passer le test d’anglais', semester: 4 },
    { title: 'Finaliser le dossier et le relire', semester: 5 },
    { title: 'Déposer les candidatures', semester: 6 },
  ],
]

/** A fresh draft plan; `variant` rotates between mock proposals. */
export function getMockLeaDraftPlan(
  targetTitle: string,
  horizonSemesters: number,
  variant = 0,
): LeaPlan {
  const now = new Date().toISOString()
  const template = draftTemplates[variant % draftTemplates.length]
  const milestones: PlanMilestone[] = template.map((item, i) => {
    const semester = Math.min(item.semester, Math.max(horizonSemesters, 1))
    return {
      id: `draft-${variant}-${i + 1}`,
      title: item.title,
      semester_label: `Semestre ${semester}`,
      semester_index: semester,
      status: 'a_faire',
      related_field: null,
      added_after_validation: false,
      events: [event(`draft-${variant}-${i + 1}-c`, 'creee', now)],
    }
  })
  return {
    id: `plan-draft-${variant}`,
    target_title: targetTitle,
    horizon_semesters: horizonSemesters,
    current_semester_index: 1,
    stage: 'draft',
    milestones,
  }
}

export function getMockLeaMessages(): LeaMessage[] {
  return [
    {
      id: 'msg-1',
      role: 'lea',
      content:
        'Salut ! J’ai préparé un premier plan sur 6 semestres pour ton objectif. Dis-moi ce que tu veux préciser ou ajuster.',
      created_at: '2026-10-26T09:12:00.000Z',
    },
    {
      id: 'msg-2',
      role: 'user',
      content: 'Par quoi je dois commencer concrètement ?',
      created_at: '2026-10-26T09:13:00.000Z',
    },
    {
      id: 'msg-3',
      role: 'lea',
      content:
        'Je te conseille de commencer par comprendre ce que les programmes demandent. Choisis quelques programmes qui t’intéressent et note leurs exigences : niveau attendu, tests de langue, documents à fournir. Ça te donne une base solide pour tout le reste du plan.',
      created_at: '2026-10-26T09:13:30.000Z',
    },
    {
      id: 'msg-4',
      role: 'user',
      content: 'Et pour me démarquer, je peux faire quoi en parallèle ?',
      created_at: '2026-10-26T09:15:00.000Z',
    },
    {
      id: 'msg-5',
      role: 'lea',
      content:
        'Les dossiers qui se démarquent montrent souvent une démarche suivie dans le temps. Un projet personnel que tu peux expliquer clairement, une expérience pratique et un échange avec quelqu’un du domaine sont de bonnes pistes. Choisis ce qui te motive vraiment, tu en parleras plus facilement.',
      created_at: '2026-10-26T09:15:40.000Z',
    },
    {
      id: 'msg-6',
      role: 'user',
      content: 'D’accord, je vais commencer par lister mes programmes cibles.',
      created_at: '2026-10-26T09:17:00.000Z',
    },
  ]
}
