import { apiRequest } from '../client'

export async function registerPushDevice(token: string, platform: 'android' | 'ios'): Promise<void> {
  await apiRequest<unknown>('/api/push/devices', {
    method: 'POST',
    body: { token, platform },
  })
}

export async function unregisterPushDevice(token: string): Promise<void> {
  await apiRequest<unknown>('/api/push/devices/unregister', {
    method: 'POST',
    body: { token },
  })
}
