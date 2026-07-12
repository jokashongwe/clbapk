export type PaymentStatus = 'paid' | 'late' | 'pending'

export type PaymentCurrency = 'USD' | 'FC'

export type Payment = {
  id: string
  label: string
  detail?: string
  month?: string
  receiptNumber?: string
  amount: number
  currency: PaymentCurrency
  paidDate?: string
  status: PaymentStatus
  tarificationName?: string
}

export type PaymentWithChild = Payment & {
  childId: string
  childName: string
  childAvatar: string
  childBg: string
}
