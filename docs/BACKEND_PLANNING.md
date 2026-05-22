# Planejamento do Backend Futuro

## Status
Backend ainda não implementado.

## Objetivo
Criar um backend intermediário seguro (BFF — Backend for Frontend) para conectar o frontend do Clube Auto+ à API do Siprov sem expor tokens, secret keys ou credenciais no navegador.

## Responsabilidades esperadas
1. Receber requisições do frontend.
2. Validar dados de formulários.
3. Proteger credenciais do Siprov em variáveis de ambiente no servidor.
4. Repassar chamadas para a API do Siprov.
5. Normalizar respostas para o frontend.
6. Tratar erros com mensagens seguras.
7. Futuramente controlar autenticação da área do cliente.
8. Futuramente listar boletos/dados do associado.
9. Futuramente suportar venda online/checkout, se o cliente aprovar.

## Stack sugerida
HIPÓTESE: Node.js + Express ou Fastify.

Motivo:
- Simples para BFF.
- Boa compatibilidade com frontend React/Vite.
- Fácil deploy em Railway, Render, Fly.io ou Vercel Serverless.
- Bom ecossistema para validação, autenticação e integração HTTP.

Alternativa: usar backend na mesma stack que o desenvolvedor preferir, desde que mantenha as regras de segurança.

## Decisão de segurança obrigatória
Se a API do Siprov exigir token fixo, secret key, usuário/senha global ou qualquer credencial sensível, as chamadas NÃO devem ser feitas diretamente pelo frontend.

Nesse caso:
frontend → backend próprio → Siprov API

## O que precisa ser confirmado antes de implementar
1. Documentação oficial da API do Siprov.
2. URL base oficial da API.
3. Método de autenticação: Bearer Token, Basic Auth, OAuth, JWT, sessão ou outro.
4. Se existe endpoint para criação de leads.
5. Se existe endpoint para autenticação de associado.
6. Se existe endpoint para listar boletos/financeiro.
7. Se existe endpoint para planos/cotações/vendas.
8. Política de CORS da API do Siprov.
9. Ambiente sandbox/homologação.
10. Limites de requisição/rate limit.
11. Formato de erro da API.
12. Se o token do Siprov é por cliente/usuário ou global.

## O que não deve ser inventado
- Não criar schema definitivo de banco sem confirmação.
- Não criar endpoints finais sem documentação oficial do Siprov.
- Não expor token do Siprov no frontend.
- Não implementar área do cliente antes de confirmar autenticação oficial.
- Não prometer venda 100% automática sem confirmar se o Siprov suporta checkout/pagamento.
