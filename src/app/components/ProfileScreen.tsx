import React, { useState } from 'react'
import {
  ChevronLeft,
  Delete,
  Loader2,
  LogOut,
  Phone,
  School,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { findSchoolByCode } from '../../api/constants'
import { useAuth, getErrorMessage } from '../../context/AuthContext'

type PinStage = 'current' | 'new' | 'confirm'

function PinDots({ length, error }: { length: number; error: boolean }) {
  return (
    <div className="flex justify-center gap-5 my-4">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            error
              ? 'border-clb-red-muted bg-clb-red-muted animate-pulse'
              : length > i
              ? 'bg-clb-blue border-clb-blue scale-110'
              : 'bg-transparent border-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function NumPad({
  onPress,
  onDelete,
  disabled,
}: {
  onPress: (d: string) => void
  onDelete: () => void
  disabled?: boolean
}) {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const btnClass =
    'h-12 bg-gray-100 text-gray-800 rounded-2xl text-xl transition-all active:scale-95 active:bg-gray-200 hover:bg-gray-200 disabled:opacity-40'

  return (
    <div className="grid grid-cols-3 gap-2.5 px-4">
      {digits.map(d => (
        <button key={d} disabled={disabled} onClick={() => onPress(String(d))} className={btnClass} style={{ fontWeight: 500 }}>
          {d}
        </button>
      ))}
      <div />
      <button disabled={disabled} onClick={() => onPress('0')} className={btnClass} style={{ fontWeight: 500 }}>
        0
      </button>
      <button
        disabled={disabled}
        onClick={onDelete}
        className="h-12 bg-gray-100 text-gray-600 rounded-2xl transition-all active:scale-95 active:bg-gray-200 flex items-center justify-center disabled:opacity-40"
      >
        <Delete size={18} />
      </button>
    </div>
  )
}

function formatPhone(phone: string): string {
  if (phone.length === 12 && phone.startsWith('243')) {
    return `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`
  }
  return phone
}

function initials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return parts[0]?.slice(0, 2).toUpperCase() ?? '?'
}

