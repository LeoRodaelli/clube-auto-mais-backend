import { buildApp } from './app.js'
import { env } from './config.js'
import { initSiprovAuth } from './services/siprov/auth.js'

async function start() {
  // 1. Autentica no Siprov antes de aceitar qualquer request
  console.info('[Boot] Autenticando no Siprov...')
  await initSiprovAuth()

  // 2. Sobe o servidor Fastify
  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    console.info(`[Boot] BFF rodando em http://0.0.0.0:${env.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
