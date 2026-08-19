# TASKS.md
> Apenas o sprint atual (máximo 14 dias).
> O agente DEVE atualizar este arquivo na mesma resposta em que entregar código relevante.
> Marque com [x] ao concluir. Não mantenha histórico antigo neste arquivo.

## Sprint Atual
**Objetivo do Sprint:** Multi-track (CCNA V1 / V2 / AWS SAA) jogável end-to-end; Stripe em produção fica em paralelo.

**Período:** 2026-08-14 → 2026-08-28

### Tarefas Ativas
- [x] Criar e alinhar PROMPT_BASE.md, DECISIONS.md, TASKS.md e CHANGELOG.md na raiz
- [x] Corrigir build de produção: excluir `supabase/` do typecheck do Next (`tsconfig.json`)
- [x] Multi-track: TrackProvider + TopBar + pools Simulado/Trilha por track
- [x] Fase 3: `domains-aws.ts` (8 domínios) + Estudo dual + progresso namespaced
- [x] Fase 3: SobreProvaAws + Sobre CCNA V1/V2 + polish labels V2
- [x] Bias fino Simulado V2: mix ~30% tickets (sessão; JSON intocado)
- [x] Deploy prep: README, .env.example, vercel.json headers, npm run qa:tracks
- [x] Estudo: fluxo Conteúdo → marcar lido → Praticar (até 30) + content bank
- [x] Copy audit multi-track (Home/TopBar/Simulado/Paywall/Trilha/Estudo)
- [x] Jornada de estudo + Simulado PT/EN (detectQuestionLang + report:lang)
- [x] Trilha V2: revisão PT de 85 tickets — commit `e78fcdf`
- [x] Trilha AWS: revisão PT de 60 tickets — commit `fd4b615`
- [x] 3A.3 Trilha V1: 155 tickets curated — commit `e29d730`
- [x] 3B.1 Traditional V2: 506 explicacao_profunda em PT (bad=0)
- [x] 3B.2 Traditional AWS: 360 explicacao_profunda em PT (bad=0)
- [x] 3B.3 Traditional V1 UI pool: 949 explicacao_profunda em PT (bad=0)
- [x] AWS Trilha = cenários traditional (sem CLI); tickets_aws.json preservado
- [x] DECISIONS.md: Opção A + Opção B (Trilha AWS) + pools UI + escopo curadoria fechado 18/08/2026
- [x] Estudo AWS study_notes polish — 18/08/2026 (aws-1.1–1.12 + regen bank)
- [x] Estudo V2 study_notes polish — 18/08/2026 (todas as 17 parts v2-1.1…5.2 + regen bank)
- [x] Estudo V1 study_notes polish — 18/08/2026 (todas as 31 parts 1.1–6.5 + regen bank)
- [ ] Deploy na Vercel Hobby + rodar checklist QA pós-deploy
- [ ] Validar na Vercel os env `NEXT_PUBLIC_STRIPE_LINK_7D`, `_30D` e `_120D` (sem Sensitive) + redeploy
- [ ] Confirmar que os planos abrem `buy.stripe.com` a partir de Conta/Home/Paywall em produção
- [ ] Validar webhook Stripe → Edge Function → atualização de `profiles.pro_expires_at` (mesmo e-mail)
- [ ] Criar README curto com: trial, planos, regra do e-mail e contato
- [ ] Checklist manual pós-deploy (Home, login, trial, Trilha, Simulado, estado PRO/free)
- [ ] Deploy produção multi-track

### Em Progresso
- Nenhum

### Conteúdo / Trilha (concluído neste ciclo)
- [x] Integrar Módulo 6.0 (Automação): traditional + tickets + domains + Estudo/Simulado/Trilha
- [x] AWS SAA Foundations 1.1–1.12 (quality-pass FINAL → app)
- [x] Estudo AWS jogável + Sobre SAA
- [x] Estudo AWS study_notes polish — 18/08/2026 (todas as parts aws-1.1–1.12)
  - Fonte canônica: `aws/parts/part-aws-*-content.json` → `node scripts/gen-estudo-content.mjs` → `estudo-content-bank` + `estudo-content.ts`
  - Estrutura: O que é · Quando usar/NÃO · Exemplo de arquitetura · Armadilhas · Ligação Simulado/Trilha
  - Backup: `scripts/output/estudo_aws_content_before_polish/`
  - Questions/tickets/traditional/Trilha wiring intocados
- [x] Estudo V2 study_notes polish — 18/08/2026 (todas as 17 parts)
  - Fonte: `v2/parts/part-v2-*-content.json` → `node scripts/gen-estudo-content.mjs` → `estudo-content-bank/v2-*.json`
  - Estrutura: O que é · Quando usar/NÃO ou prova/TShoot · Exemplo · tech · Armadilhas · Ligação Simulado+Trilha CLI
  - Backup: `scripts/output/estudo_v2_content_before_polish/` (17 arquivos)
  - part_id estáveis; questions_v2_traditional / tickets_v2 / Trilha wiring intocados
- [x] Estudo V1 study_notes polish — 18/08/2026 (todas as 31 parts)
  - Fonte: `src/data/parts/part-*-content.json` → `node scripts/gen-estudo-content.mjs` → `estudo-content-bank/{1..6}.*.json`
  - Estrutura: O que é · Quando usar/NÃO ou prova/TShoot · Exemplo · tech · Armadilhas · Ligação Simulado+Trilha CLI
  - Backup: `scripts/output/estudo_v1_content_before_polish/` (31 arquivos)
  - `1.4-drill` = prática só (sem content próprio); content didático = part `1.4`
  - part_id estáveis; traditional/tickets curated / Trilha wiring intocados

### Bloqueios / Pendências
- Env Stripe em produção já falhou uma vez (“link não configurado”)
- Webhook depende de e-mail idêntico entre checkout e profile

---
**Instrução para o agente:**  
Ao concluir uma tarefa, marque [x] na mesma resposta.  
Se a mudança for sistêmica, atualize também o CHANGELOG.md.
