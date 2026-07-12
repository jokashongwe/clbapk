import React from 'react'
import { useState } from 'react'
import { Delete, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuth, getErrorMessage } from '../../context/AuthContext'

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

export function ChangePinScreen() {
  const { changePin } = useAuth()
  const [stage, setStage] = useState<'new' | 'confirm'>('new')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addToNew = (d: string) => {
    if (isSubmitting || newPin.length >= 4) return
    const next = newPin + d
    setNewPin(next)
    if (next.length === 4) {
      setTimeout(() => setStage('confirm'), 300)
    }
  }

  const submitChangePin = async (confirmedPin: string) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      await changePin(confirmedPin)
      setSuccess(true)
    } catch (err) {
      setApiError(getErrorMessage(err))
      setError(true)
      setTimeout(() => {
        setError(false)
        setConfirmPin('')
        setStage('new')
        setNewPin('')
      }, 1200)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addToConfirm = (d: string) => {
    if (isSubmitting || confirmPin.length >= 4) return
    const next = confirmPin + d
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

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div
        className="px-5 pt-4 pb-5 flex flex-col items-center clb-header-bg"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>
          Première connexion
        </h2>
        <p className="text-clb-blue-pale text-xs text-center mt-1">
          Sécurisez votre compte en définissant un nouveau PIN
        </p>
      </div>

      <div className="flex mx-6 mt-5 gap-2">
        {['Nouveau PIN', 'Confirmer'].map((s, i) => (
          <div key={s} className="flex-1 flex flex-col gap-1">
            <div
              className={`h-1 rounded-full transition-all ${
                i === 0
                  ? stage === 'new'
                    ? 'bg-clb-blue'
                    : 'bg-green-500'
                  : stage === 'confirm'
                  ? 'bg-clb-blue'
                  : 'bg-gray-200'
              }`}
            />
            <span className="text-[10px] text-gray-500">{s}</span>
          </div>
        ))}
      </div>

      {success ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <ShieldCheck size={32} className="text-green-600" />
          </div>
          <p className="text-gray-800" style={{ fontWeight: 600 }}>PIN défini avec succès !</p>
          <p className="text-gray-500 text-sm">Redirection en cours…</p>
        </div>
      ) : stage === 'new' ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-1">
            <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Choisissez votre nouveau PIN</p>
          </div>
          <PinDots length={newPin.length} error={false} />
          <NumPad onPress={addToNew} onDelete={() => setNewPin(p => p.slice(0, -1))} disabled={isSubmitting} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-center mb-1">
            <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Confirmez votre PIN</p>
            {error && !apiError && <p className="text-clb-red text-xs mt-0.5">PINs différents, réessayez</p>}
            {apiError && <p className="text-clb-red text-xs mt-0.5">{apiError}</p>}
          </div>
          <PinDots length={confirmPin.length} error={error} />
          {isSubmitting && (
            <div className="flex justify-center mb-2">
              <Loader2 size={20} className="text-clb-blue animate-spin" />
            </div>
          )}
          <NumPad
            onPress={addToConfirm}
            onDelete={() => setConfirmPin(p => p.slice(0, -1))}
            disabled={isSubmitting}
          />
          <button
            onClick={() => { setStage('new'); setNewPin(''); setConfirmPin(''); setApiError(null) }}
            disabled={isSubmitting}
            className="text-clb-blue text-sm text-center mt-3 disabled:opacity-40"
          >
            ← Changer le PIN saisi
          </button>
        </div>
      )}
    </div>
  )
}
