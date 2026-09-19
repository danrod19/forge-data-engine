# CHANGELOG.md
> Apenas mudanças sistêmicas das últimas 2 a 4 semanas.
> É proibido registrar ruído diário. Histórico antigo deve ir para CHANGELOG_ARCHIVE.md.

## Entradas Recentes

- **2026-09-19** — Bugs CCNA Estudo + tickets 143/144 (auditoria PRO)
  - Estudo: após responder, mesmo bloco do Simulado (`Explicacao` + “Resposta correta” se errar + paywall se `isPremium && !isPro`). Wrapper sem AnimatePresence/`opacity: 0` (explicação não some). `Explicacao` deixa de iniciar invisível.
  - Header Estudo: `#id` do JSON (`5.1 · #12`); N/M só na linha “Progresso”. 5.1/6.1 nunca `#` vazio.
  - Trilha V1 `#143`/`#144` (`tickets_module6.json` ids 13–14): `cli_output` reescrito com `hostname#` + show/logging IOS; alternativas/gabarito intactos
  - Sem Stripe / PWA / AWS / Auth / deploy

- **2026-09-19** — Bugs AWS (auditoria 18/09): stems, IDs, Estudo
  - Banco: `questions_aws_traditional.json` 360 + `tickets_aws.json` 60 (tickets sem corte)
  - Stems corrigidos (14): 12, 30, 54, 90, 120, 150, 180, 210, 240, 270, 300, 322, 330, 360 — heading “Resumo …:”, colon incompleto, `…` no meio da frase IAM; alternativas/`resposta_correta` intactos
  - Explicações: 0 reescritas (min 285 chars; sem template “For this item” / “the other options misstate”)
  - IDs JSON: 0 (já 1–360 + `part_id` aws-1.x). UI: `formatQuestionId` AWS nunca `#` vazio → `AWS-1.3 · #184`
  - Estudo: `isAwsPracticeReady` no filtro por domínio — item mostrado tem enunciado completo + `explicacao_profunda` após responder
  - Amostras Simulado AWS (id + 80 chars do stem):
    - `#2` aws-1.1 — `An application on Amazon EC2 must read items from DynamoDB and write objects to `
    - `#24` aws-1.1 — `A Solutions Architect must redesign credentials for an application running on Am` (stem completo 396 chars; “Am…” era corte a 80)
    - `#123` aws-1.5 — `A three-tier web app places an Application Load Balancer in public subnets and E`
    - `#150` aws-1.5 — `Qual opção resume um desenho ALB+ASG alinhado às foundations SAA-C03 para um app`
  - Sem Stripe / PWA / e-mail / JSON CCNA / deploy

- **2026-09-17** — E-mail transacional mínimo (Resend)
  - Pagamento: 1 e-mail após `checkout.session.completed` (mesmo handler que marca PRO); sem chave = warn + 200
  - Idempotência por `profiles.last_mail_session_id` (Stripe `session.id`)
  - Trial < 24h: Edge Function `trial-reminder` (não dispara no request do usuário; cron no Dashboard)
  - SQL: `supabase/migrations/20260917_transactional_email.sql` (colar no SQL Editor)
  - Templates: `src/lib/email/templates.ts`; From `RESEND_FROM` / Reply-To `ccnaforge19@gmail.com`

- **2026-09-17** — PWA instalável (Android Chrome + iOS Safari)
  - `public/manifest.webmanifest` (name CCNA Forge, standalone, theme `#22c55e`, fundo slate-950)
  - Ícones PNG 192/512 + apple-touch 180 (“F” neon; sem logo Cisco)
  - SW mínimo em `public/sw.js` (só `/`, `/_next/static`, ícones, manifest; skipWaiting + clientsClaim)
  - Banner “Instalar app” via `beforeinstallprompt`; tip iOS dismiss `ccna-forge-pwa-tip-v1`
  - Sem push, sem cache de API/webhook/Auth/JSON de questões

