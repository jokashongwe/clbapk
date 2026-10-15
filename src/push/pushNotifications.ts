import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { registerPushDevice, unregisterPushDevice } from '../api/services/push'

export type PushOpenPayload = {
  type?: string
  annonceId?: string
  devoirId?: string
  classeId?: string
}

type OpenListener = (payload: PushOpenPayload) => void

const openListeners = new Set<OpenListener>()
let started = false
let currentToken: string | null = null

export function subscribePushOpen(listener: OpenListener): () => void {
  openListeners.add(listener)
  return () => openListeners.delete(listener)
}

function emitOpen(data: Record<string, unknown>) {
  const payload: PushOpenPayload = {
    type: typeof data.type === 'string' ? data.type : undefined,
    annonceId: data.annonceId != null ? String(data.annonceId) : undefined,
    devoirId: data.devoirId != null ? String(data.devoirId) : undefined,
    classeId: data.classeId != null ? String(data.classeId) : undefined,
  }
  openListeners.forEach(listener => listener(payload))
}

export async function enablePushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform() || started) return
  started = true

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') {
    started = false
    return
  }

  await PushNotifications.addListener('registration', async token => {
    currentToken = token.value
    const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android'
    try {
      await registerPushDevice(token.value, platform)
    } catch {
      // L'enregistrement serveur peut échouer sans bloquer l'app.
    }
  })

  await PushNotifications.addListener('pushNotificationActionPerformed', action => {
    const data = action.notification.data
    if (data && typeof data === 'object') {
      emitOpen(data as Record<string, unknown>)
    }
  })

  await PushNotifications.register()
}

export async function disablePushNotifications(): Promise<void> {
  const token = currentToken
  currentToken = null
  started = false

  if (token) {
    try {
      await unregisterPushDevice(token)
    } catch {
      // La session peut déjà être invalide.
    }
  }

  if (!Capacitor.isNativePlatform()) return

  try {
    await PushNotifications.removeAllListeners()
  } catch {
    // Plugin indisponible hors appareil.
  }
}
