import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  SIPROV_BASE_URL: z.string().url().default('https://acesso.siprov.com.br/siprov-api'),
  SIPROV_USERNAME: z.string().min(1, 'SIPROV_USERNAME é obrigatório'),
  SIPROV_PASSWORD: z.string().min(1, 'SIPROV_PASSWORD é obrigatório'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET deve ter pelo menos 32 caracteres'),
  SESSION_TTL_SECONDS: z.coerce.number().default(86400),

  // Painel de Gestão — credenciais de acesso interno
  GESTAO_USERNAME: z.string().min(1, 'GESTAO_USERNAME é obrigatório'),
  GESTAO_PASSWORD: z.string().min(8, 'GESTAO_PASSWORD deve ter ao menos 8 caracteres'),
  GESTAO_NOME: z.string().default('Administrador'),
})

function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Variáveis de ambiente inválidas:')
    result.error.issues.forEach((issue) => {
      console.error(`   ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }
  return result.data
}

export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
