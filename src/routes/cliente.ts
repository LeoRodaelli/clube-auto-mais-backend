import type { FastifyInstance, FastifyReply } from 'fastify'
import { clienteLoginSchema } from '../schemas/cliente.js'
import { searchAssociado } from '../services/siprov/associados.js'
import { searchTitulos, getBoleto, emitirBoleto, emitirPix } from '../services/siprov/financeiro.js'
import { SiprovApiError } from '../services/siprov/client.js'
import { env } from '../config.js'
import { createHmac } from 'crypto'

// Sessão simples: token HMAC assinado com SESSION_SECRET
// Não exige banco — o estado fica no token
function signSession(codPessoa: number): string {
  const payload = `${codPessoa}:${Date.now() + env.SESSION_TTL_SECONDS * 1000}`
  const sig = createHmac('sha256', env.SESSION_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}.${sig}`).toString('base64url')
}

function verifySession(token: string): number | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const lastDot = decoded.lastIndexOf('.')
    const payload = decoded.slice(0, lastDot)
    const sig = decoded.slice(lastDot + 1)
    const expected = createHmac('sha256', env.SESSION_SECRET).update(payload).digest('hex')
    if (sig !== expected) return null

    const [codPessoaStr, expiresAtStr] = payload.split(':')
    if (Date.now() > Number(expiresAtStr)) return null
    return Number(codPessoaStr)
  } catch {
    return null
  }
}

function requireSession(req: { headers: Record<string, string | string[] | undefined> }, reply: FastifyReply): number | null {
  const authHeader = req.headers['authorization']
  const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null
  if (!token) {
    reply.status(401).send({ error: 'Não autorizado', message: 'Sessão inválida ou expirada.' })
    return null
  }
  const codPessoa = verifySession(token)
  if (!codPessoa) {
    reply.status(401).send({ error: 'Não autorizado', message: 'Sessão inválida ou expirada.' })
    return null
  }
  return codPessoa
}

export async function clienteRoutes(app: FastifyInstance) {
  // POST /api/cliente/login — busca associado pelo CPF e emite sessão
  app.post('/api/cliente/login', async (req, reply) => {
    const parsed = clienteLoginSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    const { cpf } = parsed.data

    try {
      const result = await searchAssociado({ cpf })
      // Normaliza: a API pode retornar array ou objeto com .itens
      const itens = Array.isArray(result) ? result : (result.itens ?? [])

      if (!itens.length) {
        return reply.status(404).send({
          error: 'Associado não encontrado',
          message: 'CPF não encontrado em nossa base. Verifique e tente novamente.',
        })
      }

      const associado = itens[0]
      const sessionToken = signSession(associado.codPessoa)

      return reply.send({
        ok: true,
        sessionToken,
        nome: associado.nome,
        // Não retornar CPF nem dados sensíveis aqui
      })
    } catch (err) {
      if (err instanceof SiprovApiError) {
        return reply.status(502).send({ error: 'Erro ao consultar associado.' })
      }
      return reply.status(500).send({ error: 'Erro interno.' })
    }
  })

  // GET /api/cliente/perfil — dados do associado logado
  app.get('/api/cliente/perfil', async (req, reply) => {
    const codPessoa = requireSession(req as any, reply)
    if (!codPessoa) return

    try {
      const result = await searchAssociado({ codPessoa })
      const itens = Array.isArray(result) ? result : (result.itens ?? [])

      if (!itens.length) {
        return reply.status(404).send({ error: 'Associado não encontrado.' })
      }

      const { nome, email, telefone, beneficios } = itens[0]
      return reply.send({ nome, email, telefone, beneficios })
    } catch {
      return reply.status(500).send({ error: 'Erro interno.' })
    }
  })

  // GET /api/cliente/boletos — lista títulos financeiros do associado
  app.get('/api/cliente/boletos', async (req, reply) => {
    const codPessoa = requireSession(req as any, reply)
    if (!codPessoa) return

    try {
      const titulos = await searchTitulos({ codPessoa })

      return reply.send({
        ok: true,
        total: titulos.length,
        titulos: titulos.map((t) => ({
          codTitulo: t.codTitulo,
          descricao: t.descricao,
          valor: t.valor,
          dataVencimento: t.dataVencimento,
          situacao: t.situacao,
        })),
      })
    } catch {
      return reply.status(500).send({ error: 'Erro ao buscar boletos.' })
    }
  })

  // GET /api/cliente/boletos/:codTitulo — linha digitável e PDF de um boleto
  app.get('/api/cliente/boletos/:codTitulo', async (req, reply) => {
    const codPessoa = requireSession(req as any, reply)
    if (!codPessoa) return

    const { codTitulo } = req.params as { codTitulo: string }

    try {
      const boleto = await getBoleto(Number(codTitulo))
      return reply.send({ ok: true, boleto })
    } catch (err) {
      if (err instanceof SiprovApiError && err.status === 404) {
        return reply.status(404).send({ error: 'Boleto não encontrado.' })
      }
      return reply.status(500).send({ error: 'Erro ao buscar boleto.' })
    }
  })

  // POST /api/cliente/boletos/:codTitulo/emitir — emite (ou re-emite) o boleto
  app.post('/api/cliente/boletos/:codTitulo/emitir', async (req, reply) => {
    const codPessoa = requireSession(req as any, reply)
    if (!codPessoa) return

    const { codTitulo } = req.params as { codTitulo: string }

    try {
      const boleto = await emitirBoleto(Number(codTitulo))
      return reply.status(201).send({ ok: true, boleto })
    } catch {
      return reply.status(500).send({ error: 'Erro ao emitir boleto.' })
    }
  })

  // POST /api/cliente/boletos/:codTitulo/pix — emite PIX para um título
  app.post('/api/cliente/boletos/:codTitulo/pix', async (req, reply) => {
    const codPessoa = requireSession(req as any, reply)
    if (!codPessoa) return

    const { codTitulo } = req.params as { codTitulo: string }

    try {
      const pix = await emitirPix(Number(codTitulo))
      return reply.status(201).send({ ok: true, pix })
    } catch {
      return reply.status(500).send({ error: 'Erro ao emitir PIX.' })
    }
  })
}
