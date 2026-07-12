import { format, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Absence } from '../../app/types/absence'
import type { ApiAbsence } from '../types/absence'

function parseDate(value?: string): Date | null {
  if (!value) return null
  const iso = parseISO(value)
  if (isValid(iso)) return iso
  const fallback = new Date(value)
  return isValid(fallback) ? fallback : null
}

function formatDisplayDate(value?: string): string {
  const date = parseDate(value)
  if (!date) return value ?? '—'
  return format(date, 'dd MMM yyyy', { locale: fr })
}

function resolveJustified(absence: ApiAbsence): boolean {
  if (absence.justifiee === true || absence.justifie === true || absence.justified === true) {
    return true
  }
  if (absence.justifiee === false || absence.justifie === false || absence.justified === false) {
    return false
  }

  const statut = (absence.statut ?? '').toLowerCase()
  if (statut.includes('justif') && !statut.includes('non') && !statut.includes('injustif')) {
    return true
  }
  if (statut.includes('non') || statut.includes('injustif')) {
    return false
  }

  return false
}

function resolveReason(absence: ApiAbsence): string {
  return (
    absence.motif
    ?? absence.raison
    ?? absence.reason
    ?? absence.commentaire
    ?? (resolveJustified(absence) ? 'Absence justifiée' : 'Absence non justifiée')
  )
}

function resolveType(absence: ApiAbsence, justified: boolean): string {
  if (absence.type) return absence.type
  if (absence.nature) return absence.nature
  if (!justified) return 'injustifiée'
  return 'autre'
}

export function mapAbsenceToAbsence(absence: ApiAbsence): Absence {
  const justified = resolveJustified(absence)
  const dateRaw = absence.date ?? absence.date_absence ?? absence.jour

  return {
    id: String(absence.id),
    date: formatDisplayDate(dateRaw),
    reason: resolveReason(absence),
    justified,
    type: resolveType(absence, justified),
  }
}
