import { siprovRequest } from './client.js'

// GET /ext/financeiro/titulo
export interface SearchTituloParams {
  codPessoa?: number
  codBeneficio?: number
  situacao?: string
  tipo?: string  // DEBITO | CREDITO — obrigatório pela API Siprov
  dataVencimentoInicio?: string
  dataVencimentoFim?: string
  [key: string]: string | number | boolean | undefined
}

export interface TituloItem {
  codTitulo: number
  descricao: string
  valor: number
  dataVencimento: string
  situacao: string   // ex: 'PENDENTE', 'PAGO', 'CANCELADO'
  [key: string]: unknown
}

export interface BoletoOutput {
  linhaDigitavel?: string
  codigoBarras?: string
  pdfBase64?: string
  dataVencimento?: string
  valor?: number
  [key: string]: unknown
}

export interface PixOutput {
  pixCopiaECola?: string
  qrCodeBase64?: string
  dataExpiracao?: string
  valor?: number
  [key: string]: unknown
}

export async function searchTitulos(params: SearchTituloParams): Promise<TituloItem[]> {
  const data = await siprovRequest<TituloItem[] | { itens: TituloItem[] }>('/ext/financeiro/titulo', { params })
  // A API pode retornar array direto ou objeto com .itens
  return Array.isArray(data) ? data : (data.itens ?? [])
}

export async function getTitulo(codTitulo: number): Promise<TituloItem> {
  return siprovRequest<TituloItem>(`/ext/financeiro/titulo/${codTitulo}`)
}

export async function getBoleto(codTitulo: number): Promise<BoletoOutput> {
  return siprovRequest<BoletoOutput>(`/ext/financeiro/titulo/${codTitulo}/boleto`)
}

export async function emitirBoleto(codTitulo: number): Promise<BoletoOutput> {
  return siprovRequest<BoletoOutput>(`/ext/financeiro/titulo/${codTitulo}/boleto`, { method: 'POST' })
}

export async function emitirPix(codTitulo: number): Promise<PixOutput> {
  return siprovRequest<PixOutput>(`/ext/financeiro/titulo/${codTitulo}/pix`, { method: 'POST' })
}
