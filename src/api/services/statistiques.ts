import { apiRequest } from '../client'
import {
  mapInscriptionRows,
  mapResume,
  mapToStatRows,
} from '../mappers/statistiques'
import type { StatisticsBundle } from '../types/statistiques'

async function fetchStat<T>(
  baseUrl: string,
  path: string,
  mapper: (data: unknown) => T,
): Promise<T | null> {
  try {
    const data = await apiRequest<unknown>(path, { baseUrl })
    return mapper(data)
  } catch {
    return null
  }
}

export async function getStatisticsAnneeCourante(baseUrl: string): Promise<StatisticsBundle> {
  const [
    resume,
    inscriptions,
    parTarification,
    parCategorie,
    parMois,
    parTypePaiement,
    parCaisse,
  ] = await Promise.all([
    fetchStat(baseUrl, '/api/paiements/statistiques/resume/annee-scolaire-courante', mapResume),
    fetchStat(baseUrl, '/api/inscriptions/statistiques/annee-scolaire-courante', mapInscriptionRows),
    fetchStat(baseUrl, '/api/paiements/statistiques/par-tarification/annee-scolaire-courante', mapToStatRows),
    fetchStat(baseUrl, '/api/paiements/statistiques/par-categorie/annee-scolaire-courante', mapToStatRows),
    fetchStat(baseUrl, '/api/paiements/statistiques/par-mois/annee-scolaire-courante', mapToStatRows),
    fetchStat(baseUrl, '/api/paiements/statistiques/par-type-paiement/annee-scolaire-courante', mapToStatRows),
    fetchStat(baseUrl, '/api/paiements/statistiques/par-caisse/annee-scolaire-courante', mapToStatRows),
  ])

  return {
    resume,
    inscriptions: inscriptions ?? [],
    parTarification: parTarification ?? [],
    parCategorie: parCategorie ?? [],
    parMois: parMois ?? [],
    parTypePaiement: parTypePaiement ?? [],
    parCaisse: parCaisse ?? [],
  }
}
