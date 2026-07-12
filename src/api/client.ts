import { CLB_API_KEY } from './constants'
import { ApiError } from './errors'
import { getActiveBaseUrl, getActiveToken, setActiveSession } from './session'
import { clearSession, getStoredBaseUrl, getStoredToken } from './storage'

type RequestOptions = {
  method?: string
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
  baseUrl?: string
  token?: string | null
  auth?: boolean
}

function buildUrl(baseUrl: string, path: string, params?: RequestOptions['params']): string {
  const url = new URL(path.startsWith('/') ? path : `/${path}`, baseUrl)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    auth = true,
  } = options

  const baseUrl = options.baseUrl ?? getActiveBaseUrl() ?? (await getStoredBaseUrl())
  if (!baseUrl) {
    throw new ApiError('Aucune école sélectionnée', 0)
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-API-KEY': CLB_API_KEY,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = options.token ?? getActiveToken() ?? (await getStoredToken())
    if (!token) {
      throw new ApiError('Token d\'authentification manquant', 401)
    }
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(buildUrl(baseUrl, path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Connexion impossible. Vérifiez votre réseau.', 0)
  }

  if (response.status === 401 && auth) {
    setActiveSession(null)
    await clearSession()
    throw new ApiError('Session expirée', 401)
  }

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    throw new ApiError(
      `Erreur ${response.status}`,
      response.status,
      data,
    )
  }

  return data as T
}
