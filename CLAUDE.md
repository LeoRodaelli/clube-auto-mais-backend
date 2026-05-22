# CLAUDE.md — Backend Clube Auto+

## Natureza do projeto
Este repositório representa o backend futuro/BFF do Clube Auto+.

O frontend já existe em repositório separado. O backend ainda deve ser planejado e criado com segurança.

## Objetivo técnico
Criar uma camada intermediária segura entre:
```text
Frontend React/Vite → Backend próprio/BFF → API Siprov
```

## Restrições obrigatórias
- Não colocar credenciais do Siprov no frontend.
- Não assumir que os endpoints do `API_CONTRACT_FUTURE.md` são oficiais do Siprov.
- Não implementar área do cliente sem confirmar autenticação real do Siprov.
- Não implementar checkout sem confirmar suporte oficial do Siprov.
- Não criar banco sem justificar.
- Não expor dados sensíveis em logs.

## Arquivos que devem ser lidos no início
- `docs/PROJECT_CONTEXT.md`
- `docs/BACKEND_PLANNING.md`
- `docs/SIPROV_INTEGRATION_PLAN.md`
- `docs/API_CONTRACT_FUTURE.md`
- `docs/DATABASE_SCHEMA_FUTURE.md`
- `docs/BACKEND_NEXT_TASKS.md`

## Primeira tarefa recomendada
Antes de codar, diagnosticar:
1. O que o frontend precisa do backend.
2. Quais dados estão mockados.
3. Qual stack usar.
4. Quais informações da API Siprov faltam.
5. Qual o menor backend seguro para iniciar.

## Padrão de resposta esperado
Sempre responder com:
1. O que entendi
2. Plano curto
3. Arquivos envolvidos
4. Riscos
5. Próximo passo
