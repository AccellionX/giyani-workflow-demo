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

function buildHeaders(options: RequestInit): Headers {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }
  headers.set('X-User-Role', getStoredRole())
  if (getSimulateApiError()) {
    headers.set('X-Simulate-Error', 'true')
  }
  return headers
}

function isMockMode(): boolean {
  return !import.meta.env.VITE_API_BASE_URL
}

function looksLikeHtml(contentType: string, bodyPreview: string): boolean {
  if (contentType.includes('text/html')) return true
  const trimmed = bodyPreview.trimStart().toLowerCase()
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html')
}

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  const text = await response.text()

  if (looksLikeHtml(contentType, text)) {
    throw new ApiError(
      'API returned HTML instead of JSON. Mock layer is unavailable for this request.',
      response.status,
      'HTML_RESPONSE',
    )
  }

  let data: unknown = undefined
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      throw new ApiError('Invalid JSON response from API', response.status, 'INVALID_JSON')
    }
  }

  if (!response.ok) {
    const body = data as ApiErrorBody | undefined
    throw new ApiError(
      body?.message || `Request failed (${response.status})`,
      response.status,
      body?.code,
    )
  }

  return data as T
}

async function resolveWithHandlers<T>(
  url: string,
  init: RequestInit,
): Promise<T> {
  const [{ getResponse }, { handlers }] = await Promise.all([
    import('msw'),
    import('@/mocks/handlers'),
  ])
  const request = new Request(url, init)
  const response = await getResponse(handlers, request)
  if (!response) {
    throw new ApiError(`No mock handler for ${url}`, 404, 'NO_HANDLER')
  }
  return readJson<T>(response)
}

export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = buildHeaders(options)
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin).toString()
  const init: RequestInit = {
    ...options,
    headers,
  }

  if (!isMockMode()) {
    const response = await fetch(url, init)
    return readJson<T>(response)
  }

  // Prefer the MSW service worker when it is controlling the page.
  // If the host SPA-fallback returns HTML (common before SW activation / on
  // some static hosts), resolve the same handlers in-process via getResponse.
  try {
    const response = await fetch(url, init)
    const preview = await response.clone().text()
    const contentType = response.headers.get('content-type') ?? ''

    if (!looksLikeHtml(contentType, preview)) {
      return readJson<T>(response)
    }
  } catch {
    // Fall through to in-process handlers.
  }

  return resolveWithHandlers<T>(url, init)
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
