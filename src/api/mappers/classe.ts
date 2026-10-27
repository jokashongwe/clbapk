import type { Classe, ClasseCategorie, ClasseNiveau } from '../types/classe'
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

function mapNiveau(value: unknown): ClasseNiveau | null {
  const record = asRecord(value)
  const id = record ? pickNumber(record, 'id') : undefined
  if (id === undefined) return null
  return {
    id,
    libelle: pickString(record!, 'libelle', 'nom', 'name') ?? String(id),
  }
}

function mapCategorie(value: unknown): ClasseCategorie | null {
  const record = asRecord(value)
  const id = record ? pickNumber(record, 'id') : undefined
  if (id === undefined) return null
  return {
    id,
    section: pickString(record!, 'section'),
    option: pickString(record!, 'option', 'nom'),
  }
}

export function mapClasse(data: unknown): Classe | null {
  const record = asRecord(data)
  const id = record ? pickNumber(record, 'id') : undefined
  if (id === undefined) return null

  const niveau = mapNiveau(record!.niveau)
  const categorie = mapCategorie(record!.categorie)
  const libelle = pickString(record!, 'libelle')
  const nomAffiche =
    pickString(record!, 'nomAffiche', 'nom_affiche', 'nom')
    ?? [niveau?.libelle, libelle, categorie?.option ?? categorie?.section].filter(Boolean).join(' ')
    ?? `Classe #${id}`

  return {
    id,
    libelle,
    nomAffiche,
    nombreEleveMax: pickNumber(record!, 'nombreEleveMax', 'nombre_eleve_max'),
    typeClasseId: pickNumber(record!, 'typeClasseId', 'type_classe_id'),
    niveau,
    categorie,
  }
}

export function mapClasses(data: unknown): Classe[] {
  return unwrapList(data)
    .map(mapClasse)
    .filter((item): item is Classe => item !== null)
    .sort((a, b) => a.nomAffiche.localeCompare(b.nomAffiche, 'fr'))
}
