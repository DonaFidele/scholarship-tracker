import type {
  ApplicationWithChecklist,
  ChecklistItem,
  Scholarship,
  ScholarshipDetails,
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

/** Defaults so mock records satisfy the extended ApplicationInfo shape. */
const info = {
  apply_link: null,
  opens_at: null,
  results_at: null,
  is_favorite: false,
  eligibility_notes: null,
  covered_costs: null,
  details_checked_at: null,
}

/** Mock web-search results used until a real backend is connected. */
export const mockSearchResults: Scholarship[] = [
  {
    name: 'Bourse Chevening',
    amount: 'Frais de scolarité + allocation mensuelle',
    deadline: isoOffset(34),
    country: 'Royaume-Uni',
    link: 'https://www.chevening.org',
    level: 'master',
    coverage: 'full',
    benin_eligible: 'yes',
    asks_fee: false,
  },
  {
    name: 'DAAD — Bourse de Master',
    amount: '992 €/mois',
    deadline: isoOffset(12),
    country: 'Allemagne',
    link: 'https://www.daad.de',
    level: 'master',
    coverage: 'partial',
    benin_eligible: 'yes',
    asks_fee: false,
  },
  {
    name: 'Bourse d’excellence Eiffel',
    amount: '1 181 €/mois',
    deadline: isoOffset(5),
    country: 'France',
    link: 'https://www.campusfrance.org',
    level: 'master',
    coverage: 'partial',
    benin_eligible: 'unknown',
    asks_fee: false,
  },
  {
    name: 'Vanier Canada Graduate Scholarship',
    amount: '50 000 $CA/an',
    deadline: isoOffset(60),
    country: 'Canada',
    link: 'https://vanier.gc.ca',
    level: 'doctorat',
    coverage: 'full',
    benin_eligible: 'yes',
    asks_fee: false,
  },
  {
    name: 'International Merit Grant (attention)',
    amount: 'Montant non précisé',
    deadline: isoOffset(9),
    country: 'Non précisé',
    link: 'https://example.org/merit-grant',
    level: null,
    coverage: null,
    benin_eligible: 'unknown',
    // Bourse suspecte : demande des frais de dossier.
    asks_fee: true,
  },
  {
    name: 'Mastercard Foundation Scholars',
    amount: 'Financement complet',
    deadline: null,
    country: 'Canada',
    link: 'https://mastercardfdn.org',
    level: 'licence',
    coverage: 'full',
    benin_eligible: 'no',
    asks_fee: false,
  },
]

/** Mock saved applications with a spread of statuses, deadlines and dossiers. */
export function getMockApplications(): ApplicationWithChecklist[] {
  return [
    {
      ...info,
      id: 'app-chevening',
      name: 'Chevening Scholarship',
      amount: 'Frais de scolarité + allocation',
      deadline: isoOffset(1),
      country: 'Royaume-Uni',
      link: 'https://www.chevening.org',
      level: 'master',
      coverage: 'full',
      benin_eligible: 'yes',
      asks_fee: false,
      status: 'in_progress',
      notes: 'Rédiger les 4 essais avant la deadline. Relancer le référent.',
      created_at: isoOffset(-10),
      is_favorite: true,
      apply_link: 'https://www.chevening.org/apply',
      opens_at: isoOffset(-40),
      results_at: isoOffset(120),
      eligibility_notes:
        'Ouvert aux ressortissants béninois. 2 ans d’expérience professionnelle requis.',
      covered_costs: 'Scolarité, allocation mensuelle, billet aller-retour.',
      details_checked_at: new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate() - 4,
        ),
      ).toISOString(),
      // 2 / 4
      checklist_items: checklist(commonDocs, 2),
    },
    {
      ...info,
      id: 'app-daad',
      name: 'DAAD Master',
      amount: '992 €/mois',
      deadline: isoOffset(6),
      country: 'Allemagne',
      link: 'https://www.daad.de',
      level: 'master',
      coverage: 'partial',
      benin_eligible: 'yes',
      asks_fee: false,
      status: 'todo',
      notes: null,
      created_at: isoOffset(-8),
      // 0 / 4
      checklist_items: checklist(commonDocs, 0),
    },
    {
      ...info,
      id: 'app-commonwealth',
      name: 'Commonwealth Master’s',
      amount: 'Financement complet',
      deadline: isoOffset(3),
      country: 'Royaume-Uni',
      link: 'https://cscuk.fcdo.gov.uk',
      level: 'master',
      coverage: 'full',
      benin_eligible: 'unknown',
      asks_fee: false,
      status: 'submitted',
      notes: 'Dossier envoyé, en attente de réponse.',
      created_at: isoOffset(-3),
      is_favorite: true,
      // 4 / 4 (complet)
      checklist_items: checklist(commonDocs, 4),
    },
    {
      ...info,
      id: 'app-vanier',
      name: 'Vanier Canada',
      amount: '50 000 $CA/an',
      deadline: isoOffset(45),
      country: 'Canada',
      link: 'https://vanier.gc.ca',
      level: 'doctorat',
      coverage: 'full',
      benin_eligible: 'yes',
      asks_fee: false,
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
      ...info,
      id: 'app-eiffel',
      name: 'Eiffel Excellence',
      amount: '1 181 €/mois',
      deadline: isoOffset(21),
      country: 'France',
      link: 'https://www.campusfrance.org',
      level: 'master',
      coverage: 'partial',
      benin_eligible: 'unknown',
      asks_fee: false,
      status: 'accepted',
      notes: 'Entretien passé avec succès. Prévoir le logement à Paris.',
      created_at: isoOffset(-30),
      // 3 / 4
      checklist_items: checklist(commonDocs, 3),
    },
    {
      ...info,
      id: 'app-erasmus',
      name: 'Erasmus Mundus Finance',
      amount: null,
      deadline: null,
      // Bourse ajoutée à la main, sans lien source
      link: null,
      country: 'Europe',
      level: null,
      coverage: null,
      benin_eligible: 'unknown',
      asks_fee: null,
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
      ...info,
      id: 'app-mastercard',
      name: 'Mastercard Foundation',
      amount: 'Financement complet',
      deadline: isoOffset(-2),
      country: 'Canada',
      link: 'https://mastercardfdn.org',
      level: 'licence',
      coverage: 'full',
      benin_eligible: 'no',
      asks_fee: false,
      status: 'rejected',
      notes: null,
      created_at: isoOffset(-40),
      // aucun document
      checklist_items: [],
    },
  ]
}

/**
 * Mock extraction result used to demonstrate the "Détails trouvés" state.
 * Two required documents ("CV à jour", "Lettre de motivation") overlap with
 * the Chevening checklist to exercise the "Déjà dans ta liste" case.
 */
export function getMockDetailsProposal(): ScholarshipDetails {
  return {
    level: 'master',
    coverage: 'full',
    benin_eligible: 'yes',
    asks_fee: false,
    opens_at: isoOffset(-30),
    deadline: isoOffset(28),
    results_at: isoOffset(140),
    apply_link: 'https://www.chevening.org/apply',
    eligibility_summary:
      'Ouvert aux ressortissants béninois titulaires d’une licence, avec au moins 2 ans d’expérience professionnelle et un projet de retour au pays.',
    covered_costs:
      'Frais de scolarité complets, allocation mensuelle, billet d’avion aller-retour, frais de visa.',
    required_documents: [
      'CV à jour',
      'Lettre de motivation',
      'Deux lettres de recommandation',
      'Diplôme de licence',
      'Preuve d’anglais (IELTS/TOEFL)',
      'Copie du passeport',
    ],
  }
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
