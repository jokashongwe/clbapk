import React from 'react'
import { useState } from 'react'
import { ChevronLeft, Send, CheckCircle } from 'lucide-react'
import { useChildren } from '../../context/ChildrenContext'

interface Props {
  onBack: () => void
  onSent: () => void
}

type MessageType = 'absence' | 'reclamation' | 'autre'

const messageTypes: { id: MessageType; label: string; desc: string; emoji: string }[] = [
  { id: 'absence', label: "Signaler une absence", desc: "Informer l'école d'une absence", emoji: '📅' },
  { id: 'reclamation', label: "Réclamation", desc: "Signaler un problème ou désaccord", emoji: '⚠️' },
  { id: 'autre', label: "Autre communication", desc: "Toute autre demande", emoji: '💬' },
]

export function NewMessageScreen({ onBack, onSent }: Props) {
  const { children } = useChildren()
  const [type, setType] = useState<MessageType | null>(null)
  const [selectedChild, setSelectedChild] = useState('')
  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [sent, setSent] = useState(false)

  const handleSend = () => {
    setSent(true)
    setTimeout(onSent, 1500)
  }

  const canSend = type === 'absence'
    ? selectedChild && date && reason
    : subject && message

  if (sent) {
    return (
      <div className="h-full bg-gray-50 flex flex-col items-center justify-center gap-3 px-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <p className="text-gray-800 text-center" style={{ fontWeight: 700 }}>Message envoyé !</p>
        <p className="text-gray-500 text-sm text-center">L'administration vous répondra sous 24h.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div
        className="px-4 pt-3 pb-5 clb-header-bg"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-clb-blue-pale text-sm mb-3 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Retour
        </button>
        <h2 className="text-white" style={{ fontWeight: 700 }}>Nouveau message</h2>
        <p className="text-clb-blue-pale text-xs">Collège la Bonté</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'none' }}>

        {/* Type selector */}
        <div>
          <p className="text-gray-600 text-xs mb-2 uppercase tracking-wider" style={{ fontWeight: 600 }}>Type de message</p>
          <div className="space-y-2">
            {messageTypes.map(t => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                  type === t.id
                    ? 'border-clb-blue bg-clb-blue-soft'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <p className={`text-sm ${type === t.id ? 'text-clb-blue' : 'text-gray-800'}`} style={{ fontWeight: 600 }}>
                    {t.label}
                  </p>
                  <p className="text-gray-400 text-xs">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form based on type */}
        {type === 'absence' && (
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>Enfant concerné</p>
              <div className="space-y-2">
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      selectedChild === child.id ? 'border-clb-blue bg-clb-blue-soft' : 'border-gray-100 bg-white'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0" style={{ backgroundColor: child.avatarBg, fontWeight: 700 }}>
                      {child.avatar}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>{child.name}</p>
                      <p className="text-gray-400 text-xs">{child.class}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>Date d'absence</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 outline-none focus:border-clb-blue-muted text-sm"
              />
            </div>

            <div>
              <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>Motif</p>
              <div className="grid grid-cols-3 gap-2">
                {['Maladie', 'Imprévu', 'Autre'].map(r => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`py-2.5 rounded-2xl text-sm transition-all border-2 ${
                      reason === r ? 'border-clb-blue bg-clb-blue-soft text-clb-blue' : 'border-gray-100 bg-white text-gray-600'
                    }`}
                    style={{ fontWeight: reason === r ? 600 : 400 }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>Message (optionnel)</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Précisions complémentaires…"
                rows={3}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm outline-none focus:border-clb-blue-muted resize-none"
              />
            </div>
          </div>
        )}

        {(type === 'reclamation' || type === 'autre') && (
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>Objet</p>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Objet de votre message"
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm outline-none focus:border-clb-blue-muted"
              />
            </div>
            <div>
              <p className="text-gray-600 text-xs mb-1.5 uppercase tracking-wider" style={{ fontWeight: 600 }}>Message</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre demande ou réclamation…"
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 text-sm outline-none focus:border-clb-blue-muted resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Send button */}
      {type && (
        <div className="px-4 pb-3 flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-white ${canSend ? 'clb-btn-gradient' : 'bg-gray-200'}`}
            style={{ fontWeight: 700 }}
          >
            <Send size={16} />
            Envoyer le message
          </button>
        </div>
      )}
    </div>
  )
}
