import type { StatResume, StatRow } from '../types/statistiques'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? n : undefined
}

function pickNumber(obj: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const n = parseNumber(obj[key])
    if (n !== undefined) return n
  }
  return undefined
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return undefined
}

function unwrapList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map(asRecord).filter((r): r is Record<string, unknown> => r !== null)
  }
  const record = asRecord(data)
  if (!record) return []

  for (const key of ['data', 'items', 'statistiques', 'resultats', 'rows']) {
    const list = record[key]
    if (Array.isArray(list)) {
      return list.map(asRecord).filter((r): r is Record<string, unknown> => r !== null)
    }
  }

  return [record]
}

function rowLabel(item: Record<string, unknown>): string {
  return (
    pickString(item, 'nom', 'libelle', 'label', 'name', 'categorie', 'tarification', 'mois', 'type', 'typePaiement', 'caisse')
    ?? pickString(asRecord(item.tarification) ?? {}, 'nom')
    ?? pickString(asRecord(item.categorie) ?? {}, 'nom')
    ?? '—'
  )
}

export function mapToStatRows(data: unknown): StatRow[] {
  return unwrapList(data).map(item => ({
    label: rowLabel(item),
    count: pickNumber(item, 'count', 'nombre', 'total', 'nombre_paiements', 'nombre_eleves', 'nouveau', 'ancien'),
    montantUsd: pickNumber(item, 'montantUsd', 'montant_usd', 'totalUsd', 'total_usd'),
    montantFc: pickNumber(item, 'montantFc', 'montant_fc', 'totalFc', 'total_fc'),
    extra: pickString(item, 'type_classe', 'devise', 'status'),
  }))
}

export function mapInscriptionRows(data: unknown): StatRow[] {
  return unwrapList(data).flatMap(item => {
    const category = rowLabel(item)
    const nouveau = pickNumber(item, 'nouveau', 'Nouveau', 'count_nouveau')
    const ancien = pickNumber(item, 'ancien', 'Ancien', 'count_ancien')

    if (nouveau !== undefined || ancien !== undefined) {
      return [
        { label: `${category} — Nouveau`, count: nouveau },
        { label: `${category} — Ancien`, count: ancien },
      ]
    }

    return [{ label: category, count: pickNumber(item, 'count', 'nombre', 'total') }]
  })
}

export function mapResume(data: unknown): StatResume | null {
  const record = asRecord(data)
  if (!record) return null

  const annee = asRecord(record.annee_scolaire) ?? asRecord(record.anneeScolaire)

  return {
    anneeScolaire: annee
      ? {
          id: pickNumber(annee, 'id'),
          anneeScolaire: pickString(annee, 'anneeScolaire', 'annee_scolaire'),
          status: pickString(annee, 'status'),
        }
      : null,
    nombrePaiements: pickNumber(record, 'nombre_paiements', 'nombrePaiements', 'total_paiements'),
    nombreEleves: pickNumber(record, 'nombre_eleves', 'nombreEleves', 'total_eleves'),
    nombreTarifications: pickNumber(record, 'nombre_tarifications', 'nombreTarifications'),
    montantUsd: pickNumber(record, 'montant_usd', 'montantUsd', 'total_usd', 'totalUsd'),
    montantFc: pickNumber(record, 'montant_fc', 'montantFc', 'total_fc', 'totalFc'),
  }
}
