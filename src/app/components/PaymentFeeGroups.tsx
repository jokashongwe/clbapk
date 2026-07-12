import React from 'react'
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, Wallet } from 'lucide-react'
import type { Payment, PaymentWithChild } from '../types/payment'
import { formatAmount, formatPaymentTotals } from '../utils/formatAmount'
import { groupTotalsLabel, paymentItemTitle, type PaymentGroup } from '../utils/groupPayments'

type FeeTypeCardProps = {
  group: PaymentGroup
  onClick: () => void
  variant?: 'paid' | 'late' | 'pending'
}

export function FeeTypeCard({ group, onClick, variant = 'paid' }: FeeTypeCardProps) {
  const borderClass =
    variant === 'late'
      ? 'border-clb-red-border hover:bg-clb-red-soft/30'
      : 'border-gray-100 hover:border-clb-blue-pale/50 hover:shadow-md'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full bg-white rounded-2xl p-4 shadow-sm border text-left transition-all active:scale-[0.98] ${borderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'late' ? 'bg-clb-red-light' : 'bg-clb-blue-soft'
          }`}>
            <Wallet size={18} className={variant === 'late' ? 'text-clb-red' : 'text-clb-blue'} />
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 text-sm truncate" style={{ fontWeight: 700 }}>{group.feeType}</p>
            <p className="text-gray-500 text-[10px] mt-0.5">
              {group.payments.length} paiement{group.payments.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-clb-blue text-sm" style={{ fontWeight: 700 }}>
              {groupTotalsLabel(group)}
            </p>
            {variant === 'late' && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-clb-red-light text-clb-red rounded-full text-[10px]" style={{ fontWeight: 600 }}>
                En retard
              </span>
            )}
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </div>
      </div>
    </button>
  )
}

type FeeTypeCardsSectionProps<T extends Payment> = {
  title: string
  titleClass?: string
  groups: PaymentGroup<T>[]
  onSelect: (group: PaymentGroup<T>) => void
  variant?: 'paid' | 'late' | 'pending'
}

export function FeeTypeCardsSection<T extends Payment>({
  title,
  titleClass = 'text-gray-500',
  groups,
  onSelect,
  variant = 'paid',
}: FeeTypeCardsSectionProps<T>) {
  if (groups.length === 0) return null

  return (
    <div>
      <p className={`${titleClass} text-xs mb-3 uppercase tracking-wider`} style={{ fontWeight: 600 }}>
        {title}
      </p>
      <div className="space-y-2">
        {groups.map(group => (
          <FeeTypeCard
            key={group.feeType}
            group={group}
            variant={variant}
            onClick={() => onSelect(group)}
          />
        ))}
      </div>
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: Payment['status'] }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px]" style={{ fontWeight: 600 }}>
        <CheckCircle size={10} /> Payé
      </span>
    )
  }
  if (status === 'late') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-clb-red-light text-clb-red rounded-full text-[10px]" style={{ fontWeight: 600 }}>
        <AlertCircle size={10} /> En retard
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px]" style={{ fontWeight: 600 }}>
      <Clock size={10} /> En attente
    </span>
  )
}

type FeeTypeDetailProps<T extends Payment> = {
  group: PaymentGroup<T>
  onBack: () => void
  showChild?: boolean
  embedded?: boolean
}

function PaymentList<T extends Payment>({ group, showChild }: { group: PaymentGroup<T>; showChild: boolean }) {
  return (
    <>
      {group.payments.map(payment => {
        const withChild = showChild ? (payment as PaymentWithChild) : null
        const title = paymentItemTitle(payment)

        return (
          <div
            key={payment.id}
            className={`bg-white rounded-2xl p-4 shadow-sm border ${
              payment.status === 'late' ? 'border-clb-red-border bg-clb-red-soft/30' : 'border-gray-100'
            }`}
          >
            {showChild && withChild && (
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] flex-shrink-0"
                  style={{ backgroundColor: withChild.childBg, fontWeight: 700 }}
                >
                  {withChild.childAvatar}
                </div>
                <span className="text-gray-500 text-[10px]">{withChild.childName}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-gray-800 text-sm flex-1" style={{ fontWeight: 600 }}>{title}</p>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="text-gray-900 text-base" style={{ fontWeight: 700 }}>
              {formatAmount(payment.amount, payment.currency)}
            </p>
            <div className="mt-1 text-[10px] text-gray-400 flex flex-wrap gap-x-2">
              {payment.paidDate && <span>Payé le {payment.paidDate}</span>}
              {payment.receiptNumber && <span>Reçu n° {payment.receiptNumber}</span>}
            </div>
          </div>
        )
      })}
    </>
  )
}

export function FeeTypeDetail<T extends Payment>({ group, onBack, showChild = false, embedded = false }: FeeTypeDetailProps<T>) {
  if (embedded) {
    return (
      <div className="space-y-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-clb-blue text-sm hover:opacity-80 transition-opacity"
        >
          <ChevronLeft size={16} /> Types de frais
        </button>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{group.feeType}</p>
          <p className="text-gray-500 text-xs mt-0.5">
            {group.payments.length} paiement{group.payments.length > 1 ? 's' : ''} · {groupTotalsLabel(group)}
          </p>
        </div>
        <PaymentList group={group} showChild={showChild} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-4 pt-3 pb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-clb-blue-pale text-sm mb-3 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>{group.feeType}</h2>
        <p className="text-clb-blue-pale text-xs mt-0.5">
          {group.payments.length} paiement{group.payments.length > 1 ? 's' : ''} · {groupTotalsLabel(group)}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ scrollbarWidth: 'none' }}>
        <PaymentList group={group} showChild={showChild} />
      </div>
    </div>
  )
}

export function feeGroupTotalsText(group: PaymentGroup): string {
  return formatPaymentTotals(group.totalUsd, group.totalFc)
}
