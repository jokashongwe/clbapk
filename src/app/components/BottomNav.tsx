import { Home, CreditCard, Calendar, MessageSquare, User, BarChart3, type LucideIcon } from 'lucide-react'
import { FEATURES } from '../config/features'

export type MainTab = 'statistics' | 'home' | 'payments' | 'absences' | 'messages' | 'profile'

interface Props {
  activeTab: MainTab
  onChange: (tab: MainTab) => void
  isPromoteur?: boolean
}

const parentTabs: { id: MainTab; label: string; Icon: LucideIcon; enabled: boolean }[] = [
  { id: 'home', label: 'Accueil', Icon: Home, enabled: true },
  { id: 'payments', label: 'Paiements', Icon: CreditCard, enabled: true },
  { id: 'absences', label: 'Absences', Icon: Calendar, enabled: true },
  { id: 'profile', label: 'Profil', Icon: User, enabled: true },
  { id: 'messages', label: 'Messages', Icon: MessageSquare, enabled: FEATURES.messages },
]

const promoterTabs: { id: MainTab; label: string; Icon: LucideIcon; enabled: boolean }[] = [
  { id: 'statistics', label: 'Stats', Icon: BarChart3, enabled: true },
  { id: 'home', label: 'Accueil', Icon: Home, enabled: true },
  { id: 'payments', label: 'Paiements', Icon: CreditCard, enabled: true },
  { id: 'absences', label: 'Absences', Icon: Calendar, enabled: true },
  { id: 'profile', label: 'Profil', Icon: User, enabled: true },
  { id: 'messages', label: 'Messages', Icon: MessageSquare, enabled: FEATURES.messages },
]

export function BottomNav({ activeTab, onChange, isPromoteur = false }: Props) {
  const tabs = (isPromoteur ? promoterTabs : parentTabs).filter(t => t.enabled)

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-clb-blue' : 'text-gray-400'}
              />
              <span
                className={`text-[10px] tracking-tight ${active ? 'text-clb-blue' : 'text-gray-400'}`}
                style={{ fontWeight: active ? 600 : 400 }}
              >
                {label}
              </span>
              {active && (
                <div className="w-1 h-1 rounded-full bg-clb-blue mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
      <div className="h-4" />
    </div>
  )
}

export function getDefaultTab(isPromoteur: boolean): MainTab {
  return isPromoteur ? 'statistics' : 'home'
}
