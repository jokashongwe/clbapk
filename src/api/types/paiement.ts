import type { ApiParent } from './auth'

export type ApiAnneeScolaire = {
  id: number
  status?: string
  anneeScolaire?: string
  dateDebut?: string
  dateFin?: string
}

export type ApiTarification = {
  id: number
  nom?: string
  section?: string[] | null
  isPaiementDirect?: boolean
  devise?: string
}

export type ApiPaiement = {
  id: number
  tarification?: ApiTarification
  eleve?: { id: number; parent?: ApiParent }
  detail?: string | null
  montantUsd?: string | number | null
  montantFc?: string | number | null
  montant?: string | number | null
  datepaiement?: string | null
  numRecu?: string | null
  mois?: string | null
  anneescolaireId?: number
  typePaiement?: string | null
  statut?: string
  paye?: boolean
  date_paiement?: string
  date_echeance?: string
  libelle?: string
  label?: string
}

export type PaiementsEleveAnneeCourante = {
  anneeScolaire: ApiAnneeScolaire | null
  paiements: ApiPaiement[]
}
