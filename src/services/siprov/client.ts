import { env } from '../../config.js'
import { getSiprovToken } from './auth.js'

export class SiprovApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly siprovMessage: string,
    public readonly endpoint: string,
  ) {
    super(`Siprov ${status} em ${endpoint}: ${siprovMessage}`)
    this.name = 'SiprovApiError'
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  params?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${env.SIPROV_BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

// Campos sensíveis que jamais devem aparecer em logs
const SENSITIVE_KEYS = new Set(['cpf', 'cnpj', 'senha', 'password', 'token', 'authorizationToken', 'dataNascimento'])

function sanitizeForLog(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj
  if (Array.isArray(obj)) return obj.map(sanitizeForLog)
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.has(k) ? '[REDACTED]' : sanitizeForLog(v),
    ]),
  )
}

export async function siprovRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options
  const url = buildUrl(path, params)
  const token = getSiprovToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  }

  const fetchOptions: RequestInit = { method, headers }
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body)
  }

  const res = await fetch(url, fetchOptions)

  if (!res.ok) {
    let message = res.statusText
    try {
      const errBody = await res.text()
      message = errBody || message
    } catch {
      // ignora erro ao ler body de erro
    }
    throw new SiprovApiError(res.status, message, path)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  const data = (await res.json()) as T

  if (env.NODE_ENV === 'development') {
    console.debug(`[Siprov] ${method} ${path}`, sanitizeForLog(data))
  }

  return data
}
