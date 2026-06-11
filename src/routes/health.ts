import type { FastifyInstance } from 'fastify'
import { getSiprovMeta } from '../services/siprov/auth.js'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_req, reply) => {
    let siprovStatus = 'ok'
    try {
      getSiprovMeta() // lança se token não inicializado
    } catch {
      siprovStatus = 'token_not_ready'
    }

    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      siprov: siprovStatus,
    })
  })
}
