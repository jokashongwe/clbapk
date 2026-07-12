import React from 'react'
import { Bell, ChevronRight, AlertTriangle, TrendingUp, Users, Loader2, RefreshCw } from 'lucide-react'
import { findSchoolByCode } from '../../api/constants'
import { useAuth } from '../../context/AuthContext'
import { useChildren } from '../../context/ChildrenContext'
import { formatPaymentTotals } from '../utils/formatAmount'
import { PullToRefresh } from './PullToRefresh'

interface Props {
  onSelectChild: (id: string) => void
}

export function HomeScreen({ onSelectChild }: Props) {
  const { session } = useAuth()
  const { children, isLoading, error, refetch, getPaymentsByChildId } = useChildren()

  const parentName = session?.parentName ?? 'Parent'
  const school = session ? findSchoolByCode(session.schoolCode) : undefined

  const totalAbsences = children.reduce((a, c) => a + c.absencesCount, 0)
  const latePaymentsCount = children.reduce((acc, child) => {
    const payments = getPaymentsByChildId(child.id)
    return acc + payments.filter(p => p.status === 'late').length
  }, 0)

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 size={32} className="text-clb-blue animate-spin" />
        <p className="text-gray-500 text-sm">Chargement de vos enfants…</p>
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-clb-blue-pale text-xs">Bonjour 👋</p>
            <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>
              {parentName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Bell size={18} className="text-white" />
              </button>
              {latePaymentsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-clb-red rounded-full text-white text-[10px] flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {latePaymentsCount}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-clb-blue-pale/80 text-xs">
          {children[0]?.schoolYear ? `Année scolaire ${children[0].schoolYear}` : 'Année scolaire en cours'}
        </p>
      </div>

      <div className="px-4 -mt-5 flex gap-3">
        <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-md flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center">
            <Users size={18} className="text-clb-blue" />
          </div>
          <div>
            <p className="text-gray-500 text-[10px]">Enfants inscrits</p>
            <p className="text-gray-900 text-xl" style={{ fontWeight: 700 }}>{children.length}</p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-md flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${latePaymentsCount > 0 ? 'bg-clb-red-light' : 'bg-green-100'}`}>
            <AlertTriangle size={18} className={latePaymentsCount > 0 ? 'text-clb-red' : 'text-green-600'} />
          </div>
          <div>
            <p className="text-gray-500 text-[10px]">Retards paiement</p>
            <p className={`text-xl ${latePaymentsCount > 0 ? 'text-clb-red' : 'text-green-600'}`} style={{ fontWeight: 700 }}>
              {latePaymentsCount}
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-md flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <TrendingUp size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-gray-500 text-[10px]">Absences</p>
            <p className="text-amber-600 text-xl" style={{ fontWeight: 700 }}>{totalAbsences}</p>
          </div>
        </div>
      </div>

      {latePaymentsCount > 0 && (
        <div className="mx-4 mt-4 bg-clb-red-soft border border-clb-red-border rounded-2xl p-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-clb-red flex-shrink-0" />
          <p className="text-clb-red text-xs flex-1">
            {latePaymentsCount} paiement{latePaymentsCount > 1 ? 's' : ''} en retard. Régularisez à l'économat.
          </p>
        </div>
      )}

      <PullToRefresh onRefresh={refetch} className="mt-4">
        <div className="px-4 pb-2">
        <p className="text-gray-500 text-xs mb-3 uppercase tracking-wider" style={{ fontWeight: 600 }}>
          Mes enfants
        </p>

        {children.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Aucun enfant inscrit</p>
            <p className="text-gray-400 text-xs mt-1">Contactez l'administration si cela est incorrect.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map(child => {
              const payments = getPaymentsByChildId(child.id)
              const lateCount = payments.filter(p => p.status === 'late').length
              const hasPayments = child.paymentsCount > 0

              return (
                <button
                  key={child.id}
                  onClick={() => onSelectChild(child.id)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left transition-all active:scale-98 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: child.avatarBg, fontWeight: 700 }}
                    >
                      {child.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm truncate" style={{ fontWeight: 600 }}>{child.name}</p>
                      <p className="text-gray-500 text-xs">
                        {child.class}
                        {child.section ? ` · ${child.section}` : ''}
                        {school ? ` · ${school.nom}` : ''}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                  </div>

                  {hasPayments && (
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500 text-[10px]">
                          {child.paymentsCount} paiement{child.paymentsCount > 1 ? 's' : ''}
                        </span>
                        <span className="text-[10px] text-gray-600" style={{ fontWeight: 500 }}>
                          {formatPaymentTotals(child.totalPaidUsd, child.totalPaidFc)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {hasPayments && (
                      lateCount > 0 ? (
                        <span className="px-2.5 py-1 bg-clb-red-light text-clb-red rounded-full text-[10px]" style={{ fontWeight: 600 }}>
                          {lateCount} paiement{lateCount > 1 ? 's' : ''} en retard
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px]" style={{ fontWeight: 600 }}>
                          ✓ {child.paymentsCount} paiement{child.paymentsCount > 1 ? 's' : ''} enregistré{child.paymentsCount > 1 ? 's' : ''}
                        </span>
                      )
                    )}
                    {child.absencesCount > 0 && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px]" style={{ fontWeight: 600 }}>
                        {child.absencesCount} absence{child.absencesCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {child.absencesCount === 0 && !hasPayments && (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-[10px]" style={{ fontWeight: 600 }}>
                        ✓ Présence OK
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {school && (
          <div className="mt-4 mb-2 bg-clb-blue-soft rounded-2xl p-4 border border-clb-blue-pale/30">
            <p className="text-clb-blue text-xs" style={{ fontWeight: 600 }}>{school.nom}</p>
            <p className="text-clb-blue-muted text-[10px] mt-0.5">Code école : {school.code}</p>
            <p className="text-clb-blue-muted/80 text-[10px]">Économat ouvert Lun–Ven · 07h30–16h30</p>
          </div>
        )}
        </div>
      </PullToRefresh>
    </div>
  )
}
