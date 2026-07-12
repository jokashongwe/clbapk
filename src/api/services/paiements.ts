import { apiRequest } from '../client'
import type { ApiPaiement, PaiementsEleveAnneeCourante } from '../types/paiement'
import { unwrapList } from '../utils/unwrapList'

function parsePaiementsAnneeCourante(data: unknown): PaiementsEleveAnneeCourante {
  const record =
    typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}

  const anneeScolaire =
    typeof record.annee_scolaire === 'object' && record.annee_scolaire !== null
      ? (record.annee_scolaire as PaiementsEleveAnneeCourante['anneeScolaire'])
      : null

  return {
    anneeScolaire,
    paiements: unwrapList<ApiPaiement>(data),
  }
}

export async function getPaiementsAnneeScolaireCourante(
  eleveId: number | string,
): Promise<PaiementsEleveAnneeCourante> {
  const data = await apiRequest<unknown>(
    `/api/paiements/eleve/${eleveId}/annee-scolaire-courante`,
  )
  return parsePaiementsAnneeCourante(data)
}

export async function getPaiementsByEleve(
  eleveId: number | string,
  params?: { tarification_id?: string; mois?: string },
): Promise<ApiPaiement[]> {
  const data = await apiRequest<unknown>('/api/paiements', {
    params: { eleve_id: eleveId, ...params },
  })
  return unwrapList<ApiPaiement>(data)
}

export async function getPaiementById(paiementId: number | string): Promise<ApiPaiement> {
  return apiRequest<ApiPaiement>(`/api/paiements/${paiementId}`)
}
