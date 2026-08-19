# DECISIONS.md
> Lei do Stack e Decisões Arquiteturais vigentes.
> Segunda autoridade. O agente NÃO pode sugerir o que contradiz este arquivo.
> Apenas o humano pode alterar este arquivo.

## Stack Obrigatória
- TypeScript
- Next.js 15 (App Router) + React 19
- npm
- Tailwind CSS + shadcn/ui + Radix
- Framer Motion + Lucide React
- Supabase (Auth + Postgres `profiles` + Edge Functions)
- Stripe (Payment Links one-time + Webhook)
- Deploy oficial: **Vercel** + static export (`output: "export"`)
- Scripts Node em `scripts/` para higiene de conteúdo
- Python em `forge-data-engine/` apenas para pipeline offline (não runtime)

## Explicitamente Proibido
- App nativo
- Prisma ou ORM paralelo
- Backend Node/Express próprio
- Abandonar static export / SSR pesado
- Framework UI fora do stack sem decisão humana
- `service_role` ou secrets Stripe no browser
- Assinatura recorrente no MVP (planos são one-time por período)
- Inventar ou alterar gabarito/explicação em massa sem OK humano
- Tratar Cloudflare Pages como host oficial de produção

## Decisões Arquiteturais Vigentes

### 2026-07 — Static export SPA
**Decisão:** `output: "export"`; app client-side.  
**Motivo:** Simplicidade e custo baixo no MVP.  
**Consequências:** Webhook fica na Supabase Edge Function.

### 2026-07 — Deploy oficial Vercel
**Decisão:** Produção em Vercel. Cloudflare foi experimento.  
**Motivo:** Menor fricção com Next + static export.

### 2026-07 — Auth e PRO
**Decisão:** Email/senha via Supabase. Tabela `profiles` com `is_pro`, `pro_expires_at`, `trial_used_at`.  
**Motivo:** PRO por tempo + trial 1× por conta.

### 2026-07 — Monetização MVP
**Decisão:** Trial 24h + planos R$ 6,90 (7d) / 20,90 (30d) / 57,90 (120d) via Payment Links.  
**Motivo:** Entrada barata, sem assinatura recorrente.

### 2026-07 — Conteúdo (histórico; hubs atualizados em 2026-08)
**Decisão original:** Simulado = `questions_traditional_FINAL.json`; Trilha = merge de tickets.  
**Status:** Parcialmente supersedida pelo multi-track (ver **Pools da UI** abaixo). FINAL e merges permanecem no repo como volume/legado, não como hub obrigatório da UI.  
**Motivo original:** Bancos já curados.  
**Consequências:** Pipelines de curadoria continuam offline.

### 2026-07 — Progresso
**Decisão:** Estudo em localStorage. Identidade e PRO no Supabase.  
**Motivo:** Velocidade no MVP.  
**Nota 2026-08:** Progresso de Estudo namespaced por track (`ccna-forge-estudo-progress:{track}`).

### 2026-07 — UX
**Decisão:** Tema Hacker/Terminal + mobile-first.  
**Motivo:** Identidade visual do produto.

---

# Decisões de produto — CCNA Forge
Atualizado: 18/08/2026

## Idioma e explicações (Opção A) — FECHADA
- Enunciados e alternativas em inglês permanecem em inglês (modo Prova / alinhamento ao exame).
- `explicacao_profunda` é sempre em português, clara e humana (tom de professor, sem template de cursinho).
- Curadoria de texto não altera `resposta_correta` nem o sentido das alternativas (OCR só se impedir leitura).
- Classificação de idioma: `pt` | `en` | `mixed`.
- Mixed entra nos dois modos de simulado (Conhecimento PT e Prova EN). Motivo: V2 e AWS têm pouquíssimo EN puro; modo estrito esvaziaria a Prova.

## Trilha por track — FECHADA (18/08/2026)

### CCNA V1 e CCNA V2
- Trilha = tickets de troubleshooting (sintoma + CLI + 4 opções + explicação PT).
- Terminal CLI permanece no fluxo de ticket.
- Jornada CCNA: Estudo → Trilha (CLI) → Simulado.

### AWS SAA (Opção B) — FECHADA
- Trilha AWS não é hub de ticket/CLI estilo Cisco.
- Trilha AWS = cenários de arquitetura (enunciado / traditional reetiquetado como `scenario` + 4 opções + explicação PT).
- Sem TerminalCLI na Trilha AWS.
- Fonte da Trilha AWS: `questions_aws_traditional.json` via `awsTrilhaScenarios` / `getTicketsPool("aws")`.
- Arquivo `tickets_aws.json` (60 tickets com CLI) permanece no repo para uso futuro opcional (ex.: modo Incidente); não é a fonte principal da Trilha.
- Jornada AWS na copy: Estudo → Simulado → Trilha (cenários).

## Pools da UI — FECHADA
- Trilha V1: apenas pool curated (parts 1.x tickets + `tickets_module2…6`); não usar `tickets_all_merged` / `tickets_unique` como hub.
- Simulado/Estudo traditional V1: modules/parts da UI (~949); `questions_traditional_FINAL.json` não é hub obrigatório se a UI não o importa.
- Simulado/Estudo traditional V2: `questions_v2_traditional.json` via `v2-banks.ts`.
- Simulado/Estudo traditional AWS: `questions_aws_traditional.json` via `aws-banks.ts`.
- Não reabrir merge massivo de PDF nesta fase.

## Escopo de curadoria de texto — FECHADA (18/08/2026)

| Banco | Itens | Status |
|-------|------:|--------|
| Tickets V2 | 85 | OK |
| Tickets AWS (arquivo) | 60 | OK (não hub Trilha) |
| Tickets V1 Trilha | 155 | OK |
| Traditional V2 | 506 | OK |
| Traditional AWS | 360 | OK |
| Traditional V1 UI | 949 | OK |
| Trilha AWS wiring B | — | OK |

**Próximo foco de produto:** polish `study_notes`, cenários AWS mais ricos, EN real em V2/AWS, Stripe E2E — não nova reescrita em massa de gabarito.
