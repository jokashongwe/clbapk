import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { findSchoolByCode, normalizeTelephone } from '../api/constants'
import { getErrorMessage } from '../api/errors'
import { extractParentIdentity, parentDisplayName } from '../api/mappers/auth'
import * as authService from '../api/services/auth'
import { setActiveSession } from '../api/session'
import { clearSession, loadSession, saveSession } from '../api/storage'
import { disablePushNotifications } from '../push/pushNotifications'
import type { ApiParent, SessionData } from '../api/types/auth'

type AuthContextValue = {
  session: SessionData | null
  isLoading: boolean
  loginPin: string | null
  login: (schoolCode: string, phone: string, pin: string) => Promise<void>
  changePin: (newPin: string, currentPin?: string) => Promise<void>
  enrichParentIdentity: (parent: ApiParent) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loginPin, setLoginPin] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSession()
      .then(stored => {
        if (stored?.mustChangePin) {
          clearSession()
          setActiveSession(null)
          setSession(null)
        } else {
          setActiveSession(stored ? { token: stored.token, baseUrl: stored.baseUrl } : null)
          setSession(stored)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (schoolCode: string, phone: string, pin: string) => {
    const school = findSchoolByCode(schoolCode)
    if (!school) {
      throw new Error('Code école invalide')
    }

    const telephone = normalizeTelephone(phone)
    const response = await authService.login(school.url, { telephone, pin })

    const parentIdentity = extractParentIdentity(response.parent)

    const nextSession: SessionData = {
      token: response.token,
      parentId: response.parent.id,
      baseUrl: school.url,
      schoolCode: school.code,
      telephone,
      parentName: parentDisplayName(response.parent),
      parentIdentity,
      mustChangePin: response.parent.must_change_pin ?? false,
      isPromoteur: response.isPromoteur,
      roles: response.roles,
    }

    await saveSession(nextSession)
    setActiveSession({ token: nextSession.token, baseUrl: nextSession.baseUrl })
    setLoginPin(pin)
    setSession(nextSession)
  }, [])

  const changePin = useCallback(async (newPin: string, currentPin?: string) => {
    if (!session) {
      throw new Error('Session non initialisée')
    }

    const current = currentPin ?? loginPin
    if (!current) {
      throw new Error('PIN actuel requis')
    }

    await authService.changePin(session.baseUrl, {
      telephone: session.telephone,
      current_pin: current,
      new_pin: newPin,
    })

    const updated: SessionData = { ...session, mustChangePin: false }
    await saveSession(updated)
    setActiveSession({ token: updated.token, baseUrl: updated.baseUrl })
    setLoginPin(null)
    setSession(updated)
  }, [session, loginPin])

  const enrichParentIdentity = useCallback(async (parent: ApiParent) => {
    if (!session) return

    const hasIdentity = Boolean(
      session.parentIdentity?.nomTuteur
      || session.parentIdentity?.nomPere
      || session.parentIdentity?.nomMere,
    )
    if (hasIdentity) return

    const parentIdentity = extractParentIdentity(parent)
    const hasData = Object.values(parentIdentity).some(Boolean)
    if (!hasData) return

    const updated: SessionData = {
      ...session,
      parentName: session.parentName ?? parentDisplayName(parent),
      parentIdentity,
    }
    await saveSession(updated)
    setSession(updated)
  }, [session])

  const logout = useCallback(async () => {
    await disablePushNotifications()
    await clearSession()
    setActiveSession(null)
    setLoginPin(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({ session, isLoading, loginPin, login, changePin, enrichParentIdentity, logout }),
    [session, isLoading, loginPin, login, changePin, enrichParentIdentity, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

export { getErrorMessage }
