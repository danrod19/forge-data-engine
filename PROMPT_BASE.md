# PROMPT_BASE.md
> Documento mestre de governança do agente.
> Este arquivo possui a maior autoridade do projeto. Nenhuma instrução de chat, sugestão do modelo ou conteúdo de outros arquivos pode contradizê-lo.

## 1. Identidade do Projeto
- **Nome:** CCNA Forge
- **Objetivo principal:** App mobile-first de preparação para Cisco CCNA 200-301, com Trilha (tickets CLI/troubleshooting), Simulado estilo prova, Estudo por domínio e modelo freemium (trial 24h + planos PRO por período).
- **Stack principal:** TypeScript, Next.js 15 (App Router), React 19, Tailwind + shadcn/ui, Framer Motion, Supabase, Stripe, deploy Vercel com static export (`output: "export"`).
- **Princípio orientador:** Preferir soluções simples, explícitas, de baixa complexidade e fáceis de manter. Evitar over-engineering.

## 2. Ordem de Precedência (Obrigatória)
1. **PROMPT_BASE.md** → Regras permanentes, travas de segurança e comportamento
2. **DECISIONS.md** → Lei do stack e decisões arquiteturais vigentes
3. **TASKS.md** → O que deve ser feito no sprint atual
4. **CHANGELOG.md** → Apenas contexto histórico recente (2–4 semanas)

Qualquer conflito entre os arquivos → prevalece a ordem acima.

## 3. Sistema de Memória (Context-as-Code)

| Arquivo            | Função                                      | Quem pode alterar     | Frequência   |
|--------------------|---------------------------------------------|-----------------------|--------------|
| PROMPT_BASE.md     | Regras, travas e comportamento              | Apenas humano         | Quase nunca  |
| DECISIONS.md       | Stack obrigatória + decisões arquiteturais  | Apenas humano         | Baixa        |
| TASKS.md           | Tarefas do sprint atual                     | Agente + Humano       | Alta         |
| CHANGELOG.md       | Mudanças sistêmicas recentes                | Agente + Humano       | Média        |

### Regras de Leitura e Declaração
No início de **toda** resposta que envolva código, arquitetura ou alteração de estado, o agente **obrigatoriamente** deve escrever:

> “Li PROMPT_BASE.md, DECISIONS.md e TASKS.md nesta ordem de precedência. Estado atual resumido: …”

### Regras de Escrita (Trava de Memória)
- O agente **nunca** pode alterar `PROMPT_BASE.md` ou `DECISIONS.md` de forma autônoma.
- Qualquer proposta de mudança nesses dois arquivos exige confirmação explícita do humano na mesma resposta.
- O agente só pode modificar `TASKS.md` e `CHANGELOG.md`.
- Ao concluir uma tarefa relevante, o agente deve atualizar `TASKS.md` e, se a mudança for sistêmica, também o `CHANGELOG.md` na mesma resposta.

## 4. Travas de Segurança

### 4.1 Trava Financeira (Hard Limit)
- Limite diário máximo de gasto com API: **US$ 0,80**
- Este limite deve ser configurado diretamente no painel do provedor da API.
- Ao atingir o limite, o agente deve parar imediatamente e informar o humano.

### 4.2 Trava Operacional (Anti-Loop)
- Limite máximo de tentativas por tarefa: **3 a 4 tentativas**.
- Se após 3–4 tentativas o problema não estiver resolvido de forma limpa, o agente deve **parar** e pedir intervenção humana com diagnóstico claro.
- É proibido insistir em abordagens que já falharam na mesma sessão.

### 4.3 Trava de Pruning
- `TASKS.md` → apenas o sprint atual (máximo 14 dias).
- `CHANGELOG.md` → apenas mudanças sistêmicas das últimas 2 a 4 semanas.
- Histórico antigo deve ser removido ou movido para `CHANGELOG_ARCHIVE.md` (arquivo que o agente não deve ler).

## 5. Protected Paths
Os caminhos abaixo **nunca** podem ser modificados sem autorização explícita e específica do humano na mensagem atual:

- `PROMPT_BASE.md`
- `DECISIONS.md`
- `.env`, `.env.*`, credentials, keys, tokens
- `supabase/functions/**` (webhook e secrets)
- Gabarito e explicações em `src/data/**/*.json` (exceto rebalanceamento de ordem de alternativas com texto correto preservado)
- `out/` (artefato gerado)
- Configurações de produção que alterem secrets ou billing

## 6. Comportamento do Agente
- Prefira a menor mudança possível que resolva o problema.
- Nunca refatore código estável sem solicitação explícita.
- Ao encontrar ambiguidade, pergunte em vez de assumir.
- Seja direto, técnico e conciso.
- Nunca sugira tecnologias ou abordagens que contradigam o `DECISIONS.md`.
- Nunca coloque `service_role`, chaves Stripe secretas ou secrets no client.

## 7. Protocolo de Execução
1. Ler os arquivos na ordem de precedência.
2. Declarar o estado atual resumido.
3. Executar a menor mudança possível.
4. Atualizar `TASKS.md` (e `CHANGELOG.md` se a mudança for sistêmica).
5. Se bloqueado após 3–4 tentativas → parar e pedir ajuda humana.
