import Fastify from 'fastify'
import fastifyHelmet from '@fastify/helmet'
import fastifyCors from '@fastify/cors'
import fastifySensible from '@fastify/sensible'
import fastifyCookie from '@fastify/cookie'
import { env } from './config.js'
import { rateLimitPlugin } from './plugins/rateLimit.js'
import { healthRoutes } from './routes/health.js'
import { leadsRoutes } from './routes/leads.js'
import { clienteRoutes } from './routes/cliente.js'
import { planosRoutes } from './routes/planos.js'
import { gestaoRoutes } from './routes/gestao.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      // Em produção, Pino serializa em JSON (ideal para Railway/Render)
      ...(env.NODE_ENV === 'production'
        ? {}
        : { transport: { target: 'pino-pretty', options: { colorize: true } } }),
    },
  })

  // Segurança — registrados direto no app (sem wrapper) para os hooks serem globais
  await app.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
  await app.register(fastifyCors, {
    origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : true,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  await app.register(rateLimitPlugin)
  await app.register(fastifySensible)
  await app.register(fastifyCookie)

  // Rotas
  await app.register(healthRoutes)
  await app.register(leadsRoutes)
  await app.register(clienteRoutes)
  await app.register(planosRoutes)
  await app.register(gestaoRoutes)

  // Handler global de erros não tratados
  app.setErrorHandler((error: Error & { statusCode?: number }, _req, reply) => {
    app.log.error({ err: error }, 'Unhandled error')
    reply.status(error.statusCode ?? 500).send({
      error: 'Erro interno',
      message: env.NODE_ENV === 'development' ? error.message : 'Tente novamente em alguns instantes.',
    })
  })

  return app
}
