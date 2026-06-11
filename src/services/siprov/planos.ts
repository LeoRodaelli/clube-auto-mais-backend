import { siprovRequest } from './client.js'
import { getSiprovMeta } from './auth.js'

export interface Plano {
  codPlano: number
  nome: string
  [key: string]: unknown
}

// Retorna os planos que o usuário da API tem permissão para comercializar
// Esses planos vêm direto da resposta de autenticação (sem custo de request extra)
export function getPlanosCadastrados(): Plano[] {
  const { plano } = getSiprovMeta()
  return plano
}

// Unidades/lojas disponíveis para vínculo de benefício
export async function getUnidades() {
  return siprovRequest<Array<{ codLoja: number; nome: string }>>('/ext/administracao/loja')
}

// Vendedores disponíveis (para atribuir ao lead/negócio)
export async function getVendedores() {
  return siprovRequest<Array<{ codVendedor: number; nome: string }>>('/ext/administracao/vendedor')
}
