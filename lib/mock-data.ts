import type {
  ApplicationWithChecklist,
  ChecklistItem,
  Scholarship,
  UserSettings,
} from '@/lib/types'

/** Returns a "YYYY-MM-DD" date offset from today by `days` (UTC-based). */
export function isoOffset(days: number): string {
  const now = new Date()
  const t = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + days,
  )
  return new Date(t).toISOString().slice(0, 10)
}

/** Builds a checklist from labels, marking the first `doneCount` as done. */
function checklist(labels: string[], doneCount: number): ChecklistItem[] {
  return labels.map((label, i) => ({
    id: `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}`,
    label,
    is_done: i < doneCount,
    sort_order: i,
  }))
}

const commonDocs = [
  'CV à jour',
  'Lettre de motivation',
  'Relevés de notes',
  'Preuve de niveau de langue',
]

/** Mock web-search results used until a real backend is connected. */
export const mockSearchResults: Scholarship[] = [
  {
    name: 'Bourse Chevening',
    amount: 'Frais de scolarité + allocation mensuelle',
    deadline: isoOffset(34),
    country: 'Royaume-Uni',
    link: 'https://www.chevening.org',
  },
  {
    name: 'DAAD — Bourse de Master',
    amount: '992 €/mois',
    deadline: isoOffset(12),
    country: 'Allemagne',
    link: 'https://www.daad.de',
  },
  {
    name: 'Bourse d’excellence Eiffel',
    amount: '1 181 €/mois',
    deadline: isoOffset(5),
    country: 'France',
    link: 'https://www.campusfrance.org',
  },
  {
    name: 'Vanier Canada Graduate Scholarship',
    amount: '50 000 $CA/an',
    deadline: isoOffset(60),
    country: 'Canada',
    link: 'https://vanier.gc.ca',
  },
  {
    name: 'Erasmus Mundus Joint Masters',
    amount: null,
    deadline: isoOffset(20),
    country: 'Europe',
    link: 'https://www.eacea.ec.europa.eu',
  },
  {
    name: 'Mastercard Foundation Scholars',
    amount: 'Financement complet',
    deadline: null,
    country: 'Canada',
    link: 'https://mastercardfdn.org',
  },
]

/** Mock saved applications with a spread of statuses, deadlines and dossiers. */
export function getMockApplications(): ApplicationWithChecklist[] {
  return [
    {
      id: 'app-chevening',
      name: 'Chevening Scholarship',
      amount: 'Frais de scolarité + allocation',
      deadline: isoOffset(1),
      country: 'Royaume-Uni',
      link: 'https://www.chevening.org',
      status: 'in_progress',
      notes: 'Rédiger les 4 essais avant la deadline. Relancer le référent.',
      created_at: isoOffset(-10),
      // 2 / 4
      checklist_items: checklist(commonDocs, 2),
    },
    {
      id: 'app-daad',
      name: 'DAAD Master',
      amount: '992 €/mois',
      deadline: isoOffset(6),
      country: 'Allemagne',
      link: 'https://www.daad.de',
      status: 'todo',
      notes: null,
      created_at: isoOffset(-8),
      // 0 / 4
      checklist_items: checklist(commonDocs, 0),
    },
    {
      id: 'app-commonwealth',
      name: 'Commonwealth Master’s',
      amount: 'Financement complet',
      deadline: isoOffset(3),
      country: 'Royaume-Uni',
      link: 'https://cscuk.fcdo.gov.uk',
      status: 'submitted',
      notes: 'Dossier envoyé, en attente de réponse.',
      created_at: isoOffset(-3),
      // 4 / 4 (complet)
      checklist_items: checklist(commonDocs, 4),
    },
    {
      id: 'app-vanier',
      name: 'Vanier Canada',
      amount: '50 000 $CA/an',
      deadline: isoOffset(45),
      country: 'Canada',
      link: 'https://vanier.gc.ca',
      status: 'todo',
      notes: null,
      created_at: isoOffset(-6),
      // custom item ajouté
      checklist_items: checklist(
        [...commonDocs, 'Lettre de recommandation'],
        1,
      ),
    },
    {
      id: 'app-eiffel',
      name: 'Eiffel Excellence',
      amount: '1 181 €/mois',
      deadline: isoOffset(21),
      country: 'France',
      link: 'https://www.campusfrance.org',
      status: 'accepted',
      notes: 'Entretien passé avec succès. Prévoir le logement à Paris.',
      created_at: isoOffset(-30),
      // 3 / 4
      checklist_items: checklist(commonDocs, 3),
    },
    {
      id: 'app-erasmus',
      name: 'Erasmus Mundus Finance',
      amount: null,
      deadline: null,
      // Bourse ajoutée à la main, sans lien source
      link: null,
      country: 'Europe',
      status: 'in_progress',
      notes: 'Choisir 3 universités du consortium.',
      created_at: isoOffset(-5),
      // 1 / 3
      checklist_items: checklist(
        ['CV à jour', 'Lettre de motivation', 'Choix des universités'],
        1,
      ),
    },
    {
      id: 'app-mastercard',
      name: 'Mastercard Foundation',
      amount: 'Financement complet',
      deadline: isoOffset(-2),
      country: 'Canada',
      link: 'https://mastercardfdn.org',
      status: 'rejected',
      notes: null,
      created_at: isoOffset(-40),
      // aucun document
      checklist_items: [],
    },
  ]
}

export function getMockSettings(): UserSettings {
  return {
    email_reminders: true,
    reminder_days: [7, 3, 1],
  }
}

export const mockUser = {
  name: 'Marie Laurent',
  email: 'marie.laurent@email.com',
}
