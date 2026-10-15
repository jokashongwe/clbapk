import type { Annonce, AnnonceType, CibleType } from '../types/annonce'
import { unwrapList } from '../utils/unwrapList'

const TYPES: AnnonceType[] = ['Information', 'Rappel', 'Convocation']
const CIBLES: CibleType[] = ['tous', 'eleve', 'classe', 'option']

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

function asType(value?: string): AnnonceType {
  const match = TYPES.find(type => type.toLowerCase() === value?.toLowerCase())
  return match ?? 'Information'
}

function asCible(value?: string): CibleType | undefined {
  return CIBLES.find(cible => cible.toLowerCase() === value?.toLowerCase())
}

export function mapAnnonce(data: unknown): Annonce | null {
  const record = asRecord(data)
  if (!record || typeof record.id !== 'number') return null

  return {
    id: record.id,
    type: asType(pickString(record, 'type', 'annonceType')),
    titre: pickString(record, 'titre', 'title') ?? 'Annonce',
    contenu: pickString(record, 'contenu', 'content', 'message') ?? '',
    cibleType: asCible(pickString(record, 'cibleType', 'cible_type')),
    cibleId: pickNumber(record, 'cibleId', 'cible_id'),
    createdAt: pickString(record, 'createdAt', 'created_at', 'dateCreation', 'date'),
  }
}

export function mapAnnonces(data: unknown): Annonce[] {
  return unwrapList<unknown>(data)
    .map(mapAnnonce)
    .filter((item): item is Annonce => item !== null)
}
