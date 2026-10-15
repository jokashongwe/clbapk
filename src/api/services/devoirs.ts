import { apiRequest } from '../client'
import { mapDevoir, mapDevoirDownload, mapDevoirs } from '../mappers/devoir'
import type { Devoir, DevoirDownload } from '../types/devoir'

export async function getDevoirs(classeId?: number): Promise<Devoir[]> {
  const data = await apiRequest<unknown>('/api/devoirs', {
    params: classeId !== undefined ? { classeId } : undefined,
  })
  return mapDevoirs(data)
}

export async function getDevoir(id: number): Promise<Devoir> {
  const data = await apiRequest<unknown>(`/api/devoirs/${id}`)
  const devoir = mapDevoir(data)
  if (!devoir) throw new Error('Devoir introuvable')
  return devoir
}

export async function getDevoirDownloadUrl(id: number): Promise<DevoirDownload> {
  const data = await apiRequest<unknown>(`/api/devoirs/${id}/download-url`)
  return mapDevoirDownload(data)
}

export async function publishDevoir(input: {
  file: File
  titre: string
  classeId: number
  description?: string
}): Promise<Devoir> {
  const form = new FormData()
  form.append('file', input.file)
  form.append('titre', input.titre)
  form.append('classeId', String(input.classeId))
  if (input.description?.trim()) {
    form.append('description', input.description.trim())
  }

  const data = await apiRequest<unknown>('/api/devoirs', {
    method: 'POST',
    formData: form,
  })
  const devoir = mapDevoir(data)
  if (!devoir) throw new Error('Devoir publié, réponse inattendue')
  return devoir
}
