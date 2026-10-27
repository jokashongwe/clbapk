import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { isDirectorOrPromoterRole } from '../api/mappers/auth'
import { useAuth } from '../context/AuthContext'
import { LoginScreen } from './components/LoginScreen'
import { ChangePinScreen } from './components/ChangePinScreen'
import { HomeScreen } from './components/HomeScreen'
import { ChildDetailScreen } from './components/ChildDetailScreen'
import { PaymentsScreen } from './components/PaymentsScreen'
import { AbsencesScreen } from './components/AbsencesScreen'
import { ProfileScreen } from './components/ProfileScreen'
import { StatisticsScreen } from './components/StatisticsScreen'
import { AnnoncesScreen } from './components/AnnoncesScreen'
import { DevoirsScreen } from './components/DevoirsScreen'
import { BottomNav, getDefaultTab, MainTab } from './components/BottomNav'
import * as annoncesService from '../api/services/annonces'
import { setUnreadAnnonces } from './state/unreadAnnonces'
import { enablePushNotifications, subscribePushOpen } from '../push/pushNotifications'

type Screen = 'main' | 'child-detail'

export default function App() {
  const { session, isLoading } = useAuth()
  const [screen, setScreen] = useState<Screen>('main')
  const [activeTab, setActiveTab] = useState<MainTab>('home')
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | undefined>()

  const isDirecteur = Boolean(
    session?.isPromoteur || session?.roles?.some(isDirectorOrPromoterRole),
  )

  useEffect(() => {
    if (session) {
      setActiveTab(getDefaultTab(isDirecteur))
    }
  }, [isDirecteur, session?.parentId])

  useEffect(() => {
    if (!session || session.mustChangePin) {
      setUnreadAnnonces(0)
      return
    }
    annoncesService.getUnreadAnnonces().then(list => setUnreadAnnonces(list.length)).catch(() => {})
    enablePushNotifications()
    return subscribePushOpen(payload => {
      if (payload.type === 'devoir') {
        setActiveTab('devoirs')
        setFocusId(payload.devoirId)
      } else {
        setActiveTab('annonces')
        setFocusId(payload.annonceId)
      }
      setScreen('main')
    })
  }, [session])

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

  const openChild = (id: string) => {
    setSelectedChildId(id)
    setScreen('child-detail')
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
        return isDirecteur ? <StatisticsScreen /> : <HomeScreen onSelectChild={openChild} />
      case 'home':
        return <HomeScreen onSelectChild={openChild} />
      case 'payments':
        return <PaymentsScreen />
      case 'absences':
        return <AbsencesScreen />
      case 'annonces':
        return <AnnoncesScreen focusId={focusId} />
      case 'devoirs':
        return <DevoirsScreen focusId={focusId} />
      case 'profile':
        return <ProfileScreen />
      default:
        return isDirecteur
          ? <StatisticsScreen />
          : <HomeScreen onSelectChild={openChild} />
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {renderMainContent()}
      {screen === 'main' && (
        <BottomNav
          activeTab={activeTab}
          onChange={handleTabChange}
          isPromoteur={isDirecteur}
        />
      )}
    </div>
  )
}
