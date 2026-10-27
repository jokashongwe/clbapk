export type ClasseNiveau = {
  id: number
  libelle: string
}

export type ClasseCategorie = {
  id: number
  section?: string
  option?: string
}

export type Classe = {
  id: number
  libelle?: string
  nomAffiche: string
  nombreEleveMax?: number
  typeClasseId?: number
  niveau?: ClasseNiveau | null
  categorie?: ClasseCategorie | null
}
