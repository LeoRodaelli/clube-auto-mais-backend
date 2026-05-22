# Contexto do Projeto: Clube Auto+

## Nome do Projeto
Clube Auto+ | Assistência 24h Premium

## Objetivo do Projeto
Criar uma landing page/site institucional premium e de alta conversão para uma empresa de assistência veicular e residencial 24h. O objetivo é substituir o site antigo (que estava fora do ar e defasado) por uma plataforma moderna, rápida e que transmita credibilidade imediata.

## Problema que Resolve
O cliente estava com o site antigo fora do ar e perdendo oportunidades de negócio. O novo site resolve o problema de presença digital, atuando como uma vitrine profissional para captação de novos clientes, corretores parceiros e prestadores de serviço.

## Tipo de Usuário
1. **Cliente Final (B2C):** Pessoas buscando proteção veicular/residencial ou precisando de assistência imediata.
2. **Corretores (B2B):** Profissionais interessados em vender os planos do Clube Auto+.
3. **Prestadores de Serviço (B2B):** Oficinas, guinchos e chaveiros interessados em se credenciar à rede.

## Fluxo Principal do Sistema
Atualmente, o fluxo é puramente informativo e de captação de leads (Frontend estático):
1. O usuário acessa a Home e conhece os serviços.
2. Pode clicar em "Pedir Assistência" ou no botão do WhatsApp para contato imediato.
3. Pode acessar a página "Seja um Parceiro" para preencher um formulário de interesse (Corretor ou Prestador).
4. Pode clicar em "Área do Cliente", que atualmente redireciona para um sistema externo (Siprov).

## Funcionalidades Principais
* Apresentação de serviços (Assistência 24h, Proteção de Vidros, Carro Reserva, etc.).
* Formulário de captação para novos parceiros (Corretores e Prestadores).
* Botão flutuante do WhatsApp para conversão rápida.
* Redirecionamento para a Área do Cliente (Siprov).
* Design responsivo, mobile-first, com animações fluidas (Framer Motion).

## Status Geral Atual
O projeto é **100% FRONTEND**. Trata-se de uma Single Page Application (SPA) estática construída com React. **NÃO HÁ BACKEND IMPLEMENTADO NESTE MOMENTO.**

## O que está pronto
* Layout completo da Home, Serviços, Missão, Contato e Parceiros.
* Componentes de UI (Shadcn UI + Tailwind CSS).
* Roteamento client-side (Wouter).
* Animações e transições de página.
* Estrutura preparada para deploy estático (Vercel).

## O que falta
* Integração real dos formulários (atualmente apenas simulam o envio com um *toast* de sucesso).
* Backend próprio (se necessário no futuro).
* Integração com a API do Siprov (planejada para uma Fase 2).

## Pontos Críticos
* **Integração Siprov:** O cliente informou que a Siprov (sistema de gestão do clube) liberou a documentação da API. A integração dessa API transformará o site estático em uma plataforma transacional, mas isso ainda não foi iniciado.
* **Formulários:** Os dados preenchidos na página de Contato e Parceiros não estão sendo salvos em nenhum banco de dados.

## Decisões Importantes Já Tomadas
* **Stack Frontend:** React 19 + Vite + Tailwind CSS 4 + Shadcn UI.
* **Roteamento:** Utilização do `wouter` para manter o bundle leve em vez do `react-router-dom`.
* **Design System:** Foco em um design "premium" (cores sólidas, sombras suaves, tipografia bem definida) para afastar a imagem de "site barato".
* **Substituição de Páginas:** A página "Quem Somos" foi substituída pela página "Seja um Parceiro" a pedido do cliente.

## O que a próxima IA precisa saber antes de mexer no projeto
1. **ESTE PROJETO É APENAS FRONTEND.** Não procure por pastas de backend, banco de dados ou ORMs.
2. O código-fonte principal está em `/client/src`.
3. O projeto usa Tailwind CSS v4, onde as variáveis de tema estão definidas no `index.css` usando `@theme`.
4. Existe um planejamento documentado (`ANALISE_API_SIPROV.md`) para integrar a API do Siprov no futuro, mas nenhuma linha de código de integração foi escrita ainda.
5. Qualquer formulário no site atualmente usa `setTimeout` para simular um envio bem-sucedido.

> **⚠️ OBSERVAÇÃO CLARA:** Ainda não há backend implementado. O projeto é um site estático (SPA) focado em UI/UX e captação de leads via WhatsApp ou formulários simulados.


---

## Observação para Backend Futuro
Este repositório backend ainda será criado. A documentação atual é planejamento e deve ser validada com a documentação oficial e credenciais reais do Siprov antes da implementação.
