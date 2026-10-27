import { apiRequest } from '../client'
import { mapClasse, mapClasses } from '../mappers/classe'
import type { Classe } from '../types/classe'

export async function getClasses(categorieId?: number): Promise<Classe[]> {
  const data = await apiRequest<unknown>('/api/classes', {
    params: categorieId !== undefined
      ? { categorieId }
      : undefined,
  })
  return mapClasses(data)
}

export async function getClasse(id: number): Promise<Classe> {
  const data = await apiRequest<unknown>(`/api/classes/${id}`)
  const classe = mapClasse(data)
  if (!classe) {
    throw new Error('Classe introuvable')
  }
  return classe
}
