export type Devoir = {
  id: number
  titre: string
  description?: string
  classeId?: number
  filename?: string
  mimeType?: string
  createdAt?: string
}

export type DevoirDownload = {
  downloadUrl: string
  expiresInSeconds?: number
  filename?: string
  mimeType?: string
}
