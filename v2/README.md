# CCNA Forge — Trilha v2.0 (standby)

- Exam: 200-301 CCNA **v2.0** (a partir de ~03/02/2027; v1.1 até 02/02/2027)
- Objetivo: banco paralelo mais técnico, com verbos Diagnose/Troubleshoot/Configure/Interpret/Use
- Produção atual do app continua no conteúdo v1 até o cutover
- Formato por part (igual v1): content.json + questions.json (30) + tickets.json (5)
- Regras de qualidade: ver [PROMPT_BASE_v2.md](./PROMPT_BASE_v2.md) e [DECISIONS_v2.md](./DECISIONS_v2.md)

## Domínios e pesos oficiais

| Domínio | Nome | Peso |
|---------|------|------|
| 1.0 | Network Infrastructure & Connectivity | 25% |
| 2.0 | Switching & Network Access | 25% |
| 3.0 | IP Routing | 20% |
| 4.0 | Network Services & Security | 20% |
| 5.0 | AI & Network Operations and Management | 10% |

## Estrutura desta pasta

```
v2/
├── README.md
├── PROMPT_BASE_v2.md      # contrato operacional por part
├── DECISIONS_v2.md        # decisões fechadas + árvore de parts
├── TASKS_v2.md            # backlog P0–P3
├── blueprint/             # PDF oficial de tópicos (mapa)
└── parts/                 # part-*-content|questions|tickets.json
```

## Como gerar uma part

Usar o template em [PROMPT_BASE_v2.md](./PROMPT_BASE_v2.md) (3 etapas em sequência):

1. **content** → `parts/part-{id}-content.json`
2. **questions** → `parts/part-{id}-questions.json` (30 traditional)
3. **tickets** → `parts/part-{id}-tickets.json` (5 tickets)

`part_id` no conteúdo: `"v2-1.1"`, `"v2-5.2"`, etc.  
Arquivos no disco: `part-1.1-content.json` (id numérico no nome).

## Prioridade de produção

- **P0:** 5.1, 5.2, 1.1, 4.4, 1.7  
- **P1:** 1.6, 2.2, 2.4, 3.3, 4.7, 4.2  
- **P2:** reuso melhorado restante  
- **P3:** merge no app / dual-track ou cutover  

Ver [TASKS_v2.md](./TASKS_v2.md). **Nenhuma part v2 entra no app sem merge explícito e build PASS.**

## Blueprint

Colocar o PDF oficial em [blueprint/](./blueprint/) — ver [blueprint/README.md](./blueprint/README.md).
