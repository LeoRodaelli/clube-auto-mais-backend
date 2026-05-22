# Próximas Tarefas do Backend

## [Backend] Criar repositório backend vazio
**Prioridade:** Alta

### Descrição
Criar repo separado para o backend dentro do workspace.

### Critérios de aceite
- [ ] Repo criado no GitHub.
- [ ] Pasta clonada dentro do workspace.
- [ ] `docs/` criado.
- [ ] `AGENTS.md`, `CLAUDE.md`, `.env.example` e `.cursorignore` adicionados.
- [ ] Commit inicial enviado.

---

## [Backend] Confirmar documentação oficial da API Siprov
**Prioridade:** Alta

### Descrição
Antes de codar integração real, obter documentação oficial e credenciais de homologação.

### Critérios de aceite
- [ ] URL base confirmada.
- [ ] Método de autenticação confirmado.
- [ ] Endpoint de leads confirmado.
- [ ] Endpoint de login confirmado ou marcado como indisponível.
- [ ] Endpoint de boletos confirmado ou marcado como indisponível.
- [ ] Ambiente sandbox/homologação confirmado.

---

## [Backend] Criar BFF mínimo
**Prioridade:** Alta

### Descrição
Criar backend intermediário para proteger credenciais do Siprov.

### Critérios de aceite
- [ ] Stack definida.
- [ ] Endpoint `/health` criado.
- [ ] CORS restrito ao domínio do frontend.
- [ ] Variáveis de ambiente configuradas.
- [ ] Estrutura de pastas inicial criada.

---

## [Backend] Implementar endpoint de leads
**Prioridade:** Alta

### Descrição
Criar `POST /api/leads` para receber formulários do frontend e repassar ao Siprov.

### Critérios de aceite
- [ ] Validação de payload.
- [ ] Tratamento de erros.
- [ ] Logs sem expor dados sensíveis.
- [ ] Integração com Siprov ou mock controlado se credenciais ainda não existirem.
- [ ] Resposta padronizada para o frontend.

---

## [Frontend/Backend] Integrar formulários ao BFF
**Prioridade:** Alta

### Descrição
Substituir mocks dos formulários por chamada real ao backend.

### Critérios de aceite
- [ ] Formulário de Contato envia dados.
- [ ] Formulário Seja um Parceiro envia dados.
- [ ] Loading e feedback visual mantidos.
- [ ] Erros tratados sem quebrar UX.
