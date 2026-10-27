import type { SchoolOption } from '../types/option'
import { unwrapList } from '../utils/unwrapList'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = obj[key]
    const n = typeof value === 'string' ? Number(value) : value
    if (typeof n === 'number' && Number.isFinite(n)) return n
  }
  return undefined
}

export function mapOption(data: unknown): SchoolOption | null {
  const record = asRecord(data)
  const id = record ? pickNumber(record, 'id') : undefined
  if (id === undefined) return null

  const section = pickString(record!, 'section')
  const option = pickString(record!, 'option', 'nom', 'libelle')
  const nomAffiche =
    pickString(record!, 'nomAffiche', 'nom_affiche')
    ?? (section && option && section !== option ? `${section} · ${option}` : undefined)
    ?? option
    ?? section
    ?? `Catégorie #${id}`

  return {
    id,
    section,
    option,
    nombrePeriodes: pickNumber(record!, 'nombrePeriodes', 'nombre_periodes') ?? null,
    nomAffiche,
  }
}

export function mapOptions(data: unknown): SchoolOption[] {
  return unwrapList(data)
    .map(mapOption)
    .filter((item): item is SchoolOption => item !== null)
    .filter(item => Boolean(item.section || item.option))
    .sort((a, b) => a.nomAffiche.localeCompare(b.nomAffiche, 'fr'))
}