- **2026-09-14** — Histórico persistente de simulados (`simulado_attempts`)
  - INSERT ao terminar simulado logado (anti-dupe da sessão; anônimo skip)
  - Conta: últimas 10 linhas, % com cores do resultado, vazio/erro explícitos
  - SQL: `supabase/migrations/20260914_simulado_attempts.sql` (colar no SQL Editor)
  - Tracks canônicos `ccna1` | `ccna2` | `aws`; sem UPDATE/DELETE no client

- **2026-09-14** — Estudo: explicação visível + ID estável no header
  - Estudo sempre monta `Explicacao` após responder (blur+CTA se `isPremium && !isPro`); sem campo → “Sem explicação neste item”
  - `Explicacao` não usa mais `height: 0` + `overflow-hidden` (podia ficar mudo no Estudo)
  - Header Trilha/Simulado/Estudo: `formatQuestionId` (`V2-2.2 · #121`); `#` decorativo no enunciado removido
  - Simulado V2 deixa de renumerar `id` da sessão (mostra o id do JSON)
  - Banco intocado: Estudo V2 506/506 e V1 929/929 com `explicacao_profunda`

- **2026-09-11** — ID do banco + explicação no Estudo
  - Header Trilha/Simulado/Estudo mostra `#id` estável do JSON
  - Estudo passa a usar o bloco `Explicacao` da Trilha/Simulado (blur + CTA PRO se `isPremium` e não PRO)

- **2026-09-11** — Mobile PRO: 3 planos acionáveis (Home / Paywall / Conta)
  - Home: bloco de planos logo após o hero (não no fim da página)
  - Paywall: `flex` + scroll interno; planos no topo; cada plano é `<a href>` próprio (não `window.open` no Dialog, que no iOS caía no 120d)
  - Badge PRO no TopBar abre o paywall de renovação

- **2026-09-11** — Planos 7/30/120 sempre visíveis
  - Home e Paywall deixavam de renderizar `ProPlans` com PRO efetivo (ex.: trial 24h ativo)
  - `ProPlans` / `getStripePlans` não filtram por `trial_used`; os 3 botões (R$ 6,90 / 20,90 / 57,90) listam sempre

- **2026-09-11** — Copy de lançamento (Sobre + Upgrade/paywall)
  - Parágrafo único em `launchCopy` (Sobre CCNA, Home planos, Conta desbloquear, paywall Upgrade)
  - Bullets PRO: vidas infinitas, explicações sem blur, planos 7/30/120 (sem inventar preço de 7 dias em R$)
  - Trial, blur, 3 Payment Links e e-mail `ccnaforge19@gmail.com` mantidos

- **2026-09-11** — Histórico de simulados (Conta)
  - Tabela `public.simulado_runs` + RLS (select/insert próprio; sem update/delete no client)
  - Ao terminar simulado com sessão Auth, insert client-side; falha não bloqueia o resultado
  - Conta lista as últimas 20 corridas; deslogado não altera Trilha/Simulado

- **2026-09-10** — Auth: reset de senha + signup duplicado
  - Modal Entrar: “Esqueci a senha” → `resetPasswordForEmail` com redirectTo prod/local; copy genérica (não revela se o e-mail existe)
  - Link do e-mail abre modal “Nova senha” (`PASSWORD_RECOVERY` / `type=recovery`); sucesso “Senha atualizada”; link morto + CTA “Pedir novo link”
  - Conta (logado) usa o mesmo redirectTo e a mesma copy genérica
  - Signup com e-mail existente: copy + CTAs Entrar (e-mail pré-preenchido) e Esqueci a senha; sem segundo user e sem vazar PRO/FREE

- **2026-08-19** — Stripe/PRO E2E: descoberta + documentação (sem rearquitetura)
  - Static export mantido; webhook permanece em `supabase/functions/stripe-webhook`
  - `.env.example` + README: envs client/Edge, trial localhost, Test mode 4242, matching de e-mail
  - Código de Auth/Payment Links/Paywall já cobria ~85% do E2E; gaps restantes = ops/config

- **2026-08-19** — AWS Trilha cenários enriquecidos lote 3 — 19/08/2026 (+50; total ricos ~150)
  - +50 itens em `questions_aws_traditional.json` (lista `aws_scenarios_enrich_batch_3.json`; overlap com 1∪2 = 0)
  - Stems EN SAA-like; média do lote ~83→~262 chars; `explicacao_profunda` PT; `resposta_correta` intacta
  - Backup: `scripts/output/aws_scenarios_before_enrich_batch3.json`; lotes 1+2 intactos 100/100
  - Total enriquecidos lote1+2+3 = 150 / 360

