import type { Payment } from '../types/payment'
import { formatPaymentTotals } from './formatAmount'

export type PaymentGroup<T extends Payment = Payment> = {
  feeType: string
  payments: T[]
  totalUsd: number
  totalFc: number
}

export function groupPaymentsByFeeType<T extends Payment>(payments: T[]): PaymentGroup<T>[] {
  const groups = new Map<string, T[]>()

  for (const payment of payments) {
    const key = payment.tarificationName?.trim() || 'Autres frais'
    const list = groups.get(key) ?? []
    list.push(payment)
    groups.set(key, list)
  }

  return Array.from(groups.entries())
    .map(([feeType, groupPayments]) => ({
      feeType,
      payments: groupPayments,
      totalUsd: groupPayments
        .filter(p => p.currency === 'USD')
        .reduce((sum, p) => sum + p.amount, 0),
      totalFc: groupPayments
        .filter(p => p.currency === 'FC')
        .reduce((sum, p) => sum + p.amount, 0),
    }))
    .sort((a, b) => a.feeType.localeCompare(b.feeType, 'fr'))
}

export function paymentItemTitle(payment: Payment): string {
  if (payment.month) return payment.month
  if (payment.detail) return payment.detail
  if (payment.tarificationName && payment.label.startsWith(payment.tarificationName)) {
    const rest = payment.label.slice(payment.tarificationName.length).replace(/^[\s—-]+/, '')
    if (rest) return rest
  }
  return payment.label
}

export function groupTotalsLabel(group: PaymentGroup): string {
  return formatPaymentTotals(group.totalUsd, group.totalFc)
}
