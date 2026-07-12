export type AbsenceType = 'maladie' | 'imprévu' | 'autre' | 'injustifiée'

export type Absence = {
  id: string
  date: string
  reason: string
  justified: boolean
  type: AbsenceType | string
}

export type AbsenceWithChild = Absence & {
  childId: string
  childName: string
  childAvatar: string
  childBg: string
}
