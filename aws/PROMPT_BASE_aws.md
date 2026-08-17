# PROMPT_BASE — AWS (Módulo 3)

> Contrato operacional para gerar **cada part** da trilha SAA-C03.  
> Standby: não altera o app (Simulado/Trilha/Estudo) até merge explícito.

---

## Precedência

1. **DECISIONS_aws.md**
2. **Este PROMPT_BASE_aws.md**
3. **TASKS_aws.md**
4. **PDF em `aws/blueprint/`** (quando existir) — mapa; **não** copiar texto de terceiros  
   Sem PDF: usar `aws/blueprint/README.md`

---

## Contrato de arquivos por part

```
aws/parts/part-aws-{id}-content.json
aws/parts/part-aws-{id}-questions.json
aws/parts/part-aws-{id}-tickets.json
```

- `{id}` no arquivo: `1.1`, `2.1`, …  
- Campo JSON `part_id`: **sempre** com prefixo `"aws-1.1"`, `"aws-3.2"`, …

---

## Pipeline por part (3 etapas em sequência)

1. **CONTENT** → grava content  
2. **QUESTIONS (30)** → usa só o content da etapa 1  
3. **TICKETS (5)** → usa só o content da etapa 1  

Não copiar questões de CCNA. Não pedir confirmação entre etapas se o usuário pediu sequência.

---

## Schema content

```json
{
  "part_id": "aws-1.1",
  "title": "...",
  "blueprint_module": "1.0",
  "blueprint_topics": ["1.x"],
  "verb": "Design",
  "weight_percent": 30,
  "topic_list": ["..."],
  "study_notes": [
    {
      "heading": "...",
      "bullets": ["..."],
      "exam_tips": ["..."]
    }
  ],
  "key_commands": ["aws iam ...", "policy JSON ideia"],
  "must_know": ["..."],
  "reuse_from_v1": null
}
```

- `verb`: `Design` | `Select` | `Diagnose` | `Configure` | `Describe`
- `weight_percent`: peso aproximado do **domínio** SAA (não da part isolada)
- `topic_list`: 8–14 · `study_notes`: 6–8 · `must_know`: 5–8
- Serviços AWS citados em **inglês**; prosa em **PT-BR**

---

## Schema traditional (30)

| Campo | Regra |
|-------|--------|
| `id` | 1–30 |
| `question_type` | `"traditional"` |
| `isPremium` | false se id 1–10; true se 11–30 |
| `enunciado` | PT-BR, cenário SAA |
| `alternativas` | **4** strings |
| `resposta_correta` | 0–3 |
| `explicacao_profunda` | ≥ **220** chars (ideal 280–450); correta + 1 distractor + tip; sem “A resposta correta é…” |
| `part_id` | ex. `"aws-1.1"` |

Gabarito ~7–8 por índice. Sem exhibit / choose-two.

---

## Schema ticket (5)

| Campo | Regra |
|-------|--------|
| `id` | 1–5 |
| `question_type` | `"ticket"` |
| `isPremium` | **true** |
| `sintoma` | incidente / chamado |
| `cli_output` | ≥ **6 linhas** (policy JSON, `aws …`, AccessDenied, CloudTrail) |
| `alternativas` | **4** |
| `resposta_correta` | 0–3 |
| `explicacao_profunda` | ≥ **200** (causa + distractors + tip) |
| `part_id` | ex. `"aws-1.1"` |

Temas distintos; correta dedutível pela evidência.

---

## Qualidade obrigatória (paridade CCNA v2)

Aplicar a **todas** as parts AWS (traditional + tickets):

1. **Traditional `explicacao_profunda` ≥ 220** caracteres (ideal **280–450**).
2. Em **cada** expl traditional:
   - por que a alternativa correta resolve o cenário;
   - por que **1 distractor plausível** falha;
   - **1 tip de prova** (frase curta, preferir prefixo `Tip de prova:`).
3. **Proibido** iniciar expl com “A resposta correta é…”.
4. Preferir **cenário de design/TShoot** a flashcard; máximo **~3–4** questões puramente definitionais por part (30). Incluir **≥2 multi-constraint** (HA + custo, health + SG, etc.) quando o tema permitir.
5. **Distractors plausíveis** (erro de quem estudou pela metade) — evitar absurdos do tipo “converter S3 em EBS”, “hostname do NAT”, salvo reescrito de forma crível.
6. Stems hedgy (“pode haver…”) → reescrever com **causa fechada** e gabarito dedutível.
7. **Tickets:** manter evidência CLI/`aws`/JSON forte; `explicacao_profunda` ≥ **200**; causa + por que outras falham + tip.
8. Content: incluir study_note **Anti-patterns de prova** (3–5 bullets) e `must_know` **6–8** acionáveis.
9. **Proibido bordão genérico** repetido nas expls (ex.: “No SAA, amarre…”, “Confirme também listener/TG…”, “Revise o requisito desta questão…”, “Contexto &lt;part&gt; #N: o distractor ignora…”). O **tip de prova deve ser específico** do sintoma, serviço ou trade-off da questão. **Proibido** a mesma frase de fechamento idêntica em ≥3 questões da mesma part.

| Campo traditional | Barra |
|-------------------|--------|
| `explicacao_profunda` | ≥ **220** (ideal 280–450) |
| Gabarito | ~7–8 por índice 0–3 |
| `isPremium` | 1–10 false · 11–30 true |

| Campo ticket | Barra |
|--------------|--------|
| `cli_output` | ≥ 6 linhas úteis |
| `explicacao_profunda` | ≥ **200** |

---

## Regras de geração

1. Exam Guide / README blueprint = **mapa** de tópicos  
2. Tom: arquiteto / SRE cloud · nível **Associate**  
3. Foco em **escolha de serviço, trade-off e TShoot de permissão/rede/dados**  
4. Nunca copiar bancos CCNA nem material de curso de terceiros  
5. Pipeline local; output só em `aws/parts/` (e `aws/final/` via consolidate)  
6. Cumprir a seção **Qualidade obrigatória (paridade CCNA v2)** acima
