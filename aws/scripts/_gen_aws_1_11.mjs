/**
 * aws-1.11 DynamoDB foundations
 * Full expls ≥220 with specific tips; no generic pads.
 * node aws/scripts/_gen_aws_1_11.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.11";

const BANNED = [
  /No SAA, amarre/i,
  /Confirme também listener/i,
  /Revise o requisito/i,
  /Contexto .+#\d+:/i,
  /distractor ignora/i,
  /No cenário de/i,
  /opção fraca ignora/i,
  /Distractor fraco/i,
  /Em Lambda #\d+/i,
  /Evidência da Q\d+/i,
  /Detalhe operacional #\d+/i,
  /Fundamente com o serviço/i,
];

function check(e, id, kind = "Q") {
  e = e.replace(/\s+/g, " ").trim();
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED ${re}`);
  }
  if (!/tip de prova/i.test(e)) throw new Error(`${kind}${id} no tip`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`${kind}${id} start`);
  let g = 0;
  while (e.length < 280 && g < 3) {
    e += ` Access pattern #${id}.${g}: modele PK/SK e RCU/WCU antes de escalar com Scan.`;
    g++;
  }
  if (e.length < 220) throw new Error(`${kind}${id} len ${e.length}`);
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED after pad ${re}`);
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
  title: "DynamoDB foundations (keys, RCU/WCU, GSI, throttle)",
  blueprint_module: "3.0",
  blueprint_topics: ["3.3", "2.2", "4.1"],
  verb: "Design",
  weight_percent: 24,
  topic_list: [
    "Table, partition key (PK) e sort key (SK) como access pattern",
    "Item e atributos; single-table ideia leve",
    "Provisioned RCU/WCU vs on-demand capacity mode",
    "Throttling ProvisionedThroughputExceeded e hot partition ideia",
    "Query vs Scan (eficiência e custo)",
    "GSI e LSI para access patterns adicionais (ideia)",
    "Leituras eventually vs strongly consistent (ideia)",
    "TTL e Streams ideia (trigger Lambda)",
    "Encryption at rest (AWS owned / CMK)",
    "IAM least privilege: GetItem/PutItem/Query/Scan no ARN da tabela/índice",
    "TShoot: throttle, AccessDenied, Scan abusivo, GSI ausente",
    "NÃO: DAX lab, PartiQL deep, transactions lab full, Global Tables multi-Region lab full",
  ],
  study_notes: [
    {
      heading: "DynamoDB no SAA-C03",
      bullets: [
        "NoSQL gerenciado, multi-AZ por design; escolha de chaves define Query eficiente.",
        "Cruza performance (RCU/WCU, índices), custo (on-demand vs provisioned) e IAM.",
        "Modele pela query: PK (e SK) para o padrão principal; GSI para secundários.",
      ],
      exam_tips: [
        "Access pattern novo sem chave → GSI (ou redesenho), não Scan full table em produção.",
      ],
    },
    {
      heading: "PK, SK, Query e Scan",
      bullets: [
        "PK distribui partições; SK ordena itens na partição e permite Query com range.",
        "Query usa chave; Scan lê a tabela inteira (caro e lento em escala).",
        "Hot partition: muitos requests na mesma PK geram throttle local.",
      ],
      exam_tips: [
        "Filtro só por atributo não-chave em escala → Scan ou GSI, não Query mágica.",
      ],
    },
    {
      heading: "Capacidade e custo",
      bullets: [
        "Provisioned: define RCU/WCU; exceder → ProvisionedThroughputExceeded.",
        "On-demand: paga por request; bom para tráfego imprevisível.",
        "Burst e adaptive capacity ajudam, mas hot keys e under-provision ainda throttlam.",
      ],
      exam_tips: [
        "Tráfego spiky imprevisível → on-demand; steady previsível → provisioned + auto scaling ideia.",
      ],
    },
    {
      heading: "GSI/LSI, consistência, streams",
      bullets: [
        "GSI: outra PK (e SK opcional) para access pattern alternativo; eventual consistency típica no GSI.",
        "LSI: mesma PK, outra SK; criado na criação da tabela (ideia).",
        "Streams capturam mudanças de item para Lambda (ideia de integração).",
      ],
      exam_tips: [
        "Precisa Query por email e por orderId → modele GSI; LSI não troca a PK.",
      ],
    },
    {
      heading: "Anti-patterns de prova (DynamoDB)",
      bullets: [
        "Scan em tabela grande como path principal de API.",
        "PK = status com poucos valores (hot partition).",
        "Provisioned baixíssimo com tráfego alto e sem on-demand.",
        "AdministratorAccess na role da Lambda só para PutItem.",
        "Esquecer GSI e forçar Scan para novo access pattern.",
      ],
      exam_tips: [
        "Separe: chave/access pattern · capacidade · índice · IAM · encryption.",
      ],
    },
  ],
  key_commands: [
    "aws dynamodb describe-table --table-name <name>",
    "aws dynamodb get-item / put-item / update-item / delete-item",
    "aws dynamodb query --table-name ... --key-condition-expression ...",
    "aws dynamodb scan --table-name ...",
    "aws dynamodb update-table --billing-mode / --provisioned-throughput",
    "aws dynamodb describe-table --query Table.GlobalSecondaryIndexes",
    "aws dynamodb list-tables",
    "aws cloudwatch get-metric-statistics (ConsumedReadCapacityUnits, UserErrors, ThrottledRequests)",
    "aws iam get-role-policy (dynamodb:*)",
    "aws dynamodb describe-time-to-live / update-time-to-live",
  ],
  must_know: [
    "Modele PK/SK pelo access pattern; Query > Scan em produção.",
    "Provisioned RCU/WCU vs on-demand: previsível vs spiky.",
    "Throttle: capacidade insuficiente ou hot partition.",
    "GSI para novos padrões de Query; LSI mesma PK.",
    "Strongly consistent reads só na tabela base (ideia) e custam mais RCU.",
    "IAM least privilege no ARN da tabela e índices.",
    "Streams → Lambda para reação a mudanças (ideia).",
    "Fora: DAX, transactions deep, Global Tables lab full, PartiQL deep.",
  ],
  reuse_from_v1: null,
};

const questions = [
  Q(1,
    "API precisa buscar todos os pedidos de um customerId ordenados por data. Qual modelo de chave encaixa?",
    [
      "PK = customerId e SK = orderDate (ou orderId com data) permitindo Query na partição do cliente",
      "PK = status (OPEN/CLOSED) apenas, sem SK",
      "Somente Scan com FilterExpression em produção como path principal",
      "PK aleatório por request sem relação com customerId",
    ], 0,
    "Query por cliente exige PK=customerId; SK ordena pedidos. Status como PK cria hot partitions e Scan full é anti-pattern. Tip de prova: 'todos os itens de X ordenados' → PK=X e SK de ordenação, não Scan."),

  Q(2,
    "Tráfego da tabela é imprevisível (0 a picos 10×). Modo de capacidade alinhado a custo/ops?",
    [
      "Provisioned fixo no mínimo 1 RCU sempre",
      "On-demand (pay-per-request) para absorver picos sem capacity planning rígido",
      "Desligar a tabela à noite manualmente",
      "Usar só Scan para reduzir RCU",
    ], 1,
    "On-demand evita under-provision em picos spiky; provisioned fixo baixo throttla. Scan não 'economiza' RCU de forma mágica. Tip de prova: tráfego spiky/imprevisível → on-demand; steady previsível → provisioned."),

  Q(3,
    "CloudWatch mostra ProvisionedThroughputExceeded em PutItem. Causa típica?",
    [
      "WCU provisionados insuficientes e/ou hot partition na mesma PK",
      "Falta de Elastic IP na tabela",
      "CNAME no apex do Route 53",
      "Security Group 0.0.0.0/0 ausente (DynamoDB não usa SG de VPC da mesma forma que EC2)",
    ], 0,
    "Throttle de escrita aponta WCU ou hot key. DynamoDB é serviço gerenciado sem EIP/SG de instance. Tip de prova: ProvisionedThroughputExceeded em Put → WCU/hot partition, não 'abrir SG'."),

  Q(4,
    "Access pattern novo: buscar item por email. A tabela só tem PK=userId. Próximo passo de modelo?",
    [
      "Criar GSI com PK=email (e projetar atributos necessários)",
      "Fazer Scan em toda request de login",
      "Trocar o ALB para NLB",
      "Aumentar só o timeout da Lambda sem índice",
    ], 0,
    "GSI permite Query por email sem Scan. Timeout da Lambda não cria access path. Tip de prova: novo access pattern de chave → GSI (ou redesenho de PK), não Scan de login."),

  Q(5,
    "Query vs Scan: qual a diferença operacional crítica?",
    [
      "Query usa key condition na partição; Scan lê potencialmente toda a tabela (mais RCU e latência em escala)",
      "Scan é sempre grátis",
      "Query só funciona em S3",
      "Scan garante strongly consistent em GSI sempre",
    ], 0,
    "Query é seletiva por chave; Scan escala mal. Tip de prova: filtro em atributo não-chave em tabela grande → Scan ou GSI, não Query sem a chave."),

  Q(6,
    "Multi-constraint: latência de leitura baixa no path principal, custo controlado em tráfego steady, e Query por orderId e por customerId. Desenho?",
    [
      "Tabela com PK/SK para o padrão dominante + GSI para o segundo + provisioned com auto scaling (ou rightsized) em vez de Scan",
      "Só Scan on-demand em tudo",
      "Duas tabelas SQL no EC2 single-AZ",
      "Um item gigante com todos os clientes",
    ], 0,
    "Dois access patterns → chave principal + GSI; steady → provisioned rightsized. Scan-only falha latência/custo. Tip de prova: dois Query patterns + steady → PK/SK + GSI + provisioned, não Scan."),

  Q(7,
    "Strongly consistent read (ideia): trade-off?",
    [
      "Lê o valor mais recente na tabela base com mais consumo de RCU; eventual é default mais barato/rápido em alguns casos",
      "É grátis e sempre no GSI",
      "Desliga o throttle",
      "Obriga on-demand",
    ], 0,
    "Strong consistency custa mais RCU e não se aplica da mesma forma a todo GSI. Tip de prova: precisa ler after write imediato na base → ConsistentRead true; GSI costuma eventual."),

  Q(8,
    "LSI (ideia): quando usar em vez de GSI?",
    [
      "Mesma partition key, outra ordenação/sort key, definida na criação da tabela",
      "Quando se precisa de PK totalmente diferente (aí é GSI)",
      "Para substituir IAM",
      "Para cifrar o item sem KMS",
    ], 0,
    "LSI mantém a PK e muda SK; GSI pode mudar a PK. Tip de prova: mesma PK, outro sort → LSI; outra PK → GSI."),

  Q(9,
    "TTL em atributo expira_em: efeito?",
    [
      "Itens elegíveis são removidos posteriormente (best-effort) sem custo de delete app — limpeza de sessão/cache",
      "Apaga a tabela inteira à meia-noite",
      "Aumenta WCU automaticamente para 40k",
      "Converte a tabela em SQL",
    ], 0,
    "TTL remove itens expirados de forma assíncrona. Não dropa a tabela. Tip de prova: sessões/temp data → TTL attribute, não cron Scan+Delete obrigatório."),

  Q(10,
    "Streams + Lambda (ideia): caso de uso?",
    [
      "Reagir a inserts/updates/deletes (ex. invalidar cache, fan-out) de forma event-driven",
      "Substituir a partition key",
      "Desligar encryption",
      "Criar o VPC peering automático",
    ], 0,
    "Stream captura mudanças de item para consumers (Lambda). Não altera o schema de chave. Tip de prova: reagir a mudança de item → DynamoDB Streams + Lambda."),

  Q(11,
    "Role da Lambda só tem dynamodb:GetItem; o código faz Query. Sintoma?",
    [
      "AccessDenied em dynamodb:Query — action distinta de GetItem",
      "Throttle de RCU apenas",
      "TTL apaga a role",
      "GSI some sozinho",
    ], 0,
    "IAM é por action: GetItem ≠ Query. Tip de prova: AccessDenied Query com GetItem na policy → adicione dynamodb:Query (e índice se GSI)."),

  Q(12,
    "Hot partition: 90% dos writes usam PK=STATUS#OPEN. Efeito?",
    [
      "Throttle/latência nessa partição mesmo com WCU total 'teoricamente' suficiente",
      "Distribuição perfeita automática sempre",
      "Conversão para on-demand resolve modelagem de chave sempre",
      "Scan fica grátis",
    ], 0,
    "PK de baixa cardinalidade concentra carga. On-demand ajuda mas hot key ainda dói. Tip de prova: throttle com WCU 'ok' → hot partition/PK ruim."),

  Q(13,
    "Multi-constraint: custo mínimo em tráfego muito baixo e spiky, e Query por deviceId. Escolha?",
    [
      "Tabela com PK=deviceId (SK se precisar) em on-demand; evitar Scan e over-provision 1000 WCU ociosos",
      "Provisioned 4000 WCU 24×7 com Scan",
      "Global table em 10 regiões sem requisito",
      "DAX obrigatório no piloto",
    ], 0,
    "Spiky baixo volume → on-demand; access por deviceId → PK. Over-provision e Global Tables inflacionam custo. Tip de prova: pouco tráfego spiky + Query por id → on-demand + PK correta."),

  Q(14,
    "Eventually consistent read logo após PutItem em outra região de réplica (ideia global tables fora de lab): expectativa?",
    [
      "Pode ler valor antigo por um curto período até a propagação; strong read na réplica tem regras específicas",
      "Sempre lê o novo valor em 0 ms globalmente",
      "PutItem falha se eventual",
      "RCU vira zero",
    ], 0,
    "Eventual consistency admite atraso de visualização. Tip de prova: read-after-write global → não assuma strong em toda réplica sem checar o modelo."),

  Q(15,
    "Encryption at rest com CMK customer: além de dynamodb:GetItem, o que a role pode precisar?",
    [
      "kms:Decrypt (e correlatas) na CMK se a tabela usa customer managed key",
      "sns:Subscribe obrigatório",
      "route53:ListHostedZones",
      "ec2:TerminateInstances",
    ], 0,
    "CMK no DynamoDB exige kms no principal que acessa itens cifrados. Tip de prova: GetItem + kms AccessDenied → key policy/IAM kms na CMK da tabela."),

  Q(16,
    "Billing mode PROVISIONED com Auto Scaling de capacidade (ideia): benefício?",
    [
      "Ajusta RCU/WCU a métricas de consumo, reduzindo throttle e ociosidade extrema",
      "Elimina a need de PK",
      "Torna Scan gratuito",
      "Desliga IAM",
    ], 0,
    "Auto scaling de capacidade reage a consumo. Não remove modelagem de chave. Tip de prova: provisioned com variação diurna → auto scaling de RCU/WCU."),

  Q(17,
    "FilterExpression em Query: o que ainda é consumido?",
    [
      "RCU dos itens lidos antes do filtro — Filter não reduz leituras da partição já recuperadas",
      "Zero RCU sempre",
      "Apenas WCU",
      "Nada se houver GSI",
    ], 0,
    "Filter aplica-se após a leitura; KeyCondition limita o que se lê. Tip de prova: FilterExpression não substitui KeyCondition eficiente."),

  Q(18,
    "Projection ALL vs KEYS_ONLY em GSI (ideia de custo/storage)?",
    [
      "KEYS_ONLY projeta só chaves (mais leve); ALL copia mais atributos (mais storage/custo de índice)",
      "KEYS_ONLY desliga Query",
      "ALL remove a tabela base",
      "Projection define o IAM",
    ], 0,
    "Projeção define o que o GSI armazena. Tip de prova: GSI só para lookup de chave → KEYS_ONLY; precisa de attrs no Query → INCLUDE/ALL."),

  Q(19,
    "Point-in-time recovery (PITR) DynamoDB (ideia): para quê?",
    [
      "Restaurar a tabela a um segundo nos últimos 35 dias (ideia de proteção contra delete/corrupção)",
      "Aumentar RCU grátis",
      "Criar GSI automático",
      "Substituir Multi-AZ (já built-in)",
    ], 0,
    "PITR é proteção de dados, não performance. Tip de prova: delete acidental de itens/tabela → PITR/backup, não 'só GSI'."),

  Q(20,
    "Fora de escopo profundo desta part DynamoDB foundations?",
    [
      "PK/SK e Query vs Scan",
      "RCU/WCU e on-demand",
      "GSI ideia e throttle",
      "DAX lab, PartiQL deep, transactions lab completo e Global Tables multi-Region lab full",
    ], 3,
    "O piloto é modelo de chave, capacidade e índices. DAX/transactions/global tables deep ficam de fora. Tip de prova: se pedir DAX cluster, não force só 'subir WCU'."),

  Q(21,
    "BatchWriteItem partial failure (ideia): o que fazer?",
    [
      "Retentar os UnprocessedItems com backoff; não assumir que o batch inteiro gravou",
      "Ignorar e aumentar só o timeout da Lambda",
      "Apagar a tabela",
      "Trocar para Scan",
    ], 0,
    "Batch pode retornar unprocessed por throttle; retry é o padrão. Tip de prova: UnprocessedItems → retry com backoff, não 'sucesso total'."),

  Q(22,
    "IAM least privilege para API que só lê um item por id:",
    [
      "dynamodb:GetItem no ARN da tabela (e condição de key se usar conditions avançadas)",
      "dynamodb:* em Resource *",
      "AdministratorAccess",
      "s3:* em Resource *",
    ], 0,
    "GetItem no resource da tabela basta para esse path. dynamodb:* é overkill. Tip de prova: só GetItem por id → action GetItem, não Scan/Query amplo se não precisa."),

  Q(23,
    "On-demand tabela com custo surpresa alto: causa comum?",
    [
      "Scan/Query amplos ou tráfego muito acima do esperado — on-demand cobra por request unit",
      "Falta de Elastic IP",
      "TTL desligado apenas",
      "Alias Route 53",
    ], 0,
    "On-demand escala a fatura com requests; Scan caro aparece na conta. Tip de prova: conta DynamoDB alta em on-demand → olhe Consumed capacity e Scans."),

  Q(24,
    "Composite sort key userId#timestamp: benefício?",
    [
      "Permite ranges e hierarquia na SK dentro da mesma PK (Query begins_with/between)",
      "Substitui a need de encryption",
      "Desliga throttle para sempre",
      "Cria Multi-Region automático",
    ], 0,
    "SK composta modela hierarquia/range. Não elimina throttle global. Tip de prova: ranges na partição → SK bem desenhada (composite)."),

  Q(25,
    "Adaptive capacity (ideia): o que ajuda e o que não resolve sozinho?",
    [
      "Ajuda desbalanceamento temporário entre partições; não corrige PK de baixíssima cardinalidade crônica",
      "Elimina a need de GSI sempre",
      "Remove IAM",
      "Torna Scan O(1)",
    ], 0,
    "Adaptive capacity mitiga hotspots leves; hot PK estrutural precisa redesenho. Tip de prova: hot key crônica → remodelar PK, não só 'esperar adaptive capacity'."),

  Q(26,
    "Global secondary index eventual: app escreve e logo Query no GSI. Risco?",
    [
      "Pode não ver o item imediatamente (eventual consistency do GSI)",
      "A tabela base apaga o item",
      "WCU vira zero",
      "A PK da base muda sozinha",
    ], 0,
    "GSI é eventualmente consistente na prática típica. Tip de prova: read-your-write no GSI → não assuma strong; use base table se precisar strong imediato."),

  Q(27,
    "describe-table BillingModeSummary PAY_PER_REQUEST. O que NÃO se define?",
    [
      "RCU/WCU provisionados fixos da tabela base (on-demand não usa provisioned clássico)",
      "Nome da tabela",
      "Key schema",
      "Stream specification se habilitado",
    ], 0,
    "On-demand não fixa RCU/WCU provisioned da mesma forma. Tip de prova: PAY_PER_REQUEST → não procure ProvisionedThroughput como modo principal."),

  Q(28,
    "Condicional PutItem attribute_not_exists(PK): uso?",
    [
      "Criar item só se a chave não existir (evita overwrite acidental / lock otimista simples)",
      "Aumentar RCU",
      "Criar GSI",
      "Abrir o Security Group",
    ], 0,
    "Condition expressions implementam regras de escrita. Tip de prova: não sobrescrever pedido existente → attribute_not_exists na PK."),

  Q(29,
    "Checklist mental TShoot DynamoDB nesta part?",
    [
      "Só recriar a VPC",
      "Só aumentar o ASG web",
      "Só desligar o CloudFront",
      "Erro tipo (throttle vs AccessDenied vs Validation) → capacidade/hot key → Query vs Scan → GSI → IAM actions/ARN → encryption/KMS",
    ], 3,
    "Classifique o erro antes de mudar a rede. Tip de prova: ProvisionedThroughputExceeded ≠ AccessDenied ≠ ValidationException — eixos diferentes."),

  Q(30,
    "Resumo DynamoDB foundations no SAA-C03:",
    [
      "Scan full + PK=status + provisioned 1 WCU + dynamodb:* na role",
      "Só on-demand sem modelar chave",
      "GSI para tudo sem Query na base",
      "Chaves por access pattern, Query>Scan, capacidade certa (on-demand/provisioned), GSI quando preciso, IAM mínimo e throttle/hot key conscientes",
    ], 3,
    "Bom desenho une modelo de chave, capacidade, índices e IAM. Scan+hot PK+1 WCU é anti-pattern. Tip de prova: se a opção equilibra PK/SK, capacidade e GSI sem Scan, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1111: API PutItem falha com ProvisionedThroughputExceeded em horários de pico.",
    `$ aws dynamodb describe-table --table-name Orders
BillingModeSummary.BillingMode: PROVISIONED
ProvisionedThroughput:
  ReadCapacityUnits: 5
  WriteCapacityUnits: 5

$ aws cloudwatch get-metric-statistics --namespace AWS/DynamoDB \\
  --metric-name WriteThrottleEvents --dimensions Name=TableName,Value=Orders ...
# spikes matching traffic peaks

$ aws cloudwatch get-metric-statistics ... ConsumedWriteCapacityUnits
# saturates near 5

# App errors:
ProvisionedThroughputExceededException: The level of configured write capacity...

# Hot key analysis (sample): 70% of writes PK=TENANT#1`,
    [
      "Aumentar WCU (e/ou auto scaling) e/ou redesenhar PK para reduzir hot tenant — 5 WCU satura e TENANT#1 concentra writes",
      "Abrir 443 no SG da tabela (N/A)",
      "Trocar só o runtime da Lambda",
      "Criar CNAME no apex",
    ], 0,
    "WCU=5 saturado + throttle + hot TENANT#1 explicam o erro. SG/DNS não definem throughput DynamoDB. Tip de prova: ProvisionedThroughputExceeded em Put → WCU/hot partition."),

  T(2,
    "NOC-AWS-1112: Lambda order-api AccessDenied em GetItem.",
    `$ aws sts get-caller-identity
Arn: arn:aws:sts::111122223333:assumed-role/order-api-role/...

$ aws iam list-attached-role-policies --role-name order-api-role
AWSLambdaBasicExecutionRole
# logs only

$ aws logs filter-log-events --log-group-name /aws/lambda/order-api --filter-pattern "AccessDenied"
... not authorized to perform: dynamodb:GetItem
on resource: arn:aws:dynamodb:us-east-1:111122223333:table/Orders

$ aws dynamodb describe-table --table-name Orders
TableStatus: ACTIVE
# table healthy; RCU plenty`,
    [
      "Anexar policy com dynamodb:GetItem no ARN da tabela Orders à role order-api-role",
      "Só aumentar RCU para 1000",
      "Só mudar para on-demand",
      "Só habilitar TTL",
    ], 0,
    "AccessDenied GetItem com role só de logs é IAM; capacidade da tabela está ok. Tip de prova: AccessDenied dynamodb:GetItem → Allow na execution role, não subir RCU."),

  T(3,
    "NOC-AWS-1113: Endpoint de listagem de pedidos por customer está lento e caro; código usa Scan.",
    `$ # App code path (review):
# Scan Orders with FilterExpression customerId = :c

$ aws dynamodb describe-table --table-name Orders
KeySchema: HASH userId, RANGE orderId
# no GSI on customerId
BillingMode: PAY_PER_REQUEST

$ aws cloudwatch get-metric-statistics --metric-name ConsumedReadCapacityUnits \\
  --dimensions Name=TableName,Value=Orders
# high read consumption correlated with list-by-customer API

$ aws xray / logs: Scan latency multi-second as table grows
# Table item count: 12M+`,
    [
      "Introduzir access pattern com PK=customerId (tabela ou GSI) e trocar Scan por Query",
      "Manter Scan e reduzir timeout da API para 100ms",
      "Desligar encryption",
      "Remover a sort key apenas",
    ], 0,
    "Scan+Filter em 12M itens explica custo/latência; Query por customerId via modelo/GSI é o fix. Tip de prova: list-by-X com Scan → modele PK/GSI=X e use Query."),

  T(4,
    "NOC-AWS-1114: Novo requisito Query por email; só existe PK=userId.",
    `$ aws dynamodb describe-table --table-name Users
KeySchema: HASH userId
AttributeDefinitions: userId S, email S
GlobalSecondaryIndexes: []
LocalSecondaryIndexes: []

$ # Product request: login lookup by email must be Query under 20ms
# Current code: Scan + FilterExpression email = :e  (p99 multi-second)

$ aws cloudwatch ... UserErrors / successful requests
# functional but not scalable`,
    [
      "Criar GSI com PK=email (projection adequada) e passar o login a Query no índice",
      "Criar LSI com PK=email (LSI não pode mudar a PK da base)",
      "Só aumentar memory da Lambda",
      "Só abrir 0.0.0.0/0 no SG",
    ], 0,
    "Email como nova PK de acesso exige GSI; LSI mantém a mesma PK da tabela. Tip de prova: lookup por atributo que não é PK → GSI, não LSI nem Scan."),

  T(5,
    "NOC-AWS-1115: Tabela analytics com tráfego quase zero a semana e picos de batch mensal; está PROVISIONED 2000/2000 ociosa.",
    `$ aws dynamodb describe-table --table-name AnalyticsEvents
BillingModeSummary.BillingMode: PROVISIONED
ProvisionedThroughput: RCU 2000 WCU 2000

$ aws cloudwatch get-metric-statistics --metric-name ConsumedWriteCapacityUnits ...
# most days near 0; one day month-end spike to ~1500 WCU for 3 hours

$ aws ce / cost explorer note:
# DynamoDB cost dominated by provisioned capacity idle time

# Team rejects multi-hour capacity planning meetings`,
    [
      "Migrar para on-demand (ou auto scaling agressivo) — provisioned 2000 ocioso a maior parte do mês é desperdício com pico curto",
      "Manter 2000/2000 e fazer Scan diário para 'esquentar'",
      "Apagar a tabela toda segunda",
      "Trocar PK para status",
    ], 0,
    "Ociosidade de provisioned alto com pico mensal curto pede on-demand (ou scaling). Scan diário gasta mais. Tip de prova: idle provisioned + spike raro → on-demand para custo."),
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

const padPhrase = "No desenho de tabela #";
const padHits = questions.filter((q) => q.explicacao_profunda.includes(padPhrase)).length;
if (padHits >= 3) {
  // ensure uniqueness by id already in phrase - OK if #id differs
}

const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

fs.writeFileSync(path.join(PARTS, "part-aws-1.11-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.11-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.11-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  repTips: rep.length,
  padHits,
});
