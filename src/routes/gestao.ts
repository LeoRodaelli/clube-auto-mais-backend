import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { createHmac } from 'crypto'
import { env } from '../config.js'
import { searchAssociado } from '../services/siprov/associados.js'
import { siprovRequest, SiprovApiError } from '../services/siprov/client.js'
import { searchTitulos, emitirBoleto, emitirPix } from '../services/siprov/financeiro.js'

// ── Sessão ────────────────────────────────────────────────────────────────────

const GESTAO_PREFIX = 'gestor'
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000 // 8h

function signToken(): string {
  const payload = `${GESTAO_PREFIX}:${Date.now() + TOKEN_TTL_MS}`
  const sig = createHmac('sha256', env.SESSION_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastDot = decoded.lastIndexOf('.')
    const payload = decoded.slice(0, lastDot)
    const sig = decoded.slice(lastDot + 1)
    const expected = createHmac('sha256', env.SESSION_SECRET).update(payload).digest('hex')
    if (sig !== expected) return false
    const [prefix, expiresAtStr] = payload.split(':')
    if (prefix !== GESTAO_PREFIX) return false
    return Date.now() <= Number(expiresAtStr)
  } catch {
    return false
  }
}

function requireAuth(req: FastifyRequest, reply: FastifyReply): boolean {
  const authHeader = req.headers['authorization']
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null
  if (!token || !verifyToken(token)) {
    reply.status(401).send({ error: 'Não autorizado', message: 'Sessão inválida ou expirada.' })
    return false
  }
  return true
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  usuario: z.string().min(1),
  senha: z.string().min(1),
})

const searchSchema = z.object({
  nome: z.string().optional(),
  cpf: z.string().optional(),
  situacaoBeneficio: z.enum(['ATIVO', 'INATIVO', 'CANCELADO', 'INADIMPLENTE', 'PENDENTE']).optional(),
  placa: z.string().optional(),
  chassi: z.string().optional(),
  pagina: z.coerce.number().default(1),
})

const SITUACOES = ['ATIVO', 'INATIVO', 'CANCELADO', 'INADIMPLENTE', 'PENDENTE'] as const

// ── Rotas ─────────────────────────────────────────────────────────────────────

