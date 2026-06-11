import type { FastifyInstance } from 'fastify'
import fastifyCors from '@fastify/cors'
import { env } from '../config.js'

export async function corsPlugin(app: FastifyInstance) {
  await app.register(fastifyCors, {
    // Em dev: reflete a origem do request.
    // Em produção: troque por env.FRONTEND_URL para restringir ao domínio do site.
    origin: env.NODE_ENV === 'production' ? env.FRONTEND_URL : true,
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
}
