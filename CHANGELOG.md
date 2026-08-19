# CHANGELOG.md
> Apenas mudanças sistêmicas das últimas 2 a 4 semanas.
> É proibido registrar ruído diário. Histórico antigo deve ir para CHANGELOG_ARCHIVE.md.

## Entradas Recentes

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
