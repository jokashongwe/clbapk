import type { StatResume, StatRow } from '../types/statistiques'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
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
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return undefined
}

/** Clés de listes renvoyées par l’API CLB (voir PaiementStatistiqueController). */
const LIST_KEYS = [
  'par_tarification',
  'par_categorie',
  'par_mois',
  'par_type_paiement',
  'par_caisse',
  'data',
  'items',
  'statistiques',
  'resultats',
  'rows',
  'inscriptions',
] as const

function unwrapList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map(asRecord).filter((r): r is Record<string, unknown> => r !== null)
  }

  const record = asRecord(data)
  if (!record) return []

  for (const key of LIST_KEYS) {
    const list = record[key]
    if (Array.isArray(list)) {
      return list.map(asRecord).filter((r): r is Record<string, unknown> => r !== null)
    }
  }

  // Fallback : première propriété tableau d’objets
  for (const value of Object.values(record)) {
    if (Array.isArray(value) && value.length > 0 && asRecord(value[0])) {
      return value.map(asRecord).filter((r): r is Record<string, unknown> => r !== null)
    }
  }

  return []
}

function categorieLabel(categorie: Record<string, unknown>): string | undefined {
  const section = pickString(categorie, 'section', 'nom', 'name', 'libelle')
  const option = pickString(categorie, 'option')
  if (section && option && section !== option) return `${section} · ${option}`
  return section ?? option
}

function rowLabel(item: Record<string, unknown>): string {
  const tarification = asRecord(item.tarification)
  const categorie = asRecord(item.categorie)
  const caisse = asRecord(item.caisse)

  return (
    pickString(item, 'mois', 'type_paiement', 'typePaiement', 'type', 'nom', 'libelle', 'label', 'name', 'caisse')
    ?? (tarification ? pickString(tarification, 'nom', 'libelle', 'name') : undefined)
    ?? (categorie ? categorieLabel(categorie) : undefined)
    ?? (caisse ? pickString(caisse, 'nom', 'libelle', 'name') : undefined)
    ?? '—'
  )
}

function mapRow(item: Record<string, unknown>): StatRow {
  const tarification = asRecord(item.tarification)
  return {
    label: rowLabel(item),
    count: pickNumber(item, 'nombre_paiements', 'nombre_eleves', 'count', 'nombre', 'total', 'nouveau', 'ancien'),
    montantUsd: pickNumber(item, 'total_usd', 'montant_usd', 'montantUsd', 'totalUsd'),
    montantFc: pickNumber(item, 'total_fc', 'montant_fc', 'montantFc', 'totalFc'),
    extra: pickString(item, 'type_classe', 'devise', 'status')
      ?? (tarification ? pickString(tarification, 'devise') : undefined),
  }
}

function isMeaningfulRow(row: StatRow): boolean {
  if (row.label !== '—') return true
  return row.count !== undefined || row.montantUsd !== undefined || row.montantFc !== undefined
}

export function mapToStatRows(data: unknown): StatRow[] {
  return unwrapList(data).map(mapRow).filter(isMeaningfulRow)
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
      ].filter(isMeaningfulRow)
    }

    return [{ label: category, count: pickNumber(item, 'count', 'nombre', 'total') }].filter(isMeaningfulRow)
  })
}

function looksLikeResume(record: Record<string, unknown>): boolean {
  return (
    pickNumber(
      record,
      'nombre_paiements',
      'nombrePaiements',
      'total_paiements',
      'nombre_eleves',
      'nombreEleves',
      'total_usd',
      'montant_usd',
      'montantUsd',
      'total_fc',
      'montant_fc',
      'montantFc',
    ) !== undefined
    || asRecord(record.annee_scolaire) !== null
    || asRecord(record.anneeScolaire) !== null
  )
}

export function mapResume(data: unknown): StatResume | null {
  let record = asRecord(data)
  if (!record) return null

  for (const key of ['resume', 'data', 'resultat', 'result']) {
    const nested = asRecord(record[key])
    if (nested && looksLikeResume(nested)) {
      record = nested
      break
    }
  }

  // Année scolaire peut rester au niveau racine de la réponse API
  const root = asRecord(data)
  const annee =
    asRecord(record.annee_scolaire)
    ?? asRecord(record.anneeScolaire)
    ?? (root ? asRecord(root.annee_scolaire) ?? asRecord(root.anneeScolaire) : null)

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
    montantUsd: pickNumber(record, 'total_usd', 'montant_usd', 'montantUsd', 'totalUsd'),
    montantFc: pickNumber(record, 'total_fc', 'montant_fc', 'montantFc', 'totalFc'),
  }
}
