import type { Opportunity } from '@/lib/types'

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-aspire-leadership',
    name: 'Aspire Leadership Program',
    type: 'leadership',
    description:
      'Programme de développement du leadership pour jeunes africains : ateliers, projet communautaire et accompagnement par des mentors.',
    duration: '6 mois',
    mode: 'hybride',
    country: 'Afrique',
    cost: 'gratuit',
    link: 'https://example.org/aspire-leadership',
    what_it_brings:
      'Un projet concret à mettre en avant dans ta lettre de motivation.',
    source: 'curated',
  },
  {
    id: 'opp-young-leaders-academy',
    name: 'Académie des jeunes leaders francophones',
    type: 'leadership',
    description:
      'Formation en ligne au leadership, à la prise de parole et à la gestion de projet, avec une communauté d’anciens.',
    duration: '3 mois',
    mode: 'en_ligne',
    country: null,
    cost: 'gratuit',
    link: 'https://example.org/jeunes-leaders',
    what_it_brings:
      'Une attestation et des exemples de leadership à raconter en entretien.',
    source: 'community',
  },
  {
    id: 'opp-ong-benin-volontariat',
    name: 'Volontariat éducatif – ONG Avenir Jeunesse Bénin',
    type: 'volontariat',
    description:
      'Soutien scolaire et ateliers de lecture pour les enfants des quartiers défavorisés de Cotonou, quelques heures par semaine.',
    duration: '4 h par semaine',
    mode: 'presentiel',
    country: 'Bénin',
    cost: 'gratuit',
    link: null,
    what_it_brings:
      'Un engagement régulier et durable, très apprécié par les jurys de bourses.',
    source: 'community',
  },
  {
    id: 'opp-un-volunteers',
    name: 'Volontariat en ligne – Nations unies',
    type: 'volontariat',
    description:
      'Missions de volontariat à distance (traduction, recherche, design) pour des organisations qui œuvrent pour le développement.',
    duration: 'Flexible',
    mode: 'en_ligne',
    country: null,
    cost: 'gratuit',
    link: 'https://example.org/volontariat-en-ligne',
    what_it_brings:
      'Une expérience internationale, même sans quitter ton pays.',
    source: 'curated',
  },
  {
    id: 'opp-kectil-mentorship',
    name: 'Kectil Mentorship',
    type: 'mentorat',
    description:
      'Mise en relation avec des mentors ayant obtenu une bourse à l’étranger pour relire ton dossier et préparer tes entretiens.',
    duration: '3 mois',
    mode: 'en_ligne',
    country: null,
    cost: 'gratuit',
    link: 'https://example.org/kectil-mentorship',
    what_it_brings:
      'Des retours personnalisés sur ton dossier avant de postuler.',
    source: 'curated',
  },
  {
    id: 'opp-alumni-mentorat',
    name: 'Mentorat entre étudiants – Réseau Alumni Bénin',
    type: 'mentorat',
    description:
      'Des anciens boursiers béninois accompagnent les candidats : choix du programme, rédaction, préparation aux tests.',
    duration: '2 mois',
    mode: 'hybride',
    country: 'Bénin',
    cost: 'gratuit',
    link: null,
    what_it_brings: 'Un réseau local et des conseils de gens qui sont passés par là.',
    source: 'community',
  },
  {
    id: 'opp-stage-ong',
    name: 'Stage d’observation en gestion de projet',
    type: 'stage',
    description:
      'Stage court dans une organisation de développement pour découvrir le suivi de projets, le reporting et la recherche de financements.',
    duration: '2 mois',
    mode: 'presentiel',
    country: 'Sénégal',
    cost: 'gratuit',
    link: 'https://example.org/stage-gestion-projet',
    what_it_brings:
      'Une expérience professionnelle qui renforce un dossier de master.',
    source: 'curated',
  },
  {
    id: 'opp-fellowship-tech',
    name: 'Fellowship Jeunes Innovateurs Africains',
    type: 'fellowship',
    description:
      'Fellowship pour porteurs de projets à impact : formation, financement de départ et accès à un réseau de partenaires.',
    duration: '9 mois',
    mode: 'hybride',
    country: 'Afrique',
    cost: 'gratuit',
    link: 'https://example.org/fellowship-innovateurs',
    what_it_brings:
      'Une reconnaissance et un projet à impact, des critères clés des grandes bourses.',
    source: 'curated',
  },
  {
    id: 'opp-concours-entrepreneurs',
    name: 'Concours Jeunes Entrepreneurs de l’Ouest africain',
    type: 'competition',
    description:
      'Concours de pitch pour étudiants et jeunes diplômés, avec coaching et prix pour les meilleurs projets.',
    duration: '5 semaines',
    mode: 'en_ligne',
    country: 'Afrique de l’Ouest',
    cost: 'gratuit',
    link: 'https://example.org/concours-entrepreneurs',
    what_it_brings: 'Un prix ou une mention à ajouter à ton CV.',
    source: 'community',
  },
  {
    id: 'opp-hackathon-payant',
    name: 'Bootcamp Leadership & Innovation – Cotonou',
    type: 'competition',
    description:
      'Compétition de trois jours en équipe autour de défis locaux, avec jury et remise de certificats.',
    duration: '3 jours',
    mode: 'presentiel',
    country: 'Bénin',
    cost: 'payant',
    link: 'https://example.org/bootcamp-cotonou',
    what_it_brings: 'Du travail d’équipe et une expérience de compétition.',
    source: 'community',
  },
]
