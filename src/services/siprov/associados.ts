import { siprovRequest } from './client.js'

// Parâmetros de busca confirmados pelo OpenAPI (GET /ext/associado)
export interface SearchAssociadoParams {
  nome?: string
  cpf?: string
  cnpj?: string
  codPessoa?: number
  situacaoBeneficio?: string
  placa?: string
  chassi?: string
  [key: string]: string | number | boolean | undefined
}

export interface AssociadoItem {
  codPessoa: number
  nome: string
  cpf?: string
  cnpj?: string
  email?: string
  telefone?: string
  // Benefícios vinculados ao associado
  beneficios?: BeneficioResumido[]
  [key: string]: unknown
}

export interface BeneficioResumido {
  codBeneficio: number
  codPlano: number
  nomePlano: string
  situacao: string
  vencimento?: string
  [key: string]: unknown
}

export interface SearchAssociadoOutput {
  itens?: AssociadoItem[]
  // Pode retornar array direto conforme versão da API
  [key: string]: unknown
}

export async function searchAssociado(params: SearchAssociadoParams): Promise<SearchAssociadoOutput> {
  return siprovRequest<SearchAssociadoOutput>('/ext/associado', { params })
}
