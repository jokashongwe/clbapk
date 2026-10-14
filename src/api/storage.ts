import { Preferences } from '@capacitor/preferences'
import { setActiveSession } from './session'
import type { SessionData, ParentIdentity } from './types/auth'

const KEYS = {
  token: 'clb_token',
  parentId: 'clb_parent_id',
  baseUrl: 'clb_base_url',
  schoolCode: 'clb_school_code',
  telephone: 'clb_telephone',
  parentName: 'clb_parent_name',
  parentIdentity: 'clb_parent_identity',
  mustChangePin: 'clb_must_change_pin',
  isPromoteur: 'clb_is_promoteur',
  roles: 'clb_roles',
} as const

async function get(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key })
  return value
}

async function set(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value })
}

async function remove(key: string): Promise<void> {
  await Preferences.remove({ key })
}

export async function loadSession(): Promise<SessionData | null> {
  const [token, parentId, baseUrl, schoolCode, telephone, parentName, parentIdentityRaw, mustChangePin, isPromoteurRaw, rolesRaw] =
    await Promise.all([
      get(KEYS.token),
      get(KEYS.parentId),
      get(KEYS.baseUrl),
      get(KEYS.schoolCode),
      get(KEYS.telephone),
      get(KEYS.parentName),
      get(KEYS.parentIdentity),
      get(KEYS.mustChangePin),
      get(KEYS.isPromoteur),
      get(KEYS.roles),
    ])

  if (!token || !parentId || !baseUrl || !schoolCode || !telephone) {
    return null
  }

  let parentIdentity: ParentIdentity | undefined
  if (parentIdentityRaw) {
    try {
      parentIdentity = JSON.parse(parentIdentityRaw) as ParentIdentity
    } catch {
      parentIdentity = undefined
    }
  }

  let roles: string[] = []
  if (rolesRaw) {
    try {
      const parsed = JSON.parse(rolesRaw)
      if (Array.isArray(parsed)) roles = parsed.filter((r): r is string => typeof r === 'string')
    } catch {
      roles = []
    }
  }

  return {
    token,
    parentId: Number(parentId),
    baseUrl,
    schoolCode,
    telephone,
    parentName: parentName ?? undefined,
    parentIdentity,
    mustChangePin: mustChangePin === 'true',
    isPromoteur: isPromoteurRaw === 'true',
    roles,
  }
}

export async function saveSession(session: SessionData): Promise<void> {
  setActiveSession({ token: session.token, baseUrl: session.baseUrl })
  await Promise.all([
    set(KEYS.token, session.token),
    set(KEYS.parentId, String(session.parentId)),
    set(KEYS.baseUrl, session.baseUrl),
    set(KEYS.schoolCode, session.schoolCode),
    set(KEYS.telephone, session.telephone),
    set(KEYS.parentName, session.parentName ?? ''),
    set(KEYS.parentIdentity, session.parentIdentity ? JSON.stringify(session.parentIdentity) : ''),
    set(KEYS.mustChangePin, session.mustChangePin ? 'true' : 'false'),
    set(KEYS.isPromoteur, session.isPromoteur ? 'true' : 'false'),
    set(KEYS.roles, JSON.stringify(session.roles)),
  ])
}

export async function clearSession(): Promise<void> {
  setActiveSession(null)
  await Promise.all(Object.values(KEYS).map(remove))
}

export async function getStoredToken(): Promise<string | null> {
  return get(KEYS.token)
}

export async function getStoredBaseUrl(): Promise<string | null> {
  return get(KEYS.baseUrl)
}
