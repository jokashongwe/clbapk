export type AnnonceType = 'Information' | 'Rappel' | 'Convocation'

export type CibleType = 'tous' | 'eleve' | 'classe' | 'option'

export type Annonce = {
  id: number
  type: AnnonceType
  titre: string
  contenu: string
  cibleType?: CibleType
  cibleId?: number
  createdAt?: string
}

export type CreateAnnonceRequest = {
  type: AnnonceType
  titre: string
  contenu: string
  cibleType: CibleType
  cibleId?: number
}
