import { env } from '../../config.js'

// Token Siprov dura 12h. Renovamos 30 min antes para nunca servir um token expirado.
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000
const REFRESH_BEFORE_MS = 30 * 60 * 1000

interface SiprovAuthResponse {
  authorizationToken: string
  codUsuario: number
  nomeUsuario: string
  codClienteSiprov: number
  nomeClienteSiprov: string
  permissaoLoja: Array<{ codLoja: number; nome: string }>
  plano?: Array<{ codPlano: number; nome: string }>
}

interface TokenCache {
  token: string
  expiresAt: number
  codClienteSiprov: number
  permissaoLoja: Array<{ codLoja: number; nome: string }>
  plano: Array<{ codPlano: number; nome: string }>
}

let cache: TokenCache | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null

async function fetchToken(): Promise<TokenCache> {
  const credentials = Buffer.from(`${env.SIPROV_USERNAME}:${env.SIPROV_PASSWORD}`).toString('base64')

  const res = await fetch(`${env.SIPROV_BASE_URL}/ext/autenticacao`, {
    method: 'POST',
    headers: {
      // Nota: a doc oficial diz "text/plain" mas a API real exige "application/json"
      accept: 'application/json',
      authorization: `Basic ${credentials}`,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Siprov auth falhou (${res.status}): ${body}`)
  }

  const data = (await res.json()) as SiprovAuthResponse

  return {
    token: data.authorizationToken,
    expiresAt: Date.now() + TOKEN_TTL_MS,
    codClienteSiprov: data.codClienteSiprov,
    permissaoLoja: data.permissaoLoja ?? [],
    plano: data.plano ?? [],
  }
}

function scheduleRefresh(expiresAt: number) {
  if (refreshTimer) clearTimeout(refreshTimer)

  const delay = expiresAt - Date.now() - REFRESH_BEFORE_MS
  // Nunca agendar com delay negativo; renovar imediatamente nesse caso
  refreshTimer = setTimeout(
    async () => {
      try {
        cache = await fetchToken()
        scheduleRefresh(cache.expiresAt)
        console.info('[Siprov] Token renovado com sucesso.')
      } catch (err) {
        console.error('[Siprov] Falha ao renovar token:', err)
        // Tenta novamente em 1 minuto
        refreshTimer = setTimeout(() => scheduleRefresh(Date.now()), 60_000)
      }
    },
    Math.max(delay, 0),
  )
}

export async function initSiprovAuth(maxRetries = 5): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      cache = await fetchToken()
      scheduleRefresh(cache.expiresAt)
      console.info('[Siprov] Autenticado com sucesso. Token válido por 12h.')
      return
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const is429 = message.includes('429')
      if (is429 && attempt < maxRetries) {
        const waitSec = attempt * 15
        console.warn(`[Siprov] Rate limit atingido. Tentativa ${attempt}/${maxRetries}. Aguardando ${waitSec}s...`)
        await new Promise((r) => setTimeout(r, waitSec * 1000))
      } else {
        throw err
      }
    }
  }
}

export function getSiprovToken(): string {
  if (!cache) throw new Error('SiprovAuth não inicializado. Chame initSiprovAuth() no boot.')
  if (Date.now() >= cache.expiresAt) throw new Error('Token Siprov expirado. Aguardando renovação.')
  return cache.token
}

export function getSiprovMeta() {
  if (!cache) throw new Error('SiprovAuth não inicializado.')
  return {
    codClienteSiprov: cache.codClienteSiprov,
    permissaoLoja: cache.permissaoLoja,
    plano: cache.plano,
  }
}
