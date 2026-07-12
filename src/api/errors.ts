export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (typeof error.body === 'object' && error.body !== null) {
      const body = error.body as Record<string, unknown>
      if (typeof body.message === 'string') return body.message
      if (typeof body.error === 'string') return body.error
    }
    if (error.status === 401) return 'Identifiants incorrects'
    if (error.status === 0) return 'Connexion impossible. Vérifiez votre réseau.'
    return error.message || 'Une erreur est survenue'
  }
  if (error instanceof Error) return error.message
  return 'Une erreur est survenue'
}
