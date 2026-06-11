import { z } from 'zod'

export const clienteLoginSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF obrigatório')
    .max(14)
    .transform((v) => v.replace(/\D/g, '')), // remove máscara
})

export type ClienteLoginInput = z.infer<typeof clienteLoginSchema>
