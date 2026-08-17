# CCNA Forge — Módulo 3 · AWS SAA-C03 (standby)

Trilha **paralela** de preparação para **AWS Certified Solutions Architect – Associate (SAA-C03)**.

- **Não** está ligada ao frontend (Simulado / Trilha / Estudo).
- **Não** altera bancos CCNA v1 (`src/data` M1) nem CCNA v2 (`v2/`).
- Bancos consolidados ficam só em `aws/final/` até wiring explícito no app.

## Estrutura

```
aws/
├── README.md
├── DECISIONS_aws.md
├── PROMPT_BASE_aws.md
├── TASKS_aws.md
├── blueprint/          # Exam Guide PDF (usuário) + README mapa
├── parts/              # part-aws-{id}-content|questions|tickets.json
├── final/              # bancos consolidados (pós consolidate)
└── scripts/
    └── consolidate_aws.mjs
```

## Como gerar uma part

Siga [PROMPT_BASE_aws.md](./PROMPT_BASE_aws.md) e [DECISIONS_aws.md](./DECISIONS_aws.md):

1. **content** → `parts/part-aws-{id}-content.json`
2. **questions** → `parts/part-aws-{id}-questions.json` (30 traditional)
3. **tickets** → `parts/part-aws-{id}-tickets.json` (5 tickets runbook)

`part_id` no JSON: `"aws-1.1"`, `"aws-2.1"`, etc.  
Arquivos no disco: `part-aws-1.1-content.json`.

## Como consolidar

Na **raiz do repo** (`ccna/`):

```bash
node aws/scripts/consolidate_aws.mjs
```

Saídas:

- `aws/final/questions_aws_traditional.json`
- `aws/final/tickets_aws.json`
- `aws/final/parts_index.json`
- `aws/final/inventory_report.json`
- `aws/final/consolidation_report.json`

## Exam Guide (blueprint)

PDF oficial (já no repo):

```
aws/blueprint/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf
```

Mapa resumido: [blueprint/README.md](./blueprint/README.md).  
Domínios SAA-C03: **seguras 30% · resilientes 26% · alto desempenho 24% · custo 20%**.  
O PDF é **mapa de tópicos** (task statements) — não copiar texto longo nem apostilas de terceiros.

## Aviso de integração

**Ainda NÃO ligado ao frontend.**  
Sem seletor M1/M2/M3, sem imports em `src/`. Integração só após decisão explícita + merge + build PASS.
