import React from 'react'
import { useState } from 'react'
import { Delete, ChevronLeft, Loader2, ChevronDown } from 'lucide-react'
import appLogo from '../../assets/images/clb.png'
import { COLLEGE_LA_BONTE_CONFIGS } from '../../api/constants'
import { useAuth, getErrorMessage } from '../../context/AuthContext'

function PinDots({ length }: { length: number }) {
  return (
    <div className="flex justify-center gap-5 my-6">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            length > i
              ? 'bg-white border-white scale-110'
              : 'bg-transparent border-white/50'
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
  return (
    <div className="grid grid-cols-3 gap-3 px-6">
      {digits.map(d => (
        <button
          key={d}
          disabled={disabled}
          onClick={() => onPress(String(d))}
          className="h-14 bg-white/15 text-white rounded-2xl text-xl transition-all active:scale-95 active:bg-white/25 hover:bg-white/20 disabled:opacity-40"
          style={{ fontWeight: 500 }}
        >
          {d}
        </button>
      ))}
      <div />
      <button
        disabled={disabled}
        onClick={() => onPress('0')}
        className="h-14 bg-white/15 text-white rounded-2xl text-xl transition-all active:scale-95 active:bg-white/25 hover:bg-white/20 disabled:opacity-40"
        style={{ fontWeight: 500 }}
      >
        0
      </button>
      <button
        disabled={disabled}
        onClick={onDelete}
        className="h-14 bg-white/15 text-white rounded-2xl transition-all active:scale-95 active:bg-white/25 hover:bg-white/20 flex items-center justify-center disabled:opacity-40"
      >
        <Delete size={20} />
      </button>
    </div>
  )
}

export function LoginScreen() {
  const { login } = useAuth()
  const [step, setStep] = useState<'credentials' | 'pin'>('credentials')
  const [schoolCode, setSchoolCode] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    const e: string[] = []
    if (!schoolCode.trim()) e.push('schoolCode')
    if (!phone.trim()) e.push('phone')
    setErrors(e)
    if (e.length === 0) {
      setApiError(null)
      setStep('pin')
    }
  }

  const submitLogin = async (pinValue: string) => {
    setIsSubmitting(true)
    setApiError(null)
    try {
      await login(schoolCode, phone, pinValue)
    } catch (err) {
      setApiError(getErrorMessage(err))
      setPin('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addDigit = (d: string) => {
    if (isSubmitting || pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => submitLogin(next), 300)
    }
  }

  const removeDigit = () => {
    if (!isSubmitting) setPin(p => p.slice(0, -1))
  }

  return (
    <div className="clb-header-bg-login h-full flex flex-col">
      <div className="flex flex-col items-center pt-10 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-lg">
          <img src={appLogo} alt="" />
        </div>
        <h1 className="text-white text-3xl tracking-tight" style={{ fontWeight: 700 }}>
          Collège La Bonte
        </h1>
        <p className="text-clb-blue-pale text-sm mt-0.5">Toujours plus haut</p>
        <div className="w-12 h-0.5 bg-white/30 rounded-full mt-4" />
      </div>

      {step === 'credentials' ? (
        <div className="flex-1 px-6 flex flex-col">
          <p className="text-clb-blue-pale text-sm text-center mb-5">Connectez-vous à votre espace parent</p>

          <div className="space-y-3">
            <div>
              <label htmlFor="school-select" className="sr-only">École</label>
              <div className="relative">
                <select
                  id="school-select"
                  value={schoolCode}
                  onChange={e => {
                    setSchoolCode(e.target.value)
                    setErrors(ev => ev.filter(x => x !== 'schoolCode'))
                  }}
                  className={`w-full appearance-none bg-white/15 text-white rounded-2xl px-4 py-3.5 pr-10 outline-none border transition-all ${
                    schoolCode ? 'text-white' : 'text-clb-blue-pale/60'
                  } ${
                    errors.includes('schoolCode')
                      ? 'border-clb-red-muted bg-clb-red/10'
                      : 'border-white/20 focus:border-white/60 focus:bg-white/20'
                  }`}
                >
                  <option value="" disabled className="text-gray-500">
                    Sélectionnez votre école
                  </option>
                  {COLLEGE_LA_BONTE_CONFIGS.map(school => (
                    <option key={school.code} value={school.code} className="text-gray-900">
                      {school.nom}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-clb-blue-pale pointer-events-none"
                />
              </div>
              {errors.includes('schoolCode') && (
                <p className="text-clb-red-pale text-xs mt-1 px-1">Veuillez sélectionner votre école</p>
              )}
            </div>

            <div>
              <input
                className={`w-full bg-white/15 text-white placeholder:text-clb-blue-pale/60 rounded-2xl px-4 py-3.5 outline-none border transition-all ${
                  errors.includes('phone')
                    ? 'border-clb-red-muted bg-clb-red/10'
                    : 'border-white/20 focus:border-white/60 focus:bg-white/20'
                }`}
                placeholder="Numéro de téléphone"
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setErrors(ev => ev.filter(x => x !== 'phone')) }}
              />
              {errors.includes('phone') && (
                <p className="text-clb-red-pale text-xs mt-1 px-1">Veuillez entrer votre numéro</p>
              )}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="mt-6 w-full bg-white text-clb-blue rounded-2xl py-3.5 shadow-lg transition-all active:scale-98 hover:bg-clb-blue-soft"
            style={{ fontWeight: 700 }}
          >
            Suivant
          </button>

          <p className="text-clb-blue-pale/80 text-xs text-center mt-4">
            Utilisez les identifiants fournis par l'établissement
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center px-4 mb-2">
            <button
              onClick={() => { if (!isSubmitting) { setStep('credentials'); setPin(''); setApiError(null) } }}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition-colors disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
          </div>

          <div className="text-center px-6">
            <p className="text-white text-lg" style={{ fontWeight: 600 }}>Entrez votre PIN</p>
            <p className="text-clb-blue-pale text-sm">Code à 4 chiffres</p>
          </div>

          <PinDots length={pin.length} />

          {apiError && (
            <p className="text-clb-red-pale text-xs text-center px-6 -mt-2 mb-2">{apiError}</p>
          )}

          {isSubmitting && (
            <div className="flex justify-center mb-4">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            <NumPad onPress={addDigit} onDelete={removeDigit} disabled={isSubmitting} />
          </div>

          <p className="text-clb-blue-pale/80 text-xs text-center pb-4">
            PIN oublié ? Contactez l'administration
          </p>
        </div>
      )}
    </div>
  )
}
