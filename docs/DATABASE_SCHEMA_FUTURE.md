# Banco de Dados Futuro

## Status
Nenhum banco implementado ainda.

## Leitura atual
Como o projeto é frontend estático e a integração prevista depende do Siprov, ainda não é obrigatório criar banco próprio.

## Quando um banco próprio será necessário
HIPÓTESE: Um banco próprio pode ser necessário se o sistema precisar:
- registrar leads antes de enviar ao Siprov;
- manter logs de integração;
- armazenar status de envio/reprocessamento;
- controlar usuários próprios;
- salvar sessões internas;
- registrar checkout ou eventos de pagamento;
- criar painel administrativo próprio.

## Entidades prováveis

### Lead
HIPÓTESE.
Campos possíveis:
- id
- tipo: contato | corretor | prestador
- nome/contato
- empresa
- documento
- email
- telefone
- cidade
- mensagem
- status_envio_siprov
- resposta_siprov
- created_at
- updated_at

### IntegrationLog
HIPÓTESE.
Campos possíveis:
- id
- provider: siprov
- endpoint
- method
- status_code
- success
- error_message
- request_id
- created_at

### CustomerSession
HIPÓTESE.
Somente se a autenticação do associado exigir sessão própria.
Campos possíveis:
- id
- customer_external_id
- session_hash
- expires_at
- created_at

## Recomendação inicial
Não criar banco no primeiro passo, a menos que a API do Siprov não confirme recebimento confiável dos leads.

Para MVP:
frontend → backend → Siprov

Para maior segurança operacional:
frontend → backend → banco leads/logs → Siprov
