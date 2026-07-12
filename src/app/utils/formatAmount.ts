import type { PaymentCurrency } from '../types/payment'

export function formatAmount(amount: number, currency: PaymentCurrency): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `${amount.toLocaleString('fr-FR')} FC`
}

export function formatPaymentTotals(totalUsd: number, totalFc: number): string {
  const parts: string[] = []
  if (totalUsd > 0) parts.push(formatAmount(totalUsd, 'USD'))
  if (totalFc > 0) parts.push(formatAmount(totalFc, 'FC'))
  return parts.length > 0 ? parts.join(' · ') : '—'
}
