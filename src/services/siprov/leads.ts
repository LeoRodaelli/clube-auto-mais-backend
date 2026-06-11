import { siprovRequest } from './client.js'

// Campos confirmados do OpenAPI: LeadInputTO
// Os campos opcionais serão preenchidos conforme testes com credenciais reais.
export interface CreateLeadInput {
  nome: string
  telefone: string
  email?: string
  // Campos adicionais mapeados pelo OpenAPI — confirmar nomes exatos via Postman
  empresa?: string
  documento?: string  // CPF ou CNPJ
  cidade?: string
  mensagem?: string
  // Origem do lead para identificar no CRM do Siprov
  origem?: string
}

export interface LeadOutput {
  codPessoa: number
  nome: string
  [key: string]: unknown
}

export async function createLead(input: CreateLeadInput): Promise<LeadOutput> {
  return siprovRequest<LeadOutput>('/ext/crm/lead', {
    method: 'POST',
    body: input,
  })
}
