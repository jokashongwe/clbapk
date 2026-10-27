import { apiRequest } from '../client'
import { mapOption, mapOptions } from '../mappers/option'
import type { SchoolOption } from '../types/option'

export async function getOptions(): Promise<SchoolOption[]> {
  const data = await apiRequest<unknown>('/api/options')
  return mapOptions(data)
}

export async function getOption(id: number): Promise<SchoolOption> {
  const data = await apiRequest<unknown>(`/api/options/${id}`)
  const option = mapOption(data)
  if (!option) {
    throw new Error('Option introuvable')
  }
  return option
}
