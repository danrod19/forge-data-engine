# DECISIONS — AWS (Módulo 3)

> Decisões fechadas da trilha **AWS Certified Solutions Architect – Associate (SAA-C03)**.  
> Precedência: este arquivo > PROMPT_BASE_aws.md > TASKS_aws.md > PDF Exam Guide em `aws/blueprint/`.

---

## Alvo

| Item | Valor |
|------|--------|
| Certificação | **AWS Certified Solutions Architect – Associate (SAA-C03)** |
| Blueprint | `aws/blueprint/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf` |
| Idioma do banco | **PT-BR** |
| Nomes de serviços | **inglês** (IAM, EC2, S3, VPC, Security Group, …) |
| Nível | Associate — design e TShoot leve de arquitetura |

### Domínios oficiais SAA-C03 (Exam Guide PT-BR)

| Domínio | Nome | Peso |
|---------|------|------|
| 1 | Arquiteturas **seguras** | **30%** |
| 2 | Arquiteturas **resilientes** | **26%** |
| 3 | Arquiteturas de **alto desempenho** | **24%** |
| 4 | Arquiteturas com **custo otimizado** | **20%** |

> Descartado qualquer eixo legado tipo “clássico 60/10/20/10” ou blueprint não-SAA.  
> Task statements do guia = **mapa**; não copiar texto longo do PDF.

---

## Isolamento do app

- Bancos consolidados **somente** em `aws/final/` até wiring explícito.
- **Zero** alteração automática em `src/`, `v2/`, M1 ou M2.
- Sem seletor M1/M2/M3 nesta fase.
- Pipeline **local** (JSON + scripts Node). Sem Ollama/APIs pagas obrigatórias.

---

## Schema (idêntico ao v2 CCNA)

| Tipo | Arquivo | Contagem |
|------|---------|----------|
| content | `part-aws-{id}-content.json` | 1 |
| traditional | `part-aws-{id}-questions.json` | 30 |
| ticket | `part-aws-{id}-tickets.json` | 5 |

- `part_id`: `"aws-1.1"`, `"aws-1.2"`, …
- 4 alternativas · `resposta_correta` 0–3
- `explicacao_profunda` ≥ **150** caracteres; proibido iniciar com “A resposta correta é…”
- Traditional `isPremium`: ids **1–10 false**, **11–30 true**
- Tickets: **todos** `isPremium: true`
- Zero exhibit obrigatório / zero choose-two no banco standard

---

## Ticket AWS (runbook)

Ticket ≠ CLI Cisco. Evidência típica:

- `aws ec2 describe-*` (rotas, SG, NACL, subnets)
- mensagem `AccessDenied` / timeout / connection refused
- trecho JSON de **IAM policy** ou **trust policy**
- output `aws iam …` / `aws sts …` / `aws s3 …`

Sintoma + evidência ≥ 6 linhas úteis; resposta **dedutível** só com a evidência.

---

## Qualidade

1. Cada part declara `verb`: `Design` | `Select` | `Diagnose` | `Configure` | `Describe`
2. Preferir cenário SAA (escolha de serviço / causa de falha) a definição pura
3. Gabarito traditional ~7–8 por índice (0–3)
4. Exam Guide = **mapa**; não copiar material de curso de terceiros
5. Fora de escopo profundo por part: documentar no content (`must_know` / study_notes)
6. `weight_percent` no content = peso do **domínio** SAA-C03 (30 / 26 / 24 / 20)

---

## Blueprint

| Item | Path |
|------|------|
| PDF oficial | `aws/blueprint/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf` |
| Mapa resumido | [blueprint/README.md](./blueprint/README.md) |

---

## Relação com CCNA (M1/M2)

| Trilha | Pasta | App |
|--------|-------|-----|
| M1 CCNA v1 | `src/data` (legado) | produção |
| M2 CCNA v2.0 | `v2/` | produção (primary v2) |
| M3 AWS SAA-C03 | `aws/` | **standby — não ligado** |
