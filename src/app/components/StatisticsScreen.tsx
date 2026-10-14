import React, { useCallback, useEffect, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  Loader2,
  RefreshCw,
  School,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { COLLEGE_LA_BONTE_CONFIGS, findSchoolByCode } from '../../api/constants'
import { getErrorMessage } from '../../api/errors'
import * as statistiquesService from '../../api/services/statistiques'
import type { StatRow, StatisticsBundle } from '../../api/types/statistiques'
import { useAuth } from '../../context/AuthContext'
import { formatAmount } from '../utils/formatAmount'
import { PullToRefresh } from './PullToRefresh'

function StatSection({ title, rows }: { title: string; rows: StatRow[] }) {
  if (rows.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{title}</p>
      </div>
      <div className="divide-y divide-gray-50">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{row.label}</p>
              {row.extra && <p className="text-gray-400 text-[10px] mt-0.5">{row.extra}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              {row.count !== undefined && (
                <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{row.count.toLocaleString('fr-FR')}</p>
              )}
              <div className="text-[10px] text-gray-500 mt-0.5 space-y-0.5">
                {row.montantUsd !== undefined && row.montantUsd > 0 && (
                  <p>{formatAmount(row.montantUsd, 'USD')}</p>
                )}
                {row.montantFc !== undefined && row.montantFc > 0 && (
                  <p>{formatAmount(row.montantFc, 'FC')}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: typeof Users
  label: string
  value: string
  tone?: 'blue' | 'green' | 'amber'
}) {
  const tones = {
    blue: 'bg-clb-blue-soft text-clb-blue',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <div className="flex-1 bg-white rounded-2xl p-3 shadow-md border border-gray-100">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${tones[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{value}</p>
      <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
    </div>
  )
}

export function StatisticsScreen() {
  const { session } = useAuth()
  const [selectedSchoolCode, setSelectedSchoolCode] = useState(session?.schoolCode ?? COLLEGE_LA_BONTE_CONFIGS[0]?.code ?? '')
  const [stats, setStats] = useState<StatisticsBundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedSchool = findSchoolByCode(selectedSchoolCode)

  const load = useCallback(async () => {
    if (!selectedSchool) {
      setError('École invalide')
      setStats(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await statistiquesService.getStatisticsAnneeCourante(selectedSchool.url)
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSchool])

  useEffect(() => {
    load()
  }, [load])

  const schoolYear = stats?.resume?.anneeScolaire?.anneeScolaire

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={20} className="text-white" />
          <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Statistiques</h2>
        </div>
        <p className="text-clb-blue-pale text-xs">
          {schoolYear ? `Année scolaire ${schoolYear}` : 'Vue promoteur — année en cours'}
        </p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <School size={16} className="text-clb-blue" />
            <p className="text-gray-500 text-xs" style={{ fontWeight: 600 }}>École consultée</p>
          </div>
          <div className="relative">
            <select
              value={selectedSchoolCode}
              onChange={e => setSelectedSchoolCode(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 pr-10"
              style={{ fontWeight: 600 }}
            >
              {COLLEGE_LA_BONTE_CONFIGS.map(school => (
                <option key={school.code} value={school.code}>
                  {school.nom} ({school.code})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {session && selectedSchoolCode !== session.schoolCode && (
            <p className="text-gray-400 text-[10px] mt-2">
              Connexion via {findSchoolByCode(session.schoolCode)?.nom ?? session.schoolCode} — stats consultables sur toutes les écoles.
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-clb-blue animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des statistiques…</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-clb-red text-sm text-center">{error}</p>
          <button
            onClick={() => load()}
            className="flex items-center gap-2 px-4 py-2 bg-clb-blue text-white rounded-xl text-sm"
          >
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      ) : (
        <PullToRefresh onRefresh={load} className="mt-4 flex-1">
          <div className="px-4 space-y-4 pb-3">
            {stats?.resume && (
              <div className="flex gap-3">
                <SummaryCard
                  icon={Wallet}
                  label="Paiements"
                  value={stats.resume.nombrePaiements?.toLocaleString('fr-FR') ?? '—'}
                  tone="blue"
                />
                <SummaryCard
                  icon={Users}
                  label="Élèves"
                  value={stats.resume.nombreEleves?.toLocaleString('fr-FR') ?? '—'}
                  tone="green"
                />
                <SummaryCard
                  icon={TrendingUp}
                  label="Tarifications"
                  value={stats.resume.nombreTarifications?.toLocaleString('fr-FR') ?? '—'}
                  tone="amber"
                />
              </div>
            )}

            {(stats?.resume?.montantUsd !== undefined || stats?.resume?.montantFc !== undefined) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs mb-1">Montants totaux</p>
                <div className="flex flex-wrap gap-3">
                  {stats.resume?.montantUsd !== undefined && stats.resume.montantUsd > 0 && (
                    <p className="text-clb-blue text-lg" style={{ fontWeight: 700 }}>
                      {formatAmount(stats.resume.montantUsd, 'USD')}
                    </p>
                  )}
                  {stats.resume?.montantFc !== undefined && stats.resume.montantFc > 0 && (
                    <p className="text-green-600 text-lg" style={{ fontWeight: 700 }}>
                      {formatAmount(stats.resume.montantFc, 'FC')}
                    </p>
                  )}
                </div>
              </div>
            )}

            <StatSection title="Inscriptions" rows={stats?.inscriptions ?? []} />
            <StatSection title="Paiements par tarification" rows={stats?.parTarification ?? []} />
            <StatSection title="Paiements par catégorie" rows={stats?.parCategorie ?? []} />
            <StatSection title="Paiements par mois" rows={stats?.parMois ?? []} />
            <StatSection title="Paiements par type" rows={stats?.parTypePaiement ?? []} />
            <StatSection title="Paiements par caisse" rows={stats?.parCaisse ?? []} />

            {!stats?.resume
              && (stats?.inscriptions.length ?? 0) === 0
              && (stats?.parTarification.length ?? 0) === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Aucune statistique disponible</p>
                <p className="text-gray-400 text-xs mt-1">Vérifiez vos droits promoteur pour cette école.</p>
              </div>
            )}
          </div>
        </PullToRefresh>
      )}
    </div>
  )
}
