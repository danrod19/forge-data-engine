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

### 2026-07 — Conteúdo
**Decisão:** Simulado = `questions_traditional_FINAL.json`. Trilha = merge de tickets.  
**Motivo:** Bancos já curados.  
**Consequências:** Pipelines de curadoria são offline.

### 2026-07 — Progresso
**Decisão:** Estudo em localStorage. Identidade e PRO no Supabase.  
**Motivo:** Velocidade no MVP.

### 2026-07 — UX
**Decisão:** Tema Hacker/Terminal + mobile-first.  
**Motivo:** Identidade visual do produto.
