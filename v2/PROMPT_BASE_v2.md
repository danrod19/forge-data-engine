# PROMPT_BASE v2.0

> Documento operacional para o Build gerar **cada part** da trilha CCNA 200-301 v2.0.  
> Standby: não altera o app de produção (v1) até merge/cutover explícito.

---

## Precedência

1. **DECISIONS_v2.md**
2. **Este PROMPT_BASE_v2.md**
3. **TASKS_v2.md**
4. **PDF em `v2/blueprint/`** (mapa de tópicos — **NÃO** copiar texto de apostila/terceiros)

Qualquer conflito → prevalece a ordem acima.

---

## Contrato de arquivos por part

```
v2/parts/part-{id}-content.json
v2/parts/part-{id}-questions.json
v2/parts/part-{id}-tickets.json
```

Onde `{id}` = `1.1`, `1.2`, … `5.6` (nome de arquivo **sem** prefixo `v2-`).

O campo JSON `part_id` **sempre** usa o prefixo: `"v2-1.1"`, `"v2-5.2"`, etc.

---

## Schema content

```json
{
  "part_id": "v2-1.1",
  "title": "...",
  "blueprint_module": "1.0",
  "blueprint_topics": ["1.1"],
  "verb": "Diagnose",
  "weight_percent": 25,
  "topic_list": ["..."],
  "study_notes": [
    {
      "heading": "...",
      "bullets": ["..."],
      "exam_tips": ["..."]
    }
  ],
  "key_commands": ["..."],
  "must_know": ["..."],
  "reuse_from_v1": null
}
```

- `verb`: um de `Diagnose` | `Troubleshoot` | `Configure` | `Interpret` | `Use` | `Describe`
- `reuse_from_v1`: `null` ou string tipo `"part-x.y (upgrade notes)"`
- `weight_percent`: peso do **domínio** (módulo blueprint), não da part isolada
- `topic_list`: 8–14 itens
- `study_notes`: 6–8 blocos
- `must_know`: 5–8 itens

---

## Schema question (traditional)

| Campo | Regra |
|-------|--------|
| `id` | 1–30 por part |
| `question_type` | `"traditional"` |
| `isPremium` | `false` se id 1–10; `true` se id 11–30 |
| `enunciado` | PT-BR, preferir cenário/output |
| `alternativas` | array de **4** strings |
| `resposta_correta` | 0–3 |
| `explicacao_profunda` | ≥ **150** caracteres; proibido “A resposta correta é…” |
| `part_id` | ex. `"v2-1.1"` |

---

## Schema ticket

| Campo | Regra |
|-------|--------|
| `id` | 1–5 por part |
| `question_type` | `"ticket"` |
| `isPremium` | **sempre** `true` |
| `sintoma` | sintoma do chamado |
| `cli_output` | ≥ **6 linhas úteis** de evidência |
| `alternativas` | array de **4** strings |
| `resposta_correta` | 0–3 |
| `explicacao_profunda` | ≥ **150** caracteres |
| `part_id` | ex. `"v2-1.1"` |

---

## Regras de geração (obrigatórias)

1. PDF/oficial = **mapa de tópicos**; NÃO copiar material de curso de terceiros
2. **PT-BR**, nível 200-301 v2.0, tom técnico de suporte
3. `topic_list` 8–14; `study_notes` 6–8; `must_know` 5–8
4. Questions **30**: ids 1–10 free, 11–30 PRO; gabarito equilibrado (~7–8 por índice 0–3)
5. **≥60%** das questions com cenário, sintoma ou leitura de output; máx. **20%** definição pura
6. Tickets **5 temas DISTINTOS**; correta dedutível **só** pela evidência do `cli_output`
7. Proibido: choose-two, exhibit obrigatório, “A resposta correta é…”
8. Se `reuse_from_v1`: **melhorar** — mais TShoot, CLI mais rico, menos definição
9. Se **NOVO**: detalhar mecanismos, falhas clássicas, checklist de isolamento
10. Entrega do Build = **só resumo** (paths, contagens, distribuição de gabarito, temas dos tickets) — **não** colar JSON inteiro no chat
11. Ansible = **Use** (playbook/inventory/RECAP), não só descrever
12. AI = **operacional de rede** (persona, dados, formato, instruções), não chatbot genérico

---

## Template de prompt por part (3 etapas em sequência)

