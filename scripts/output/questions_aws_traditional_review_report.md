# Questions AWS traditional review report

## Cadeia UI

```
Simulado track aws
  → getSimuladoPoolByTrack("aws") / simuladoQuestionsAws
  → awsTraditionalQuestions (aws-banks.ts)
  → src/data/questions_aws_traditional.json

Estudo track aws
  → filterQuestionsForAwsDomain / getAwsTraditionalByPart
  → mesmo questions_aws_traditional.json
```

| Métrica | Valor |
|---------|-------|
| Total no pool | 360 |
| Explicações reescritas | 360 |
| Enunciados só OCR / ajuste leve | 0 |
| Inalteradas (expl+enunciado) | 0 |
| bad gabarito | 0 |

## Amostras — explicação (antes → depois)

### ID 1
**Antes:** Least privilege limita Allow ao mínimo do job (ações e ARNs concretos), reduzindo blast radius se a credencial vazar. AdministratorAccess universal falha porque concede bem mais do que o deploy precisa e é o anti-pattern clássico de prova. Tip de prova: se a opção fala em 'admin agora, restringe depois', descarte em favor de permissões mínimas desde o início.

**Depois:** Least privilege no IAM significa Allow só das Actions e Resources que a função realmente precisa (por exemplo s3:PutObject em um prefixo de deploy), reduzindo o blast radius se a credencial vazar. AdministratorAccess para todos os developers concede poder administrativo completo desde o dia 1 e contradiz o princípio — 'revisar depois' quase nunca acontece. Effect Deny em tudo com liberação manual por ticket não é modelo operacional de least privilege: torna o dia a dia inviável e não substitui policies Allow bem delimitadas. Desabilitar MFA no console só reduz segurança de autenticação e não organiza permissões. Insight: comece com a menor policy que faz o job e amplie com evidência, nunca o contrário.

### ID 2
**Antes:** Workloads em EC2 usam role + instance profile: o IMDS entrega sessão STS rotativa, sem key estática no host. Access key de user no user-data é o anti-pattern que a prova pune. Tip de prova: se o cenário é serviço AWS falando com outro serviço AWS, a resposta padrão de identidade é role, não user/root.

**Depois:** Workloads em EC2 devem usar IAM role associada via instance profile: o IMDS entrega credenciais temporárias do STS que rotacionam sozinhas, sem access key estática no disco. IAM user com senha e access key no user-data grava segredo de longo prazo na instância (visível em userdata/AMI) e é o anti-pattern clássico. Grupo IAM vazio sem policy não concede identidade à EC2 nem entrega credenciais de API. Root user com MFA desligado na instância é péssima prática de conta e não é como apps autenticam em APIs AWS. Insight: serviço AWS falando com outro serviço AWS → role, não user nem root.

### ID 3
**Antes:** A trust policy lista Principals (serviço EC2, conta, user) autorizados a sts:AssumeRole; sem trust adequado a role não é assumida mesmo com AmazonS3ReadOnlyAccess anexada. Bucket policy e SG não substituem trust de IAM role. Tip de prova: erro 'not authorized to perform sts:AssumeRole' → confira trust primeiro, não só a policy de dados.

**Depois:** Quem pode chamar sts:AssumeRole é definido pela trust policy (AssumeRolePolicyDocument) da role: ela lista Principals (ec2.amazonaws.com, conta, user). Sem trust adequado, a role não é assumida mesmo com AmazonS3ReadOnlyAccess anexada. A bucket policy do S3 controla acesso ao recurso S3, não quem assume a role. Tag Name da VPC é metadado de rede e não participa de AssumeRole. Security Group da ENI filtra tráfego de rede da instância, não autorização IAM de assume. Insight: erro 'not authorized to perform sts:AssumeRole' → confira trust primeiro, depois a permissions policy.

### ID 4
**Antes:** Na lógica IAM, Deny explícito tem precedência sobre qualquer Allow; por isso AccessDenied com 'explicit deny' não se resolve só empilhando outro Allow *. Managed vs inline não muda essa regra de precedência. Tip de prova: se a mensagem cita explicit deny, o próximo passo é achar e ajustar o statement Deny, não criar Allow genérico.

**Depois:** Na avaliação IAM, Deny explícito tem precedência absoluta sobre qualquer Allow; o resultado é AccessDenied com indicação de explicit deny. Não existe regra de que Allow em managed policy 'sempre vence' — tipo de policy (managed vs inline) não altera a precedência. Horário comercial só entra se houver Condition de tempo; sem isso a ação não fica Allow fora do expediente. Root user não é desabilitado automaticamente por conflito Allow/Deny em policies de outros principals. Insight: se a mensagem cita explicit deny, ache e ajuste o statement Deny; empilhar outro Allow * não resolve.

### ID 5
**Antes:** Groups aplicam o mesmo conjunto de policies a vários users humanos, facilitando least privilege por função. Root keys compartilhadas e desligar CloudTrail são falhas graves de segurança e auditoria. Tip de prova: humanos no console → users + groups; workloads → roles.

**Depois:** Para humanos com o mesmo conjunto de permissões, o padrão é IAM group (ex. Support-L2) com policies anexadas ao group: novos membros herdam o mesmo least privilege por função. Access key de root compartilhada no canal do time é falha grave — root não deve ter keys operacionais e credencial compartilhada impede auditoria. Doze roles EC2 diferentes só para login de console confundem identidade de workload com identidade humana; console usa users (ou federação). Desligar CloudTrail remove trilha de auditoria e piora o problema operacional. Insight: humanos no console → users + groups; workloads → roles.

## Invariantes

- `resposta_correta` e texto das `alternativas` preservados em 100% (bad=0).
- Enunciados NÃO traduzidos EN→PT (0 alterações de enunciado neste passe).
- Backup: `scripts/output/questions_aws_traditional_before_review.json`
