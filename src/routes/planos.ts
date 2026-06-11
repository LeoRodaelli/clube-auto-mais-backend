import type { FastifyInstance } from 'fastify'
import { getPlanosCadastrados, getUnidades } from '../services/siprov/planos.js'

export async function planosRoutes(app: FastifyInstance) {
  // GET /api/planos — planos autorizados para comercialização
  app.get('/api/planos', async (_req, reply) => {
    try {
      const planos = getPlanosCadastrados()
      return reply.send({ ok: true, planos })
    } catch {
      return reply.status(500).send({ error: 'Erro ao buscar planos.' })
    }
  })

  // GET /api/unidades — lojas/unidades disponíveis
  app.get('/api/unidades', async (_req, reply) => {
    try {
      const unidades = await getUnidades()
      return reply.send({ ok: true, unidades })
    } catch {
      return reply.status(500).send({ error: 'Erro ao buscar unidades.' })
    }
  })
}
