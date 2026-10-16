import type { CurrentLevel, FieldKey, Level } from './types'

export const CURRENT_LEVELS: { value: CurrentLevel; label: string }[] = [
  { value: 'licence_1', label: 'Licence 1' }, { value: 'licence_2', label: 'Licence 2' }, { value: 'licence_3', label: 'Licence 3' }, { value: 'master_1', label: 'Master 1' }, { value: 'master_2', label: 'Master 2' }, { value: 'diplome', label: 'Déjà diplômé(e)' }, { value: 'autre', label: 'Autre' },
]
export const TARGET_LEVELS: { value: Level; label: string }[] = [{ value: 'licence', label: 'Licence' }, { value: 'master', label: 'Master' }, { value: 'doctorat', label: 'Doctorat' }, { value: 'autre', label: 'Autre' }]
export const FIELDS: { value: FieldKey; label: string }[] = [
  { value: 'economie', label: 'Économie' }, { value: 'finance', label: 'Finance' }, { value: 'gestion', label: 'Gestion / Management' }, { value: 'comptabilite_audit', label: 'Comptabilité / Audit' }, { value: 'marketing_commerce', label: 'Marketing / Commerce' }, { value: 'statistiques_data', label: 'Statistiques / Data' }, { value: 'informatique', label: 'Informatique' }, { value: 'droit_sciences_po', label: 'Droit / Sciences politiques' }, { value: 'sante', label: 'Santé' }, { value: 'ingenierie', label: 'Ingénierie' }, { value: 'agriculture_environnement', label: 'Agriculture / Environnement' }, { value: 'lettres_sciences_humaines', label: 'Lettres / Sciences humaines' }, { value: 'autre', label: 'Autre' },
]
export const COUNTRIES = ['Canada','France','Allemagne','Royaume-Uni','États-Unis','Belgique','Suisse','Pays-Bas','Suède','Norvège','Italie','Espagne','Irlande','Australie','Chine','Japon','Corée du Sud','Turquie','Maroc','Afrique du Sud']
export const LANGUAGES = [{ value: 'francais', label: 'Français' }, { value: 'anglais', label: 'Anglais' }] as const
export const TESTS = [{ value: 'ielts', label: 'IELTS' }, { value: 'toefl', label: 'TOEFL' }, { value: 'tcf_delf', label: 'TCF / DELF' }, { value: 'gre_gmat', label: 'GRE / GMAT' }] as const
