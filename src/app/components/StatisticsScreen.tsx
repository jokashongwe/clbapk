import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CreditCard,
  GraduationCap,
  Layers,
  Loader2,
  RefreshCw,
  School,
  Tag,
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

type StatsTab = 'apercu' | 'inscriptions' | 'encaissements' | 'detail'

const TABS: { id: StatsTab; label: string }[] = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'inscriptions', label: 'Effectifs' },
  { id: 'encaissements', label: 'Encaissements' },
  { id: 'detail', label: 'Détail frais' },
]

function rowTotal(row: StatRow): number {
  return (row.montantUsd ?? 0) + (row.montantFc ?? 0) / 2800
}

function Amounts({ usd, fc, size = 'sm' }: { usd?: number; fc?: number; size?: 'sm' | 'lg' }) {
  const hasUsd = usd !== undefined && usd > 0
  const hasFc = fc !== undefined && fc > 0
  if (!hasUsd && !hasFc) return null

  const usdClass = size === 'lg' ? 'text-base' : 'text-xs'
  const fcClass = size === 'lg' ? 'text-sm' : 'text-[11px]'

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${size === 'lg' ? '' : 'justify-end'}`}>
      {hasUsd && (
        <span className={`text-clb-blue ${usdClass}`} style={{ fontWeight: 700 }}>
          {formatAmount(usd, 'USD')}
        </span>
      )}
      {hasFc && (
        <span className={`text-emerald-700 ${fcClass}`} style={{ fontWeight: 600 }}>
          {formatAmount(fc, 'FC')}
        </span>
      )}
    </div>
  )
}

function ProgressBar({ value, max, tone = 'blue' }: { value: number; max: number; tone?: 'blue' | 'amber' | 'green' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const tones = {
    blue: 'bg-clb-blue',
    amber: 'bg-amber-500',
    green: 'bg-emerald-500',
  }
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full ${tones[tone]} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function StatRowItem({
  row,
  max,
  tone = 'blue',
  showBar = true,
}: {
  row: StatRow
  max: number
  tone?: 'blue' | 'amber' | 'green'
  showBar?: boolean
}) {
  const barValue = row.count ?? rowTotal(row)

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-gray-800 text-sm truncate" style={{ fontWeight: 600 }}>{row.label}</p>
          {row.extra && <p className="text-gray-400 text-[10px] mt-0.5">{row.extra}</p>}
        </div>
        <div className="text-right flex-shrink-0 space-y-0.5">
          {row.count !== undefined && (
            <p className="text-gray-900 text-sm tabular-nums" style={{ fontWeight: 700 }}>
              {row.count.toLocaleString('fr-FR')}
            </p>
          )}
          <Amounts usd={row.montantUsd} fc={row.montantFc} />
        </div>
      </div>
      {showBar && max > 0 && <ProgressBar value={barValue} max={max} tone={tone} />}
    </div>
  )
}

function CollapsibleGroup({
  title,
  subtitle,
  icon: Icon,
  rows,
  tone = 'blue',
  defaultOpen = false,
  preview = 5,
}: {
  title: string
  subtitle?: string
  icon: typeof Users
  rows: StatRow[]
  tone?: 'blue' | 'amber' | 'green'
  defaultOpen?: boolean
  preview?: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (rows.length === 0) return null

  const max = Math.max(...rows.map(r => r.count ?? rowTotal(r)), 0)
  const visible = open ? rows : rows.slice(0, preview)
  const hiddenCount = rows.length - preview

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-gray-50"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          tone === 'blue' ? 'bg-clb-blue-soft text-clb-blue'
            : tone === 'amber' ? 'bg-amber-100 text-amber-600'
              : 'bg-emerald-100 text-emerald-600'
        }`}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{title}</p>
          <p className="text-gray-400 text-[10px] mt-0.5">
            {subtitle ?? `${rows.length} ligne${rows.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>

      <div className="border-t border-gray-50 divide-y divide-gray-50">
        {visible.map((row, index) => (
          <StatRowItem key={`${row.label}-${index}`} row={row} max={max} tone={tone} />
        ))}
      </div>

      {!open && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-2.5 text-clb-blue text-xs border-t border-gray-50"
          style={{ fontWeight: 600 }}
        >
          Voir les {hiddenCount} autres
        </button>
      )}
    </div>
  )
}

/** Regroupe les lignes « Catégorie — Nouveau/Ancien » en cartes par catégorie. */
function InscriptionGroups({ rows }: { rows: StatRow[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, { nouveau?: number; ancien?: number; total?: number }>()

    for (const row of rows) {
      const match = /^(.*?)\s*[—–-]\s*(Nouveau|Ancien)$/i.exec(row.label)
      if (match) {
        const name = match[1].trim()
        const kind = match[2].toLowerCase()
        const current = map.get(name) ?? {}
        if (kind === 'nouveau') current.nouveau = row.count
        else current.ancien = row.count
        map.set(name, current)
      } else {
        map.set(row.label, { total: row.count })
      }
    }

    return [...map.entries()].map(([name, counts]) => ({
      name,
      nouveau: counts.nouveau ?? 0,
      ancien: counts.ancien ?? 0,
      total: counts.total ?? (counts.nouveau ?? 0) + (counts.ancien ?? 0),
    }))
  }, [rows])

  if (groups.length === 0) return null

  const maxTotal = Math.max(...groups.map(g => g.total), 0)

  return (
    <div className="space-y-3">
      {groups.map(group => (
        <div key={group.name} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{group.name}</p>
            <p className="text-clb-blue text-sm tabular-nums" style={{ fontWeight: 700 }}>
              {group.total.toLocaleString('fr-FR')}
            </p>
          </div>
          <ProgressBar value={group.total} max={maxTotal} tone="green" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-emerald-700/70 text-[10px]">Nouveaux</p>
              <p className="text-emerald-800 text-sm tabular-nums" style={{ fontWeight: 700 }}>
                {group.nouveau.toLocaleString('fr-FR')}
              </p>
            </div>
            <div className="rounded-xl bg-clb-blue-soft px-3 py-2">
              <p className="text-clb-blue-muted text-[10px]">Anciens</p>
              <p className="text-clb-blue text-sm tabular-nums" style={{ fontWeight: 700 }}>
                {group.ancien.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function KpiTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: string
  tone: 'blue' | 'green' | 'amber'
}) {
  const tones = {
    blue: 'bg-clb-blue-soft text-clb-blue',
    green: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-gray-900 text-base tabular-nums leading-tight" style={{ fontWeight: 700 }}>{value}</p>
        <p className="text-gray-500 text-[10px] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function StatisticsScreen() {
  const { session } = useAuth()
  const [selectedSchoolCode, setSelectedSchoolCode] = useState(session?.schoolCode ?? COLLEGE_LA_BONTE_CONFIGS[0]?.code ?? '')
  const [stats, setStats] = useState<StatisticsBundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<StatsTab>('apercu')

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
      const baseUrl =
        session && selectedSchoolCode === session.schoolCode
          ? session.baseUrl
          : selectedSchool.url
      const data = await statistiquesService.getStatisticsAnneeCourante(baseUrl)
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedSchool, selectedSchoolCode, session])

  useEffect(() => {
    load()
  }, [load])

  const schoolYear = stats?.resume?.anneeScolaire?.anneeScolaire
  const hasAnyData = Boolean(
    stats?.resume
    || (stats?.inscriptions.length ?? 0) > 0
    || (stats?.parTarification.length ?? 0) > 0,
  )

  const topMois = useMemo(
    () => [...(stats?.parMois ?? [])].sort((a, b) => (b.montantUsd ?? 0) - (a.montantUsd ?? 0)).slice(0, 3),
    [stats?.parMois],
  )

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-8">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <BarChart3 size={18} className="text-white/90" />
              <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Statistiques</h2>
            </div>
            <p className="text-clb-blue-pale text-xs">
              {schoolYear ? `Année scolaire ${schoolYear}` : 'Vue directeur — année en cours'}
            </p>
          </div>
          {!isLoading && !error && (
            <button
              type="button"
              onClick={() => load()}
              className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"
              aria-label="Actualiser"
            >
              <RefreshCw size={15} className="text-white" />
            </button>
          )}
        </div>

        {!isLoading && !error && stats?.resume && (
          <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
            <p className="text-clb-blue-pale text-[10px] uppercase tracking-wider mb-1" style={{ fontWeight: 600 }}>
              Encaissements totaux
            </p>
            <Amounts
              usd={stats.resume.montantUsd}
              fc={stats.resume.montantFc}
              size="lg"
            />
          </div>
        )}
      </div>

      <div className="px-4 -mt-4 z-10">
        <div className="bg-white rounded-2xl p-3.5 shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <School size={14} className="text-clb-blue" />
            <p className="text-gray-500 text-[10px] uppercase tracking-wider" style={{ fontWeight: 600 }}>École</p>
          </div>
          <div className="relative">
            <select
              value={selectedSchoolCode}
              onChange={e => setSelectedSchoolCode(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 pr-10"
              style={{ fontWeight: 600 }}
              disabled
            >
              {COLLEGE_LA_BONTE_CONFIGS.map(school => (
                <option key={school.code} value={school.code}>
                  {school.nom} ({school.code})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
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
        <PullToRefresh onRefresh={load} className="mt-3 flex-1">
          <div className="px-4 pb-4 space-y-4">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-none">
              {TABS.map(tab => {
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs transition-colors ${
                      active
                        ? 'bg-clb-blue text-white'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                    style={{ fontWeight: active ? 700 : 500 }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {!hasAnyData && (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Aucune statistique disponible</p>
                <p className="text-gray-400 text-xs mt-1">Vérifiez vos droits directeur pour cette école.</p>
              </div>
            )}

            {activeTab === 'apercu' && hasAnyData && (
              <div className="space-y-3">
                {stats?.resume && (
                  <div className="grid grid-cols-1 gap-2.5">
                    <KpiTile
                      icon={Wallet}
                      label="Paiements enregistrés"
                      value={stats.resume.nombrePaiements?.toLocaleString('fr-FR') ?? '—'}
                      tone="blue"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <KpiTile
                        icon={Users}
                        label="Élèves payants"
                        value={stats.resume.nombreEleves?.toLocaleString('fr-FR') ?? '—'}
                        tone="green"
                      />
                      <KpiTile
                        icon={Tag}
                        label="Types de frais"
                        value={stats.resume.nombreTarifications?.toLocaleString('fr-FR') ?? '—'}
                        tone="amber"
                      />
                    </div>
                  </div>
                )}

                {topMois.length > 0 && (
                  <CollapsibleGroup
                    title="Top mois"
                    subtitle="Meilleurs encaissements"
                    icon={CalendarDays}
                    rows={topMois}
                    tone="blue"
                    defaultOpen
                    preview={3}
                  />
                )}

                {(stats?.parTypePaiement.length ?? 0) > 0 && (
                  <CollapsibleGroup
                    title="Par type de paiement"
                    icon={CreditCard}
                    rows={stats?.parTypePaiement ?? []}
                    tone="amber"
                    defaultOpen
                    preview={4}
                  />
                )}

                {(stats?.parCaisse.length ?? 0) > 0 && (
                  <CollapsibleGroup
                    title="Par caisse"
                    icon={Wallet}
                    rows={stats?.parCaisse ?? []}
                    tone="green"
                    defaultOpen
                    preview={4}
                  />
                )}
              </div>
            )}

            {activeTab === 'inscriptions' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <GraduationCap size={14} className="text-clb-blue" />
                  <p className="text-gray-500 text-xs" style={{ fontWeight: 600 }}>
                    Inscriptions par catégorie · Nouveau / Ancien
                  </p>
                </div>
                {(stats?.inscriptions.length ?? 0) > 0 ? (
                  <InscriptionGroups rows={stats?.inscriptions ?? []} />
                ) : (
                  <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                    <p className="text-gray-500 text-sm">Aucune inscription à afficher</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'encaissements' && (
              <div className="space-y-3">
                <CollapsibleGroup
                  title="Par mois"
                  subtitle="Évolution des encaissements"
                  icon={CalendarDays}
                  rows={stats?.parMois ?? []}
                  tone="blue"
                  defaultOpen
                  preview={6}
                />
                <CollapsibleGroup
                  title="Par catégorie / filière"
                  icon={Layers}
                  rows={stats?.parCategorie ?? []}
                  tone="green"
                  defaultOpen
                  preview={6}
                />
                <CollapsibleGroup
                  title="Par type de paiement"
                  icon={CreditCard}
                  rows={stats?.parTypePaiement ?? []}
                  tone="amber"
                  defaultOpen
                />
                <CollapsibleGroup
                  title="Par caisse"
                  icon={Wallet}
                  rows={stats?.parCaisse ?? []}
                  tone="blue"
                  defaultOpen
                />
              </div>
            )}

            {activeTab === 'detail' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Tag size={14} className="text-clb-blue" />
                  <p className="text-gray-500 text-xs" style={{ fontWeight: 600 }}>
                    Répartition par type de frais
                  </p>
                </div>
                <CollapsibleGroup
                  title="Par tarification"
                  subtitle={`${stats?.parTarification.length ?? 0} frais`}
                  icon={Tag}
                  rows={stats?.parTarification ?? []}
                  tone="amber"
                  defaultOpen
                  preview={8}
                />
              </div>
            )}
          </div>
        </PullToRefresh>
      )}
    </div>
  )
}
