import type { Child } from '../../app/types/child'
import type { ApiClasse, ApiEleve, ApiSection } from '../types/eleve'

const AVATAR_COLORS = ['#031844', '#980404', '#0a3478', '#5a7196', '#052a63']

function resolveLabel(value?: ApiClasse | ApiSection): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value.libelle ?? value.nom ?? value.name
}

function resolveClasseId(eleve: ApiEleve): number | undefined {
  if (typeof eleve.classeId === 'number') return eleve.classeId
  if (typeof eleve.classe === 'object' && eleve.classe && typeof eleve.classe.id === 'number') {
    return eleve.classe.id
  }
  return undefined
}

function initials(prenom?: string, nom?: string): string {
  const p = prenom?.trim().charAt(0).toUpperCase() ?? ''
  const n = nom?.trim().charAt(0).toUpperCase() ?? ''
  return p + n || '?'
}

export function mapEleveToChild(
  eleve: ApiEleve,
  index: number,
  absencesCount = 0,
  paymentSummary?: { count: number; totalPaidUsd: number; totalPaidFc: number },
  schoolYear?: string,
): Child {
  const prenom = eleve.prenom ?? ''
  const nom = eleve.nom ?? ''
  const postnom = eleve.postnom ?? ''
  const name = [prenom, nom, postnom].filter(Boolean).join(' ') || `Élève #${eleve.id}`

  return {
    id: String(eleve.id),
    name,
    class: resolveLabel(eleve.classe) ?? '—',
    classeId: resolveClasseId(eleve),
    section: resolveLabel(eleve.section),
    schoolYear: schoolYear ?? eleve.annee_scolaire ?? eleve.anneescolaire,
    avatar: initials(prenom, nom),
    avatarBg: AVATAR_COLORS[index % AVATAR_COLORS.length],
    paymentsCount: paymentSummary?.count ?? 0,
    totalPaidUsd: paymentSummary?.totalPaidUsd ?? 0,
    totalPaidFc: paymentSummary?.totalPaidFc ?? 0,
    absencesCount,
  }
}