export function ProfileScreen() {
  const { session, logout, changePin } = useAuth()
  const [showChangePin, setShowChangePin] = useState(false)
  const [stage, setStage] = useState<PinStage>('current')
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const school = session ? findSchoolByCode(session.schoolCode) : undefined
  const identity = session?.parentIdentity
  const parentName =
    session?.parentName
    ?? identity?.nomTuteur
    ?? identity?.nomMere
    ?? identity?.nomPere
    ?? 'Parent'

  const hasIdentityDetails = Boolean(
    identity?.nomTuteur
    || identity?.nomPere
    || identity?.nomMere
    || identity?.telephonePere
    || identity?.telephoneMere,
  )

  const resetPinFlow = () => {
    setStage('current')
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    setError(false)
    setApiError(null)
    setSuccess(false)
    setIsSubmitting(false)
  }

  const closeChangePin = () => {
    resetPinFlow()
    setShowChangePin(false)
  }

  const submitChangePin = async (confirmedPin: string) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      await changePin(confirmedPin, currentPin)
      setSuccess(true)
      setTimeout(() => closeChangePin(), 2000)
    } catch (err) {
      setApiError(getErrorMessage(err))
      setError(true)
      setTimeout(() => {
        setError(false)
        resetPinFlow()
        setShowChangePin(true)
        setStage('current')
      }, 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePinPress = (digit: string) => {
    if (isSubmitting) return

    if (stage === 'current') {
      if (currentPin.length >= 4) return
      const next = currentPin + digit
      setCurrentPin(next)
      if (next.length === 4) setTimeout(() => setStage('new'), 300)
      return
    }

    if (stage === 'new') {
      if (newPin.length >= 4) return
      const next = newPin + digit
      setNewPin(next)
      if (next.length === 4) setTimeout(() => setStage('confirm'), 300)
      return
    }

    if (confirmPin.length >= 4) return
    const next = confirmPin + digit
    setConfirmPin(next)
    if (next.length === 4) {
      if (next === newPin) {
        submitChangePin(next)
      } else {
        setError(true)
        setTimeout(() => {
          setError(false)
          setConfirmPin('')
        }, 800)
      }
    }
  }

  const handlePinDelete = () => {
    if (isSubmitting) return
    if (stage === 'current') setCurrentPin(p => p.slice(0, -1))
    else if (stage === 'new') setNewPin(p => p.slice(0, -1))
    else setConfirmPin(p => p.slice(0, -1))
  }

  const activePinLength =
    stage === 'current' ? currentPin.length : stage === 'new' ? newPin.length : confirmPin.length

  if (!session) return null

  if (showChangePin) {
    const stages: { id: PinStage; label: string }[] = [
      { id: 'current', label: 'PIN actuel' },
      { id: 'new', label: 'Nouveau PIN' },
      { id: 'confirm', label: 'Confirmer' },
    ]

    return (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="clb-header-bg px-4 pt-3 pb-5">
          <button
            onClick={closeChangePin}
            disabled={isSubmitting}
            className="flex items-center gap-1 text-clb-blue-pale text-sm mb-3 hover:text-white transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Retour au profil
          </button>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Changer le PIN</h2>
            <p className="text-clb-blue-pale text-xs text-center mt-1">
              Saisissez votre PIN actuel puis choisissez un nouveau code à 4 chiffres
            </p>
          </div>
        </div>

        <div className="flex mx-6 mt-5 gap-2">
          {stages.map(({ id, label }) => (
            <div key={id} className="flex-1 flex flex-col gap-1">
              <div
                className={`h-1 rounded-full transition-all ${
                  stage === id
                    ? 'bg-clb-blue'
                    : stages.findIndex(s => s.id === id) < stages.findIndex(s => s.id === stage)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
              <span className="text-[10px] text-gray-500 truncate">{label}</span>
            </div>
          ))}
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck size={32} className="text-green-600" />
            </div>
            <p className="text-gray-800 text-center" style={{ fontWeight: 600 }}>PIN modifié avec succès !</p>
            <p className="text-gray-500 text-sm text-center">Utilisez votre nouveau PIN lors de la prochaine connexion.</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-1 px-6">
              <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>
                {stage === 'current' && 'Entrez votre PIN actuel'}
                {stage === 'new' && 'Choisissez votre nouveau PIN'}
                {stage === 'confirm' && 'Confirmez votre nouveau PIN'}
              </p>
              {error && !apiError && stage === 'confirm' && (
                <p className="text-clb-red text-xs mt-0.5">PINs différents, réessayez</p>
              )}
              {apiError && <p className="text-clb-red text-xs mt-0.5">{apiError}</p>}
            </div>
            <PinDots length={activePinLength} error={error} />
            {isSubmitting && (
              <div className="flex justify-center mb-2">
                <Loader2 size={20} className="text-clb-blue animate-spin" />
              </div>
            )}
            <NumPad onPress={handlePinPress} onDelete={handlePinDelete} disabled={isSubmitting} />
            {stage !== 'current' && (
              <button
                onClick={() => {
                  if (stage === 'confirm') {
                    setStage('new')
                    setConfirmPin('')
                  } else {
                    setStage('current')
                    setNewPin('')
                    setCurrentPin('')
                  }
                  setApiError(null)
                }}
                disabled={isSubmitting}
                className="text-clb-blue text-sm text-center mt-3 disabled:opacity-40"
              >
                ← Retour à l'étape précédente
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-8">
        <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Mon profil</h2>
        <p className="text-clb-blue-pale text-xs">Informations du compte parent</p>
      </div>

      <div className="px-4 -mt-6 pb-6 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl clb-header-bg flex items-center justify-center text-white text-xl flex-shrink-0" style={{ fontWeight: 700 }}>
            {initials(parentName)}
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 text-base truncate" style={{ fontWeight: 700 }}>{parentName}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {session.isPromoteur ? 'Compte parent · Promoteur' : (
                identity?.nomTuteur && identity.nomTuteur !== parentName
                  ? `Tuteur : ${identity.nomTuteur}`
                  : 'Compte parent'
              )}
            </p>
          </div>
        </div>

        {hasIdentityDetails && (
          <>
            <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider px-1" style={{ fontWeight: 600 }}>
              Identité des responsables
            </p>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
              {identity?.nomTuteur && (
                <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-clb-blue" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px]">Tuteur / responsable</p>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{identity.nomTuteur}</p>
                  </div>
                </div>
              )}
              {identity?.nomPere && (
                <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-clb-blue" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px]">Père</p>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{identity.nomPere}</p>
                    {identity.telephonePere && (
                      <p className="text-gray-500 text-[10px] mt-0.5">{formatPhone(identity.telephonePere)}</p>
                    )}
                  </div>
                </div>
              )}
              {identity?.nomMere && (
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-clb-blue" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px]">Mère</p>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{identity.nomMere}</p>
                    {identity.telephoneMere && (
                      <p className="text-gray-500 text-[10px] mt-0.5">{formatPhone(identity.telephoneMere)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider px-1" style={{ fontWeight: 600 }}>
          Compte
        </p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-clb-blue" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px]">Téléphone</p>
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
                {formatPhone(session.telephone)}
              </p>
            </div>
          </div>
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-gray-50">
            <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center flex-shrink-0">
              <School size={16} className="text-clb-blue" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px]">École</p>
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
                {school?.nom ?? session.schoolCode}
              </p>
              <p className="text-gray-400 text-[10px] mt-0.5">Code : {session.schoolCode}</p>
            </div>
          </div>
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-clb-blue-soft flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-clb-blue" />
            </div>
            <div>
              <p className="text-gray-400 text-[10px]">Identifiant parent</p>
              <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>#{session.parentId}</p>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider px-1" style={{ fontWeight: 600 }}>
          Sécurité
        </p>
        <button
          onClick={() => setShowChangePin(true)}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:border-clb-blue-pale transition-colors mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>Changer le PIN</p>
            <p className="text-gray-400 text-[10px] mt-0.5">Modifier votre code de connexion à 4 chiffres</p>
          </div>
          <ChevronLeft size={16} className="text-gray-300 rotate-180 flex-shrink-0" />
        </button>

        <button
          onClick={() => logout()}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-clb-red-border flex items-center justify-center gap-2 text-clb-red hover:bg-clb-red-soft transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm" style={{ fontWeight: 600 }}>Se déconnecter</span>
        </button>
      </div>
    </div>
  )
}
