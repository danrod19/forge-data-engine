# CCNA Forge

App **mobile-first** de preparação para certificações, visual **hacker/terminal**.

Stack: **Next.js 15** (App Router) · React 19 · Tailwind + shadcn/ui · Framer Motion · static export (`out/`).

## Tracks

| Track | Cert | Destaque no app |
|-------|------|-----------------|
| **CCNA V1** | 200-301 clássico | Módulos 1–6, seletor de fonte no Simulado |
| **CCNA V2** | 200-301 v2.0 | Trilha 100% tickets · Simulado **~30% troubleshooting** (mix tickets) |
| **AWS SAA** | SAA-C03 Foundations | Piloto parts 1.1–1.12 · Simulado + Trilha + Estudo por domínio |

Troca de track no **TopBar** · progresso / vidas / streak **namespaced** (`localStorage` por track).

## Scripts

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export → pasta out/
npx tsc --noEmit     # typecheck
npm run qa:tracks    # imprime checklist QA multi-track (manual)
```

> Com `output: "export"`, `npm start` (`next start`) **não** serve o app. Após o build, use um static server na pasta `out/` (ex.: `npx serve out`) ou faça deploy na Vercel.

### Pipeline de conteúdo (dev)

```bash
npm run fix-ocr
npm run build-premium
```

## Deploy Vercel (Hobby)

App é **static export** — sem env obrigatória para o MVP free (quiz offline via `localStorage`).

1. **Push** do repositório para GitHub/GitLab/Bitbucket.
2. [Vercel](https://vercel.com) → **Import project** · Framework Preset **Next.js** · **Root Directory** = raiz do app (onde está `package.json` / `next.config.ts`).
3. **Build Command:** `npm run build` (padrão).
4. **Output:** padrão Next — com `output: "export"` a Vercel publica a pasta **`out/`** automaticamente. Não configure SPA fallback de SPA clássica no App Router.
5. **Environment Variables:** nenhuma obrigatória no MVP free. Opcional (build-time): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — ver `.env.example`. **Stripe depois.**

Deploy → abrir a URL `*.vercel.app` e rodar o checklist abaixo.

### Headers

`vercel.json` aplica headers básicos (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). Sem rewrites que quebrem o App Router.

### Static export vs Node

| | Static export (atual) | Node runtime Vercel |
|--|----------------------|---------------------|
| Config | `output: "export"` | remover export |
| API routes / webhook no mesmo projeto | não | sim |
| Stripe checkout redirect client-side | links externos ok | + webhook Edge/Server |
| Hobby | ideal (estático) | também ok |

## QA pós-deploy (checklist)

Copie ou rode `npm run qa:tracks` no terminal.

### Viewport / shell

- [ ] Abre no mobile (viewport)
- [ ] TopBar: alternar **CCNA V1 / V2 / AWS**
- [ ] Hard refresh mantém track

### Home

- [ ] Cada track: Home mostra contagens coerentes
- [ ] V2: “Trilha 100% tickets · Simulado ~30% troubleshooting”
- [ ] AWS: labels SAA Foundations

### Simulado

- [ ] Simulado **20** questões até o resultado + review
- [ ] **CCNA V2:** ~**6** itens com CLI/tag troubleshooting numa sessão de 20
- [ ] **CCNA V1:** traditional only (sem mix de tickets)
- [ ] **AWS:** pool traditional inalterado

### Trilha

- [ ] Trilha: **3 tickets** com terminal (sintoma + CLI)
- [ ] V2: copy “Troubleshooting · v2.0”

### Estudo

- [ ] Estudo: 1 domínio/part, progresso sobe
- [ ] Trocar track **não** mistura progresso

### Sobre

- [ ] Sobre: **V1** clássico · **V2** posture · **AWS** SAA

### Vidas / paywall

- [ ] Vidas: errar reduz; zerar abre paywall visual

### localStorage (DevTools → Application)

- [ ] `ccna-forge-active-track`
- [ ] `ccna-forge-lives:ccna-v1` \| `:ccna-v2` \| `:aws`
- [ ] `ccna-forge-streak:{track}`
- [ ] `ccna-forge-estudo-progress:{track}`

### Build local (pré-deploy)

- [ ] `npx tsc --noEmit`
- [ ] `npm run build` → pasta `out/`

## Env

Ver **`.env.example`**. Copie para `.env.local` se for usar Supabase no build:

```bash
cp .env.example .env.local
```

- `.env*.local` e secrets **nunca** vão para o git (`.gitignore`).
- Stripe **não** faz parte deste deploy.

## Estrutura (resumo)

```
src/
├── app/                 # layout + page SPA
├── components/          # Home, Trilha, Simulado, Estudo, Sobre, TopBar
├── data/                # bancos por track (JSON + loaders)
├── lib/                 # track-context, estudo-progress, supabase client
└── types/
```

## Tema

| Token       | Valor    |
|------------|----------|
| Background | slate-950 |
| Accent     | #22c55e  |
| Secondary  | #22d3ee  |
| PRO / Gold | #fbbf24  |

## O que este deploy **não** inclui

- Integração Stripe (links + webhook E2E)
- Domínio custom
- Analytics (Vercel Analytics / terceiros)
- SSR / API routes no app Next (static export)
