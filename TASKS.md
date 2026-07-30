# TASKS.md
> Apenas o sprint atual (máximo 14 dias).
> O agente DEVE atualizar este arquivo na mesma resposta em que entregar código relevante.
> Marque com [x] ao concluir. Não mantenha histórico antigo neste arquivo.

## Sprint Atual
**Objetivo do Sprint:** Fechar monetização PRO em produção (Stripe links + webhook E2E) e consolidar a disciplina Context-as-Code.

**Período:** 2026-07-29 → 2026-08-12

### Tarefas Ativas
- [x] Criar e alinhar PROMPT_BASE.md, DECISIONS.md, TASKS.md e CHANGELOG.md na raiz
- [ ] Validar na Vercel os env `NEXT_PUBLIC_STRIPE_LINK_7D`, `_30D` e `_120D` (sem Sensitive) + redeploy
- [ ] Confirmar que os planos abrem `buy.stripe.com` a partir de Conta/Home/Paywall em produção
- [ ] Validar webhook Stripe → Edge Function → atualização de `profiles.pro_expires_at` (mesmo e-mail)
- [ ] Criar README curto com: trial, planos, regra do e-mail e contato
- [ ] Checklist manual pós-deploy (Home, login, trial, Trilha, Simulado, estado PRO/free)

### Em Progresso
- Nenhum

### Bloqueios / Pendências
- Env Stripe em produção já falhou uma vez (“link não configurado”)
- Webhook depende de e-mail idêntico entre checkout e profile

---
**Instrução para o agente:**  
Ao concluir uma tarefa, marque [x] na mesma resposta.  
Se a mudança for sistêmica, atualize também o CHANGELOG.md.
