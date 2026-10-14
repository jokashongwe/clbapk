export type StatAnneeScolaire = {
  id?: number
  anneeScolaire?: string
  status?: string
}

export type StatResume = {
  anneeScolaire?: StatAnneeScolaire | null
  nombrePaiements?: number
  nombreEleves?: number
  nombreTarifications?: number
  montantUsd?: number
  montantFc?: number
}

export type StatRow = {
  label: string
  count?: number
  montantUsd?: number
  montantFc?: number
  extra?: string
}

export type SchoolStatistics = {
  schoolCode: string
  schoolName: string
  resume: StatResume | null
  inscriptions: StatRow[]
  parTarification: StatRow[]
  parCategorie: StatRow[]
  parMois: StatRow[]
  parTypePaiement: StatRow[]
  parCaisse: StatRow[]
}

export type StatisticsBundle = {
  resume: StatResume | null
  inscriptions: StatRow[]
  parTarification: StatRow[]
  parCategorie: StatRow[]
  parMois: StatRow[]
  parTypePaiement: StatRow[]
  parCaisse: StatRow[]
}
