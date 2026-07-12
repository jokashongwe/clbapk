export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
    if (Array.isArray(obj.paiements)) return obj.paiements as T[]
    if (Array.isArray(obj['hydra:member'])) return obj['hydra:member'] as T[]
  }
  return []
}
