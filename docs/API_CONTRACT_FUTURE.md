# Contratos de API (Futuro)

> **⚠️ AVISO:** Este documento contém **HIPÓTESES** baseadas na análise preliminar da documentação da API do Siprov e nas necessidades atuais do frontend. Nenhum destes endpoints está implementado ou consumido no código atual.

## Endpoints Provavelmente Necessários no Futuro

### 1. Captação de Leads (Contato e Parceiros)
**HIPÓTESE:** Será necessário um endpoint para receber os dados dos formulários e injetá-los no CRM do Siprov ou em um banco de dados próprio.

* **Rota Sugerida:** `POST /api/leads`
* **Dados enviados pelo formulário de Parceiros:**
  ```json
  {
    "tipo": "corretor" | "prestador",
    "empresa": "string",
    "contato": "string",
    "documento": "string (CPF/CNPJ)",
    "email": "string",
    "telefone": "string",
    "cidade": "string",
    "mensagem": "string (opcional)"
  }
  ```

### 2. Autenticação de Cliente (Área do Cliente)
**HIPÓTESE:** Para trazer a Área do Cliente para dentro do site, será necessário autenticar o usuário na API do Siprov.

* **Rota Sugerida:** `POST /api/auth/login`
* **Dados enviados:**
  ```json
  {
    "cpf": "string",
    "senha": "string"
  }
  ```
* **Retorno esperado:** Token JWT ou Session ID válido para requisições subsequentes.

### 3. Dados do Cliente e Boletos
**HIPÓTESE:** Após o login, a tela da Área do Cliente precisará buscar os dados do plano e a situação financeira.

* **Rota Sugerida:** `GET /api/cliente/boletos`
* **Headers:** `Authorization: Bearer <token>`
* **Retorno esperado:**
  ```json
  {
    "cliente": { "nome": "string", "plano": "string", "status": "ativo" },
    "boletos": [
      {
        "id": "string",
        "vencimento": "YYYY-MM-DD",
        "valor": 150.00,
        "status": "pendente" | "pago",
        "link_pdf": "string",
        "linha_digitavel": "string"
      }
    ]
  }
  ```

### 4. Venda Online (E-commerce)
**HIPÓTESE:** Se o cliente aprovar a Fase 2 (Venda Online), será necessário um fluxo complexo de endpoints para cotar, cadastrar cliente, cadastrar veículo e gerar cobrança via API do Siprov.

* **Rotas Sugeridas:**
  * `GET /api/planos` (Listar planos disponíveis)
  * `POST /api/vendas/checkout` (Enviar dados completos do cliente e veículo)
  * `GET /api/vendas/pagamento/{id}` (Retornar PIX copia e cola ou link do boleto)

## Integrações Futuras Previstas
* **Siprov API:** Integração principal para gestão de associados, veículos e financeiro.
* **Gateway de Pagamento:** Caso o Siprov não forneça o checkout transparente, pode ser necessário integrar Stripe, Asaas ou Mercado Pago.
* **Serviço de E-mail:** SendGrid, Resend ou AWS SES para envio de e-mails transacionais (confirmação de contato).


---

## Nota para backend
As rotas deste arquivo são contratos internos sugeridos para o backend próprio/BFF. Elas não devem ser confundidas automaticamente com as rotas oficiais da API do Siprov.
