import { apiRequest } from '../client'
import { mapAnnonce, mapAnnonces } from '../mappers/annonce'
import type { Annonce, CreateAnnonceRequest } from '../types/annonce'

export async function getUnreadAnnonces(): Promise<Annonce[]> {
  const data = await apiRequest<unknown>('/api/annonces')
  return mapAnnonces(data)
}

export async function markAnnonceRead(id: number): Promise<void> {
  await apiRequest<unknown>(`/api/annonces/${id}/read`, { method: 'POST' })
}

export async function markAllAnnoncesRead(): Promise<number> {
  const data = await apiRequest<unknown>('/api/annonces/read-all', { method: 'POST' })
  if (typeof data === 'object' && data !== null && 'markedCount' in data) {
    const count = (data as { markedCount?: unknown }).markedCount
    return typeof count === 'number' ? count : 0
  }
  return 0
}

export async function createAnnonce(payload: CreateAnnonceRequest): Promise<Annonce> {
  const body: Record<string, unknown> = {
    type: payload.type,
    titre: payload.titre,
    contenu: payload.contenu,
    cibleType: payload.cibleType,
  }
  if (payload.cibleType !== 'tous' && payload.cibleId !== undefined) {
    body.cibleId = payload.cibleId
  }

  const data = await apiRequest<unknown>('/api/annonces', {
    method: 'POST',
    body,
  })
  const annonce = mapAnnonce(data)
  if (!annonce) {
    throw new Error('Annonce créée, réponse inattendue')
  }
  return annonce
}
