# Blueprint SAA-C03 (Exam Guide oficial)

## Arquivo

```
aws/blueprint/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf
```

- Certificação: **AWS Certified Solutions Architect – Associate (SAA-C03)**
- Idioma do guia: **PT-BR** (versão 1.1)
- Fonte: AWS Certification — Guia do exame

> O guia lista **declarações de tarefa** e exemplos de conhecimento/habilidade.  
> **Não** é lista exaustiva do exame. Use-o como **mapa de tópicos**.  
> **Não** copiar trechos longos do PDF nem apostilas de terceiros ao gerar parts.

---

## Domínios oficiais (SAA-C03)

| Domínio | Nome (Exam Guide PT-BR) | Peso |
|---------|-------------------------|------|
| **1** | Design / criação de **arquiteturas seguras** | **30%** |
| **2** | Design / criação de **arquiteturas resilientes** | **26%** |
| **3** | Design / criação de **arquiteturas de alto desempenho** | **24%** |
| **4** | Design / criação de **arquiteturas com custo otimizado** | **20%** |

Nomes em inglês (referência): Secure · Resilient · High-Performing · Cost-Optimized Architectures.

---

## Declarações de tarefa (mapa de parts)

Resumo de orientação (detalhes no PDF — não copiar o texto longo):

| Tarefa | Tema (mapa) | Domínio |
|--------|--------------|---------|
| **1.1** | Acesso seguro a recursos (IAM, least privilege, multi-account ideia) | 1 |
| **1.2** | Cargas e apps seguros (VPC, SG, NACL, NAT, subnets) | 1 |
| **1.3** | Controles de segurança de dados (KMS, criptografia, classificação) | 1 |
| **2.1** | Escalável e acoplamento fraco | 2 |
| **2.2** | HA / tolerância a falhas (multi-AZ, DR, RPO/RTO) | 2 |
| **3.x** | Storage / compute / database / rede de alto desempenho | 3 |
| **4.x** | Custo (modelos de preço, storage lifecycle, right-sizing) | 4 |

---

## Mapeamento parts → domínio / tarefa

| part_id | Slug | Domínio | Tarefa (mapa) |
|---------|------|---------|----------------|
| **aws-1.1** | iam-foundations | 1 Seguras (30%) | **1.1** |
| **aws-1.2** | vpc-foundations | 1 Seguras (30%) | **1.2** |
| **aws-1.3** | s3-foundations | 1 (+4 custo · 2 versioning) | **1.3** / dados |
| **aws-1.4** | ec2-ebs-foundations | 3/2 (+1 IAM · 4 custo) | compute / EBS |
| **aws-1.5** | alb-asg-foundations | 2/3 resiliente + scale | ALB / ASG |
| **aws-1.6** | rds-foundations | 2 (+1 SG · 4 custo storage) | RDS Multi-AZ / backup |
| **aws-1.7** | route53-cloudfront-foundations | 2/3 DNS + edge | R53 / CloudFront |
| **aws-1.8** | sqs-sns-decoupling | 2/3 messaging | SQS / SNS / DLQ |
| **aws-1.9** | kms-secrets-foundations | 1 dados / crypto | KMS / Secrets Manager |
| **aws-1.10** | lambda-foundations | 2/3 serverless | Lambda / triggers / VPC |
| **aws-1.11** | dynamodb-foundations | 3/2/4 NoSQL | DynamoDB keys / capacity |
| **aws-1.12** | cloudwatch-foundations | 2/4 ops + custo | Metrics / alarms / logs |
| aws-2.1 | loose-coupling-scale | 2 | 2.1 |
| aws-2.2 | ha-fault-tolerance | 2 | 2.2 |
| aws-3.1 | storage-performance | 3 | 3.1 |
| aws-3.2 | compute-elastic | 3 | 3.2 |
| aws-3.3 | database-high-perf | 3 | 3.x |
| aws-3.4 | network-edge-perf | 3 | 3.x |
| aws-4.1 | cost-models | 4 | 4.x |
| aws-4.2 | storage-lifecycle-cost | 4 | 4.x |

IDs `aws-x.y` alinham ao domínio e, quando possível, à declaração de tarefa do guia.

---

## Uso

1. Abrir o PDF oficial nesta pasta.  
2. Escolher declaração de tarefa → gerar part em `aws/parts/`.  
3. Consolidar com `node aws/scripts/consolidate_aws.mjs`.  
4. **Não** ligar ao frontend até ordem explícita.
