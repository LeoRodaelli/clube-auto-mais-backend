# AGENTS.md — Backend Clube Auto+

Você está trabalhando no futuro backend/BFF do projeto Clube Auto+.

## Contexto
O frontend já existe em outro repositório. Este backend deve servir como camada segura entre o frontend e a API do Siprov.

## Regras críticas
1. Não expor tokens, secret keys ou credenciais do Siprov no frontend.
2. Não inventar endpoints oficiais do Siprov.
3. Marcar como HIPÓTESE tudo que não estiver confirmado na documentação oficial.
4. Implementar primeiro um BFF mínimo e seguro.
5. Manter integração pequena e testável.
6. Não criar banco próprio sem necessidade clara.
7. Se criar banco, documentar em `docs/DATABASE_SCHEMA_FUTURE.md`.

## Antes de alterar código
Leia:
- `docs/PROJECT_CONTEXT.md`
- `docs/BACKEND_PLANNING.md`
- `docs/SIPROV_INTEGRATION_PLAN.md`
- `docs/API_CONTRACT_FUTURE.md`
- `docs/BACKEND_NEXT_TASKS.md`

## Fluxo de trabalho
1. Entender a tarefa.
2. Validar se é fato, hipótese ou informação faltante.
3. Propor plano curto.
4. Listar arquivos que pretende alterar.
5. Implementar somente após confirmação.
6. Atualizar documentação quando criar endpoint, regra, env ou decisão técnica.
