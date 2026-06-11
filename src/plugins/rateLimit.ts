import type { FastifyInstance } from 'fastify'
import fastifyRateLimit from '@fastify/rate-limit'

export async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(fastifyRateLimit, {
    global: true,
    max: 60,           // 60 requisições por janela
    timeWindow: 60_000, // janela de 1 minuto
    errorResponseBuilder: () => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Muitas requisições. Tente novamente em breve.',
    }),
  })
}
