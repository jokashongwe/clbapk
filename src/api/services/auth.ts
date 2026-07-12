import { apiRequest } from '../client'
import { parseLoginResponse } from '../mappers/auth'
import type { ChangePinRequest, LoginRequest, LoginResponse } from '../types/auth'

export async function login(
  baseUrl: string,
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const data = await apiRequest<unknown>('/api/auth/login', {
    method: 'POST',
    body: credentials,
    baseUrl,
    auth: false,
  })

  return parseLoginResponse(data)
}

export async function changePin(
  baseUrl: string,
  payload: ChangePinRequest,
): Promise<void> {
  await apiRequest<unknown>('/api/auth/change-pin', {
    method: 'POST',
    body: payload,
    baseUrl,
    auth: false,
  })
}
