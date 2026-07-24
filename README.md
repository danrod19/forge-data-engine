# CCNA Forge

Plataforma de estudos gamificada para a certificação **Cisco CCNA 200-301 v2.0**.

Visual **Hacker/Terminal Moderno** · Mobile First · Next.js 15 SPA

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (animações e feedback)
- **JetBrains Mono** (tipografia terminal)
- **Lucide React** (ícones)

## Funcionalidades

- **Trilha / Ticket de Suporte** — sintoma + saída CLI, 4 alternativas e explicações
- **Simulado** — banco de ~700 questões traditional, timer opcional e revisão de erros
- **Estudo por Tópicos** — 6 domínios do CCNA 200-301 com progresso e prática filtrada
- **Sobre a Prova** — guia do exame (duração, formatos, pesos, mudança v2.0)
- **Sistema de vidas** (3/5) com paywall ao zerar
- **Streak** e botão **Upgrade PRO**
- Navegação inferior: **Trilha · Simulado · Estudo · Sobre a Prova**

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Pipeline do banco de questões

```bash
npm run fix-ocr        # limpo → corrigido (OCR)
npm run build-premium  # corrigido → premium (150–200 melhores)
```

| Arquivo | Uso |
|---------|-----|
| `questions_bulk_limpo.json` | Extração bruta |
| `questions_bulk_corrigido.json` | Backup OCR corrigido |
| `questions_simulado_premium.json` | **Simulado** (preferencial) |

## Estrutura

```
src/
├── app/                  # App Router (layout + page SPA)
├── components/
│   ├── layout/           # TopBar, BottomNav
│   ├── ticket/           # TicketDeSuporte, TerminalCLI, Explicacao, PaywallModal
│   ├── simulado/         # SimuladoMode
│   ├── estudo/           # Estudo por Tópicos
│   ├── sobre/            # Sobre a Prova
│   └── ui/               # shadcn primitives
├── data/
│   ├── questions.ts              # Tickets mock
│   ├── domains.ts                # Domínios CCNA
│   ├── questions_bulk_limpo.json
│   └── questions_bulk_corrigido.json
├── types/question.ts
└── lib/
scripts/
└── fix-ocr-questions.mjs # Correção inteligente de OCR
```

## Tema

| Token        | Valor     |
|-------------|-----------|
| Background  | slate-950 |
| Accent      | #22c55e   |
| Secondary   | #22d3ee   |
| PRO / Gold  | #fbbf24   |
