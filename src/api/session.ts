import type { SessionData } from './types/auth'

let activeSession: Pick<SessionData, 'token' | 'baseUrl'> | null = null

export function setActiveSession(session: Pick<SessionData, 'token' | 'baseUrl'> | null): void {
  activeSession = session
}

export function getActiveToken(): string | null {
  return activeSession?.token ?? null
}

export function getActiveBaseUrl(): string | null {
  return activeSession?.baseUrl ?? null
}
