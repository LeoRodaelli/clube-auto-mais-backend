import type { FastifyInstance, FastifyReply } from 'fastify'
import { contactoLeadSchema, parceirosLeadSchema } from '../schemas/leads.js'
import { createLead } from '../services/siprov/leads.js'
import { SiprovApiError } from '../services/siprov/client.js'

function handleSiprovError(err: unknown, reply: FastifyReply) {
  if (err instanceof SiprovApiError) {
    console.error(`[Siprov] Erro ${err.status} em ${err.endpoint}: ${err.siprovMessage}`)
    if (err.status >= 400 && err.status < 500) {
      return reply.status(422).send({
        error: 'Não foi possível registrar sua solicitação.',
        message: 'Verifique os dados e tente novamente.',
      })
    }
  } else {
    console.error('[Siprov] Erro inesperado:', err)
  }
  return reply.status(500).send({
    error: 'Erro interno',
    message: 'Tente novamente em alguns instantes.',
  })
}

export async function leadsRoutes(app: FastifyInstance) {
  // POST /api/leads/contato — formulário da página /contato
  app.post('/api/leads/contato', async (req, reply) => {
    const parsed = contactoLeadSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    const { nome, telefone, email, assunto, mensagem } = parsed.data

    try {
      const result = await createLead({
        nome,
        telefone,
        email,
        mensagem: assunto && mensagem ? `${assunto}: ${mensagem}` : (mensagem ?? assunto),
        origem: 'site-contato',
      })

      return reply.status(201).send({
        ok: true,
        codPessoa: result.codPessoa,
        message: 'Mensagem recebida. Nossa equipe entrará em contato em breve.',
      })
    } catch (err) {
      return handleSiprovError(err, reply)
    }
  })

  // POST /api/leads/parceiros — formulário da página /parceiros
  app.post('/api/leads/parceiros', async (req, reply) => {
    const parsed = parceirosLeadSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    const { tipo, contato, empresa, documento, email, telefone, cidade, mensagem } = parsed.data

    try {
      const result = await createLead({
        nome: contato,
        telefone,
        email,
        empresa,
        documento,
        cidade,
        mensagem,
        origem: `site-parceiro-${tipo}`,
      })

      return reply.status(201).send({
        ok: true,
        codPessoa: result.codPessoa,
        message: 'Solicitação recebida. Nossa equipe comercial entrará em contato em breve.',
      })
    } catch (err) {
      return handleSiprovError(err, reply)
    }
  })
}
