import React from 'react'
import { Plus, MessageSquare, Send } from 'lucide-react'
import { mockMessages } from '../data/mockData'

interface Props {
  onNewMessage: () => void
}

export function CommunicationScreen({ onNewMessage }: Props) {
  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-4 pb-6 flex items-center justify-between clb-header-bg">
        <div>
          <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Messagerie</h2>
          <p className="text-clb-blue-pale text-xs">Collège la Bonté</p>
        </div>
        <button
          onClick={onNewMessage}
          className="flex items-center gap-1.5 bg-white text-clb-blue rounded-2xl px-3 py-2 shadow-md transition-all active:scale-95"
          style={{ fontWeight: 600 }}
        >
          <Plus size={14} />
          <span className="text-xs">Nouveau</span>
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-3 space-y-3" style={{ scrollbarWidth: 'none' }}>
        <p className="text-gray-400 text-[10px] text-center uppercase tracking-wider">Historique des échanges</p>

        {[...mockMessages].reverse().map((msg, idx, arr) => {
          const prevMsg = arr[idx - 1]
          const showDate = !prevMsg || prevMsg.date !== msg.date

          return (
            <div key={msg.id}>
              {showDate && (
                <p className="text-gray-400 text-[10px] text-center my-2">{msg.date}</p>
              )}

              <div className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.type === 'sent'
                      ? 'bg-clb-blue text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                  }`}
                >
                  {msg.type === 'sent' && msg.subject && (
                    <p className="text-clb-blue-pale text-[10px] mb-1" style={{ fontWeight: 600 }}>
                      {msg.subject}
                      {msg.childName && ` · ${msg.childName}`}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.type === 'sent' ? 'text-clb-blue-pale' : 'text-gray-400'}`}>
                    <span className="text-[10px]">{msg.date}</span>
                    {msg.type === 'sent' && <Send size={8} />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info banner */}
      <div className="px-4 pb-2">
        <div className="bg-clb-blue-soft border border-clb-blue-pale/30 rounded-2xl p-3 flex items-center gap-2">
          <MessageSquare size={14} className="text-clb-blue-muted flex-shrink-0" />
          <p className="text-clb-blue text-[10px]">
            Les messages sont traités par l'administration sous 24h en jours ouvrables.
          </p>
        </div>
      </div>
    </div>
  )
}
