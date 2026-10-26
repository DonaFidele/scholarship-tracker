import type { LeaMessage, LeaPlan } from '@/lib/types'

export function getMockLeaPlan(): LeaPlan {
  return {
    id: 'plan-ml-stanford',
    target_title: 'Master en Machine Learning à Stanford',
    horizon_semesters: 6,
    milestones: [
      {
        id: 'ms-1',
        title: 'Lister 5 programmes cibles',
        semester_label: 'Semestre 1',
        status: 'fait',
        related_field: null,
      },
      {
        id: 'ms-2',
        title: 'Consolider les bases en statistiques',
        semester_label: 'Semestre 1',
        status: 'en_cours',
        related_field: 'statistiques_data',
      },
      {
        id: 'ms-3',
        title: 'Premier projet personnel en apprentissage automatique',
        semester_label: 'Semestre 2',
        status: 'en_cours',
        related_field: 'informatique',
      },
      {
        id: 'ms-4',
        title: 'Échanger avec un mentor du domaine',
        semester_label: 'Semestre 3',
        status: 'a_faire',
        related_field: null,
      },
      {
        id: 'ms-5',
        title: 'Passer le test d’anglais exigé',
        semester_label: 'Semestre 4',
        status: 'a_faire',
        related_field: null,
      },
      {
        id: 'ms-6',
        title: 'Stage ou expérience en laboratoire',
        semester_label: 'Semestre 4',
        status: 'a_faire',
        related_field: 'informatique',
      },
      {
        id: 'ms-7',
        title: 'Rédiger la lettre de motivation',
        semester_label: 'Semestre 5',
        status: 'a_faire',
        related_field: null,
      },
      {
        id: 'ms-8',
        title: 'Déposer les candidatures',
        semester_label: 'Semestre 6',
        status: 'a_faire',
        related_field: null,
      },
    ],
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
