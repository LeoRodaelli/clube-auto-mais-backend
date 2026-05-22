# Plano de Integração com a API Siprov

## Base da análise
Este plano foi criado a partir do arquivo `API_CONTRACT_FUTURE.md` e da análise enviada no chat. Ainda depende da documentação oficial e credenciais reais do Siprov.

## Passo Zero — Decisão arquitetural de segurança

Antes de escrever código, confirmar como a API do Siprov autentica.

Se a API usar:
- Secret Key
- Token fixo
- Usuário/senha global
- Bearer token administrativo
- Qualquer credencial sensível

Então é obrigatório criar um backend intermediário/BFF.

Fluxo correto:
```text
Frontend React → Backend próprio/BFF → API Siprov
```

Não chamar Siprov direto do navegador se houver credencial secreta.

## Passo 1 — Captação de leads

Prioridade inicial porque gera valor rápido e usa formulários já prontos.

### Objetivo
Conectar os formulários de Contato e Seja um Parceiro ao backend próprio, que repassará os dados para o Siprov ou enviará para e-mail/CRM temporário.

### Endpoint próprio sugerido
`POST /api/leads`

### Origem no frontend
- `client/src/pages/Contact.tsx`
- `client/src/pages/Partners.tsx`

### Ação técnica
Substituir o `setTimeout`/mock dos formulários por chamada HTTP real ao backend.

### Validações mínimas
- Nome obrigatório
- E-mail válido quando informado
- Telefone obrigatório
- Tipo de lead: contato, corretor ou prestador
- CPF/CNPJ com máscara e validação básica se aplicável

## Passo 2 — Autenticação da Área do Cliente

### Objetivo
Trazer a experiência da Área do Cliente para dentro do site.

### Endpoint próprio sugerido
`POST /api/auth/login`

### Requisito
Confirmar se o Siprov permite autenticar associado por CPF/senha, CPF/data de nascimento, placa, token, ou outro fluxo.

### Segurança
Preferir sessão via HttpOnly Cookie quando houver backend próprio. Evitar armazenar token sensível em localStorage.

## Passo 3 — Dashboard do Associado

### Objetivo
Após login, permitir autoatendimento.

### Endpoint próprio sugerido
`GET /api/cliente/boletos`

### Dados esperados
- Nome do associado
- Plano/status
- Boletos pendentes/pagos
- Linha digitável
- Link PDF
- PIX copia e cola, se existir

### Valor operacional
Reduzir suporte manual via WhatsApp para segunda via de boleto e dúvidas simples.

## Passo 4 — Venda online / checkout

### Objetivo
Transformar o site em canal transacional completo.

### Endpoints próprios sugeridos
- `GET /api/planos`
- `POST /api/vendas/checkout`
- `GET /api/vendas/pagamento/:id`

### Observação
Esta fase só deve começar após validar se o Siprov permite:
- cadastrar cliente
- cadastrar veículo
- ativar contrato/plano
- gerar cobrança
- confirmar pagamento
- receber webhook ou consultar status

## Ordem recomendada
1. Criar backend BFF mínimo.
2. Configurar variáveis de ambiente seguras.
3. Criar endpoint `/health`.
4. Criar endpoint `/api/leads`.
5. Integrar formulários do frontend.
6. Testar com ambiente sandbox/homologação do Siprov.
7. Criar logs seguros.
8. Só depois iniciar login/área do cliente.

## Pendência crítica
Solicitar ao cliente/Siprov:
- documentação oficial
- ambiente de teste
- credenciais de homologação
- exemplos de payload
- lista de endpoints permitidos
- política de uso/rate limit
