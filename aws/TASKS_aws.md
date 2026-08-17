# TASKS — AWS SAA-C03 (Módulo 3)

> Backlog da trilha standby **SAA-C03**.  
> Blueprint: `aws/blueprint/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf`  
> Nenhuma part AWS entra no app sem merge explícito e build PASS.

---

## Feito

- [x] Estrutura `aws/` + DECISIONS + PROMPT_BASE + README
- [x] Exam Guide oficial registrado em `aws/blueprint/`
- [x] `aws/scripts/consolidate_aws.mjs`
- [x] **aws-1.1** iam-foundations (tarefa 1.1 · domínio 1)
- [x] **aws-1.2** vpc-foundations (tarefa 1.2 · domínio 1)
- [x] **aws-1.3** s3-foundations (acesso/BPA/encryption/versioning/lifecycle)
- [x] Quality pass paridade CCNA v2 (expl ≥220 traditional · tickets ≥200 · anti-patterns content) em 1.1–1.3
- [x] **aws-1.4** ec2-ebs-foundations (compute, volumes, snapshots, custo Spot/OD/RI)
- [x] **aws-1.5** alb-asg-foundations (health, multi-AZ, capacity, SG ALB→target)
- [x] **aws-1.6** rds-foundations (Multi-AZ, backup, SG, storage)
- [x] **aws-1.7** route53-cloudfront-foundations (DNS, edge, OAI/OAC)
- [x] **aws-1.8** sqs-sns-decoupling (filas, fan-out, DLQ)
- [x] **aws-1.9** kms-secrets-foundations (CMK, key policy, Secrets Manager)
- [x] **aws-1.10** lambda-foundations (role, timeout, concurrency, VPC, triggers)
- [x] **aws-1.11** dynamodb-foundations (PK/SK, RCU/WCU, GSI, throttle)
- [x] **aws-1.12** cloudwatch-foundations (metrics, alarms, logs, retention)
- [x] **Piloto AWS FOUNDATIONS 1.1–1.12 FECHADO** (12 parts · 360Q · 60 tickets)
- [x] **Quality pass FINAL** (strip pads · schema · dedupe · `questions_traditional_FINAL.json` / `tickets_FINAL.json`)

---

## Domínio 1 — Arquiteturas seguras (30%)

Task statements oficiais: **1.1** acesso seguro · **1.2** cargas/apps seguros · **1.3** segurança de dados.

- [x] **aws-1.1** iam-foundations *(tarefa 1.1)*
- [x] **aws-1.2** vpc-foundations *(tarefa 1.2 — VPC, SG, NACL, NAT, subnets)*
- [x] **aws-1.3** s3-foundations *(tarefa 1.3 + custo/resiliência leve — S3, BPA, SSE, lifecycle)*
- [x] **aws-1.9** kms-secrets-foundations *(tarefa 1.3 — KMS/CMK, Secrets Manager)*

## Compute / storage / scale / edge / messaging / crypto / serverless (cruza D1–D4)

- [x] **aws-1.4** ec2-ebs-foundations
- [x] **aws-1.5** alb-asg-foundations
- [x] **aws-1.6** rds-foundations
- [x] **aws-1.7** route53-cloudfront-foundations
- [x] **aws-1.8** sqs-sns-decoupling
- [x] **aws-1.10** lambda-foundations
- [x] **aws-1.11** dynamodb-foundations
- [x] **aws-1.12** cloudwatch-foundations

## Domínio 2 — Arquiteturas resilientes (26%)

Task statements: **2.1** escalável/acoplamento fraco · **2.2** HA / tolerância a falhas.

- [ ] aws-2.1 loose-coupling-scale *(SQS/SNS/event-driven ideia)*
- [ ] aws-2.2 ha-fault-tolerance *(multi-AZ, ALB, DR RPO/RTO ideia)*
- [ ] aws-2.3 backup-dr-patterns

## Domínio 3 — Arquiteturas de alto desempenho (24%)

Task statements: storage · compute · database · rede de alto desempenho.

- [ ] aws-3.1 storage-performance *(S3/EBS/EFS ideia)*
- [ ] aws-3.2 compute-elastic *(EC2/Lambda/Auto Scaling ideia)*
- [ ] aws-3.3 database-high-perf *(RDS/Aurora/DynamoDB ideia)*
- [ ] aws-3.4 network-edge-perf *(CloudFront/caching ideia)*

## Domínio 4 — Arquiteturas com custo otimizado (20%)

- [ ] aws-4.1 cost-models *(On-Demand / RI / SP / Spot ideia)*
- [ ] aws-4.2 storage-lifecycle-cost *(S3 classes / lifecycle ideia)*

---

## Consolidação

- [x] Script `consolidate_aws.mjs`
- [x] Reconsolidate após aws-1.1 + aws-1.2 → `aws/final/`
- [x] Reconsolidate após aws-1.3 → 3 parts / 90 Q / 15 tickets
- [x] Reconsolidate após aws-1.4 → 4 parts / 120 Q / 20 tickets
- [x] Reconsolidate após aws-1.5 → 5 parts / 150 Q / 25 tickets
- [x] Reconsolidate após aws-1.6 → 6 parts / 180 Q / 30 tickets
- [x] Reconsolidate após aws-1.7 → 7 parts / 210 Q / 35 tickets
- [x] Reconsolidate após aws-1.8 → 8 parts / 240 Q / 40 tickets
- [x] Reconsolidate após aws-1.9 → 9 parts / 270 Q / 45 tickets
- [x] Reconsolidate após aws-1.10 → 10 parts / 300 Q / 50 tickets
- [x] Reconsolidate após aws-1.11 → 11 parts / 330 Q / 55 tickets
- [x] Reconsolidate FINAL piloto → 12 parts / 360 Q / 60 tickets
- [ ] Wiring app (dual-track M3) — **bloqueado até ordem explícita**

---

## Regra

**Não integrar UI / Simulado / Trilha / Estudo** até ordem explícita.  
CCNA M1 e M2 permanecem intocados.  
Não usar eixos de blueprint “clássico” legados — só **SAA-C03** (30/26/24/20).
