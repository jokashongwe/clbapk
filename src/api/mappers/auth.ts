import type { ApiParent, LoginResponse, ParentIdentity } from '../types/auth'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function pickString(parent: ApiParent, ...keys: (keyof ApiParent)[]): string | undefined {
  for (const key of keys) {
    const value = parent[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

export function extractParentIdentity(parent: ApiParent): ParentIdentity {
  return {
    nomTuteur: pickString(parent, 'nomTuteur', 'nom_tuteur'),
    nomPere: pickString(parent, 'nompere', 'nom_pere'),
    telephonePere: pickString(parent, 'telephonepere', 'telephone_pere'),
    nomMere: pickString(parent, 'nommere', 'nom_mere'),
    telephoneMere: pickString(parent, 'telephonemere', 'telephone_mere'),
  }
}

export function parentDisplayName(parent: ApiParent): string | undefined {
  const parts = [parent.prenom, parent.nom, parent.postnom].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')

  const identity = extractParentIdentity(parent)
  return identity.nomTuteur ?? identity.nomMere ?? identity.nomPere
}

export function isDirectorOrPromoterRole(role: string): boolean {
  const normalized = role.trim().toUpperCase().replace(/^ROLE_/, '')
  return normalized === 'DIRECTEUR' || normalized === 'PROMOTEUR'
}

export function isPromoterAccount(parent: ApiParent, roles: string[] = []): boolean {
  if (parent.isDirecteur === true || parent.is_directeur === true) return true
  if (parent.isPromoteur === true || parent.is_promoteur === true) return true
  return roles.some(isDirectorOrPromoterRole)
}

function normalizeRole(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  const record = asRecord(value)
  if (!record) return null
  for (const key of ['authority', 'role', 'nom', 'name']) {
    const candidate = record[key]
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }
  return null
}

function collectRoles(value: unknown, into: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      const role = normalizeRole(item)
      if (role) into.push(role)
    }
    return
  }
  const role = normalizeRole(value)
  if (role) into.push(role)
}

function extractRoles(data: Record<string, unknown>): string[] {
  const roles: string[] = []
  const parent = asRecord(data.parent) ?? asRecord(asRecord(data.data)?.parent) ?? asRecord(data.user)
  const nestedData = asRecord(data.data)

  collectRoles(data.roles, roles)
  collectRoles(data.authorities, roles)
  collectRoles(data.role, roles)
  collectRoles(nestedData?.roles, roles)
  collectRoles(nestedData?.authorities, roles)
  collectRoles(nestedData?.role, roles)
  collectRoles(parent?.roles, roles)
  collectRoles(parent?.authorities, roles)
  collectRoles(parent?.role, roles)

  return [...new Set(roles)]
}

function extractToken(data: Record<string, unknown>): string | null {
  const candidates = [
    data.token,
    data.access_token,
    data.sessionToken,
    data.session_token,
    asRecord(data.data)?.token,
    asRecord(data.data)?.access_token,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  return null
}

function extractParent(data: Record<string, unknown>): ApiParent | null {
  const parent =
    asRecord(data.parent)
    ?? asRecord(data.data)?.parent
    ?? asRecord(data.user)

  if (!parent || typeof parent.id !== 'number') {
    return null
  }

  return parent as ApiParent
}

export function parseLoginResponse(data: unknown): LoginResponse {
  const record = asRecord(data)
  if (!record) {
    throw new Error('Réponse de connexion invalide')
  }

  const token = extractToken(record)
  const parent = extractParent(record)
  const roles = extractRoles(record)

  if (!token) {
    throw new Error('Token de session manquant dans la réponse du serveur')
  }
  if (!parent) {
    throw new Error('Informations parent manquantes dans la réponse du serveur')
  }

  return {
    token,
    parent,
    roles,
    isPromoteur: isPromoterAccount(parent, roles),
  }
}
