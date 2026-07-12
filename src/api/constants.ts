export type SchoolConfig = {
  code: string
  nom: string
  url: string
}

export const COLLEGE_LA_BONTE_CONFIGS: SchoolConfig[] = [
  { code: 'CLB01', nom: 'Collège La Bonte 1', url: 'https://gestion.collegelabonte.com:5443' },
  { code: 'CLB02', nom: 'Collège La Bonte 2', url: 'https://clb2.collegelabonte.com:5443' },
  { code: 'CLB03', nom: 'Collège La Bonte 3', url: 'https://clb3.collegelabonte.com:5443' },
  { code: 'CLB04', nom: 'Collège La Bonte 4', url: 'https://clb4.collegelabonte.com:5443' },
  { code: 'CLB05', nom: 'Collège La Bonte 5', url: 'https://clb5.collegelabonte.com:5443' },
]

/** Clé API technique envoyée dans l'en-tête X-API-KEY */
export const CLB_API_KEY = 'trezevuyfvyghvgvytytyfyrtyrtrresxdxfcgfcfdxzqzazatvjhbkjbkiuhiuguyfytchg'

export function findSchoolByCode(code: string): SchoolConfig | undefined {
  const normalized = code.trim().toUpperCase()
  return COLLEGE_LA_BONTE_CONFIGS.find(s => s.code.toUpperCase() === normalized)
}

export function normalizeTelephone(phone: string): string {
  return phone.replace(/\D/g, '')
}
