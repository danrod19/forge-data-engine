# Tickets AWS review report

**Fonte UI Trilha aws:** `src/data/tickets_aws.json` ← `aws-banks.ts` (`awsTickets`) ← `tickets.ts` `getTicketsPool("aws")` → `awsModuleTickets`.

| Métrica | Valor |
|---------|-------|
| Total tickets | 60 |
| Sintomas reescritos/polidos | 60 |
| Explicações reescritas | 60 |
| CLI alterado (limpeza) | 0 |
| IDs só limpeza leve / inalterados | — |
| bad gabarito | 0 |

## Amostras — sintomas (antes → depois)

### ID 1
**Antes:** NOC-AWS-1101: DevOps user app-deploy não consegue s3:DeleteObject em s3://corp-artifacts/releases/*. AccessDenied mesmo após 'Allow s3:*' em managed policy anexada.

**Depois:** NOC-AWS-1101: o user app-deploy do DevOps não consegue s3:DeleteObject em s3://corp-artifacts/releases/*. Continua AccessDenied mesmo depois de anexarem uma managed policy com Allow s3:*.

### ID 2
**Antes:** NOC-AWS-1102: EC2 app-tier deveria usar role S3ReadRole, mas a instância não obtém credenciais de role. Permissions na role incluem s3:GetObject.

**Depois:** NOC-AWS-1102: a EC2 do app-tier deveria usar a role S3ReadRole, mas a instância não obtém credenciais de role. As permissions na role já incluem s3:GetObject.

### ID 3
**Antes:** NOC-AWS-1103: Usuário ana.silva não lista filas SQS (sqs:ListQueues). A policy SQS-Support está no grupo Support-L2; ana está só no grupo Billing-View.

**Depois:** NOC-AWS-1103: a usuária ana.silva não lista filas SQS (sqs:ListQueues). A policy SQS-Support está no grupo Support-L2, mas ana aparece só em Billing-View.

## Amostras — explicações (antes → depois)

### ID 1
**Antes:** A mensagem cita explicit deny e a policy ProtectProdDelete tem Deny em DeleteObject no prefix. Allow em DeployS3Allow não supera Deny. SG de 'bucket' e só mudar região não removem o Deny. o, ou Allow genérico que não remove Deny/rota/BPA. Tip de prova: ancore a resposta em uma linha do output (Deny, rota ausente, policy Principal, delete marker, lifecycle ausente).

**Depois:** O sintoma aponta para Deny explícito: no CLI, o AccessDenied cita "explicit deny in an identity-based policy" e a ProtectProdDelete tem Effect Deny em s3:DeleteObject no prefix releases/*. Allow em DeployS3Allow (mesmo s3:*) nunca supera um Deny — a avaliação IAM para no primeiro Deny que case. Abrir 0.0.0.0/0 em "SG de bucket" não faz sentido: S3 não usa Security Group de EC2 para autorizar DeleteObject. Só trocar a região do CLI não remove o statement Deny. Um segundo Allow * sem mexer no Deny deixa o bloqueio intacto. Insight: quando a mensagem fala explicit deny, liste as policies anexadas e procure Effect Deny antes de ampliar Allow.

### ID 2
**Antes:** Trust só permite Lambda e não há instance profile na EC2 — a role não pode ser assumida pelo host. Permissions S3 já existem. Corrija trust EC2 + associe o profile. Tipo de instância e root policy não resolvem o trust.

**Depois:** No CLI, o trust da S3ReadRole só permite lambda.amazonaws.com e describe-iam-instance-profile-associations volta vazio — a EC2 não tem profile e, mesmo que tivesse, o serviço EC2 não poderia assumir a role. Por isso o IMDS em /iam/security-credentials/ responde vazio/404. AmazonS3ReadOnlyAccess na role já cobre GetObject; o buraco é trust + associação. Upsize de instance type não cria credencial de role. Desabilitar IMDSv2 não conserta Principal errado nem ausência de profile. Colar a managed policy no root user é anti-padrão e não amarra a workload da instância. Insight: se permissions estão ok mas o metadata não lista role, confira AssumeRolePolicyDocument (ec2.amazonaws.com) e a associação do instance profile na mesma ordem.

### ID 3
**Antes:** A Allow existe no Support-L2, mas ana só está em Billing-View. Membership/group attach errado explica o AccessDenied. FIFO e endpoint não concedem IAM. Remover a policy do Support piora o time de suporte.

**Depois:** O sintoma aponta para membership errado: SQS-Support Allow ListQueues/GetQueueAttributes está no Support-L2, mas list-groups-for-user mostra só Billing-View (job-function Billing). Ana nunca herda a Allow — daí o AccessDenied. Coloque-a no Support-L2 ou anexe a policy ao principal efetivo. Habilitar FIFO em todas as filas não concede IAM. Remover a policy do Support-L2 tira permissão de quem já está no grupo certo. Endpoint "público" da API SQS não substitui autorização identity-based. Insight: em tickets de AccessDenied com groups, compare list-groups-for-user com list-attached-group-policies do grupo que realmente tem a action.

## Invariantes

- `resposta_correta` e texto das `alternativas` preservados em 100% dos itens.
- Nenhum ticket novo inventado.
- Backup: `scripts/output/tickets_aws_before_review.json`
