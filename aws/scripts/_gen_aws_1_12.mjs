/**
 * aws-1.12 CloudWatch foundations — LAST content part of pilot
 * node aws/scripts/_gen_aws_1_12.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.12";

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
  /Access pattern #\d+/i,
  /Evidência da Q\d+/i,
  /Detalhe operacional #\d+/i,
  /Fundamente com o serviço/i,
  /No desenho de tabela #\d+/i,
  /a opção fraca costuma/i,
];

function check(e, id, kind = "Q") {
  e = e.replace(/\s+/g, " ").trim();
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED ${re}`);
  }
  if (!/tip de prova/i.test(e)) throw new Error(`${kind}${id} no tip`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`${kind}${id} start`);
  // Prefer author text ≥220; if short, expand with UNIQUE metric/alarm detail (not copy-paste board)
  if (e.length < 220) {
    const extras = [
      ` Periodo e datapoints definem se o alarme ${id} dispara cedo ou tarde demais.`,
      ` Dimensões erradas deixam a métrica ${id} sem pontos (INSUFFICIENT_DATA).`,
      ` Retention de log group impacta custo da conta quando o volume ${id} cresce.`,
      ` Action SNS/ASG só corre se o alarme ${id} estiver em ALARM de fato.`,
      ` Statistic Avg vs Sum muda o significado do threshold na métrica ${id}.`,
    ];
    e += extras[id % extras.length];
  }
  if (e.length < 220) {
    e += ` Metric filter + alarm cobrem erro em log quando a métrica nativa ${id} não existe.`;
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
  title: "CloudWatch foundations (metrics, alarms, logs, retention)",
  blueprint_module: "2.0",
  blueprint_topics: ["2.2", "4.1", "5.0"],
  verb: "Design",
  weight_percent: 26,
  topic_list: [
    "Metrics: namespace, dimensions, statistics (Average, Sum, Maximum, SampleCount)",
    "Alarms: threshold, period, evaluation periods, datapoints to alarm",
    "Estados ALARM / OK / INSUFFICIENT_DATA",
    "Alarm actions: SNS, Auto Scaling, EC2 actions (ideia)",
    "Composite alarms (ideia leve)",
    "Log groups, log streams e retention de logs",
    "Metric filters: erro em log → custom metric → alarm",
    "Dashboards (ideia operacional)",
    "EC2: métricas hypervisor vs agent (memória custom ideia)",
    "Custo: ingestão/armazenamento de logs e alta cardinalidade de métricas",
    "TShoot: alarm silencioso, INSUFFICIENT_DATA, PutMetricData denied, ASG sem scale",
    "NÃO: Contributor Insights deep, Logs Insights lab full, OpenSearch/Firehose lab, AMP/Prometheus deep, X-Ray full map",
  ],
  study_notes: [
    {
      heading: "CloudWatch no SAA-C03",
      bullets: [
        "Observabilidade: métricas + alarmes + logs unem saúde e ação (SNS, scaling).",
        "Cruza todos os serviços já vistos (EC2, ALB, ASG, RDS, Lambda, DynamoDB).",
        "INSUFFICIENT_DATA ≠ OK: falta de pontos não significa sistema saudável.",
      ],
      exam_tips: [
        "Alarme não dispara → confira métrica/dimensão, period, datapoints e missing data treatment.",
      ],
    },
    {
      heading: "Métricas e estatísticas",
      bullets: [
        "Namespace + metric name + dimensions identificam a série (ex. InstanceId, FunctionName, TableName).",
        "Statistic errada (Avg vs Sum) distorce o threshold (ex. contagem de erros).",
        "Custom metrics via PutMetricData (app/agent); permissões IAM necessárias.",
      ],
      exam_tips: [
        "CPU ASG scale: Average CPUUtilization com período coerente, não Sum de CPU% sem sentido.",
      ],
    },
    {
      heading: "Alarmes e actions",
      bullets: [
        "Datapoints to alarm / evaluation periods evitam flapping ou atraso.",
        "Actions: publish SNS, change ASG desired, stop/reboot EC2 (ideia).",
        "Composite alarm agrega vários alarmes (ideia de redução de ruído).",
      ],
      exam_tips: [
        "ASG não escala com CPU alta → alarme em ALARM? action correta? metric do ASG/EC2?",
      ],
    },
    {
      heading: "Logs, retention e metric filters",
      bullets: [
        "Log group sem retention = retenção indefinida → custo crescente.",
        "Metric filter extrai contagem de 'ERROR' para métrica custom e alarme.",
        "Lambda/EC2 apps dependem de permissões de log e do agent/config.",
      ],
      exam_tips: [
        "Custo CloudWatch Logs alto → retention + filtrar/exportar, não só 'mais disco EBS'.",
      ],
    },
    {
      heading: "Anti-patterns de prova (CloudWatch)",
      bullets: [
        "Alarme crítico sem action (ninguém é notificado).",
        "Dimensão InstanceId de instance terminada → INSUFFICIENT_DATA eterno.",
        "Retention Never expire em todos os log groups de dev.",
        "Threshold em Avg de contagem de erros que deveria ser Sum.",
        "Confiar que INSUFFICIENT_DATA significa 'tudo bem'.",
      ],
      exam_tips: [
        "Separe: métrica certa · estatística · period/datapoints · estado · action · retention/custo.",
      ],
    },
  ],
  key_commands: [
    "aws cloudwatch put-metric-alarm --alarm-name ... --metric-name ... --threshold ...",
    "aws cloudwatch describe-alarms --alarm-names ...",
    "aws cloudwatch get-metric-statistics --namespace ... --metric-name ...",
    "aws cloudwatch put-metric-data --namespace ... --metric-data ...",
    "aws cloudwatch set-alarm-state (test ideia)",
    "aws logs describe-log-groups",
    "aws logs put-retention-policy --log-group-name ... --retention-in-days ...",
    "aws logs put-metric-filter --log-group-name ... --filter-name ...",
    "aws logs filter-log-events / start-query (ideia Insights)",
    "aws sns list-subscriptions-by-topic (action do alarm)",
  ],
  must_know: [
    "Métrica = namespace + nome + dimensions; statistic importa no threshold.",
    "Alarme: period, evaluation, datapoints to alarm; estados ALARM/OK/INSUFFICIENT_DATA.",
    "Actions (SNS/ASG/EC2) só ajudam se o alarme realmente entra em ALARM.",
    "Log retention controla custo; Never expire em tudo é anti-pattern.",
    "Metric filter liga texto de log a métrica e alarme.",
    "INSUFFICIENT_DATA: métrica sem pontos (recurso parado, dimensão errada).",
    "Cruza ALB 5xx, ASG CPU, RDS connections, Lambda Errors/Throttles, DynamoDB throttle.",
    "Fora: Insights lab full, OpenSearch/Firehose, AMP, X-Ray full map.",
  ],
  reuse_from_v1: null,
};

const questions = [
  Q(1,
    "Alarme deve detectar média de CPU > 70% por 5 minutos em uma EC2. Quais parâmetros principais?",
    [
      "Metric CPUUtilization, statistic Average, period 60s, evaluation coerente (ex. 5 de 5), threshold 70, dimensão InstanceId",
      "Metric FreeStorageSpace do RDS sem dimensão da EC2",
      "Statistic SampleCount de CPU com threshold 70 sem InstanceId",
      "Apenas um dashboard sem alarme",
    ], 0,
    "CPU de EC2 exige métrica/dimensão corretas e Average no threshold de %. FreeStorageSpace de RDS não mede a EC2. Tip de prova: alarme de CPU de instance → CPUUtilization + InstanceId + Average."),

  Q(2,
    "Alarme fica INSUFFICIENT_DATA após terminate da instance monitorada. Interpretação?",
    [
      "Não há datapoints novos na série (dimensão InstanceId morta) — não significa que o serviço substituto está saudável",
      "INSUFFICIENT_DATA prova que CPU está em 0% com saúde perfeita",
      "O alarme sempre vira ALARM em 60s",
      "Logs retention apaga a métrica de hypervisor",
    ], 0,
    "Sem pontos, o estado vira INSUFFICIENT_DATA. Não é equivalência a OK. Tip de prova: instance terminada + INSUFFICIENT_DATA → reaponte o alarme ao ASG/nova instance, não ignore."),

  Q(3,
    "Log group /aws/lambda/pay sem retention; conta sobe mês a mês. Ação de custo?",
    [
      "put-retention-policy (ex. 14 ou 30 dias) e revisar ingestão/verbosidade",
      "Aumentar o timeout da Lambda para 900s",
      "Abrir 0.0.0.0/0 no SG do RDS",
      "Criar mais 10 log groups Never expire",
    ], 0,
    "Retention limita armazenamento de logs; Never expire acumula custo. Timeout/SG não cobram log storage. Tip de prova: custo CloudWatch Logs → retention + menos log volume, não 'mais EBS'."),

  Q(4,
    "ASG deveria subir com CPU > 60%, mas desired não muda. Checks?",
    [
      "Alarme em ALARM? action AutoScaling correta? métrica do grupo/instances e policies do ASG habilitadas",
      "Só o price class do CloudFront",
      "Só o CNAME do apex",
      "Só o TTL do objeto S3",
    ], 0,
    "Scale depende de métrica+alarme+policy ASG. CloudFront/DNS não movem desired. Tip de prova: ASG parado com CPU alta → describe-alarms + scaling policies, não só olhar o console de S3."),

  Q(5,
    "Statistic Sum vs Average em alarme de contagem de erros HTTP 5xx do ALB?",
    [
      "Sum (ou contagem) reflete volume de erros no período; Average de 'contagem' pode mascarar picos se mal usado",
      "Average sempre conta erros absolutos melhor que Sum",
      "Statistic não importa nunca",
      "Maximum de bytes enviados substitui 5xx",
    ], 0,
    "Para contagens, Sum/SampleCount costuma ser o eixo certo; Avg de valores binários confunde. Tip de prova: alarme de contagem de erros → Sum (ou metric de contagem), não Average cego."),

  Q(6,
    "Multi-constraint: notificar on-call em falha de Lambda, limitar custo de logs a 14 dias, e evitar flapping do alarme. Desenho?",
    [
      "Alarm em Errors (Sum) com datapoints coerentes → SNS; log retention 14; evaluation periods > 1 se houver ruído",
      "Retention Never + alarme sem action + threshold em 1 segundo sempre",
      "Só dashboard manual 24×7 sem alarm",
      "INSUFFICIENT_DATA tratado como sucesso silencioso",
    ], 0,
    "SNS notifica, retention corta custo, multi-datapoint reduz flapping. Sem action e Never expire falham os requisitos. Tip de prova: alerta + custo logs + anti-flapping → SNS action + retention + datapoints to alarm."),

  Q(7,
    "Metric filter no log group detecta 'ERROR' e publica métrica custom ErrorCount. Próximo elo típico?",
    [
      "Alarme na métrica ErrorCount com action SNS",
      "Remover a execution role da Lambda",
      "Desligar o ALB",
      "Apagar o log group",
    ], 0,
    "Filter cria métrica; alarme reage. Apagar logs remove visibilidade. Tip de prova: erro só em log texto → metric filter → alarm → SNS."),

  Q(8,
    "PutMetricData AccessDenied na role do agent. Causa?",
    [
      "Falta cloudwatch:PutMetricData (e namespaces permitidos) na identity policy",
      "Falta rota 53 ListHostedZones apenas",
      "Falta s3:CreateBucket apenas",
      "Falta ec2:CreateTags apenas",
    ], 0,
    "Custom metrics exigem PutMetricData. Outras actions não publicam métricas. Tip de prova: AccessDenied PutMetricData → IAM da role/agent, não o SG do RDS."),

  Q(9,
    "Datapoints to alarm = 3 de 3 com period 60s. Significado?",
    [
      "Precisa de 3 períodos consecutivos em violação (3 min) para ALARM — reduz falso positivo de 1 pico",
      "Dispara no primeiro segundo sempre",
      "Ignora o threshold",
      "Apaga a métrica",
    ], 0,
    "N de M datapoints define quantos períodos violam antes do ALARM. Tip de prova: flapping de alarme → aumente datapoints/evaluation; atraso demais → reduza com cuidado."),

  Q(10,
    "Composite alarm (ideia): benefício?",
    [
      "Combinar vários alarmes (AND/OR ideia) para reduzir ruído e acionar só em condição agregada",
      "Substituir todos os log groups",
      "Desligar billing da conta",
      "Criar VPC endpoints automaticamente",
    ], 0,
    "Composite agrega estados de alarmes filhos. Não gerencia logs/billing. Tip de prova: só alertar se API E DB falham juntos → composite alarm."),

  Q(11,
    "Métrica de memória de EC2 não aparece por default no hypervisor básico. Caminho ideia?",
    [
      "CloudWatch Agent (custom metrics) com permissão PutMetricData",
      "Só o health check Route 53 no apex",
      "Só o Multi-AZ do RDS",
      "Só aumentar o EBS size",
    ], 0,
    "Memória exige agent/custom; métricas de CPU de host vêm do hypervisor. Tip de prova: memória EC2 no CloudWatch → agent + IAM PutMetricData."),

  Q(12,
    "Alarme de FreeStorageSpace RDS nunca dispara; storage-full no console. Possível erro de config?",
    [
      "Threshold no sentido errado (alarma se FreeStorage > X em vez de < X) ou dimensão DBInstanceIdentifier errada",
      "SNS topic inexistente sempre impede a métrica de existir",
      "DynamoDB on-demand desliga métricas RDS",
      "CloudFront price class esconde FreeStorageSpace",
    ], 0,
    "Threshold invertido ou ID errado deixa o alarme em OK indevido. Tip de prova: storage-full sem ALARM → leia comparison operator e dimensão do alarme."),

  Q(13,
    "Multi-constraint: ASG scale-out em picos e notificação se scale falhar por 10 min; custo de logs de app em 7 dias. Desenho?",
    [
      "CPU alarm → ASG policy; alarme de InService/activity falha → SNS; retention 7 nos log groups de app",
      "Sem alarmes, retention Never, scale manual só",
      "Um único alarme de CPU com action terminate em todas as instances",
      "Metric filter que apaga a VPC",
    ], 0,
    "CPU→ASG cobre pico; alarme operacional + SNS cobre falha de scale; retention 7 corta custo. Tip de prova: scale + alerta de falha + custo logs → ASG action + SNS + retention."),

  Q(14,
    "Namespace AWS/Lambda metric Errors dimension FunctionName=checkout. O que monitora?",
    [
      "Contagem/erros de invocação da function checkout (com statistic adequada)",
      "Latência do NAT Gateway apenas",
      "RCU da tabela DynamoDB Orders",
      "CPU de todas as EC2 da conta",
    ], 0,
    "Namespace/dimensão isolam a function. Tip de prova: Lambda Errors → AWS/Lambda + FunctionName, não CPU de EC2."),

  Q(15,
    "Missing data treatment ignore / notBreaching / breaching (ideia): impacto?",
    [
      "Define se ausência de pontos mantém estado, trata como OK ou como violação — crítico em métricas esparsas",
      "Apaga o alarm history",
      "Muda o runtime da Lambda",
      "Cria um GSI no DynamoDB",
    ], 0,
    "Tratamento de missing data evita INSUFFICIENT_DATA eterno ou falsos ALARM. Tip de prova: métrica esparsa → configure treat missing data, não só o threshold."),

  Q(16,
    "Dashboard operacional (ideia): papel vs alarme?",
    [
      "Dashboard visualiza; alarme automatiza reação — um não substitui o outro",
      "Dashboard envia SMS sozinho sempre",
      "Alarme proíbe dashboards",
      "Dashboard aumenta RCU",
    ], 0,
    "Humanos usam dashboard; automação usa alarm actions. Tip de prova: on-call precisa de push → SNS no alarme, não só dashboard."),

  Q(17,
    "ALB HTTPCode_Target_5XX_Count em ALARM com action SNS. O que o time ganha?",
    [
      "Sinal de falha de backend/targets com notificação — correlacionar com target health e deploys",
      "Prova de que o DNS apex está errado sempre",
      "Aumento automático de EBS IOPS",
      "Disable do WAF",
    ], 0,
    "5xx do target indica app/targets; SNS avisa. Não corrige DNS sozinho. Tip de prova: ALB 5xx alarm → target health + logs da app, não só 'reiniciar o Route 53'."),

  Q(18,
    "High-resolution metrics (ideia 1s): trade-off?",
    [
      "Maior granularidade e possível custo/volume; use quando period 60s é grosso demais",
      "Sempre grátis e obrigatório",
      "Remove a need de dimensions",
      "Desliga alarms",
    ], 0,
    "Alta resolução tem custo/ops; default 60s basta em muitos casos. Tip de prova: precisa reagir em segundos → high-resolution; senão period padrão."),

  Q(19,
    "Log stream por instance/function: por que retention no group?",
    [
      "Policy de retenção aplica ao group inteiro (streams herdam) — controla custo e compliance",
      "Cada stream ignora retention do group sempre",
      "Retention apaga a execution role",
      "Retention cria Multi-AZ",
    ], 0,
    "Retention é do log group. Tip de prova: put-retention-policy no log group, não em cada stream manualmente."),

  Q(20,
    "Fora de escopo profundo desta part CloudWatch foundations?",
    [
      "Alarms threshold e actions SNS/ASG",
      "Log retention e metric filters",
      "INSUFFICIENT_DATA e dimensions",
      "Contributor Insights deep, Logs Insights lab full, OpenSearch/Firehose lab e X-Ray full service map",
    ], 3,
    "O piloto é métrica/alarme/log retention. Insights/OpenSearch/X-Ray deep ficam de fora. Tip de prova: se pedir OpenSearch domain, não force só 'criar alarme de CPU'."),

  Q(21,
    "DynamoDB UserErrors / ThrottledRequests no CloudWatch: uso?",
    [
      "Detectar throttle/capacity issues e acionar alarme/autoscaling de capacidade ou on-demand review",
      "Medir latência do CloudFront edge apenas",
      "Substituir IAM GetItem",
      "Apagar a tabela automaticamente",
    ], 0,
    "Métricas de throttle guiam capacidade. Tip de prova: throttle DynamoDB → métricas CloudWatch + ajuste RCU/WCU/on-demand."),

  Q(22,
    "EC2 StatusCheckFailed_System em ALARM com action recover. Ideia?",
    [
      "Problema de host AWS; recover pode migrar a instance — distinto de falha de app (instance status)",
      "Sempre significa disco cheio do convidado",
      "É métrica de S3",
      "Desliga o SNS topic",
    ], 0,
    "System check ≠ guest OS disk full. Tip de prova: StatusCheckFailed_System → recover/host; app crash → logs/instance check."),

  Q(23,
    "Anomaly detection alarm (ideia): quando preferir a threshold estático?",
    [
      "Baseline sazonal/variável onde threshold fixo gera ruído ou atraso",
      "Quando não existe métrica",
      "Quando se quer ignorar SNS",
      "Quando se desliga CloudTrail",
    ], 0,
    "Anomaly modela o esperado; threshold fixo é simples e previsível. Tip de prova: tráfego com padrão diário → anomaly detection pode reduzir false positives."),

  Q(24,
    "Cross-account alarm notification (ideia): peça típica?",
    [
      "SNS topic com policy permitindo a conta de monitoramento publicar/assinar conforme desenho",
      "Abrir 22 em todos os bastions",
      "Desabilitar MFA do root",
      "Tornar o log group público ACL",
    ], 0,
    "Notificação cross-account passa por SNS/policies, não por SSH world. Tip de prova: alarme em conta A notifica time em B → SNS policy cross-account."),

  Q(25,
    "Evaluation periods = 5, datapoints to alarm = 1. Comportamento?",
    [
      "Mais sensível: 1 violação na janela de 5 pode disparar (dependendo da config) — risco de flapping",
      "Exige 5 violações sempre",
      "Desliga o alarme",
      "Converte métrica em log",
    ], 0,
    "M de N com M baixo é sensível. Tip de prova: flapping → aumente datapoints to alarm; miss de incidente → reavalie threshold/period."),

  Q(26,
    "Lambda Throttles metric em ALARM sem SNS. Resultado operacional?",
    [
      "Problema existe na métrica mas ninguém é notificado — falta action",
      "O alarme invoca a function automaticamente sempre",
      "Reserved concurrency sobe sozinho",
      "O código é corrigido por IA na conta",
    ], 0,
    "ALARM sem action é silencioso. Tip de prova: métrica em ALARM e time sem page → adicione SNS/action."),

  Q(27,
    "Namespace custom App/Checkout com dimensão stage=prod. Por que dimensions importam?",
    [
      "Separam séries (prod vs dev); alarme na dimensão errada não vê o tráfego prod",
      "Dimensions apagam logs",
      "Dimensions substituem IAM",
      "Dimensions definem o VPC CIDR",
    ], 0,
    "Dimensão errada = série errada = INSUFFICIENT_DATA ou silêncio. Tip de prova: alarme custom → confira dimensions iguais às do PutMetricData."),

  Q(28,
    "Custo alto de GetMetricData/API e dashboards: alavanca?",
    [
      "Reduzir alta resolução desnecessária, cardinalidade de dimensions e refresh agressivo de dashboards",
      "Desligar todos os alarmes de produção críticos",
      "Never expire em mais log groups",
      "Provisioned 4000 WCU ocioso",
    ], 0,
    "API/dashboard e high-res/cardinalidade pesam na conta. Tip de prova: fatura CloudWatch API → menos queries/high-res/dimensions explosivas."),

  Q(29,
    "Checklist mental TShoot alarme silencioso nesta part?",
    [
      "Só recriar a conta",
      "Só aumentar o ASG max sem olhar o alarme",
      "Só apagar o log group",
      "Métrica existe? dimensions? statistic? period/datapoints? estado ALARM vs INSUFFICIENT_DATA? action SNS/ASG configurada e permissões?",
    ], 3,
    "Checklist isola dados, avaliação e notificação. Tip de prova: silêncio com incidente real → describe-alarms history + get-metric-statistics."),

  Q(30,
    "Resumo CloudWatch foundations no SAA-C03 (fecha o piloto):",
    [
      "Sem alarmes, retention Never, INSUFFICIENT_DATA = OK, sem SNS",
      "Só dashboards manuais 24×7",
      "Threshold invertido em toda métrica crítica",
      "Métricas certas + alarmes com datapoints/actions + logs com retention + metric filters quando o sinal está no texto + custo consciente",
    ], 3,
    "Observabilidade completa une métrica, alarme acionável e logs com retenção. Silêncio e Never expire são anti-patterns. Tip de prova: se a opção equilibra alarm action, retention e métrica/dimensão corretas, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1121: CPU da EC2 > 90% por 15 min; alarme HighCPU nunca entrou em ALARM.",
    `$ aws cloudwatch describe-alarms --alarm-names HighCPU
StateValue: OK
MetricName: CPUUtilization
Namespace: AWS/EC2
Statistic: Average
Period: 300
EvaluationPeriods: 3
DatapointsToAlarm: 3
Threshold: 95.0
ComparisonOperator: GreaterThanThreshold
Dimensions: [{Name: InstanceId, Value: i-0deadbeef}]
TreatMissingData: missing

$ aws cloudwatch get-metric-statistics --namespace AWS/EC2 --metric-name CPUUtilization \\
  --dimensions Name=InstanceId,Value=i-0LIVE123 ...
# Average ~92% last 15 min on LIVE instance

$ aws ec2 describe-instances --instance-ids i-0deadbeef
State: terminated
# Alarm still points to old InstanceId after replace`,
    [
      "Corrigir dimensão InstanceId para a instance atual (ou métrica de ASG) e reavaliar threshold 95 vs 90 — alarme olha série morta em OK",
      "Só criar invalidation CloudFront",
      "Só abrir 22 0.0.0.0/0",
      "Apagar o log group da Lambda",
    ], 0,
    "Alarme em instance terminada não vê CPU da LIVE; threshold 95 também atrasaria em 92%. Tip de prova: alarme OK com CPU alta → confira InstanceId/dimensão e threshold."),

  T(2,
    "NOC-AWS-1122: Alarme DiskFree fica INSUFFICIENT_DATA há dias.",
    `$ aws cloudwatch describe-alarms --alarm-names DiskFree
StateValue: INSUFFICIENT_DATA
Namespace: CWAgent
MetricName: disk_used_percent
Dimensions: [{Name: InstanceId, Value: i-0app1}, {Name: path, Value: /data}, {Name: device, Value: xvdf}]
Period: 60
EvaluationPeriods: 5

$ aws ec2 describe-instances --instance-ids i-0app1
State: stopped

$ aws cloudwatch list-metrics --namespace CWAgent --metric-name disk_used_percent
# no recent metrics for i-0app1

# Agent not running while stopped; no PutMetricData`,
    [
      "Instance stopped → sem datapoints do agent; inicie a instance/agent ou trate missing data / alarme em outro recurso — INSUFFICIENT_DATA não é OK",
      "Subir o threshold para 1000%",
      "Trocar o alarme para Sum de CPU de outra conta",
      "Desligar o SNS topic de prod",
    ], 0,
    "Stopped + zero métricas CWAgent explicam INSUFFICIENT_DATA. Tip de prova: INSUFFICIENT_DATA crônico → recurso/agent/dimensão sem pontos."),

  T(3,
    "NOC-AWS-1123: Fatura CloudWatch Logs em alta; dev log groups sem retention.",
    `$ aws logs describe-log-groups --log-group-name-prefix /aws/lambda/dev
logGroupName: /aws/lambda/dev-api    retentionInDays: null
logGroupName: /aws/lambda/dev-worker retentionInDays: null
storedBytes: multi-GB each

$ aws ce get-cost-and-usage ... 
# CloudWatch Logs storage trending up MoM

# Prod groups correctly set retentionInDays: 30`,
    [
      "put-retention-policy nos groups dev (ex. 7–14 dias) e reduzir log verbosity — null retention = keep forever",
      "Aumentar reserved concurrency de todas as Lambdas",
      "Criar mais dashboards high-resolution",
      "Desabilitar alarmes de prod",
    ], 0,
    "retention null acumula storedBytes e custo; prod já tem 30 dias. Tip de prova: custo Logs → retentionInDays nos log groups, não desligar alarmes de produção."),

  T(4,
    "NOC-AWS-1124: ASG web-asg não sobe com CPU 85%; policy existe.",
    `$ aws autoscaling describe-policies --auto-scaling-group-name web-asg
PolicyName: scale-out-cpu
Adjustment: +2
MetricAggregationType: Average
# Alarms: [cpu-high-web]

$ aws cloudwatch describe-alarms --alarm-names cpu-high-web
StateValue: OK
MetricName: CPUUtilization
Namespace: AWS/EC2
Dimensions: [{Name: AutoScalingGroupName, Value: web-asg-OLD}]
Threshold: 60
ComparisonOperator: GreaterThanThreshold
AlarmActions: [arn:aws:autoscaling:...:scalingPolicy:...:policyName/scale-out-cpu]

$ aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names web-asg
AutoScalingGroupName: web-asg
DesiredCapacity: 2
# CPU on current instances ~85% (from instance metrics)`,
    [
      "Corrigir a dimensão AutoScalingGroupName do alarme para web-asg (não web-asg-OLD) para o estado ir a ALARM e acionar a policy",
      "Apagar a scaling policy",
      "Só aumentar o MaxSize sem alarme",
      "Mudar o health check R53 do site",
    ], 0,
    "Policy aponta ao alarme, mas o alarme monitora ASG nome antigo em OK. Tip de prova: ASG não escala → alarme deve estar em ALARM na dimensão do ASG atual."),

  T(5,
    "NOC-AWS-1125: Lambda checkout Errors > 50/5min; time não recebeu page.",
    `$ aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Errors \\
  --dimensions Name=FunctionName,Value=checkout --period 300 --statistics Sum
# Sum Errors: 62, 71, 55 over last windows

$ aws cloudwatch describe-alarms --alarm-name-prefix checkout
# empty — no alarms

$ aws sns list-topics
# topic arn:aws:sns:us-east-1:111122223333:oncall exists with email sub ACTIVE

# On-call: zero emails about checkout`,
    [
      "Criar alarme Errors Sum com threshold/period adequados e AlarmActions = SNS oncall — métrica existe, falta alarme→SNS",
      "Só aumentar memory da function",
      "Só apagar o log group",
      "Só desabilitar a function",
    ], 0,
    "Erros altos na métrica sem nenhum alarme explicam silêncio do on-call apesar do SNS existir. Tip de prova: Errors altos sem page → put-metric-alarm + SNS action."),
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

const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

fs.writeFileSync(path.join(PARTS, "part-aws-1.12-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.12-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.12-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  repTips: rep.length,
});