- **2026-08-19** — AWS Trilha cenários enriquecidos lote 2 — 19/08/2026
  - +50 itens em `questions_aws_traditional.json` (lista `aws_scenarios_enrich_batch_2.json`; zero overlap com lote 1)
  - Stems EN SAA-like; média do lote ~71→~270 chars; `explicacao_profunda` PT; `resposta_correta` intacta
  - Backup: `scripts/output/aws_scenarios_before_enrich_batch2.json`; lote 1 verificado intacto
  - Total enriquecidos lote1+2 = 100 / 360

- **2026-08-19** — AWS Trilha cenários enriquecidos — 19/08/2026
  - 50 itens prioritários em `src/data/questions_aws_traditional.json` (hub Trilha via `awsTrilhaScenarios`)
  - Stems EN SAA-like (situação + requisito + restrição + decisão); média ~56→~277 chars
  - `explicacao_profunda` PT; `resposta_correta` e IDs estáveis; `tickets_aws.json` intocado
  - Backup: `scripts/output/aws_scenarios_before_enrich.json`

- **2026-08-18** — Estudo V1 study_notes polish — 18/08/2026
  - Polidas as 31 `src/data/parts/part-*-content.json` (módulos 1–6; O que é · Quando usar/NÃO ou prova/TShoot · Exemplo · tech · Armadilhas · Ligação Simulado+Trilha CLI)
  - Regen: `node scripts/gen-estudo-content.mjs` → `src/data/estudo-content-bank/{1..6}.*.json` + `estudo-content.ts`
  - Backup: `scripts/output/estudo_v1_content_before_polish/` (31 arquivos)
  - `1.4-drill` sem content próprio (prática); part_id estáveis; traditional/tickets curated intocados

- **2026-08-18** — Estudo V2 study_notes polish — 18/08/2026
  - Polidas as 17 `v2/parts/part-v2-*-content.json` (O que é · Quando usar/NÃO ou prova/TShoot · Exemplo · tech · Armadilhas · Ligação Simulado+Trilha CLI)
  - Regen: `node scripts/gen-estudo-content.mjs` → `src/data/estudo-content-bank/v2-*.json` + `estudo-content.ts`
  - Backup: `scripts/output/estudo_v2_content_before_polish/` (17 arquivos)
  - part_id estáveis; questions_v2_traditional / tickets_v2 / Trilha wiring intocados

- **2026-08-18** — Estudo AWS study_notes polish — 18/08/2026
  - Polidos os 12 `aws/parts/part-aws-1.1…1.12-content.json` (O que é · Quando usar/NÃO · exemplo arquitetura · armadilhas · ligação Simulado/Trilha)
  - Regen: `node scripts/gen-estudo-content.mjs` → `src/data/estudo-content-bank/aws-*.json` + `estudo-content.ts`
  - Backup pré-polish: `scripts/output/estudo_aws_content_before_polish/`
  - part_id estáveis; questions/tickets/traditional e Trilha AWS intocados

- **2026-08-18** — Estudo AWS: polish didático parts 1.7–1.9
  - `aws/parts/part-aws-1.7|1.8|1.9-content.json`: study_notes PT-BR (O que é · Quando usar/NÃO · exemplo · armadilhas · ligação Simulado/Trilha)
  - Bank UI sincronizado: `src/data/estudo-content-bank/aws-1.7|1.8|1.9.json`
  - part_id / blueprint / verb / weight estáveis; questions/tickets intocados

- **2026-08-18** — Decisão B + bloco curadoria de texto fechado (DECISIONS.md)
  - Opção A (explicações PT / enunciados EN) e Opção B (Trilha AWS = cenários) gravadas como lei
  - Tabela de escopo: tickets V1/V2/AWS + traditional V1/V2/AWS OK; próximo foco ≠ reescrita em massa

