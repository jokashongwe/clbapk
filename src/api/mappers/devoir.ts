import type { Devoir, DevoirDownload } from '../types/devoir'
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

export function mapDevoir(data: unknown): Devoir | null {
  const record = asRecord(data)
  if (!record || typeof record.id !== 'number') return null

  return {
    id: record.id,
    titre: pickString(record, 'titre', 'title') ?? 'Devoir',
    description: pickString(record, 'description'),
    classeId: pickNumber(record, 'classeId', 'classe_id'),
    filename: pickString(record, 'filename', 'fileName', 'nomFichier', 'originalFilename'),
    mimeType: pickString(record, 'mimeType', 'mime_type'),
    createdAt: pickString(record, 'createdAt', 'created_at', 'dateCreation', 'date'),
  }
}

export function mapDevoirs(data: unknown): Devoir[] {
  return unwrapList<unknown>(data)
    .map(mapDevoir)
    .filter((item): item is Devoir => item !== null)
}

export function mapDevoirDownload(data: unknown): DevoirDownload {
  const record = asRecord(data) ?? {}
  const downloadUrl = pickString(record, 'downloadUrl', 'download_url', 'url')
  if (!downloadUrl) {
    throw new Error('Lien de téléchargement indisponible')
  }

  return {
    downloadUrl,
    expiresInSeconds: pickNumber(record, 'expiresInSeconds', 'expires_in'),
    filename: pickString(record, 'filename', 'fileName'),
    mimeType: pickString(record, 'mimeType', 'mime_type'),
  }
}
