export type ApiParent = {
  id: number
  nom?: string
  prenom?: string
  postnom?: string
  telephone?: string
  must_change_pin?: boolean
  nomTuteur?: string
  nom_tuteur?: string
  numeroTelephoneTuteur?: string
  numero_telephone_tuteur?: string
  nompere?: string
  nom_pere?: string
  telephonepere?: string
  telephone_pere?: string
  nommere?: string
  nom_mere?: string
  telephonemere?: string
  telephone_mere?: string
  isDirecteur?: boolean
  is_directeur?: boolean
  isPromoteur?: boolean
  is_promoteur?: boolean
}

export type ParentIdentity = {
  nomTuteur?: string
  nomPere?: string
  telephonePere?: string
  nomMere?: string
  telephoneMere?: string
}

export type LoginRequest = {
  telephone: string
  pin: string
}

export type LoginResponse = {
  token: string
  parent: ApiParent
  roles: string[]
  isPromoteur: boolean
}

export type ChangePinRequest = {
  telephone: string
  current_pin: string
  new_pin: string
}

export type SessionData = {
  token: string
  parentId: number
  baseUrl: string
  schoolCode: string
  telephone: string
  parentName?: string
  parentIdentity?: ParentIdentity
  mustChangePin: boolean
  isPromoteur: boolean
  roles: string[]
}
