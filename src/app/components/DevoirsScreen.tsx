import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Download, FileText, Loader2, RefreshCw, Upload } from 'lucide-react'
import { getErrorMessage } from '../../api/errors'
import * as classesService from '../../api/services/classes'
import * as devoirsService from '../../api/services/devoirs'
import type { Classe } from '../../api/types/classe'
import type { Devoir } from '../../api/types/devoir'
import { useAuth } from '../../context/AuthContext'
import { useChildren } from '../../context/ChildrenContext'
import { PullToRefresh } from './PullToRefresh'

function formatDate(value?: string): string {
  if (!value) return ''
  const date = parseISO(value)
  if (!isValid(date)) return ''
  return format(date, 'dd MMM yyyy', { locale: fr })
}

interface Props {
  focusId?: string
}

export function DevoirsScreen({ focusId }: Props) {
  const { session } = useAuth()
  const { children } = useChildren()
  const [devoirs, setDevoirs] = useState<Devoir[]>([])
  const [apiClasses, setApiClasses] = useState<Classe[]>([])
  const [classesLoading, setClassesLoading] = useState(Boolean(session?.isPromoteur))
  const [classeFilter, setClasseFilter] = useState<number | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const parentClasses = useMemo(() => {
    const map = new Map<number, string>()
    for (const child of children) {
      if (child.classeId) map.set(child.classeId, child.class)
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }))
  }, [children])

  const classes = useMemo(() => {
    if (session?.isPromoteur) {
      return apiClasses.map(item => ({ id: item.id, label: item.nomAffiche }))
    }
    return parentClasses
  }, [session?.isPromoteur, apiClasses, parentClasses])

  useEffect(() => {
    if (!session?.isPromoteur) {
      setApiClasses([])
      setClassesLoading(false)
      return
    }

    let cancelled = false
    setClassesLoading(true)
    classesService.getClasses()
      .then(list => {
        if (cancelled) return
        setApiClasses(list)
        setClasseFilter(current => {
          if (current !== 'all') return current
          return list[0]?.id ?? 'all'
        })
      })
      .catch(err => {
        if (!cancelled) setActionError(getErrorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setClassesLoading(false)
      })

    return () => { cancelled = true }
  }, [session?.isPromoteur])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const classeId = session?.isPromoteur
        ? (classeFilter === 'all' ? classes[0]?.id : classeFilter)
        : (classeFilter === 'all' ? undefined : classeFilter)

      if (session?.isPromoteur && classeId === undefined) {
        setDevoirs([])
        return
      }

      const list = await devoirsService.getDevoirs(classeId)
      setDevoirs(list)
    } catch (err) {
      setError(getErrorMessage(err))
      setDevoirs([])
    } finally {
      setIsLoading(false)
    }
  }, [classeFilter, classes, session?.isPromoteur])

  useEffect(() => {
    if (session?.isPromoteur && classesLoading) return
    load()
  }, [load, session?.isPromoteur, classesLoading])

  const download = async (devoir: Devoir) => {
    setActionError(null)
    setDownloadingId(devoir.id)
    try {
      const file = await devoirsService.getDevoirDownloadUrl(devoir.id)
      window.open(file.downloadUrl, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setDownloadingId(null)
    }
  }

  const selectedClasseLabel = classes.find(item => item.id === classeFilter)?.label

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="clb-header-bg px-5 pt-4 pb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white text-lg" style={{ fontWeight: 700 }}>Devoirs</h2>
            <p className="text-clb-blue-pale text-xs">Fichiers PDF et Word par classe</p>
          </div>
          {session?.isPromoteur && (
            <button
              onClick={() => setPublishing(true)}
              className="flex items-center gap-1 bg-white text-clb-blue rounded-xl px-3 py-2 text-xs"
              style={{ fontWeight: 600 }}
            >
              <Upload size={14} /> Publier
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 flex gap-2 overflow-x-auto">
        {!session?.isPromoteur && (
          <FilterChip active={classeFilter === 'all'} label="Toutes" onClick={() => setClasseFilter('all')} />
        )}
        {classesLoading ? (
          <span className="text-gray-400 text-xs flex items-center gap-1 px-2">
            <Loader2 size={12} className="animate-spin" /> Classes…
          </span>
        ) : (
          classes.map(item => (
            <FilterChip
              key={item.id}
              active={classeFilter === item.id || (session?.isPromoteur && classeFilter === 'all' && classes[0]?.id === item.id)}
              label={item.label}
              onClick={() => setClasseFilter(item.id)}
            />
          ))
        )}
      </div>

      {isLoading || (session?.isPromoteur && classesLoading) ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 size={32} className="text-clb-blue animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des devoirs…</p>
        </div>
      ) : error && devoirs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-4">
          <p className="text-clb-red text-sm text-center">{error}</p>
          <button onClick={() => load()} className="flex items-center gap-2 px-4 py-2 bg-clb-blue text-white rounded-xl text-sm">
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      ) : (
        <PullToRefresh onRefresh={load} className="flex-1 mt-3">
          <div className="px-4 pb-4 space-y-3">
            {actionError && <p className="text-clb-red text-xs">{actionError}</p>}
            {publishing && session?.isPromoteur && (
              <PublishDevoir
                classes={classes}
                initialClasseId={typeof classeFilter === 'number' ? classeFilter : classes[0]?.id}
                saving={isSaving}
                onCancel={() => setPublishing(false)}
                onSubmit={async input => {
                  setIsSaving(true)
                  setActionError(null)
                  try {
                    await devoirsService.publishDevoir(input)
                    setPublishing(false)
                    setClasseFilter(input.classeId)
                    await load()
                  } catch (err) {
                    setActionError(getErrorMessage(err))
                  } finally {
                    setIsSaving(false)
                  }
                }}
              />
            )}
            {devoirs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                <FileText size={28} className="text-clb-blue mx-auto mb-2" />
                <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Aucun devoir</p>
                <p className="text-gray-400 text-xs mt-1">
                  {selectedClasseLabel
                    ? `Aucun fichier pour ${selectedClasseLabel}.`
                    : 'Les fichiers publiés pour vos classes apparaîtront ici.'}
                </p>
              </div>
            ) : devoirs.map(devoir => (
              <article
                key={devoir.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border ${focusId === String(devoir.id) ? 'border-clb-blue' : 'border-gray-100'}`}
              >
                <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>{devoir.titre}</p>
                {devoir.description && <p className="text-gray-500 text-xs mt-1">{devoir.description}</p>}
                <div className="mt-2 text-[10px] text-gray-400 flex flex-wrap gap-x-2">
                  {devoir.filename && <span>{devoir.filename}</span>}
                  {devoir.createdAt && <span>{formatDate(devoir.createdAt)}</span>}
                  {devoir.classeId && (
                    <span>
                      {classes.find(item => item.id === devoir.classeId)?.label ?? `Classe #${devoir.classeId}`}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => download(devoir)}
                  disabled={downloadingId === devoir.id}
                  className="mt-3 flex items-center gap-2 text-clb-blue text-sm disabled:opacity-50"
                  style={{ fontWeight: 600 }}
                >
                  <Download size={16} />
                  {downloadingId === devoir.id ? 'Préparation…' : 'Télécharger'}
                </button>
              </article>
            ))}
          </div>
        </PullToRefresh>
      )}
    </div>
  )
}

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${active ? 'bg-clb-blue text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
      style={{ fontWeight: 600 }}
    >
      {label}
    </button>
  )
}

