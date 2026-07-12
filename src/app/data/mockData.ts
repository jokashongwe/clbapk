import type { Absence } from '../types/absence'
import type { Child } from '../types/child'
import type { Payment } from '../types/payment'

export type { Absence } from '../types/absence'
export type { Child } from '../types/child'
export type { Payment } from '../types/payment'

export const mockParent = {
  name: 'Marie KOUASSI',
  phone: '+225 07 04 12 34',
}

export const mockChildren: Child[] = [
  {
    id: '1',
    name: 'Amara KOUASSI',
    class: '6ème A',
    avatar: 'AK',
    avatarBg: '#3B82F6',
    totalFees: 160000,
    paidFees: 70000,
    absencesCount: 3,
  },
  {
    id: '2',
    name: 'Fatou KOUASSI',
    class: '4ème B',
    avatar: 'FK',
    avatarBg: '#8B5CF6',
    totalFees: 160000,
    paidFees: 160000,
    absencesCount: 1,
  },
]

export const mockPayments: Record<string, Payment[]> = {
  '1': [
    { id: 'p1', label: "Frais d'inscription", amount: 25000, dueDate: '01 Sep 2023', paidDate: '02 Sep 2023', status: 'paid' },
    { id: 'p2', label: 'Frais 1er trimestre', amount: 45000, dueDate: '15 Sep 2023', paidDate: '14 Sep 2023', status: 'paid' },
    { id: 'p3', label: 'Frais 2ème trimestre', amount: 45000, dueDate: '15 Jan 2024', status: 'late' },
    { id: 'p4', label: 'Frais 3ème trimestre', amount: 45000, dueDate: '15 Avr 2024', status: 'pending' },
  ],
  '2': [
    { id: 'p5', label: "Frais d'inscription", amount: 25000, dueDate: '01 Sep 2023', paidDate: '01 Sep 2023', status: 'paid' },
    { id: 'p6', label: 'Frais 1er trimestre', amount: 45000, dueDate: '15 Sep 2023', paidDate: '15 Sep 2023', status: 'paid' },
    { id: 'p7', label: 'Frais 2ème trimestre', amount: 45000, dueDate: '15 Jan 2024', paidDate: '10 Jan 2024', status: 'paid' },
    { id: 'p8', label: 'Frais 3ème trimestre', amount: 45000, dueDate: '15 Avr 2024', paidDate: '12 Avr 2024', status: 'paid' },
  ],
}

export const mockAbsences: Record<string, Absence[]> = {
  '1': [
    { id: 'a1', date: '12 Jan 2024', reason: 'Grippe — certificat médical fourni', justified: true, type: 'maladie' },
    { id: 'a2', date: '03 Fév 2024', reason: 'Absence non justifiée', justified: false, type: 'injustifiée' },
    { id: 'a3', date: '15 Mar 2024', reason: 'Urgence familiale', justified: true, type: 'imprévu' },
  ],
  '2': [
    { id: 'a4', date: '20 Jan 2024', reason: 'Rendez-vous médical', justified: true, type: 'maladie' },
  ],
}

export type Note = {
  subject: string
  grade: number
  maxGrade: number
  teacher: string
  appreciation: string
}

export const mockNotes: Record<string, Note[]> = {
  '1': [
    { subject: 'Mathématiques', grade: 14, maxGrade: 20, teacher: 'M. BAMBA', appreciation: 'Bien' },
    { subject: 'Français', grade: 12, maxGrade: 20, teacher: 'Mme TOURÉ', appreciation: 'Assez bien' },
    { subject: 'Anglais', grade: 15, maxGrade: 20, teacher: 'M. DIALLO', appreciation: 'Bien' },
    { subject: 'Sciences de la Vie', grade: 11, maxGrade: 20, teacher: 'Mme KONÉ', appreciation: 'Assez bien' },
    { subject: 'Histoire-Géographie', grade: 13, maxGrade: 20, teacher: 'M. OUATTARA', appreciation: 'Assez bien' },
    { subject: 'E.P.S.', grade: 17, maxGrade: 20, teacher: 'M. COULIBALY', appreciation: 'Très bien' },
    { subject: 'Arts Plastiques', grade: 16, maxGrade: 20, teacher: 'Mme FOFANA', appreciation: 'Très bien' },
  ],
  '2': [
    { subject: 'Mathématiques', grade: 16, maxGrade: 20, teacher: 'M. BAMBA', appreciation: 'Très bien' },
    { subject: 'Français', grade: 14, maxGrade: 20, teacher: 'Mme TOURÉ', appreciation: 'Bien' },
    { subject: 'Anglais', grade: 13, maxGrade: 20, teacher: 'M. DIALLO', appreciation: 'Assez bien' },
    { subject: 'Sciences de la Vie', grade: 15, maxGrade: 20, teacher: 'Mme KONÉ', appreciation: 'Bien' },
    { subject: 'Histoire-Géographie', grade: 12, maxGrade: 20, teacher: 'M. OUATTARA', appreciation: 'Assez bien' },
    { subject: 'E.P.S.', grade: 18, maxGrade: 20, teacher: 'M. COULIBALY', appreciation: 'Excellent' },
  ],
}

export type Message = {
  id: string
  type: 'sent' | 'received'
  content: string
  date: string
  subject?: string
  childName?: string
}

export const mockMessages: Message[] = [
  {
    id: 'm1',
    type: 'sent',
    content: "Bonjour, je vous signale qu'Amara sera absente le 03/02 pour raison de santé. Un certificat médical sera fourni à son retour.",
    date: '03 Fév 2024',
    subject: 'Signalement absence',
    childName: 'Amara KOUASSI',
  },
  {
    id: 'm2',
    type: 'received',
    content: "Bonjour Mme KOUASSI, nous prenons bonne note de l'absence d'Amara. Nous attendons le certificat médical à son retour. Bonne guérison à elle.",
    date: '03 Fév 2024',
  },
  {
    id: 'm3',
    type: 'sent',
    content: "Bonjour, je souhaite obtenir des informations concernant les modalités de paiement du 2ème trimestre pour Amara.",
    date: '20 Jan 2024',
    subject: 'Demande renseignements',
    childName: 'Amara KOUASSI',
  },
  {
    id: 'm4',
    type: 'received',
    content: "Bonjour Mme KOUASSI, les frais du 2ème trimestre s'élèvent à 45 000 FCFA, payables avant le 15 Janvier. Vous pouvez régler à l'économat ou via mobile money au 07 00 00 00. Cordialement.",
    date: '20 Jan 2024',
  },
]
