import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mapAbsenceToAbsence } from '../api/mappers/absence'
import { mapEleveToChild } from '../api/mappers/child'
import { computePaymentSummary, mapPaiementsToPayments } from '../api/mappers/payment'
import * as elevesService from '../api/services/eleves'
import * as paiementsService from '../api/services/paiements'
import type { Absence, AbsenceWithChild } from '../app/types/absence'
import type { Child } from '../app/types/child'
import type { Payment, PaymentWithChild } from '../app/types/payment'
import { getErrorMessage } from '../api/errors'
import { useAuth } from './AuthContext'

type ChildrenContextValue = {
  children: Child[]
  paymentsByChildId: Record<string, Payment[]>
  absencesByChildId: Record<string, Absence[]>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  getChildById: (id: string) => Child | undefined
  getPaymentsByChildId: (id: string) => Payment[]
  getAbsencesByChildId: (id: string) => Absence[]
  getAllPaymentsWithChild: () => PaymentWithChild[]
  getAllAbsencesWithChild: () => AbsenceWithChild[]
}

const ChildrenContext = createContext<ChildrenContextValue | null>(null)

export function ChildrenProvider({ children: childNodes }: { children: ReactNode }) {
  const { session, enrichParentIdentity } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [paymentsByChildId, setPaymentsByChildId] = useState<Record<string, Payment[]>>({})
  const [absencesByChildId, setAbsencesByChildId] = useState<Record<string, Absence[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!session) {
      setChildren([])
      setPaymentsByChildId({})
      setAbsencesByChildId({})
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const eleves = await elevesService.getElevesByParent(session.parentId)
      const paymentsMap: Record<string, Payment[]> = {}
      const absencesMap: Record<string, Absence[]> = {}

      const mapped = await Promise.all(
        eleves.map(async (eleve, index) => {
          const childId = String(eleve.id)

          const [absencesRaw, paiementsResponse] = await Promise.all([
            elevesService.getEleveAbsences(eleve.id).catch(() => []),
            paiementsService.getPaiementsAnneeScolaireCourante(eleve.id).catch(() => ({
              anneeScolaire: null,
              paiements: [],
            })),
          ])

          const parentFromPayment = paiementsResponse.paiements.find(p => p.eleve?.parent)?.eleve?.parent
          if (parentFromPayment) {
            await enrichParentIdentity(parentFromPayment)
          }

          const absences = absencesRaw.map(mapAbsenceToAbsence)
          absencesMap[childId] = absences

          const payments = mapPaiementsToPayments(paiementsResponse.paiements)
          paymentsMap[childId] = payments

          const summary = computePaymentSummary(payments)
          const schoolYear = paiementsResponse.anneeScolaire?.anneeScolaire
          return mapEleveToChild(eleve, index, absences.length, summary, schoolYear)
        }),
      )

      setChildren(mapped)
      setPaymentsByChildId(paymentsMap)
      setAbsencesByChildId(absencesMap)
    } catch (err) {
      setError(getErrorMessage(err))
      setChildren([])
      setPaymentsByChildId({})
      setAbsencesByChildId({})
    } finally {
      setIsLoading(false)
    }
  }, [session, enrichParentIdentity])

  useEffect(() => {
    load()
  }, [load])

  const getChildById = useCallback(
    (id: string) => children.find(c => c.id === id),
    [children],
  )

  const getPaymentsByChildId = useCallback(
    (id: string) => paymentsByChildId[id] ?? [],
    [paymentsByChildId],
  )

  const getAbsencesByChildId = useCallback(
    (id: string) => absencesByChildId[id] ?? [],
    [absencesByChildId],
  )

  const getAllPaymentsWithChild = useCallback((): PaymentWithChild[] => {
    return children.flatMap(child =>
      (paymentsByChildId[child.id] ?? []).map(p => ({
        ...p,
        childId: child.id,
        childName: child.name,
        childAvatar: child.avatar,
        childBg: child.avatarBg,
      })),
    )
  }, [children, paymentsByChildId])

  const getAllAbsencesWithChild = useCallback((): AbsenceWithChild[] => {
    return children.flatMap(child =>
      (absencesByChildId[child.id] ?? []).map(a => ({
        ...a,
        childId: child.id,
        childName: child.name,
        childAvatar: child.avatar,
        childBg: child.avatarBg,
      })),
    )
  }, [children, absencesByChildId])

  const value = useMemo(
    () => ({
      children,
      paymentsByChildId,
      absencesByChildId,
      isLoading,
      error,
      refetch: load,
      getChildById,
      getPaymentsByChildId,
      getAbsencesByChildId,
      getAllPaymentsWithChild,
      getAllAbsencesWithChild,
    }),
    [
      children,
      paymentsByChildId,
      absencesByChildId,
      isLoading,
      error,
      load,
      getChildById,
      getPaymentsByChildId,
      getAbsencesByChildId,
      getAllPaymentsWithChild,
      getAllAbsencesWithChild,
    ],
  )

  return <ChildrenContext.Provider value={value}>{childNodes}</ChildrenContext.Provider>
}

export function useChildren(): ChildrenContextValue {
  const ctx = useContext(ChildrenContext)
  if (!ctx) {
    throw new Error('useChildren must be used within ChildrenProvider')
  }
  return ctx
}