Copiar e preencher. Executar **ETAPA 1 → 2 → 3** sem pular. Não inventar tópicos fora do blueprint.

```
Você está no projeto local CCNA Forge (v2/ standby).
Trabalhe SÓ com arquivos desta máquina. Não use Ollama nem APIs externas.
NÃO altere src/ de produção nem parts/ v1. Grave apenas em v2/parts/.

Leia antes: v2/DECISIONS_v2.md e v2/PROMPT_BASE_v2.md.

════════════════════════════════════════
PART ALVO
════════════════════════════════════════
part_id (JSON): v2-{X.Y}
arquivo base: part-{X.Y}
title: {TÍTULO}
blueprint_module: {1.0|2.0|3.0|4.0|5.0}
blueprint_topics: [{tópicos oficiais, ex. "5.1"}]
verb: {Diagnose|Troubleshoot|Configure|Interpret|Use|Describe}
weight_percent: {25|25|20|20|10 conforme domínio}
reuse_from_v1: {null | "part-a.b (notas de upgrade)"}
slug: {ex. agentic-ai}
status: {NOVO | reuso+ | reescrever}

════════════════════════════════════════
ETAPA 1 — content
════════════════════════════════════════
Gerar e gravar:
  v2/parts/part-{X.Y}-content.json

Schema completo (PROMPT_BASE_v2):
- part_id, title, blueprint_module, blueprint_topics, verb, weight_percent
- topic_list (8–14), study_notes (6–8), key_commands, must_know (5–8)
- reuse_from_v1

Conteúdo original PT-BR. PDF = mapa. Sem copiar apostila.

════════════════════════════════════════
ETAPA 2 — questions (30 traditional)
════════════════════════════════════════
Gerar e gravar:
  v2/parts/part-{X.Y}-questions.json

- 30 itens, ids 1–30
- isPremium: 1–10 false, 11–30 true
- alternativas[4], resposta_correta 0–3, gabarito ~7–8 cada índice
- ≥60% cenário/output; ≤20% definição pura
- explicacao_profunda ≥150 chars; sem “A resposta correta é…”
- part_id = "v2-{X.Y}"
- question_type = "traditional"

════════════════════════════════════════
ETAPA 3 — tickets (5)
════════════════════════════════════════
Gerar e gravar:
  v2/parts/part-{X.Y}-tickets.json

- 5 tickets, ids 1–5, isPremium true, question_type "ticket"
- Temas DISTINTOS; cli_output ≥6 linhas úteis
- Correta dedutível só com a evidência
- explicacao_profunda ≥150 chars
- part_id = "v2-{X.Y}"

════════════════════════════════════════
ENTREGA (só resumo — não cole JSON inteiro)
════════════════════════════════════════
1. Paths gravados
2. Contagens: content OK? 30 Q? 5 tickets?
3. Distribuição resposta_correta (0–3) nas questions e nos tickets
4. verb + blueprint_topics + reuse_from_v1
5. Temas dos 5 tickets (uma linha cada)
6. Confirmação: nada em src/ ou parts v1 alterado
```

---

## Diferenças vs PROMPT_BASE v1

| Aspecto | v1 | v2 |
|---------|----|----|
| `part_id` | `"1.1"` | `"v2-1.1"` (prefixo `v2-`) |
| `verb` | opcional/ausente | **obrigatório** no content |
| `explicacao_profunda` | ≥120 | ≥**150** |
| Tickets `cli_output` | variável | ≥**6 linhas** úteis |
| Definição pura | tolerada | máx. **20%** / part; ≥60% cenário |
| Domínios | 6 (até Automação) | **5** (AI no 5.0) |
| AI | genérico / ausente | **operacional de rede** (agentic + prompts) |
| Ansible | descrever | **Use** (playbook/inventory/RECAP) |
| Produção | app atual | **standby** até merge P3 |

---

## Validação rápida pós-geração

Antes de marcar a part como pronta no TASKS_v2:

- [ ] 3 arquivos existem em `v2/parts/`
- [ ] `part_id` começa com `v2-`
- [ ] `verb` presente no content
- [ ] 30 questions / 5 tickets
- [ ] Free 1–10 / PRO 11–30 / tickets premium
- [ ] Gabarito ~equilibrado
- [ ] Zero choose-two / zero “A resposta correta é…”
- [ ] Nenhuma alteração em `src/` ou `trilha-content/parts/` v1
