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
- [x] AWS Trilha cenários enriquecidos — 19/08/2026 (50 prioritários em questions_aws_traditional.json)
- [x] AWS Trilha cenários enriquecidos lote 2 — 19/08/2026 (+50; total ricos 100)
- [x] AWS Trilha cenários enriquecidos lote 3 — 19/08/2026 (+50; total ricos 150)
- [x] Stripe/PRO E2E — descoberta + docs (19/08/2026): fluxo já no código; `.env.example` + README Test mode
- [x] Auth Spec 4 — reset de senha completo (forgot no Entrar, form Nova senha no link, Conta com o mesmo redirectTo/copy)
- [x] Auth Spec 5 — signup com e-mail já existente (copy genérica + CTAs Entrar / Esqueci a senha)
- [x] Histórico de simulados na Conta (`simulado_runs` + RLS; grava no resultado se logado)
- [x] Histórico persistente `simulado_attempts` (track ccna1/ccna2/aws, 10 linhas, RLS, SQL Editor)
- [x] Copy de lançamento — Sobre a Prova + Upgrade/paywall (parágrafo + bullets PRO; e-mail ccnaforge19@gmail.com)
- [x] UI: 3 planos (7/30/120) sempre visíveis — não esconder 7d após trial/PRO
- [x] Mobile PRO ~390px: Home mostra 7/30/120; Paywall não força checkout 120d (`<a href>` por plano)
- [x] UI: ID estável `#id` no header de Trilha / Simulado / Estudo
- [x] Estudo: após responder, `Explicacao` (blur/paywall se isPremium e não PRO)
- [x] Estudo: `Explicacao` sempre após responder (mesmo bloco da Trilha/Simulado; “Sem explicação neste item” se o campo vier vazio)
- [x] Header ID: `formatQuestionId` — `#184` ou `V2-2.2 · #184`; nunca `#` vazio; Simulado V2 preserva id do banco
- [x] PWA instalável — manifest + ícones 192/512/180 + SW mínimo (estáticos) + banner Android / tip iOS
- [x] E-mail transacional mínimo (Resend): pagamento no webhook `checkout.session.completed` + trial-reminder diário (SQL colunas; sem deploy/cron neste repo)
- [x] Bugs AWS (auditoria 18/09): stems incompletos + ID visível `AWS-x.y · #n` + Estudo só mostra item com enunciado+explicação (sem Stripe/PWA/e-mail/CCNA)
- [x] Bugs CCNA (auditoria 19/09): Estudo renderiza `Explicacao` após responder; header `#id` (não N/M); tickets 143/144 CLI IOS
- [x] QA geral CCNA+AWS (19/09): scanner `qa-scan-questions.mjs`; 4683 vistos; 407 high + 96 med corrigidos; quarentena 0; V2 tickets 12/63/82 CLI IOS
- [x] Smoke V2 `#63` (20/09): já IOS (`EDGE#` / `show run` / `show hosts`); JSON não reescrito; `resposta_correta` 3
- [ ] Deploy na Vercel Hobby + rodar checklist QA pós-deploy
- [ ] Validar na Vercel os env `NEXT_PUBLIC_STRIPE_LINK_7D`, `_30D` e `_120D` (sem Sensitive) + redeploy
- [ ] Confirmar que os planos abrem `buy.stripe.com` a partir de Conta/Home/Paywall em produção
- [ ] Validar webhook Stripe → Edge Function → atualização de `profiles.pro_expires_at` (mesmo e-mail)
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
- [x] AWS Trilha cenários enriquecidos — 19/08/2026 (50 prioritários)
  - Fonte UI: `src/data/questions_aws_traditional.json` → `awsTrilhaScenarios` / `getTicketsPool("aws")`
  - Critério: score≥5 (short/dry/no constraint), exclui meta quiz, diversificado por part_id
  - Stems EN estilo SAA (situação+requisito+restrição+decisão); `explicacao_profunda` PT; `resposta_correta` intacta
  - Backup: `scripts/output/aws_scenarios_before_enrich.json`
  - `tickets_aws.json` e study notes AWS intocados
- [x] AWS Trilha cenários enriquecidos lote 2 — 19/08/2026 (+50)
  - Lista: `scripts/output/aws_scenarios_enrich_batch_2.json` (zero overlap com lote 1)
  - Backup pré-lote-2: `scripts/output/aws_scenarios_before_enrich_batch2.json`
  - Gate: 50/50; lote 1 intacto 50/50; pool 360; média enunciado lote2 ~71→~270
  - `tickets_aws.json` / study notes intocados
- [x] AWS Trilha cenários enriquecidos lote 3 — 19/08/2026 (+50; total ricos 150)
  - Lista: `scripts/output/aws_scenarios_enrich_batch_3.json` (overlap com 1∪2 = 0)
  - Backup: `scripts/output/aws_scenarios_before_enrich_batch3.json`
  - Gate: 50/50; lotes 1+2 intactos 100/100; média lote3 ~83→~262
  - `tickets_aws.json` / study notes intocados
- [x] Bugs AWS auditoria 18/09 — 19/09/2026
  - 14 stems em `questions_aws_traditional.json` (heading/OCR/`…`); tickets 0
  - IDs: 360 já numéricos; UI `AWS-1.x · #n` (nunca `#` vazio)
  - Estudo: `isAwsPracticeReady` (stem≥40 + expl≥80) em `filterQuestionsForAwsDomain`
  - Gabarito: nenhum `resposta_correta` alterado
  - `npx tsc --noEmit` ok

### Bloqueios / Pendências
- Env Stripe em produção já falhou uma vez (“link não configurado”)
- Webhook depende de e-mail idêntico entre checkout e profile

---
**Instrução para o agente:**  
Ao concluir uma tarefa, marque [x] na mesma resposta.  
Se a mudança for sistêmica, atualize também o CHANGELOG.md.
