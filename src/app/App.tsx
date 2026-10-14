import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { LoginScreen } from './components/LoginScreen'
import { ChangePinScreen } from './components/ChangePinScreen'
import { HomeScreen } from './components/HomeScreen'
import { ChildDetailScreen } from './components/ChildDetailScreen'
import { PaymentsScreen } from './components/PaymentsScreen'
import { AbsencesScreen } from './components/AbsencesScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { StatisticsScreen } from './components/StatisticsScreen'
import { BottomNav, getDefaultTab, MainTab } from './components/BottomNav'

type Screen = 'main' | 'child-detail'

export default function App() {
  const { session, isLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('main')
  const [activeTab, setActiveTab] = useState<MainTab>('home')
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      setActiveTab(getDefaultTab(session.isPromoteur))
    }
  }, [session?.isPromoteur, session?.parentId])

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab)
    setScreen('main')
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="text-clb-blue animate-spin" />
      </div>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  if (session.mustChangePin) {
    return (
      <ChangePinScreen />
    )
  }

  const renderMainContent = () => {
    if (screen === 'child-detail' && selectedChildId) {
      return (
        <ChildDetailScreen
          childId={selectedChildId}
          onBack={() => { setScreen('main'); setActiveTab('home') }}
        />
      )
    }
    switch (activeTab) {
      case 'statistics':
        return session.isPromoteur ? <StatisticsScreen /> : <HomeScreen onSelectChild={id => { setSelectedChildId(id); setScreen('child-detail') }} />
      case 'home':
        return (
          <HomeScreen
            onSelectChild={id => { setSelectedChildId(id); setScreen('child-detail') }}
          />
        )
      case 'payments':
        return <PaymentsScreen />
      case 'absences':
        return <AbsencesScreen />
      case 'profile':
        return <ProfileScreen />
      default:
        return session.isPromoteur
          ? <StatisticsScreen />
          : (
            <HomeScreen
              onSelectChild={id => { setSelectedChildId(id); setScreen('child-detail') }}
            />
          )
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {renderMainContent()}
      {screen === 'main' && (
        <BottomNav
          activeTab={activeTab}
          onChange={handleTabChange}
          isPromoteur={session.isPromoteur}
        />
      )}
    </div>
  )
}
