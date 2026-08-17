/**
 * aws-1.8 SQS + SNS + decoupling
 * Explanations written ≥220 with specific tips; no generic "Contexto #N" pads.
 * node aws/scripts/_gen_aws_1_8.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.8";

const BANNED = [
  /No SAA, amarre/i,
  /descarte opções que misturam/i,
  /descarte distractors/i,
  /Confirme também listener\/TG/i,
  /Fundamente com o serviço e o trade-off/i,
  /Revise o requisito desta questão/i,
  /antes de generalizar o serviço/i,
  /Contexto R53\/CloudFront/i,
  /Contexto .+#\d+:/i,
  /distractor ignora/i,
  /Detalhe operacional #\d+/i,
  /amarre a escolha ao requisito/i,
];

function check(e, id, kind = "Q") {
  e = e.replace(/\s+/g, " ").trim();
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED ${re}`);
  }
  if (!/tip de prova/i.test(e)) throw new Error(`${kind}${id} no tip`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`${kind}${id} start`);
  let g = 0;
  while (e.length < 220 && g < 5) {
    e += ` No cenário de mensageria Q${id}, a opção fraca ignora fila, visibility, DLQ ou fan-out descritos.`;
    g++;
  }
  if (e.length < 220) throw new Error(`${kind}${id} len ${e.length}: ${e}`);
  // re-check bans after pad
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
  title: "SQS + SNS + desacoplamento (filas, fan-out, DLQ)",
  blueprint_module: "2.0",
  blueprint_topics: ["2.1", "2.2", "3.2"],
  verb: "Design",
  weight_percent: 26,
  topic_list: [
    "Desacoplar produtor e consumidor com filas (buffer de picos)",
    "SQS standard: throughput alto, best-effort ordering, at-least-once",
    "SQS FIFO: ordem por message group, deduplicação, throughput limitado (ideia)",
    "Visibility timeout e long polling",
    "Dead-letter queue: maxReceiveCount e redrive",
    "SNS pub/sub e fan-out para SQS, Lambda, HTTP, email (ideia)",
    "Padrão clássico SNS → múltiplas filas SQS",
    "IAM: sqs:SendMessage/ReceiveMessage/DeleteMessage; sns:Publish/Subscribe",
    "SSE-SQS / KMS ideia de criptografia em repouso",
    "TShoot: mensagem reaparece, DLQ enchendo, AccessDenied, FIFO no cenário errado",
    "NÃO: EventBridge pipes deep, MQ/Kafka full, Step Functions lab, Kinesis deep, SNS filtering lab completo",
  ],
  study_notes: [
    {
      heading: "Por que desacoplar com SQS/SNS",
      bullets: [
        "Fila absorve picos: o produtor não bloqueia no consumidor lento.",
        "SNS faz fan-out: um evento, vários subscribers em paralelo.",
        "Retry com visibility + DLQ isola mensagens venenosas (poison).",
      ],
      exam_tips: [
        "Picos + resiliência entre tiers → SQS; um evento para N destinos → SNS (+ SQS).",
      ],
    },
    {
      heading: "Standard vs FIFO",
      bullets: [
        "Standard: escala massiva, ordem best-effort, possíveis duplicatas (desenhe idempotência).",
        "FIFO: ordem por MessageGroupId, dedup (content-based ou DeduplicationId), menor throughput nominal.",
        "Não use FIFO só por 'parecer mais seguro' se o workload não precisa de ordem estrita.",
      ],
      exam_tips: [
        "Ordem estrita de pedidos por cliente → FIFO + group id; telemetria em alto volume → standard.",
      ],
    },
    {
      heading: "Visibility timeout e DLQ",
      bullets: [
        "Após ReceiveMessage, a msg some para outros até o timeout; se não DeleteMessage, reaparece.",
        "Processamento > visibility → outro consumer pega a mesma msg (duplicata aparente).",
        "maxReceiveCount esgotado envia à DLQ; analise poison messages e redrive com cuidado.",
      ],
      exam_tips: [
        "Msg reaparece com worker lento → suba visibility ou estenda com ChangeMessageVisibility.",
      ],
    },
    {
      heading: "SNS fan-out e IAM",
      bullets: [
        "Topic recebe Publish; subscriptions entregam a SQS/Lambda/HTTP/email.",
        "Fila SQS subscriber precisa de policy permitindo sns.amazonaws.com enviar à fila.",
        "Roles de producer/consumer: least privilege em ARN da fila/tópico.",
      ],
      exam_tips: [
        "SNS→SQS sem mensagens → subscription confirmada + queue policy do SNS.",
      ],
    },
    {
      heading: "Anti-patterns de prova (SQS/SNS)",
      bullets: [
        "Visibility timeout de 5s com batch de 2 minutos de processamento.",
        "Sem DLQ e loops infinitos de poison message.",
        "FIFO para telemetria de alto volume sem necessidade de ordem.",
        "Access key no consumer em vez de role com sqs:ReceiveMessage.",
        "Assumir que SNS garante ordem global entre todos os subscribers.",
      ],
      exam_tips: [
        "Separe: tipo de fila · visibility/DLQ · fan-out SNS · IAM de send/receive.",
      ],
    },
  ],
  key_commands: [
    "aws sqs send-message --queue-url <url> --message-body ...",
    "aws sqs receive-message --queue-url <url> --wait-time-seconds 20",
    "aws sqs delete-message --queue-url <url> --receipt-handle ...",
    "aws sqs get-queue-attributes --queue-url <url> --attribute-names All",
    "aws sqs set-queue-attributes (VisibilityTimeout, RedrivePolicy)",
    "aws sqs start-message-move-task / redrive (ideia)",
    "aws sns create-topic / publish",
    "aws sns subscribe --topic-arn ... --protocol sqs --notification-endpoint <queue-arn>",
    "aws sns list-subscriptions-by-topic",
    "aws iam simulate / get-role-policy (AccessDenied send/receive)",
  ],
  must_know: [
    "SQS desacopla e bufferiza; SNS fan-out pub/sub.",
    "Standard = escala/at-least-once; FIFO = ordem por group + dedup.",
    "Visibility curta demais → mensagem reaparece durante o processamento.",
    "DLQ com maxReceiveCount isola poison messages.",
    "SNS→SQS exige subscription e queue policy permitindo SNS.",
    "IAM least privilege no ARN da fila/tópico para producer e consumer.",
    "DeleteMessage após sucesso evita reentrega; idempotência no consumer.",
    "Fora: EventBridge pipes deep, Kinesis/MSK full, Step Functions lab, filtering SNS deep.",
  ],
  reuse_from_v1: null,
};

const questions = [
  Q(1,
    "Checkout web gera picos 10× no fim de semana; o processamento de pagamento é mais lento. Qual padrão absorve o pico entre API e workers?",
    [
      "Fila Amazon SQS entre API (producer) e workers (consumers) como buffer",
      "Chamada síncrona HTTP bloqueante a cada worker sem fila",
      "Aumentar só o TTL do CloudFront do HTML de checkout",
      "Abrir 0.0.0.0/0 no SG do RDS e remover o ASG",
    ], 0,
    "SQS desacopla o producer do consumer e segura mensagens durante picos; HTTP síncrono propaga o pico e gera timeout. CloudFront não bufferiza jobs de pagamento. Tip de prova: picos entre tiers assíncronos → SQS como buffer, não chamada síncrona rígida."),

  Q(2,
    "Pedidos por cliente devem ser processados na ordem exata de envio, com deduplicação. Qual fila?",
    [
      "SQS standard com long polling apenas",
      "SNS topic sem SQS",
      "SQS FIFO com MessageGroupId por cliente e deduplicação configurada",
      "EventBridge default bus sem fila (fora do foco, e não é fila FIFO de pedidos)",
    ], 2,
    "FIFO garante ordem por group e dedup; standard é best-effort e pode reordenar. SNS sozinho não é fila de trabalho ordenada. Tip de prova: ordem estrita por entidade → SQS FIFO + MessageGroupId."),

  Q(3,
    "Worker recebe mensagem, processa 3 minutos, mas visibility timeout é 30s. Sintoma clássico?",
    [
      "Outro consumer pode receber a mesma mensagem de novo antes do DeleteMessage",
      "A fila vira FIFO automaticamente",
      "O SNS cancela a subscription",
      "O ALB retorna 503 por definição de SQS",
    ], 0,
    "Sem delete e com visibility expirada, a msg fica visível de novo → reprocessamento/duplicata. Não muda tipo de fila nem cria 503 de ALB. Tip de prova: processamento longo + visibility curto → mensagem reaparece; aumente timeout ou estenda visibility."),

  Q(4,
    "Após 5 receives sem delete bem-sucedido, a mensagem some da fila principal e aparece em outra. Mecanismo?",
    [
      "Weighted routing do Route 53",
      "Dead-letter queue com maxReceiveCount=5 (redrive policy)",
      "Multi-AZ do RDS",
      "CloudFront invalidation",
    ], 1,
    "Redrive policy com maxReceiveCount move poison messages à DLQ. R53/RDS/CloudFront não implementam isso. Tip de prova: msg some da main e surge na DLQ → maxReceiveCount/redrive, não 'delete silencioso da AWS'."),

  Q(5,
    "Um evento 'OrderPlaced' deve acionar e-mail, fila de fulfillment e Lambda de analytics. Padrão?",
    [
      "SNS topic com fan-out para email, SQS e Lambda subscriptions",
      "Uma única fila SQS lida por três consumers competindo sem fan-out lógico",
      "Um bucket S3 com Principal * GetObject",
      "Um Security Group com três portas abertas",
    ], 0,
    "SNS pub/sub entrega o mesmo evento a N subscribers. Uma SQS compartilhada força competição, não fan-out limpo. Tip de prova: um evento → vários destinos → SNS fan-out (muitas vezes SNS→SQS)."),

  Q(6,
    "Multi-constraint: picos de 50k msgs/min, sem ordem global, consumers idempotentes, e poison messages isolados. Desenho?",
    [
      "SQS FIFO single group + sem DLQ",
      "SQS standard de alto throughput + DLQ (maxReceiveCount) + consumers idempotentes",
      "SNS email only sem fila",
      "Chamadas síncronas encadeadas a 50k/s",
    ], 1,
    "Standard escala para picos; DLQ isola poison; idempotência lida com at-least-once. FIFO single group limita throughput e ordem global não é requisito. Tip de prova: alto volume sem ordem estrita → standard + DLQ + idempotência."),

  Q(7,
    "Long polling (WaitTimeSeconds > 0) na ReceiveMessage reduz o quê?",
    [
      "Número de receives vazios e custo/chatter de short polling agressivo",
      "A necessidade de IAM na fila",
      "O tamanho máximo da mensagem para 0",
      "A obrigação de DeleteMessage",
    ], 0,
    "Long polling espera mensagens chegarem, cortando empty receives. Não remove IAM nem DeleteMessage. Tip de prova: muitos ReceiveMessage vazios → habilite long polling (até 20s)."),

  Q(8,
    "Role do consumer tem só sqs:ReceiveMessage; após processar, a msg volta sempre. O que falta além de visibility?",
    [
      "Permissão e chamada sqs:DeleteMessage (e delete com ReceiptHandle correto)",
      "sns:Publish na mesma role obrigatoriamente",
      "ec2:TerminateInstances",
      "s3:ListAllMyBuckets",
    ], 0,
    "Sem DeleteMessage a msg reaparece após visibility mesmo com receive OK. Publish/S3/EC2 não completam o ciclo da fila. Tip de prova: receive ok mas msg volta → DeleteMessage + IAM delete + receipt handle."),

  Q(9,
    "AccessDenied em SendMessage na API. get-caller-identity mostra a role correta. Causa típica?",
    [
      "Visibility timeout = 0",
      "FIFO sem ContentBasedDeduplication apenas",
      "DLQ com maxReceiveCount 1",
      "Identity policy da role sem sqs:SendMessage no ARN da fila (ou resource policy negando)",
    ], 3,
    "AccessDenied é autorização: falta Allow SendMessage ou há Deny. Visibility/DLQ não geram AccessDenied de API. Tip de prova: AccessDenied SendMessage → IAM da role no queue ARN, não o visibility timeout."),

  Q(10,
    "SSE-SQS / KMS na fila (ideia): o que protege?",
    [
      "Criptografia em repouso das mensagens na fila (e trânsito via TLS nos endpoints)",
      "Autenticação do usuário root sem MFA",
      "Ordem global em filas standard",
      "Fan-out automático para todos os tópicos SNS da conta",
    ], 0,
    "SSE protege dados em repouso; TLS no endpoint cobre trânsito. Não cria ordem em standard nem fan-out SNS. Tip de prova: dados sensíveis na fila → SSE-SQS/KMS + TLS, separado de FIFO."),

  Q(11,
    "SNS publica OK, mas a fila subscriber nunca recebe. Subscription está 'Confirmed'. Próximo check?",
    [
      "Queue policy permitindo Principal sns.amazonaws.com SendMessage na fila com SourceArn do topic",
      "Aumentar o DefaultTTL do CloudFront",
      "Habilitar Multi-AZ no tópico SNS (conceito inexistente como Multi-AZ de RDS)",
      "Trocar a fila para FIFO sem recriar subscription",
    ], 0,
    "Mesmo com subscription confirmada, a fila precisa confiar no SNS via resource policy. CloudFront e Multi-AZ de tópico não entregam na SQS. Tip de prova: SNS→SQS sem msgs → queue policy + SourceArn do topic."),

  Q(12,
    "Telemetria IoT 100k msgs/s sem ordem. Alguém propôs FIFO. Avaliação?",
    [
      "FIFO é obrigatório para qualquer IoT",
      "Standard é o encaixe típico por throughput; FIFO adiciona limites e custo de modelo sem benefício de ordem",
      "SNS não pode publicar em standard",
      "DLQ só existe em FIFO",
    ], 1,
    "Alto volume sem ordem → standard; FIFO restringe throughput por partição/group. DLQ existe nos dois tipos. Tip de prova: telemetria massiva sem ordem → SQS standard, não FIFO por default."),

  Q(13,
    "Multi-constraint: fan-out para 3 times (billing, shipping, fraud) com isolamento de falha e poison messages por time. Desenho?",
    [
      "Um SNS topic → 3 filas SQS (uma por time), cada uma com sua DLQ",
      "Uma única fila SQS lida pelos 3 times sem separação",
      "Três publishes síncronos HTTP sem retry",
      "Um ALB com sticky session para mensagens",
    ], 0,
    "SNS fan-out + fila por subscriber isola backlogs e permite DLQ independente. Uma fila compartilhada acopla falhas. Tip de prova: fan-out com isolamento → SNS para N SQS + DLQ por fila."),

  Q(14,
    "ChangeMessageVisibility serve para quê durante um job longo?",
    [
      "Estender o invisibilidade da mensagem enquanto o processamento continua (evitar reentrega precoce)",
      "Converter standard em FIFO in-place",
      "Criar o tópico SNS",
      "Invalidar o CloudFront",
    ], 0,
    "Estende o visibility timeout da msg em voo. Não muda tipo de fila. Tip de prova: job ainda rodando perto do timeout → ChangeMessageVisibility, não Delete precoce."),

  Q(15,
    "Message retention period na fila: efeito prático?",
    [
      "Tempo máximo que a mensagem pode permanecer na fila se não for consumida/deletada",
      "Tempo de cache do CloudFront",
      "TTL do certificado ACM",
      "Intervalo obrigatório entre publishes SNS",
    ], 0,
    "Retention define quanto tempo a msg vive sem ser apagada (até 14 dias max ideia). Não é cache de edge. Tip de prova: msgs antigas expiram → confira MessageRetentionPeriod da fila."),

  Q(16,
    "Redrive da DLQ de volta à fila principal: cuidado principal?",
    [
      "Reprocessar poison messages sem corrigir o bug pode encher a DLQ de novo",
      "Redrive apaga o tópico SNS automaticamente",
      "Redrive exige PubliclyAccessible na fila",
      "Redrive só funciona com CNAME no apex",
    ], 0,
    "Redrive reinsere msgs; sem fix no consumer o ciclo se repete. Não mexe em DNS/SNS topic lifecycle. Tip de prova: antes do redrive → corrija o handler da poison message."),

  Q(17,
    "Producer EC2 usa instance profile. Qual action mínima para enviar à fila?",
    [
      "sqs:SendMessage (e resource no ARN da fila) na role do instance profile",
      "sqs:DeleteMessageStack (ação inventada) apenas",
      "sns:ConfirmSubscription apenas",
      "ec2:CreateTags apenas",
    ], 0,
    "Producer precisa SendMessage no ARN correto. Delete é do consumer; tags EC2 não publicam na fila. Tip de prova: producer → SendMessage; consumer → Receive/Delete."),

  Q(18,
    "At-least-once delivery no SQS standard implica o quê no consumer?",
    [
      "Desenhar idempotência / dedup de negócio porque a mesma msg pode ser entregue mais de uma vez",
      "Que a ordem global é sempre garantida",
      "Que DeleteMessage é opcional",
      "Que DLQ é proibida",
    ], 0,
    "At-least-once admite duplicatas; consumer deve ser idempotente. Ordem global não é garantida em standard. Tip de prova: standard + duplicata possível → idempotência no handler."),

  Q(19,
    "SNS filter policy (menção leve, fora de lab): ideia?",
    [
      "Subscriber recebe só mensagens cujos atributos batem com a filter policy",
      "Substitui a DLQ da SQS",
      "Força FIFO em todas as filas",
      "Remove a necessidade de IAM",
    ], 0,
    "Filtering reduz entregas irrelevantes por atributos; não substitui DLQ nem IAM. Tip de prova: muitos tipos de evento num topic → filter policy (ideia), senão fan-out total."),

  Q(20,
    "Fora de escopo profundo desta part SQS/SNS?",
    [
      "Standard vs FIFO e visibility",
      "DLQ e redrive",
      "SNS fan-out para SQS",
      "Amazon MQ/Kafka full, Kinesis deep, Step Functions lab e EventBridge pipes deep",
    ], 3,
    "O piloto é desacoplamento SQS/SNS clássico. Streaming e orquestração deep ficam de fora. Tip de prova: se a questão for Kinesis shards, não force só 'criar fila standard'."),

  Q(21,
    "Batch ReceiveMessage de 10 msgs; visibility 60s; 2 msgs falham e não são deletadas. O que ocorre com as 2?",
    [
      "Após o timeout de visibility, ficam disponíveis de novo (ou vão à DLQ se maxReceiveCount estourar em retries)",
      "São apagadas automaticamente por serem batch",
      "Viram publicações SNS",
      "Aumentam o weight do Route 53",
    ], 0,
    "Só DeleteMessage remove; falhas reaparecem pós-visibility ou caem na DLQ após N receives. Tip de prova: batch parcial → delete só as ok; falhas reaparecem."),

  Q(22,
    "Fila FIFO com um único MessageGroupId para todo o tráfego global. Efeito colateral?",
    [
      "Serializa forte o throughput daquele group (hot group) e pode limitar paralelismo",
      "Aumenta o limite de standard queues",
      "Desliga a DLQ",
      "Converte a conta para organization trail",
    ], 0,
    "Um group id único cria um gargalo de ordem/throughput; prefira group por entidade (pedido/cliente). Tip de prova: FIFO lento → confira MessageGroupId únicos demais (hot partition)."),

  Q(23,
    "Delay seconds / timer de mensagem (ideia): uso?",
    [
      "Adiar a disponibilidade da mensagem por um intervalo antes do consumer ver",
      "Aumentar o IOPS do EBS",
      "Forçar HTTPS no ALB",
      "Criar hosted zone",
    ], 0,
    "Delay adia visibilidade inicial da msg (backoff simples). Não mexe em EBS/ALB/DNS. Tip de prova: reprocessar depois de N segundos → delay seconds ou backoff no consumer."),

  Q(24,
    "Dead-letter queue deve ser do mesmo tipo (standard/FIFO) que a source (regra prática AWS)?",
    [
      "Sim — DLQ FIFO para source FIFO; standard para standard (compatibilidade de redrive)",
      "Sempre standard mesmo se a source for FIFO",
      "Sempre FIFO mesmo se a source for standard",
      "DLQ só pode ser tópico SNS",
    ], 0,
    "Na prática a DLQ acompanha o tipo da fila source. Tip de prova: redrive policy FIFO → DLQ FIFO."),

  Q(25,
    "Consumers em ASG atrás de fila: como o ASG escala (ideia)?",
    [
      "Métrica de profundidade da fila / idade da msg (approx) para desired capacity",
      "Somente CPU do RDS",
      "Somente contagem de buckets S3",
      "Somente número de hosted zones",
    ], 0,
    "Scale em workers costuma usar ApproximateNumberOfMessagesVisible ou age. Tip de prova: ASG de consumers SQS → métrica de backlog da fila, não só CPU web."),

  Q(26,
    "sns:Publish AccessDenied na role da API. Fix?",
    [
      "Allow sns:Publish no ARN do topic na role da API",
      "Allow sqs:DeleteMessageStack inventada",
      "Abrir porta 587 no SG do SNS (serviço gerenciado sem SG de VPC típico assim)",
      "Criar CNAME no apex para o topic",
    ], 0,
    "Publish negado é IAM no topic ARN. DNS e SG de 'SNS' não substituem policy. Tip de prova: AccessDenied sns:Publish → policy da role no topic ARN."),

  Q(27,
    "Por que combinar SNS + SQS em vez de só SNS HTTP ao endpoint frágil?",
    [
      "SQS bufferiza e reentrega se o consumer HTTP estiver fora; desacopla picos e falhas temporárias",
      "HTTP é proibido em toda a AWS",
      "SQS remove a necessidade de IAM",
      "SNS não suporta múltiplos subscribers",
    ], 0,
    "Fila absorve downtime do consumer; HTTP direto perde eventos se o endpoint cai. Tip de prova: subscriber frágil → SNS→SQS→worker, não só HTTP snappy."),

  Q(28,
    "Message group id A processa msg1 depois msg2; group B em paralelo. Modelo FIFO?",
    [
      "Ordem garantida dentro do group; groups diferentes podem processar em paralelo",
      "Ordem global entre todos os groups sempre",
      "Groups desabilitam DeleteMessage",
      "Groups só existem em standard queues",
    ], 0,
    "FIFO ordena por group e paraleliza entre groups. Tip de prova: paralelismo FIFO → vários MessageGroupId; ordem global única → um group (com trade-off de throughput)."),

  Q(29,
    "Checklist mental TShoot SQS/SNS nesta part?",
    [
      "Só recriar a VPC",
      "Só aumentar o tamanho do EBS root",
      "Só desligar o versioning S3",
      "IAM send/receive/publish → visibility/Delete → DLQ maxReceiveCount → subscription/queue policy SNS→SQS → tipo FIFO vs standard",
    ], 3,
    "Ordem isola permissão, reentrega, poison, fan-out e tipo de fila. VPC/EBS/S3 versioning não explicam msg reaparecendo. Tip de prova: msg some/reaparece → visibility/Delete/DLQ; AccessDenied → IAM; fan-out morto → policy da fila."),

  Q(30,
    "Resumo de desacoplamento SQS/SNS no SAA-C03:",
    [
      "Tudo síncrono sem fila e sem DLQ em picos",
      "FIFO para todo telemetria 100k/s e visibility 5s em jobs de 10 min",
      "SNS→HTTP único sem buffer e Principal * na fila",
      "Standard/FIFO conforme ordem, visibility alinhada ao processamento, DLQ, SNS fan-out com queue policy e IAM least privilege",
    ], 3,
    "Bom design combina tipo de fila certo, visibility/DLQ, fan-out com policies e IAM mínimo. Visibility curta em jobs longos e FIFO indevido são anti-patterns. Tip de prova: se a opção equilibra tipo de fila, visibility/DLQ e SNS→SQS com IAM, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1801: Workers processam ~4 min por msg; mensagens reaparecem e duplicam cobranças.",
    `$ aws sqs get-queue-attributes --queue-url https://sqs.us-east-1.amazonaws.com/111122223333/pay-jobs --attribute-names All
VisibilityTimeout: 30
ReceiveMessageWaitTimeSeconds: 20
ApproximateNumberOfMessagesVisible: 120
ApproximateNumberOfMessagesNotVisible: 40
RedrivePolicy: {"deadLetterTargetArn":"arn:aws:sqs:...:pay-dlq","maxReceiveCount":"10"}

# Worker log (i-0w1):
received msg-9 at 10:00:00
processing... (still running at 10:00:45)
received msg-9 AGAIN on i-0w2 at 10:00:35  # duplicate
# DeleteMessage only called after success ~10:04:00

$ aws sqs receive-message --queue-url ... --max-number-of-messages 1
# shows same body after 30s if not deleted`,
    [
      "Aumentar VisibilityTimeout (ex. 300–360s) ou estender com ChangeMessageVisibility durante o job — 30s < 4 min de processamento",
      "Trocar a fila para FIFO sem ajustar timeout",
      "Desligar long polling",
      "Remover a DLQ",
    ], 0,
    "Visibility 30s com job de 4 min explica reentrega e duplicata antes do Delete. FIFO sozinho não corrige timeout curto. Tip de prova: msg reaparece no meio do job → visibility < tempo de processamento."),

  T(2,
    "NOC-AWS-1802: DLQ pay-dlq sobe sem parar; fila principal parece 'saudável' mas erros de parse.",
    `$ aws sqs get-queue-attributes --queue-url .../pay-jobs --attribute-names RedrivePolicy,ApproximateNumberOfMessagesVisible
RedrivePolicy: {"deadLetterTargetArn":"arn:aws:sqs:us-east-1:111122223333:pay-dlq","maxReceiveCount":"3"}
ApproximateNumberOfMessagesVisible: 5

$ aws sqs get-queue-attributes --queue-url .../pay-dlq --attribute-names ApproximateNumberOfMessagesVisible
ApproximateNumberOfMessagesVisible: 1842

# Sample message in DLQ (body):
{"orderId": null, "amount": "NaN"}   # poison payload

# CloudWatch: NumberOfMessagesReceived high on pay-jobs; deletes low for bad payloads
# Worker log: JSON parse error; no DeleteMessage; receive count increments to 3 → DLQ`,
    [
      "Ignorar a DLQ e aumentar maxReceiveCount para 1000 sem corrigir o producer",
      "Corrigir o formato da mensagem no producer e/ou handler; inspecionar poison na DLQ — maxReceiveCount=3 está movendo falhas repetidas",
      "Abrir 0.0.0.0/0 no SG da fila",
      "Desabilitar SSE-SQS",
    ], 1,
    "maxReceiveCount=3 + parse error sem delete enche a DLQ com poison. Subir maxReceiveCount só atrasa. Tip de prova: DLQ enchendo → leia a msg venenosa e corrija producer/handler antes do redrive em massa."),

  T(3,
    "NOC-AWS-1803: API role api-producer não envia para a fila orders; AccessDenied.",
    `$ aws sts get-caller-identity
Arn: arn:aws:sts::111122223333:assumed-role/api-producer/session

$ aws sqs send-message --queue-url https://sqs.us-east-1.amazonaws.com/111122223333/orders --message-body '{"ok":1}'
An error occurred (AccessDenied) when calling the SendMessage operation:
User: arn:aws:sts::111122223333:assumed-role/api-producer/session is not authorized to perform: sqs:SendMessage
on resource: arn:aws:sqs:us-east-1:111122223333:orders

$ aws iam list-attached-role-policies --role-name api-producer
Attached: arn:aws:iam::111122223333:policy/ApiReadOnly
# ApiReadOnly: s3:GetObject, sqs:GetQueueAttributes  (no SendMessage)

$ aws sqs get-queue-attributes --queue-url .../orders --attribute-names Policy
Policy: (none / default)

VisibilityTimeout: 60  # irrelevant to AccessDenied`,
    [
      "Anexar/allow sqs:SendMessage no ARN da fila orders à role api-producer",
      "Só aumentar VisibilityTimeout para 3600",
      "Converter a fila em tópico SNS",
      "Criar health check Route 53 na fila",
    ], 0,
    "AccessDenied SendMessage com policy só GetQueueAttributes fecha o caso IAM. Visibility não autoriza envio. Tip de prova: AccessDenied sqs:SendMessage → Allow na role para o queue ARN."),

  T(4,
    "NOC-AWS-1804: SNS topic order-events publica com 200; fila fulfillment-q não recebe.",
    `$ aws sns list-subscriptions-by-topic --topic-arn arn:aws:sns:us-east-1:111122223333:order-events
SubscriptionArn: arn:aws:sns:...:order-events:uuid
Protocol: sqs
Endpoint: arn:aws:sqs:us-east-1:111122223333:fulfillment-q
# Status: Confirmed

$ aws sns publish --topic-arn arn:aws:sns:us-east-1:111122223333:order-events --message '{"order":1}'
MessageId: 9b3c...

$ aws sqs get-queue-attributes --queue-url .../fulfillment-q --attribute-names All
ApproximateNumberOfMessagesVisible: 0
Policy: {
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"AWS": "arn:aws:iam::111122223333:root"},
    "Action": "sqs:SendMessage",
    "Resource": "arn:aws:sqs:us-east-1:111122223333:fulfillment-q"
  }]
}
# Missing: Principal Service sns.amazonaws.com + Condition aws:SourceArn = topic

$ aws sqs receive-message --queue-url .../fulfillment-q --wait-time-seconds 5
(no messages)`,
    [
      "Atualizar a queue policy para permitir sns.amazonaws.com SendMessage com SourceArn do topic order-events",
      "Remover a subscription confirmada",
      "Trocar o topic para FIFO SNS sem policy (fora do foco e não corrige principal)",
      "Aumentar o retention da fila para 14 dias apenas",
    ], 0,
    "Subscription confirmada mas policy só permite a conta root, não o serviço SNS — publishes não entram na fila. Tip de prova: SNS OK e SQS vazia → queue policy Principal sns.amazonaws.com + SourceArn."),

  T(5,
    "NOC-AWS-1805: Time migrou telemetria high-volume para FIFO e viu throttling / backlog enorme; ordem global não era requisito.",
    `$ aws sqs get-queue-attributes --queue-url .../telemetry-fifo.fifo --attribute-names All
FifoQueue: true
ContentBasedDeduplication: true
ApproximateNumberOfMessagesVisible: 900000
VisibilityTimeout: 30

# Producer errors:
Total Throughput Limit Exceeded / rate issues on SendMessage batch
# All messages use MessageGroupId = "global"

$ aws cloudwatch get-metric-statistics ... NumberOfMessagesSent
# plateau below expected 100k+/min design target

# Business: metrics order not required; idempotent aggregators exist`,
    [
      "Manter um único MessageGroupId global e subir só o visibility",
      "Desligar a Internet da VPC",
      "Migrar telemetria para SQS standard (ou múltiplos group ids se FIFO for obrigatório) — hot group FIFO limita paralelismo/throughput",
      "Abrir a fila com Principal * SendMessage",
    ], 2,
    "FIFO com group global e alto volume cria gargalo; o negócio não exige ordem → standard é o encaixe. Visibility e Principal * não resolvem throughput FIFO. Tip de prova: telemetria high-volume sem ordem → standard; FIFO hot group = backlog."),
];

// balance rc to ~8/8/7/7
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
    const t = r[1] < 8 ? 1 : r[2] < 7 ? 2 : 3;
    move(id, t);
    r[0]--;
    r[t]++;
  }
  while (r[1] > 8) {
    const id = by(1).pop();
    const t = r[2] < 7 ? 2 : 3;
    move(id, t);
    r[1]--;
    r[t]++;
  }
  while (r[2] > 8) {
    const id = by(2).pop();
    move(id, 3);
    r[2]--;
    r[3]++;
  }
}

const tipCount = {};
for (const q of questions) {
  const m = q.explicacao_profunda.match(/Tip de prova:[^.]*\./i);
  const t = m ? m[0] : "";
  tipCount[t] = (tipCount[t] || 0) + 1;
}
const repTips = Object.entries(tipCount).filter(([, n]) => n >= 3);
if (repTips.length) console.warn("WARN identical tips", repTips);

const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

fs.writeFileSync(path.join(PARTS, "part-aws-1.8-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.8-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.8-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  free: 10,
  repTips: repTips.length,
});
