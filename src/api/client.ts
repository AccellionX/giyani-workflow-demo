import type { ApiErrorBody } from './contracts'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const ROLE_KEY = 'giyani.role'
const ERROR_KEY = 'giyani.simulateApiError'

export function getStoredRole(): string {
  return localStorage.getItem(ROLE_KEY) ?? 'admin'
}

export function setStoredRole(role: string): void {
  localStorage.setItem(ROLE_KEY, role)
}

export function getSimulateApiError(): boolean {
  return localStorage.getItem(ERROR_KEY) === 'true'
}

export function setSimulateApiError(value: boolean): void {
  localStorage.setItem(ERROR_KEY, value ? 'true' : 'false')
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('X-User-Role', getStoredRole())
  if (getSimulateApiError()) {
    headers.set('X-Simulate-Error', 'true')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    let code: string | undefined
    try {
      const body = (await response.json()) as ApiErrorBody
      message = body.message || message
      code = body.code
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, response.status, code)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  })
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}