function PublishDevoir({
  classes,
  initialClasseId,
  saving,
  onCancel,
  onSubmit,
}: {
  classes: { id: number; label: string }[]
  initialClasseId?: number
  saving: boolean
  onCancel: () => void
  onSubmit: (input: { file: File; titre: string; classeId: number; description?: string }) => Promise<void>
}) {
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [classeId, setClasseId] = useState(initialClasseId ? String(initialClasseId) : classes[0] ? String(classes[0].id) : '')
  const [file, setFile] = useState<File | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifiedLabel, setVerifiedLabel] = useState<string | null>(
    classes.find(item => String(item.id) === classeId)?.label ?? null,
  )
  const [verifyError, setVerifyError] = useState<string | null>(null)

  useEffect(() => {
    const id = Number(classeId)
    if (!Number.isFinite(id) || id <= 0) {
      setVerifiedLabel(null)
      return
    }

    const local = classes.find(item => item.id === id)
    if (local) {
      setVerifiedLabel(local.label)
      setVerifyError(null)
      return
    }

    let cancelled = false
    setVerifying(true)
    setVerifyError(null)
    classesService.getClasse(id)
      .then(classe => {
        if (!cancelled) setVerifiedLabel(classe.nomAffiche)
      })
      .catch(err => {
        if (!cancelled) {
          setVerifiedLabel(null)
          setVerifyError(getErrorMessage(err))
        }
      })
      .finally(() => {
        if (!cancelled) setVerifying(false)
      })

    return () => { cancelled = true }
  }, [classeId, classes])

  return (
    <form
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3"
      onSubmit={event => {
        event.preventDefault()
        if (!file || !classeId) return
        onSubmit({
          file,
          titre: titre.trim(),
          classeId: Number(classeId),
          description: description.trim() || undefined,
        })
      }}
    >
      <p className="text-gray-900 text-sm" style={{ fontWeight: 700 }}>Publier un devoir</p>
      <input required value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description (optionnel)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      {classes.length > 0 ? (
        <select required value={classeId} onChange={e => setClasseId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm">
          <option value="">Choisir une classe</option>
          {classes.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      ) : (
        <input required value={classeId} onChange={e => setClasseId(e.target.value)} inputMode="numeric" placeholder="ID de la classe" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      )}
      {verifying && (
        <p className="text-gray-400 text-[10px] flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" /> Vérification de la classe…
        </p>
      )}
      {verifiedLabel && !verifying && (
        <p className="text-gray-500 text-[10px]">Classe : {verifiedLabel}</p>
      )}
      {verifyError && <p className="text-clb-red text-xs">{verifyError}</p>}
      <input
        required
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={e => setFile(e.target.files?.[0] ?? null)}
        className="w-full text-xs text-gray-600"
      />
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">Annuler</button>
        <button
          type="submit"
          disabled={saving || verifying || !classeId || Boolean(verifyError)}
          className="flex-1 bg-clb-blue text-white rounded-xl py-2 text-sm disabled:opacity-50"
          style={{ fontWeight: 600 }}
        >
          {saving ? 'Envoi…' : 'Publier'}
        </button>
      </div>
    </form>
  )
}
