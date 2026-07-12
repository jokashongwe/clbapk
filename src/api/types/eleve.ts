export type ApiClasse = string | { nom?: string; libelle?: string; name?: string }

export type ApiSection = string | { nom?: string; libelle?: string; name?: string }

export type ApiEleve = {
  id: number
  nom?: string
  prenom?: string
  postnom?: string
  classe?: ApiClasse
  section?: ApiSection
  annee_scolaire?: string
  anneescolaire?: string
}
