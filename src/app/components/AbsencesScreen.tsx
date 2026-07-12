import React from 'react'
import { CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { useChildren } from '../../context/ChildrenContext'
import { PullToRefresh } from './PullToRefresh'

export function AbsencesScreen() {
  const { children, isLoading, error, refetch, getAllAbsencesWithChild } = useChildren()

  const allAbsences = getAllAbsencesWithChild()
  const justified = allAbsences.filter(a => a.justified).length
  const unjustified = allAbsences.filter(a => !a.justified).length
  const schoolYear = children[0]?.schoolYear

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 size={32} className="text-clb-blue animate-spin" />
        <p className="text-gray-500 text-sm">Chargement des absences…</p>
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
      <div className="clb-header-bg px-5 pt-4 pb-6">
        <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Absences</h2>
        <p className="text-clb-blue-pale text-xs">
          {schoolYear ? `Année scolaire ${schoolYear}` : 'Année scolaire en cours'}
        </p>
      </div>

      <div className="px-4 -mt-4 flex gap-3">
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
          <p className="text-gray-900 text-xl" style={{ fontWeight: 700 }}>{allAbsences.length}</p>
          <p className="text-gray-500 text-[10px]">Total</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
          <p className="text-green-600 text-xl" style={{ fontWeight: 700 }}>{justified}</p>
          <p className="text-gray-500 text-[10px]">Justifiées</p>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-md text-center">
          <p className="text-clb-red text-xl" style={{ fontWeight: 700 }}>{unjustified}</p>
          <p className="text-gray-500 text-[10px]">Non just.</p>
        </div>
      </div>

      <PullToRefresh onRefresh={refetch} className="mt-4">
        <div className="px-4 space-y-3 pb-3">
        {allAbsences.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <CheckCircle size={36} className="text-green-500 mx-auto mb-3" />
            <p className="text-gray-700" style={{ fontWeight: 600 }}>Aucune absence enregistrée</p>
            <p className="text-gray-400 text-sm mt-1">Excellent taux de présence !</p>
          </div>
        ) : (
          children.map(child => {
            const childAbsences = allAbsences.filter(a => a.childId === child.id)
            if (childAbsences.length === 0) return null
            return (
              <div key={child.id}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0" style={{ backgroundColor: child.avatarBg, fontWeight: 700 }}>
                    {child.avatar}
                  </div>
                  <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>{child.name}</p>
                  <span className="text-gray-400 text-xs">· {child.class}</span>
                </div>
                <div className="space-y-2">
                  {childAbsences.map(a => (
                    <div key={a.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${!a.justified ? 'border-clb-red-border bg-clb-red-soft/30' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{a.date}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{a.reason}</p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px]" style={{ fontWeight: 500 }}>
                            {a.type}
                          </span>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] ${a.justified ? 'bg-green-100 text-green-700' : 'bg-clb-red-light text-clb-red'}`}
                          style={{ fontWeight: 600 }}
                        >
                          {a.justified ? '✓ Justifiée' : '✗ Non just.'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
        </div>
      </PullToRefresh>
    </div>
  )
}
