import { apiRequest } from '../client'
import type { ApiAbsence } from '../types/absence'
import type { ApiEleve } from '../types/eleve'
import { unwrapList } from '../utils/unwrapList'

export async function getElevesByParent(parentId: number): Promise<ApiEleve[]> {
  const data = await apiRequest<unknown>(`/api/eleves/by-parent/${parentId}`)
  return unwrapList<ApiEleve>(data)
}

export async function getEleveById(eleveId: number | string): Promise<ApiEleve> {
  return apiRequest<ApiEleve>(`/api/eleves/${eleveId}`)
}

export async function getEleveAbsences(eleveId: number | string): Promise<ApiAbsence[]> {
  const data = await apiRequest<unknown>(`/api/eleves/${eleveId}/absences`)
  return unwrapList<ApiAbsence>(data)
}
