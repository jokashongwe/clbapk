import { format, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Payment, PaymentCurrency, PaymentStatus } from '../../app/types/payment'
import type { ApiPaiement } from '../types/paiement'

function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const iso = parseISO(value)
  if (isValid(iso)) return iso
  const fallback = new Date(value)
  return isValid(fallback) ? fallback : null
}

function formatDisplayDate(value?: string | null): string {
  const date = parseDate(value)
  if (!date) return '—'
  return format(date, 'dd MMM yyyy', { locale: fr })
}

function parseAmount(value?: string | number | null): number {
  if (value === null || value === undefined || value === '') return 0
  const n = typeof value === 'string' ? parseFloat(value) : value
  return Number.isFinite(n) ? n : 0
}

function resolveAmount(paiement: ApiPaiement): { amount: number; currency: PaymentCurrency } {
  const usd = parseAmount(paiement.montantUsd)
  const fc = parseAmount(paiement.montantFc)
  const devise = paiement.tarification?.devise?.toUpperCase()

  if (usd > 0) return { amount: usd, currency: 'USD' }
  if (fc > 0) return { amount: fc, currency: 'FC' }
  if (devise === 'USD') return { amount: usd, currency: 'USD' }
  return { amount: fc, currency: 'FC' }
}

function normalizeMonth(mois?: string | null): string | undefined {
  if (!mois || mois.toLowerCase() === 'pas de mois') return undefined
  return mois
}

function resolveLabel(paiement: ApiPaiement): string {
  if (paiement.libelle) return paiement.libelle
  if (paiement.label) return paiement.label

  const tarifName = paiement.tarification?.nom
  const month = normalizeMonth(paiement.mois)

  if (tarifName && month) return `${tarifName} — ${month}`
  if (tarifName) return tarifName
  if (month) return `Frais — ${month}`
  if (paiement.detail) return paiement.detail
  return 'Paiement'
}

function resolveStatus(paiement: ApiPaiement): PaymentStatus {
  const paidAt = paiement.datepaiement ?? paiement.date_paiement
  if (paidAt) return 'paid'

  const statut = (paiement.statut ?? '').toLowerCase()
  if (paiement.paye === true || statut.includes('pay') || statut === 'ok') {
    return 'paid'
  }

  const due = parseDate(paiement.date_echeance)
  if (due && due < new Date()) return 'late'

  return 'pending'
}

export function mapPaiementToPayment(paiement: ApiPaiement): Payment {
  const { amount, currency } = resolveAmount(paiement)
  const paidAt = paiement.datepaiement ?? paiement.date_paiement

  return {
    id: String(paiement.id),
    label: resolveLabel(paiement),
    detail: paiement.detail ?? undefined,
    month: normalizeMonth(paiement.mois),
    receiptNumber: paiement.numRecu ?? undefined,
    amount,
    currency,
    paidDate: paidAt ? formatDisplayDate(paidAt) : undefined,
    status: resolveStatus(paiement),
    tarificationName: paiement.tarification?.nom,
  }
}

export function mapPaiementsToPayments(paiements: ApiPaiement[]): Payment[] {
  return [...paiements]
    .sort((a, b) => {
      const ta = parseDate(a.datepaiement ?? a.date_paiement)?.getTime() ?? 0
      const tb = parseDate(b.datepaiement ?? b.date_paiement)?.getTime() ?? 0
      return tb - ta
    })
    .map(mapPaiementToPayment)
}

export function computePaymentSummary(payments: Payment[]): {
  count: number
  totalPaidUsd: number
  totalPaidFc: number
} {
  const paid = payments.filter(p => p.status === 'paid')
  return {
    count: payments.length,
    totalPaidUsd: paid.filter(p => p.currency === 'USD').reduce((sum, p) => sum + p.amount, 0),
    totalPaidFc: paid.filter(p => p.currency === 'FC').reduce((sum, p) => sum + p.amount, 0),
  }
}

export function countLatePayments(payments: Payment[]): number {
  return payments.filter(p => p.status === 'late').length
}