- **2026-08-18** — Trilha AWS = cenários de arquitetura (sem terminal)
  - `getTicketsPool("aws")` → `awsTrilhaScenarios` (questions_aws_traditional)
  - UI: “Cenário · Arquitetura”; TerminalCLI só em tickets CCNA
  - `tickets_aws.json` preservado (não é mais o hub da Trilha)

- **2026-08-18** — Traditional V1 UI pool: 949 explicações reescritas em PT
  - Fontes: `parts/part-1.*-questions.json` (+ drill) + `questions_module2…6_traditional.json`
  - UI: `simuladoQuestionsCurated` / `getPartQuestions` — sem `questions_traditional_FINAL.json`
  - bad=0; 2 enunciados só OCR; report `scripts/output/questions_v1_traditional_review_report.md`

- **2026-08-18** — Traditional AWS: 360 explicações reescritas em PT (Simulado/Estudo)
  - Fonte: `src/data/questions_aws_traditional.json` via `aws-banks.ts`
  - Gabarito/alternativas/enunciados intactos (bad=0); report `scripts/output/questions_aws_traditional_review_report.md`

- **2026-08-18** — Traditional V2: 506 explicações reescritas em PT (Simulado/Estudo)
  - Fonte: `src/data/questions_v2_traditional.json` via `v2-banks.ts`
  - Gabarito/alternativas/enunciados intactos (bad=0); report `scripts/output/questions_v2_traditional_review_report.md`

- **2026-08-18** — Trilha V1: 155 tickets do pool curated revisados (PT humano)
  - Fontes: `parts/part-1.1…1.6-tickets.json` + `tickets_module2…6.json`
  - UI: `getTicketsPool("ccna-v1")` → `curatedModuleTickets` (sem merge/unique/bulk)
  - bad gabarito=0; report `scripts/output/tickets_v1_trilha_review_report.md`

- **2026-08-17** — Trilha AWS: 60 tickets revisados (sintoma + explicação em PT humano)
  - Fonte: `src/data/tickets_aws.json` (UI via `getTicketsPool("aws")`)
  - Gabarito/alternativas/CLI intactos (bad=0); report `scripts/output/tickets_aws_review_report.md`

- **2026-08-17** — Trilha V2: 85 tickets revisados (sintoma + explicação em PT humano)
  - Fonte: `src/data/tickets_v2.json` (UI via `getTicketsPool("ccna-v2")`)
  - Gabarito/alternativas/CLI intactos; report em `scripts/output/tickets_v2_review_report.md`

- **2026-08-17** — Jornada de estudo + Simulado Conhecimento (PT) / Prova (EN)
  - Home: bloco “Como estudar” (Estudo → Trilha → Simulado PT → Simulado EN)
  - `question-lang.ts` + `npm run report:lang` (totais pt/en/mixed por track)
  - Simulado: 2 modos; pool filtrado; mixed entra nos dois
  - Estudo: preferência PT na prática; aviso se fallback EN
  - Sem reescrita de explicações / sem mudança de gabarito

- **2026-08-17** — Estudo com leitura + copy multi-track
  - Fluxo Estudo: Conteúdo (`study_notes`) → Marcar como lido → Praticar até 30
  - `estudo-content.ts` + bank (V1 31 · V2 17 · AWS 12); progresso `contentRead`/`lastReadAt` por track
  - Catálogo V1 vs V2 separado (`getStudyPartsForTrack`)
  - `src/data/copy.ts`: heroes Home por track (AWS sem Cisco), Simulado/Paywall/Estudo
  - JSON de questões (alternativas/respostas) intocados

- **2026-08-15** — Deploy prep multi-track (Vercel Hobby, sem Stripe)
  - README: Tracks, scripts, Deploy Vercel, checklist QA pós-deploy
  - `.env.example` (Supabase opcional; Stripe comentado) · `.gitignore` permite example
  - `vercel.json` headers de segurança · `npm run qa:tracks` imprime checklist
  - `next.config.ts` documenta static export (`out/`)

