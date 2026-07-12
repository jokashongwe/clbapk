import React, { useState } from 'react'
import { CheckCircle, CreditCard, Loader2, RefreshCw } from 'lucide-react'
import { useChildren } from '../../context/ChildrenContext'
import type { PaymentWithChild } from '../types/payment'
import { formatAmount } from '../utils/formatAmount'
import { groupPaymentsByFeeType, type PaymentGroup } from '../utils/groupPayments'
import { FeeTypeCardsSection, FeeTypeDetail } from './PaymentFeeGroups'
import { PullToRefresh } from './PullToRefresh'

export function PaymentsScreen() {
  const { children, isLoading, error, refetch, getAllPaymentsWithChild } = useChildren()
  const [selectedGroup, setSelectedGroup] = useState<PaymentGroup<PaymentWithChild> | null>(null)

  const allPayments = getAllPaymentsWithChild()
  const paid = allPayments.filter(p => p.status === 'paid')
  const late = allPayments.filter(p => p.status === 'late')
  const pending = allPayments.filter(p => p.status === 'pending')

  const paidGroups = groupPaymentsByFeeType(paid)
  const lateGroups = groupPaymentsByFeeType(late)
  const pendingGroups = groupPaymentsByFeeType(pending)

  const totalUsd = paid.filter(p => p.currency === 'USD').reduce((s, p) => s + p.amount, 0)
  const totalFc = paid.filter(p => p.currency === 'FC').reduce((s, p) => s + p.amount, 0)

  const schoolYear = children[0]?.schoolYear

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 size={32} className="text-clb-blue animate-spin" />
        <p className="text-gray-500 text-sm">Chargement des paiements…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 px-6 gap-4">
        <p className="text-clb-red text-sm text-center">{error}</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-clb-blue text-white rounded-xl text-sm"
        >
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    )
  }

  if (selectedGroup) {
    return (
      <FeeTypeDetail
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        showChild
      />
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-6">
        <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Paiements</h2>
        <p className="text-clb-blue-pale text-xs">
          {schoolYear ? `Année scolaire ${schoolYear}` : 'Année scolaire en cours'}
        </p>
      </div>

      <div className="px-4 -mt-4 flex gap-3">
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
          <CreditCard size={18} className="text-clb-blue mx-auto mb-1" />
          <p className="text-clb-blue text-xl" style={{ fontWeight: 700 }}>{paid.length}</p>
          <p className="text-gray-500 text-[10px]">Paiements</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
          <CheckCircle size={18} className="text-green-500 mx-auto mb-1" />
          <p className="text-green-600 text-sm" style={{ fontWeight: 700 }}>
            {totalUsd > 0 ? formatAmount(totalUsd, 'USD') : '—'}
          </p>
          <p className="text-gray-500 text-[10px]">Total USD</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
          <CheckCircle size={18} className="text-green-500 mx-auto mb-1" />
          <p className="text-green-600 text-sm" style={{ fontWeight: 700 }}>
            {totalFc > 0 ? formatAmount(totalFc, 'FC') : '—'}
          </p>
          <p className="text-gray-500 text-[10px]">Total FC</p>
        </div>
      </div>

      <PullToRefresh onRefresh={refetch} className="mt-4">
        <div className="px-4 space-y-4 pb-3">
          {allPayments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Aucun paiement enregistré</p>
              <p className="text-gray-400 text-xs mt-1">Les types de frais apparaîtront ici.</p>
            </div>
          ) : (
            <>
              {lateGroups.length > 0 && (
                <FeeTypeCardsSection
                  title="⚠ Paiements en retard"
                  titleClass="text-clb-red"
                  groups={lateGroups}
                  variant="late"
                  onSelect={setSelectedGroup}
                />
              )}

              {pendingGroups.length > 0 && (
                <FeeTypeCardsSection
                  title="À venir"
                  groups={pendingGroups}
                  variant="pending"
                  onSelect={setSelectedGroup}
                />
              )}

              {paidGroups.length > 0 && (
                <FeeTypeCardsSection
                  title={`Types de frais — ${schoolYear ?? 'année en cours'}`}
                  groups={paidGroups}
                  variant="paid"
                  onSelect={setSelectedGroup}
                />
              )}
            </>
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}
