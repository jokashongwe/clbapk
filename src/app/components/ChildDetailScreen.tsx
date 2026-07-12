import React, { useState } from 'react'
import { ChevronLeft, CheckCircle, Calendar, CreditCard } from 'lucide-react'
import { useChildren } from '../../context/ChildrenContext'
import { formatAmount, formatPaymentTotals } from '../utils/formatAmount'
import { groupPaymentsByFeeType, type PaymentGroup } from '../utils/groupPayments'
import { FeeTypeCardsSection, FeeTypeDetail } from './PaymentFeeGroups'
import type { Payment } from '../types/payment'

interface Props {
  childId: string
  onBack: () => void
}

type Tab = 'paiements' | 'absences'

export function ChildDetailScreen({ childId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('paiements')
  const [selectedGroup, setSelectedGroup] = useState<PaymentGroup<Payment> | null>(null)
  const { getChildById, getPaymentsByChildId, getAbsencesByChildId } = useChildren()
  const child = getChildById(childId)
  const payments = getPaymentsByChildId(childId)
  const absences = getAbsencesByChildId(childId)

  if (!child) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 px-6 gap-4">
        <p className="text-gray-600 text-sm text-center">Élève introuvable</p>
        <button onClick={onBack} className="text-clb-blue text-sm">← Retour</button>
      </div>
    )
  }

  const paymentGroups = groupPaymentsByFeeType(payments)

  const tabs: { id: Tab; label: string; Icon: typeof CreditCard }[] = [
    { id: 'paiements', label: 'Paiements', Icon: CreditCard },
    { id: 'absences', label: 'Absences', Icon: Calendar },
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-4 pt-3 pb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-clb-blue-pale text-sm mb-3 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: child.avatarBg, fontWeight: 700 }}
          >
            {child.avatar}
          </div>
          <div>
            <h2 className="text-white" style={{ fontWeight: 700 }}>{child.name}</h2>
            <p className="text-clb-blue-pale text-xs">
              {child.class}
              {child.section ? ` · ${child.section}` : ''}
              {child.schoolYear ? ` · ${child.schoolYear}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id)
                setSelectedGroup(null)
              }}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors border-b-2 ${
                activeTab === id
                  ? 'border-clb-blue text-clb-blue'
                  : 'border-transparent text-gray-400'
              }`}
            >
              <Icon size={16} />
              <span className="text-[10px]" style={{ fontWeight: activeTab === id ? 600 : 400 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none' }}>
        {activeTab === 'paiements' && (
          <div className="space-y-3">
            {!selectedGroup && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs mb-1">
                  {child.paymentsCount} paiement{child.paymentsCount > 1 ? 's' : ''} — {child.schoolYear ?? 'année en cours'}
                </p>
                <p className="text-clb-blue text-xl" style={{ fontWeight: 700 }}>
                  {formatPaymentTotals(child.totalPaidUsd, child.totalPaidFc)}
                </p>
                {(child.totalPaidUsd > 0 && child.totalPaidFc > 0) && (
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span>{formatAmount(child.totalPaidUsd, 'USD')}</span>
                    <span>·</span>
                    <span>{formatAmount(child.totalPaidFc, 'FC')}</span>
                  </div>
                )}
              </div>
            )}

            {payments.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-gray-500 text-sm">Aucun paiement pour cette année scolaire</p>
              </div>
            ) : selectedGroup ? (
              <FeeTypeDetail
                group={selectedGroup}
                onBack={() => setSelectedGroup(null)}
                embedded
              />
            ) : (
              <FeeTypeCardsSection
                title="Types de frais"
                groups={paymentGroups}
                onSelect={setSelectedGroup}
              />
            )}
          </div>
        )}

        {activeTab === 'absences' && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{absences.length}</p>
                <p className="text-gray-500 text-[10px]">Total absences</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl text-green-600" style={{ fontWeight: 700 }}>
                  {absences.filter(a => a.justified).length}
                </p>
                <p className="text-gray-500 text-[10px]">Justifiées</p>
              </div>
              <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl text-clb-red" style={{ fontWeight: 700 }}>
                  {absences.filter(a => !a.justified).length}
                </p>
                <p className="text-gray-500 text-[10px]">Non just.</p>
              </div>
            </div>

            {absences.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 text-sm" style={{ fontWeight: 600 }}>Aucune absence enregistrée</p>
              </div>
            ) : (
              absences.map(a => (
                <div key={a.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${!a.justified ? 'border-clb-red-border bg-clb-red-soft/30' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{a.date}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{a.reason}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] flex-shrink-0 ${
                        a.justified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-clb-red-light text-clb-red'
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {a.justified ? '✓ Justifiée' : '✗ Non just.'}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px]" style={{ fontWeight: 500 }}>
                      {a.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
