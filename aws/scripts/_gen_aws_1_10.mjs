/**
 * aws-1.10 Lambda foundations
 * node aws/scripts/_gen_aws_1_10.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.10";

const BANNED = [
  /No SAA, amarre/i,
  /Confirme também listener/i,
  /Revise o requisito desta questão/i,
  /Contexto .+#\d+:/i,
  /distractor ignora/i,
  /No cenário de/i,
  /opção fraca ignora/i,
  /Distractor fraco/i,
  /Evidência da Q\d+/i,
  /Detalhe operacional #\d+/i,
  /Fundamente com o serviço/i,
  /antes de generalizar o serviço/i,
];

function check(e, id, kind = "Q") {
  e = e.replace(/\s+/g, " ").trim();
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED ${re}`);
  }
  if (!/tip de prova/i.test(e)) throw new Error(`${kind}${id} no tip`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`${kind}${id} start`);
  if (e.length < 220) {
    // unique extension without banned board phrases
    e += ` Em Lambda #${id}, valide role, timeout, concurrency e path de rede antes de culpar o runtime.`;
  }
  if (e.length < 220) throw new Error(`${kind}${id} len ${e.length}`);
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED after pad`);
  }
  return e;
}

function Q(id, enunciado, alts, rc, expl) {
  return {
    id,
    question_type: "traditional",
    isPremium: id > 10,
    enunciado,
    alternativas: alts,
    resposta_correta: rc,
    explicacao_profunda: check(expl, id),
    part_id: PART,
  };
}

function T(id, sintoma, cli, alts, rc, expl) {
  return {
    id,
    question_type: "ticket",
    isPremium: true,
    sintoma,
    cli_output: cli,
    alternativas: alts,
    resposta_correta: rc,
    explicacao_profunda: check(expl, id, "T"),
    part_id: PART,
  };
}

const content = {
  part_id: PART,
  title: "Lambda foundations (role, timeout, concurrency, VPC, triggers)",
  blueprint_module: "3.0",
  blueprint_topics: ["3.2", "2.1", "1.1"],
  verb: "Design",
  weight_percent: 24,
  topic_list: [
    "Function, handler, package/container (ideia de deploy)",
    "Execution role least privilege vs resource-based policy de invoke",
    "Timeout, memory e ephemeral storage (/tmp) ideia",
    "Concurrency: account unreserved, reserved concurrency, throttling",
    "Triggers: SQS, SNS, EventBridge, API Gateway, S3 event (ideia)",
    "Lambda em VPC: ENI, cold start, endpoints/NAT para APIs AWS",
    "Env vars vs Secrets Manager (sem secret em plaintext)",
    "CloudWatch Logs: log group e logs:CreateLogStream/PutLogEvents na role",
    "Versions e aliases (ideia de tráfego estável)",
    "TShoot: timeout, AccessDenied na role, throttle 429, VPC sem rota",
    "NÃO: Lambda@Edge full, SnapStart lab, provisioned concurrency deep, Step Functions lab, Layers deep",
  ],
  study_notes: [
    {
      heading: "Lambda no SAA-C03",
      bullets: [
        "Compute event-driven: escala com invocações, paga por duração/request (modelo serverless).",
        "Execution role define o que a function pode chamar (S3, SQS, Secrets, logs).",
        "Quem invoca (SQS, API GW, outra conta) pode precisar de resource policy de invoke além da role.",
      ],
      exam_tips: [
        "AccessDenied dentro da function → execution role; 403 de invoke externo → resource policy/permissions do trigger.",
      ],
    },
    {
      heading: "Timeout, memory e concurrency",
      bullets: [
        "Timeout máximo da function deve ser ≥ tempo real do job (com margem); senão Task timed out.",
        "Memory aloca CPU proporcional (ideia); mais memória pode reduzir duração.",
        "Reserved concurrency limita/garante capacidade; sem headroom → throttling.",
      ],
      exam_tips: [
        "Logs 'Task timed out after N seconds' → suba timeout ou quebre o trabalho; não é só 'falta de SG'.",
      ],
    },
    {
      heading: "VPC e path a serviços AWS",
      bullets: [
        "Lambda em subnet privada precisa de NAT ou VPC endpoints (Secrets, KMS, S3, SQS…) para APIs AWS.",
        "ENI/cold start: anexar a VPC aumenta latência de init (ideia).",
        "Sem path de rede, o sintoma parece timeout, não AccessDenied de IAM.",
      ],
      exam_tips: [
        "VPC Lambda + timeout em GetSecretValue com IAM ok → endpoint/NAT, não só amplie a policy.",
      ],
    },
    {
      heading: "Triggers e observabilidade",
      bullets: [
        "SQS event source mapping: role precisa receive/delete; batch e concurrency importam.",
        "S3/SNS/EventBridge/API GW disparam invoke conforme config e permissões.",
        "Logs vão ao CloudWatch; role precisa de permissões de log se não usar managed policy básica.",
      ],
      exam_tips: [
        "SQS não invoca → event source mapping enabled + permissões SQS na role + fila com msgs.",
      ],
    },
    {
      heading: "Anti-patterns de prova (Lambda)",
      bullets: [
        "Secrets em variáveis de ambiente plaintext.",
        "Timeout 3s para job de 2 minutos.",
        "AdministratorAccess na execution role.",
        "Lambda em VPC sem NAT/endpoints e culpar só o código.",
        "Reserved concurrency = 0 efetivo / sem conta para picos (throttle).",
      ],
      exam_tips: [
        "Separe: role · timeout/memory · concurrency · trigger · rede VPC · logs.",
      ],
    },
  ],
  key_commands: [
    "aws lambda get-function --function-name <name>",
    "aws lambda get-function-configuration --function-name <name>",
    "aws lambda update-function-configuration --timeout --memory-size --role",
    "aws lambda list-event-source-mappings --function-name <name>",
    "aws lambda create-event-source-mapping --event-source-arn <sqs-arn> ...",
    "aws lambda invoke --function-name <name> out.json",
    "aws logs describe-log-groups / filter-log-events",
    "aws iam get-role --role-name <exec-role>",
    "aws ec2 describe-vpc-endpoints / describe-nat-gateways",
    "aws lambda put-function-concurrency --reserved-concurrent-executions <n>",
  ],
  must_know: [
    "Execution role = o que a function faz; resource policy = quem invoca.",
    "Timeout < duração real → Task timed out; ajuste timeout ou arquitetura.",
    "Concurrency esgotada → throttle; reserved concurrency isola critical functions.",
    "VPC Lambda precisa de path (endpoint/NAT) para Secrets/KMS/S3 APIs.",
    "Triggers SQS/SNS/S3/API/EventBridge com permissões corretas.",
    "Secrets via Secrets Manager/SSM, não plaintext em env.",
    "Logs: CloudWatch + permissões de log na role.",
    "Fora: Lambda@Edge full, SnapStart/provisioned deep, Step Functions lab.",
  ],
  reuse_from_v1: null,
};

const questions = [
  Q(1,
    "Function processa uploads S3 e grava metadados em DynamoDB. O que define as permissões de S3/DynamoDB?",
    [
      "Execution role da function com least privilege s3 e dynamodb no ARN dos recursos",
      "Somente o Security Group da subnet pública",
      "Somente o record ALIAS do Route 53",
      "Somente o price class do CloudFront",
    ], 0,
    "A execution role autoriza chamadas AWS da function. SG/DNS/CloudFront não concedem s3:PutObject/dynamodb:PutItem. Tip de prova: Lambda AccessDenied em API AWS → execution role, não o SG do ALB."),

  Q(2,
    "Logs mostram 'Task timed out after 3.00 seconds'; o job legítimo leva ~45s. Correção direta?",
    [
      "Aumentar o timeout da function (ex. 60–90s) ou quebrar o trabalho assíncrono",
      "Abrir 0.0.0.0/0 no SG do RDS como único fix",
      "Trocar o runtime para 'desligar timeout'",
      "Remover a execution role",
    ], 0,
    "Timeout configurado < duração real mata o invoke. Ampliar timeout ou assíncrono (SQS) resolve. Remover a role piora auth. Tip de prova: Task timed out after N seconds → N é o timeout da config; suba ou redesenhe o job."),

  Q(3,
    "Picos de invoke geram 429 Too Many Requests / throttling na function crítica de pagamento. Controle típico?",
    [
      "Reserved concurrency adequada (e arquitetura de fila) para garantir/limitar capacidade",
      "Desligar o CloudWatch Logs",
      "Colocar a senha do DB em env plaintext",
      "CNAME no apex para a function URL",
    ], 0,
    "Reserved concurrency isola a function dos picos da conta; fila SQS ainda ajuda a bufferizar. Logs off e secret em env não curam throttle. Tip de prova: throttle Lambda em pico → concurrency reservada e/ou buffer SQS."),

  Q(4,
    "Lambda em subnets privadas chama GetSecretValue e dá timeout; IAM GetSecretValue está correto. Hipótese forte?",
    [
      "Sem NAT ou VPC endpoint para secretsmanager (e kms se CMK) — path de rede ausente",
      "Falta de s3:ListAllMyBuckets apenas",
      "Timeout da function em 900s sempre",
      "Alias Route 53 errado para o secret",
    ], 0,
    "IAM ok + timeout em API AWS de dentro da VPC aponta rede (endpoint/NAT). ListBucket e DNS do secret não criam path. Tip de prova: VPC Lambda + timeout Secrets/KMS com IAM ok → interface endpoint ou NAT."),

  Q(5,
    "Qual diferença execution role vs resource-based policy na function?",
    [
      "Role = o que a function pode chamar; resource policy = quais principals podem invocar a function",
      "São o mesmo documento IAM sempre",
      "Resource policy substitui o timeout",
      "Role define o memory size",
    ], 0,
    "Role é identity da function; resource policy controla invoke (conta, serviço). Timeout/memory são config, não policy de invoke. Tip de prova: 403 ao invocar de fora → resource policy; erro dentro ao chamar S3 → execution role."),

  Q(6,
    "Multi-constraint: processar 10k eventos/min de S3, least privilege, sem secret em env, e evitar throttle da function de fraud. Desenho?",
    [
      "S3 event → SQS → Lambda com role mínima, secret no Secrets Manager, reserved concurrency na fraud-fn",
      "S3 event → Lambda com AdministratorAccess e senha no env",
      "Polling manual sem fila e timeout 1s",
      "Uma EC2 t2.micro com SSH world open",
    ], 0,
    "SQS bufferiza, role mínima e Secrets Manager fecham segurança; reserved concurrency protege fraud-fn. Admin+senha no env violam least privilege. Tip de prova: S3 burst + segurança + anti-throttle → SQS + role mínima + Secrets + reserved concurrency."),

  Q(7,
    "Env var DB_PASSWORD=SuperSecret no console. Anti-pattern: por quê e alternativa?",
    [
      "Secret em plaintext no config; use Secrets Manager/SSM e GetSecretValue na role",
      "É obrigatório pela AWS em toda Lambda",
      "Substitui a need de CloudWatch",
      "Aumenta o reserved concurrency automaticamente",
    ], 0,
    "Env vars são visíveis a quem lê a config; secrets gerenciados + IAM são o padrão. Tip de prova: senha na env da Lambda → mover para Secrets Manager e permitir GetSecretValue."),

  Q(8,
    "Function sem permissão logs:CreateLogGroup/CreateLogStream/PutLogEvents. Sintoma?",
    [
      "Invokes podem 'funcionar' mas logs não aparecem no CloudWatch (ou falha ao criar log stream)",
      "A VPC é apagada",
      "O SQS vira FIFO sozinho",
      "O ALB perde o listener 443",
    ], 0,
    "Sem permissões de log a function não grava no log group. Não destrói VPC/ALB. Tip de prova: invoke ok e zero logs → IAM de logs na execution role (AWSLambdaBasicExecutionRole ideia)."),

  Q(9,
    "Event source mapping SQS enabled, fila com 500 msgs, mas Lambda nunca roda. Checks?",
    [
      "Permissões da role (sqs:ReceiveMessage/DeleteMessage), mapping state, batch size e se há erros de invoke",
      "Somente o TTL do CloudFront",
      "Somente o Multi-AZ do RDS sem consumers",
      "Somente o tipo de EBS root",
    ], 0,
    "SQS→Lambda depende do mapping e da role SQS. CloudFront/RDS/EBS não disparam o poller. Tip de prova: SQS cheia e Lambda idle → list-event-source-mappings + IAM SQS na role."),

  Q(10,
    "Memory 128 MB, CPU efetiva baixa, duração alta em CPU-bound. Ajuste ideia?",
    [
      "Aumentar memory size (escala CPU alocada) e medir custo/duração",
      "Desligar a execution role",
      "Colocar a function em /tmp de 0 bytes apenas",
      "Remover o trigger e esperar",
    ], 0,
    "Em Lambda, mais memória implica mais CPU (modelo AWS). Role off quebra permissões. Tip de prova: CPU-bound lento → teste memory maior e compare duration/cost."),

  Q(11,
    "Alias 'prod' aponta para version 5; deploy criou version 6. Como evitar que 100% do tráfego mude sem controle (ideia)?",
    [
      "Atualizar o alias com weighted shift gradual (ou canary) entre versões",
      "Sempre $LATEST em produção sem alias",
      "Apagar todas as versões antigas imediatamente",
      "Usar só env var para versionar código",
    ], 0,
    "Aliases com traffic shifting controlam rollout. $LATEST em prod é instável. Tip de prova: deploy seguro Lambda → versions + alias (canary/weighted)."),

  Q(12,
    "Reserved concurrency = 10; picos de 50 invokes simultâneos. O que ocorre com o excesso?",
    [
      "Throttling dos invokes acima do reserved (a menos que haja outra capacidade/arquitetura de fila)",
      "AWS ignora o limite sempre",
      "Converte automaticamente em EC2",
      "Aumenta o timeout para 900s sozinho",
    ], 0,
    "Reserved cap limita concorrência da function; excesso é throttled. Tip de prova: reserved=10 e 50 concurrent → 40 throttled (aprox) sem buffer."),

  Q(13,
    "Multi-constraint: API síncrona <2s p50, trabalho de 30s de enriquecimento, e least privilege. Padrão?",
    [
      "API Lambda só enfileira SQS (ack rápido); worker Lambda/EC2 processa 30s com role mínima",
      "Uma Lambda síncrona de 30s no request path do usuário com timeout 3s",
      "Senha no env e AdministratorAccess",
      "Polling em loop dentro da API até 30s com timeout 2s",
    ], 0,
    "Desacoplar com SQS mantém API rápida e job longo assíncrono. Timeout 3s em job 30s falha. Tip de prova: UX rápida + job longo → API ack + SQS + worker, não síncrono 30s no request."),

  Q(14,
    "lambda:InvokeFunction AccessDenied de uma role de pipeline. Onde corrigir?",
    [
      "Resource-based policy da function (e/ou IAM da role do pipeline) permitindo invoke",
      "Só o Security Group da Lambda ENI para 443 world",
      "Só o MessageRetentionPeriod da fila",
      "Só o price class CloudFront",
    ], 0,
    "Invoke entre principals usa resource policy da function e/ou identity do caller. SG não autoriza a API Lambda. Tip de prova: AccessDenied InvokeFunction → policy de invoke na function/caller."),

  Q(15,
    "Cold start percebido após colocar a function em VPC. Explicação ideia?",
    [
      "Criação/anexo de ENI e init em VPC aumentam latência de inicialização",
      "O S3 versioning desliga o handler",
      "O Route 53 remove o alias automaticamente",
      "O KMS apaga a role",
    ], 0,
    "VPC adds ENI overhead no init (ideia). Versioning/DNS/KMS não são a causa clássica do cold start VPC. Tip de prova: cold start pior após VPC → esperado; mitigue com design (keep-warm limitado, endpoints, etc.)."),

  Q(16,
    "Ephemeral storage /tmp (ideia): uso correto?",
    [
      "Espaço temporário por execution environment; não é storage durável entre deploys frios indefinidos",
      "Substitui o S3 para dados de 10 anos",
      "É o mesmo que EFS sempre montado por default",
      "Persiste após delete da function",
    ], 0,
    "/tmp é efêmero do environment; dados duráveis vão a S3/EFS/DB. Tip de prova: arquivo temporário no unzip → /tmp; artefato permanente → S3."),

  Q(17,
    "S3 ObjectCreated → Lambda; a function falha e S3 redrive não é fila. Risco de retry?",
    [
      "S3 pode retentar delivers; desenhe idempotência ou use SQS entre S3 e Lambda para controle de retry/DLQ",
      "S3 nunca retenta",
      "Falhas apagam o objeto automaticamente",
      "Reserved concurrency desliga retries de S3",
    ], 0,
    "Retries de evento S3 podem reinvocar; SQS no meio dá DLQ/visibilidade. Tip de prova: S3→Lambda com side effects → idempotência ou S3→SQS→Lambda."),

  Q(18,
    "Function precisa de 2 GB de libs nativas no package. Abordagem ideia (sem lab Layers deep)?",
    [
      "Otimizar package, container image Lambda, ou layers (ideia) — respeitar limites de tamanho do modelo escolhido",
      "Colocar as libs só em env vars base64 de 4 KB",
      "Usar CNAME no apex como storage",
      "Desligar a role para 'caber mais'",
    ], 0,
    "Pacote/imagem/layers endereçam dependências grandes; env vars não são FS. Tip de prova: dependências pesadas → imagem container ou package/layers, não env."),

  Q(19,
    "API Gateway → Lambda; 5xx com log 'Status: error' e stack na function. Onde olhar primeiro?",
    [
      "CloudWatch Logs da function e o erro da application; depois IAM e timeout",
      "Só o Multi-AZ do RDS sem logs",
      "Só o health check Route 53 do apex",
      "Só o sticky session do ALB de outra conta",
    ], 0,
    "Erro de aplicação aparece nos logs da function. R53/ALB alheios não substituem o stack trace. Tip de prova: API GW 5xx → logs da Lambda primeiro."),

  Q(20,
    "Fora de escopo profundo desta part Lambda foundations?",
    [
      "Execution role e timeout",
      "SQS event source e concurrency",
      "VPC endpoints/NAT para APIs AWS",
      "Lambda@Edge full, SnapStart lab, provisioned concurrency deep tuning e Step Functions lab",
    ], 3,
    "O piloto é Lambda clássica Associate. Edge/SnapStart/Step Functions deep ficam de fora. Tip de prova: se pedir Step Functions state machine complexa, não force só 'subir timeout'."),

  Q(21,
    "Dead-letter queue / on-failure destination (ideia) para async invoke: propósito?",
    [
      "Capturar eventos que esgotaram retries para análise (não perder silenciosamente)",
      "Aumentar memory automaticamente",
      "Remover a need de IAM",
      "Converter a function em EC2",
    ], 0,
    "Destinations/DLQ preservam falhas assíncronas. Não substituem IAM. Tip de prova: async Lambda falha sumindo → configure DLQ/on-failure destination."),

  Q(22,
    "Batch size SQS→Lambda = 10; uma msg do batch falha no partial batch (ideia). Risco se mal configurado?",
    [
      "Reprocessar o batch inteiro e reentregar msgs já ok (duplicatas) — use partial batch response/idempotência",
      "A fila apaga a conta AWS",
      "O timeout vira 0",
      "A role ganha AdministratorAccess",
    ], 0,
    "Falha de item pode reprocessar o lote; idempotência e partial failure report ajudam. Tip de prova: SQS batch com 1 poison → partial batch failure ou idempotência."),

  Q(23,
    "Function URL ou API GW pública sem auth. Risco?",
    [
      "Invoke anônimo e abuso de custo/throttle — proteja com auth (IAM, JWT, etc.) e WAF quando couber",
      "Melhora automática do least privilege da role",
      "Desliga logs",
      "Obriga VPC",
    ], 0,
    "Endpoint público sem auth é superfície de ataque e custo. Tip de prova: Lambda URL/API pública → auth e rate control, não aberta 'por teste' em prod."),

  Q(24,
    "put-function-concurrency reserved=0 (ou valor que impede execuções). Efeito?",
    [
      "Pode impedir invocações (throttle total) se reserved zera a capacidade efetiva da function",
      "Garante throughput ilimitado",
      "Apaga o código da function",
      "Muda o runtime para provided.al2 sozinho",
    ], 0,
    "Reserved 0 é anti-pattern clássico de 'desligar' invokes. Tip de prova: Lambda não roda e concurrency reserved 0 → ajuste reserved/unreserved."),

  Q(25,
    "Cross-account S3 trigger para Lambda (ideia): o que além da role?",
    [
      "Permissões de invoke na resource policy da Lambda e config de notificação S3 na conta origem",
      "Somente abrir 22 na ENI",
      "Somente ALIAS no apex",
      "Somente desligar BPA e nada de policy",
    ], 0,
    "S3 em outra conta precisa poder invocar a function (resource policy) e notificar. Tip de prova: S3 cross-account → Lambda invoke permission + bucket notification."),

  Q(26,
    "Memory 1024 MB, timeout 60s, job I/O bound a API externa lenta. Melhor eixo primeiro?",
    [
      "Timeout adequado + retries/backoff assíncrono; memory extra ajuda pouco se o gargalo é espera de rede",
      "Memory 10 GB obrigatório",
      "Remover todos os logs",
      "Reserved concurrency 1 sempre",
    ], 0,
    "I/O wait não some só com RAM; timeout e design async importam. Tip de prova: espera de API externa → timeout/async, não só max memory."),

  Q(27,
    "Handler não encontrado / Runtime.ImportModuleError após deploy. Causa típica?",
    [
      "Handler string ou package path incorreto no deploy (module.function) ou dependência ausente no package",
      "Falta de Multi-AZ no tópico SNS",
      "TTL DNS 300",
      "gp3 IOPS 3000 no EBS de outra conta",
    ], 0,
    "Import/handler errors são de packaging/config. Multi-AZ SNS e DNS não definem o module path. Tip de prova: ImportModuleError → handler path e zip/imagem de dependências."),

  Q(28,
    "X-Ray / tracing (menção): para que serve no TShoot de latência?",
    [
      "Mapear subsegments de calls a S3/HTTP e achar gargalo de duração",
      "Substituir a execution role",
      "Desligar o timeout",
      "Criar a VPC automaticamente",
    ], 0,
    "Tracing ajuda a ver onde o tempo vai. Não remove a need de role/timeout. Tip de prova: latência alta multi-serviço → X-Ray/trace + logs."),

  Q(29,
    "Checklist mental TShoot Lambda nesta part?",
    [
      "Só recriar a conta AWS",
      "Só aumentar o ASG de um serviço não relacionado",
      "Só desligar o versioning S3 global",
      "Logs/erro → timeout/memory → execution role → concurrency/throttle → event source → VPC path (endpoint/NAT) → secrets",
    ], 3,
    "Ordem isola app, limites, IAM, trigger e rede. Recriar conta não é o primeiro passo. Tip de prova: timeout vs AccessDenied vs throttle são eixos diferentes — classifique o sintoma nos logs."),

  Q(30,
    "Resumo Lambda foundations no SAA-C03:",
    [
      "Admin role + secret no env + timeout 1s + VPC sem NAT para jobs longos",
      "Sem logs, sem fila, invoke público sem auth",
      "Reserved 0 e culpar o runtime sempre",
      "Role mínima, timeout/memory/concurrency alinhados, triggers com permissão, Secrets gerenciados, VPC com path AWS, logs no CloudWatch",
    ], 3,
    "Bom desenho une least privilege, limites corretos, triggers, secrets e rede. Admin+timeout 1s+VPC sem path são anti-patterns. Tip de prova: se a opção equilibra role, timeout, concurrency, trigger e VPC path, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1101: Lambda report-gen termina com Task timed out; job de PDF leva ~2 min.",
    `$ aws lambda get-function-configuration --function-name report-gen
Timeout: 30
MemorySize: 512
Role: arn:aws:iam::111122223333:role/report-gen-role
VpcConfig: null

$ aws logs filter-log-events --log-group-name /aws/lambda/report-gen --filter-pattern "Task timed out"
... Task timed out after 30.00 seconds
... REPORT Duration: 30000.12 ms ... Status: timeout

# Business: PDF generation p50=90s p99=110s on same code path in staging with Timeout 120`,
    [
      "Aumentar Timeout para ≥120s (e monitorar) ou mover o job para assíncrono (SQS) se o client não pode esperar",
      "Remover a execution role",
      "Só criar um CNAME no apex",
      "Desabilitar CloudWatch Logs",
    ], 0,
    "Timeout 30s < p99 110s explica Task timed out. Role off e DNS não estendem o limite de execução. Tip de prova: Task timed out after 30s com job de 2 min → suba Timeout ou assíncrono."),

  T(2,
    "NOC-AWS-1102: Lambda order-writer falha ao PutItem no DynamoDB com AccessDenied.",
    `$ aws sts get-caller-identity
# from inside function simulation
Arn: arn:aws:sts::111122223333:assumed-role/order-writer-role/...

$ aws lambda get-function-configuration --function-name order-writer
Role: arn:aws:iam::111122223333:role/order-writer-role

$ aws iam list-attached-role-policies --role-name order-writer-role
Attached: AWSLambdaBasicExecutionRole
# only logs

$ aws logs filter-log-events --log-group-name /aws/lambda/order-writer --filter-pattern "AccessDenied"
... User is not authorized to perform: dynamodb:PutItem on resource: arn:aws:dynamodb:us-east-1:111122223333:table/Orders

Timeout: 10  MemorySize: 256  # not the failing axis`,
    [
      "Anexar policy com dynamodb:PutItem no ARN da tabela Orders à execution role",
      "Só aumentar o timeout para 900",
      "Só habilitar reserved concurrency 100",
      "Só colocar a function em VPC sem endpoints",
    ], 0,
    "AccessDenied dynamodb:PutItem com role só de logs fecha IAM. Timeout/concurrency/VPC não concedem PutItem. Tip de prova: AccessDenied na action do recurso → execution role Allow no ARN."),

  T(3,
    "NOC-AWS-1103: Function checkout-fn com reserved concurrency 5; Black Friday gera milhares de 429.",
    `$ aws lambda get-function-concurrency --function-name checkout-fn
ReservedConcurrentExecutions: 5

$ aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Throttles \\
  --dimensions Name=FunctionName,Value=checkout-fn ...
# Throttles spike 10:00–11:00

$ aws cloudwatch get-metric-statistics ... ConcurrentExecutions
# plateaus at 5

# API Gateway integration sync → user-facing 429/5xx
# SQS buffer not in front of checkout-fn`,
    [
      "Aumentar reserved concurrency (com base na conta) e/ou colocar SQS buffer + async para absorver picos",
      "Apagar o log group",
      "Remover a policy de logs para 'ir mais rápido'",
      "Trocar o runtime sem mudar concurrency",
    ], 0,
    "ConcurrentExecutions no teto do reserved=5 + Throttles explicam 429. Logs off não aumentam concurrency. Tip de prova: Throttles com ConcurrentExecutions=reserved → suba reserved ou bufferize com SQS."),

  T(4,
    "NOC-AWS-1104: Lambda em VPC não alcança Secrets Manager; IAM GetSecretValue ok.",
    `$ aws lambda get-function-configuration --function-name pay-fn
VpcConfig:
  SubnetIds: [subnet-0priva, subnet-0privb]
  SecurityGroupIds: [sg-lambda]
Timeout: 10

$ aws iam get-role-policy --role-name pay-fn-role --policy-name secrets
# Allow secretsmanager:GetSecretValue on arn:...:secret:prod/db-*
# Allow kms:Decrypt on cmk-sec

$ aws logs filter-log-events --log-group-name /aws/lambda/pay-fn --filter-pattern "timeout"
... Task timed out after 10.00 seconds
# stack shows hang on GetSecretValue HTTP client

$ aws ec2 describe-nat-gateways --filter Name=vpc-id,Values=vpc-0app
NatGateways: []

$ aws ec2 describe-vpc-endpoints --filters Name=vpc-id,Values=vpc-0app
# no secretsmanager or kms interface endpoints

$ aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=subnet-0priva
Routes: 10.0.0.0/16 local   # no 0.0.0.0/0 to nat`,
    [
      "Criar VPC endpoints (secretsmanager/kms) ou NAT + rota 0.0.0.0/0 nas subnets da Lambda — IAM já está ok",
      "Remover GetSecretValue da role",
      "Desabilitar a CMK",
      "Só aumentar memory para 10 GB",
    ], 0,
    "IAM ok + timeout + zero NAT/endpoints nas privadas = path de rede. Memory não cria rota a Secrets. Tip de prova: VPC Lambda timeout em AWS API com IAM ok → endpoint/NAT."),

  T(5,
    "NOC-AWS-1105: Fila orders-q tem 2k msgs; Lambda orders-worker não é invocada.",
    `$ aws sqs get-queue-attributes --queue-url .../orders-q --attribute-names ApproximateNumberOfMessagesVisible
ApproximateNumberOfMessagesVisible: 2044

$ aws lambda list-event-source-mappings --function-name orders-worker
[
  {
    "UUID": "1111-2222",
    "EventSourceArn": "arn:aws:sqs:us-east-1:111122223333:orders-q",
    "State": "Enabled",
    "LastProcessingResult": "PROBLEM: Function call failed",
    "BatchSize": 10
  }
]

$ aws iam list-attached-role-policies --role-name orders-worker-role
AWSLambdaBasicExecutionRole
# missing sqs:ReceiveMessage, DeleteMessage, GetQueueAttributes on orders-q

$ aws logs filter-log-events --log-group-name /aws/lambda/orders-worker --filter-pattern "AccessDenied"
... not authorized to perform: sqs:ReceiveMessage ...`,
    [
      "Permitir sqs:ReceiveMessage/DeleteMessage/GetQueueAttributes na role e corrigir o mapping até LastProcessingResult OK",
      "Apagar todas as mensagens da fila sem fix de IAM",
      "Desabilitar o event source mapping e esperar",
      "Trocar a fila para FIFO sem policy SQS na role",
    ], 0,
    "Mapping enabled mas AccessDenied ReceiveMessage impede o poller. Apagar msgs esconde o backlog sem corrigir IAM. Tip de prova: SQS cheia + Lambda idle + AccessDenied ReceiveMessage → IAM SQS na execution role."),
];

function move(id, newRc) {
  const item = questions.find((x) => x.id === id);
  const c = item.resposta_correta;
  if (c === newRc) return;
  const alts = [...item.alternativas];
  const correct = alts[c];
  alts.splice(c, 1);
  alts.splice(newRc, 0, correct);
  item.alternativas = alts;
  item.resposta_correta = newRc;
}
{
  const r = [0, 0, 0, 0];
  questions.forEach((q) => r[q.resposta_correta]++);
  const by = (rc) => questions.filter((q) => q.resposta_correta === rc).map((q) => q.id);
  while (r[0] > 8) {
    const id = by(0).pop();
    if (!id) break;
    const t = r[1] < 8 ? 1 : r[2] < 7 ? 2 : 3;
    move(id, t);
    r[0]--;
    r[t]++;
  }
  while (r[1] > 8) {
    const id = by(1).pop();
    if (!id) break;
    const t = r[2] < 7 ? 2 : 3;
    move(id, t);
    r[1]--;
    r[t]++;
  }
}

const tipCount = {};
for (const q of questions) {
  const m = q.explicacao_profunda.match(/Tip de prova:[^.]*\./i);
  const t = m ? m[0] : "";
  tipCount[t] = (tipCount[t] || 0) + 1;
}
const rep = Object.entries(tipCount).filter(([, n]) => n >= 3);
if (rep.length) console.warn("WARN tips", rep);

// check pad phrase not identical in >=3 - "Em Lambda #${id}" differs by id
const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

fs.writeFileSync(path.join(PARTS, "part-aws-1.10-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.10-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.10-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  repTips: rep.length,
});
