import { z } from 'zod'

const tipoLeadEnum = z.enum(['contato', 'corretor', 'prestador'])

export const contactoLeadSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(10, 'Telefone obrigatório'),
  email: z.string().email('E-mail inválido').optional(),
  assunto: z.string().optional(),
  mensagem: z.string().optional(),
})

export const parceirosLeadSchema = z.object({
  tipo: tipoLeadEnum,
  contato: z.string().min(2, 'Nome do responsável obrigatório'),
  empresa: z.string().min(2, 'Nome da empresa obrigatório'),
  documento: z.string().min(11, 'CPF ou CNPJ obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  mensagem: z.string().optional(),
})

export type ContactoLeadInput = z.infer<typeof contactoLeadSchema>
export type ParceirosLeadInput = z.infer<typeof parceirosLeadSchema>