export async function gestaoRoutes(app: FastifyInstance) {

  // POST /api/gestao/login
  app.post('/api/gestao/login', async (req, reply) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Dados inválidos' })
    }
    const { usuario, senha } = parsed.data
    // Delay fixo para mitigar timing attacks e brute-force
    await new Promise(r => setTimeout(r, 200 + Math.random() * 150))
    if (usuario !== env.GESTAO_USERNAME || senha !== env.GESTAO_PASSWORD) {
      return reply.status(401).send({ error: 'Credenciais inválidas', message: 'Usuário ou senha incorretos.' })
    }
    return reply.send({ ok: true, token: signToken(), nome: env.GESTAO_NOME })
  })

  // GET /api/gestao/me
  app.get('/api/gestao/me', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    return reply.send({ ok: true, nome: env.GESTAO_NOME })
  })

  // GET /api/gestao/dashboard — stats para a tela inicial
  app.get('/api/gestao/dashboard', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    try {
      const [loja, ...contagens] = await Promise.all([
        siprovRequest<Array<{ id: number; nome: string }>>('/ext/administracao/loja'),
        ...SITUACOES.map(sit =>
          searchAssociado({ situacaoBeneficio: sit } as any)
            .then((r: any) => ({ sit, qtd: r.quantidade ?? 0 }))
            .catch(() => ({ sit, qtd: 0 }))
        ),
      ])
      const stats = Object.fromEntries(contagens.map(({ sit, qtd }) => [sit, qtd]))
      return reply.send({ ok: true, loja: loja[0] ?? null, stats })
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro no dashboard')
      return reply.status(500).send({ error: 'Erro ao carregar dashboard.' })
    }
  })

  // GET /api/gestao/associados — busca paginada
  app.get('/api/gestao/associados', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    const parsed = searchSchema.safeParse(req.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Parâmetros inválidos', details: parsed.error.flatten().fieldErrors })
    }
    const { pagina, ...filters } = parsed.data
    const hasFilter = Object.values(filters).some(v => v !== undefined)
    if (!hasFilter) {
      return reply.status(400).send({ error: 'Informe ao menos um filtro (nome, CPF, situação, placa ou chassi).' })
    }
    try {
      const result = await searchAssociado({ ...filters, pagina } as any)
      return reply.send(result)
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro ao buscar associados')
      if (err instanceof SiprovApiError) {
        return reply.status(502).send({ error: 'Erro ao consultar o Siprov.' })
      }
      return reply.status(500).send({ error: 'Erro interno.' })
    }
  })

  // GET /api/gestao/associados/:codPessoa — detalhe
  app.get('/api/gestao/associados/:codPessoa', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    const { codPessoa } = req.params as { codPessoa: string }
    try {
      const result = await searchAssociado({ codPessoa: Number(codPessoa) })
      const itens: any[] = Array.isArray(result) ? result : ((result as any).itens ?? [])
      if (!itens.length) {
        return reply.status(404).send({ error: 'Associado não encontrado.' })
      }
      return reply.send(itens[0])
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro ao buscar associado')
      if (err instanceof SiprovApiError) {
        return reply.status(502).send({ error: 'Erro ao consultar o Siprov.' })
      }
      return reply.status(500).send({ error: 'Erro interno.' })
    }
  })

  // GET /api/gestao/beneficio — consulta por placa/chassi
  app.get('/api/gestao/beneficio', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    const { placa, chassi, sequencial, numeroCartaoDesconto } = req.query as Record<string, string | undefined>
    if (!placa && !chassi && !sequencial && !numeroCartaoDesconto) {
      return reply.status(400).send({ error: 'Informe placa, chassi, sequencial ou numeroCartaoDesconto.' })
    }
    try {
      const data = await siprovRequest<unknown[]>('/ext/beneficio', {
        params: { placa, chassi, sequencial, numeroCartaoDesconto },
      })
      return reply.send({ ok: true, beneficios: data })
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro ao buscar benefício')
      if (err instanceof SiprovApiError) {
        return reply.status(502).send({ error: 'Erro ao consultar o Siprov.' })
      }
      return reply.status(500).send({ error: 'Erro interno.' })
    }
  })

  // GET /api/gestao/financeiro — títulos por associado
  app.get('/api/gestao/financeiro', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    const { codPessoa, tipo = 'DEBITO' } = req.query as { codPessoa?: string; tipo?: string }
    try {
      const titulos = await searchTitulos({
        ...(codPessoa ? { codPessoa: Number(codPessoa) } : {}),
        tipo,
      })
      return reply.send({ ok: true, total: titulos.length, titulos })
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro ao buscar financeiro')
      if (err instanceof SiprovApiError) {
        return reply.status(502).send({ error: 'Erro ao consultar o Siprov.' })
      }
      return reply.status(500).send({ error: 'Erro interno.' })
    }
  })

  // POST /api/gestao/financeiro/:codTitulo/boleto
  app.post('/api/gestao/financeiro/:codTitulo/boleto', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    const { codTitulo } = req.params as { codTitulo: string }
    try {
      const boleto = await emitirBoleto(Number(codTitulo))
      return reply.status(201).send({ ok: true, boleto })
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro ao emitir boleto')
      return reply.status(500).send({ error: 'Erro ao emitir boleto.' })
    }
  })

  // POST /api/gestao/financeiro/:codTitulo/pix
  app.post('/api/gestao/financeiro/:codTitulo/pix', async (req, reply) => {
    if (!requireAuth(req, reply)) return
    const { codTitulo } = req.params as { codTitulo: string }
    try {
      const pix = await emitirPix(Number(codTitulo))
      return reply.status(201).send({ ok: true, pix })
    } catch (err) {
      app.log.error({ err }, '[Gestão] Erro ao emitir PIX')
      return reply.status(500).send({ error: 'Erro ao emitir PIX.' })
    }
  })
}