- **2026-08-15** — Simulado V2 mix ~30% troubleshooting (tickets)
  - `V2_SIMULADO_TICKET_RATIO = 0.30` em `simulado-questions.ts`
  - Sessão ccna-v2: ~70% traditional + ~30% tickets (IDs únicos, Fisher–Yates)
  - UX: CLI no Simulado para tickets, badge no resultado, labels Home/config
  - ccna-v1 e aws: sem mix (comportamento anterior)

- **2026-08-15** — Multi-track Fase 3 (Estudo AWS + Sobre SAA/V2)
  - `domains-aws.ts`: 8 domínios (Identity…Observability) a partir de parts 1.1–1.12
  - `EstudoMode` dual via `useTrack()`; progresso `ccna-forge-estudo-progress:{track}` (sem misturar)
  - `SobreProvaAws` + `SobreProva` por track (V1 clássico · V2 troubleshooting · AWS SAA)
  - Placeholders AWS removidos; polish labels V2 (Trilha, Simulado, Home)
  - JSON de questões intocados; `tsc` + `npm run build` OK

- **2026-08-14** — Reconsolidate v2 + sync app (P0+P1+P2)
  - 16 parts → traditional **477** (480−3 dedupe) · tickets **80** · free/PRO 160/317
  - `src/data/*_v2*` atualizado; loaders dinâmicos (Simulado/Trilha/Estudo)

- **2026-08-14** — Banco CCNA v2.0 como fonte primária do app
  - `questions_v2_traditional.json` + `tickets_v2.json` + `parts_index_v2.json`
  - Simulado default `v2`; Trilha e Estudo leem part_id v2; legados mantidos como fallback

- **2026-08-14** — Módulo 6.0 (Automação e Programabilidade) integrado ao app
  - `questions_module6_traditional.json` (149; 1 dedupe interno em 6.5) + merge FINAL 1185→1334
  - `tickets_module6.json` (25); Trilha curada m1–m6 (155); `tickets_all_merged` 540→565
  - Simulado chip Automação 6.0 + curated 1–6; Estudo 6.1–6.5; domains `ap-1`…`ap-5`
  - Contents em `src/data/parts/part-6.*-content.json` via `module-6-automation.ts`

- **2026-08-13** — Módulo 5.0 (Security) integrado ao app
  - `questions_module5_traditional.json` (150) + merge FINAL 1035→1185
  - `tickets_module5.json` (25); Trilha curada m1–m5 (130); `tickets_all_merged` 515→540
  - Simulado chip Segurança 5.0; Estudo 5.1–5.5; domains `sec-1`…`sec-5`

- **2026-08-13** — Módulo 4.0 (IP Services) integrado ao app
  - `questions_module4_traditional.json` (150) + merge FINAL 885→1035
  - `tickets_module4.json` (25); Trilha curada m1–m4 (105); `tickets_all_merged` 490→515
  - Simulado chip Serviços IP 4.0; Estudo 4.1–4.5; domains `svc-1`…`svc-5`

- **2026-08-12** — Módulo 3.0 (IP Connectivity) integrado ao app
  - `questions_module3_traditional.json` (150) + merge em `questions_traditional_FINAL.json` (735→885)
  - `tickets_module3.json` (25); Trilha curada m1+m2+m3 (80); `tickets_all_merged` 465→490
  - Simulado: fonte curated 1+2+3 e filtro módulo 3.0; Estudo partes 3.1–3.5; domains `ip-1`…`ip-5`

- **2026-07-30** — Build de produção: `tsconfig.json` exclui `supabase`, `out`, `.next` do typecheck do Next (Edge Functions Deno não entram no `next build`)
- **2026-07-30** — Alinhamento Context-as-Code (versão canônica)
  - PROMPT_BASE.md, DECISIONS.md, TASKS.md e CHANGELOG.md reescritos no padrão rigoroso da arquitetura
  - Ordem de precedência, travas e protected paths consolidados

- **2026-07-29** — Implantação inicial Context-as-Code
  - Criação dos quatro arquivos na raiz do repositório

- **2026-07-25/26** — Monetização PRO (MVP)
  - Trial 24h + planos por período via Payment Links
  - Edge Function de webhook + lógica de `pro_expires_at`

- **2026-07-25** — Rebalanceamento de tickets
  - Eliminação do viés de resposta A nos tickets da Trilha
