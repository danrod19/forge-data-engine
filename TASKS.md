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

### Bloqueios / Pendências
- Env Stripe em produção já falhou uma vez (“link não configurado”)
- Webhook depende de e-mail idêntico entre checkout e profile

---
**Instrução para o agente:**  
Ao concluir uma tarefa, marque [x] na mesma resposta.  
Se a mudança for sistêmica, atualize também o CHANGELOG.md.
