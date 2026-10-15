import React, { useCallback, useEffect, useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bell, CheckCheck, Loader2, Megaphone, Plus, RefreshCw } from 'lucide-react'
import { getErrorMessage } from '../../api/errors'
import * as annoncesService from '../../api/services/annonces'
import type { Annonce, AnnonceType, CibleType } from '../../api/types/annonce'
import { useAuth } from '../../context/AuthContext'
import { useChildren } from '../../context/ChildrenContext'
import { setUnreadAnnonces } from '../state/unreadAnnonces'
import { PullToRefresh } from './PullToRefresh'

const TYPE_STYLES: Record<AnnonceType, string> = {
  Information: 'bg-clb-blue-soft text-clb-blue',
  Rappel: 'bg-amber-100 text-amber-700',
  Convocation: 'bg-clb-red-light text-clb-red',
}

function formatDate(value?: string): string {
  if (!value) return ''
  const date = parseISO(value)
  if (!isValid(date)) return ''
  return format(date, 'dd MMM yyyy · HH:mm', { locale: fr })
}

interface Props {
  focusId?: string
}

export function AnnoncesScreen({ focusId }: Props) {
  const { session } = useAuth()
  const { children } = useChildren()
  const [annonces, setAnnonces] = useState<Annonce[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [composing, setComposing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const list = await annoncesService.getUnreadAnnonces()
      setAnnonces(list)
      setUnreadAnnonces(list.length)
    } catch (err) {
      setError(getErrorMessage(err))
      setAnnonces([])
      setUnreadAnnonces(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!focusId) return
    const id = Number(focusId)
    if (Number.isFinite(id)) setSelectedId(id)
  }, [focusId])

  const selected = annonces.find(item => item.id === selectedId) ?? null

  const markRead = async (id: number) => {
    setActionError(null)
    try {
      await annoncesService.markAnnonceRead(id)
      setAnnonces(current => {
        const next = current.filter(item => item.id !== id)
        setUnreadAnnonces(next.length)
        return next
      })
      setSelectedId(null)
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  const markAll = async () => {
    setActionError(null)
    try {
      await annoncesService.markAllAnnoncesRead()
      setAnnonces([])
      setUnreadAnnonces(0)
      setSelectedId(null)
    } catch (err) {
      setActionError(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
        <Loader2 size={32} className="text-clb-blue animate-spin" />
        <p className="text-gray-500 text-sm">Chargement des annonces…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 px-6 gap-4">
        <p className="text-clb-red text-sm text-center">{error}</p>
        <button onClick={() => load()} className="flex items-center gap-2 px-4 py-2 bg-clb-blue text-white rounded-xl text-sm">
          <RefreshCw size={16} /> Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Annonces</h2>
            <p className="text-clb-blue-pale text-xs">
              {annonces.length} non lue{annonces.length > 1 ? 's' : ''}
            </p>
          </div>
          {session?.isPromoteur && (
            <button
              onClick={() => { setComposing(true); setSelectedId(null) }}
              className="flex items-center gap-1 bg-white text-clb-blue rounded-xl px-3 py-2 text-xs"
              style={{ fontWeight: 600 }}
            >
              <Plus size={14} /> Nouvelle
            </button>
          )}
        </div>
      </div>

      <PullToRefresh onRefresh={load} className="flex-1">
        <div className="px-4 py-4 space-y-3">
          {actionError && <p className="text-clb-red text-xs">{actionError}</p>}

          {composing && session?.isPromoteur && (
            <ComposeAnnonce
              childrenOptions={children.map(child => ({ id: Number(child.id), label: child.name }))}
              classOptions={children
                .filter(child => child.classeId)
                .map(child => ({ id: child.classeId as number, label: child.class }))}
              saving={isSaving}
              onCancel={() => setComposing(false)}
              onSubmit={async payload => {
                setIsSaving(true)
                setActionError(null)
                try {
                  await annoncesService.createAnnonce(payload)
                  setComposing(false)
                  await load()
                } catch (err) {
                  setActionError(getErrorMessage(err))
                } finally {
                  setIsSaving(false)
                }
              }}
            />
          )}

          {selected ? (
            <article className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <button onClick={() => setSelectedId(null)} className="text-clb-blue text-xs mb-3">← Liste</button>
              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] ${TYPE_STYLES[selected.type]}`} style={{ fontWeight: 600 }}>
                {selected.type}
              </span>
              <h3 className="text-gray-900 text-base mt-2" style={{ fontWeight: 700 }}>{selected.titre}</h3>
              {selected.createdAt && <p className="text-gray-400 text-[10px] mt-1">{formatDate(selected.createdAt)}</p>}
              <p className="text-gray-700 text-sm mt-3 whitespace-pre-wrap leading-relaxed">{selected.contenu}</p>
              <button
                onClick={() => markRead(selected.id)}
                className="mt-4 w-full bg-clb-blue text-white rounded-xl py-2.5 text-sm"
                style={{ fontWeight: 600 }}
              >
                Marquer comme lue
              </button>
            </article>
          ) : annonces.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <Megaphone size={28} className="text-clb-blue mx-auto mb-2" />
              <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Aucune annonce non lue</p>
              <p className="text-gray-400 text-xs mt-1">Les informations, rappels et convocations apparaîtront ici.</p>
            </div>
          ) : (
            <>
              <button
                onClick={markAll}
                className="w-full flex items-center justify-center gap-2 text-clb-blue text-xs py-1"
                style={{ fontWeight: 600 }}
              >
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>
              {annonces.map(annonce => (
                <button
                  key={annonce.id}
                  onClick={() => setSelectedId(annonce.id)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bell size={14} className="text-clb-blue" />
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${TYPE_STYLES[annonce.type]}`} style={{ fontWeight: 600 }}>
                      {annonce.type}
                    </span>
                  </div>
                  <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{annonce.titre}</p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{annonce.contenu}</p>
                  {annonce.createdAt && <p className="text-gray-400 text-[10px] mt-2">{formatDate(annonce.createdAt)}</p>}
                </button>
              ))}
            </>
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}

function ComposeAnnonce({
  childrenOptions,
  classOptions,
  saving,
  onCancel,
  onSubmit,
}: {
  childrenOptions: { id: number; label: string }[]
  classOptions: { id: number; label: string }[]
  saving: boolean
  onCancel: () => void
  onSubmit: (payload: {
    type: AnnonceType
    titre: string
    contenu: string
    cibleType: CibleType
    cibleId?: number
  }) => Promise<void>
}) {
  const [type, setType] = useState<AnnonceType>('Information')
  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [cibleType, setCibleType] = useState<CibleType>('tous')
  const [cibleId, setCibleId] = useState('')

  const uniqueClasses = Array.from(new Map(classOptions.map(item => [item.id, item])).values())

  return (
    <form
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3"
      onSubmit={event => {
        event.preventDefault()
        const parsedId = cibleId ? Number(cibleId) : undefined
        onSubmit({
          type,
          titre: titre.trim(),
          contenu: contenu.trim(),
          cibleType,
          cibleId: cibleType === 'tous' ? undefined : parsedId,
        })
      }}
    >
      <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>Nouvelle annonce</p>
      <select value={type} onChange={e => setType(e.target.value as AnnonceType)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
        <option value="Information">Information</option>
        <option value="Rappel">Rappel</option>
        <option value="Convocation">Convocation</option>
      </select>
      <input
        value={titre}
        onChange={e => setTitre(e.target.value)}
        required
        placeholder="Titre"
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
      />
      <textarea
        value={contenu}
        onChange={e => setContenu(e.target.value)}
        required
        rows={4}
        placeholder="Message"
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm"
      />
      <select value={cibleType} onChange={e => { setCibleType(e.target.value as CibleType); setCibleId('') }} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
        <option value="tous">Tous les parents</option>
        <option value="eleve">Un élève</option>
        <option value="classe">Une classe</option>
        <option value="option">Une option (catégorie)</option>
      </select>
      {cibleType === 'eleve' && (
        <select required value={cibleId} onChange={e => setCibleId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="">Choisir un élève</option>
          {childrenOptions.map(child => <option key={child.id} value={child.id}>{child.label}</option>)}
        </select>
      )}
      {cibleType === 'classe' && (
        uniqueClasses.length > 0 ? (
          <select required value={cibleId} onChange={e => setCibleId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
            <option value="">Choisir une classe</option>
            {uniqueClasses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        ) : (
          <input required value={cibleId} onChange={e => setCibleId(e.target.value)} inputMode="numeric" placeholder="ID de la classe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        )
      )}
      {cibleType === 'option' && (
        <input required value={cibleId} onChange={e => setCibleId(e.target.value)} inputMode="numeric" placeholder="ID de la catégorie" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      )}
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">Annuler</button>
        <button type="submit" disabled={saving} className="flex-1 bg-clb-blue text-white rounded-xl py-2 text-sm disabled:opacity-50" style={{ fontWeight: 600 }}>
          {saving ? 'Envoi…' : 'Publier'}
        </button>
      </div>
    </form>
  )
}
