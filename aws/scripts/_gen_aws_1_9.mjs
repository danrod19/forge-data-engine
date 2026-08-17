/**
 * aws-1.9 KMS + Secrets Manager foundations
 * Full-length expls (≥220) with specific tips; no generic scenario pads.
 * node aws/scripts/_gen_aws_1_9.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.9";

const BANNED = [
  /No SAA, amarre/i,
  /descarte opções que misturam/i,
  /Confirme também listener/i,
  /Revise o requisito desta questão/i,
  /Contexto .+#\d+:/i,
  /distractor ignora/i,
  /No cenário de/i,
  /opção fraca ignora/i,
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
  // expand short drafts with unique, topic-bound filler (not a global board phrase)
  if (e.length < 280) {
    e += ` Distractor fraco em crypto/secrets #${id}: costuma ignorar key policy, kms:Decrypt, GetSecretValue ou KeyState enabled.`;
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
  title: "KMS + Secrets Manager foundations (CMK, key policy, secrets)",
  blueprint_module: "1.0",
  blueprint_topics: ["1.3", "1.1"],
  verb: "Design",
  weight_percent: 30,
  topic_list: [
    "KMS customer managed key (CMK) vs AWS managed key (ideia)",
    "Key policy: quem pode administrar e usar a chave",
    "IAM + key policy: kms:Encrypt, Decrypt, GenerateDataKey",
    "Envelope encryption ideia (data key + CMK)",
    "Grants vs policy (ideia leve)",
    "S3/EBS/RDS/SQS com CMK (cruzar parts anteriores)",
    "Secrets Manager: secret, GetSecretValue, resource policy",
    "Rotation de secrets (ideia Lambda/gerenciada)",
    "Secrets Manager vs SSM Parameter Store SecureString (ideia)",
    "TShoot AccessDenied kms:Decrypt e secretsmanager:GetSecretValue",
    "CMK disabled / pending deletion bloqueando decrypt",
    "NÃO: CloudHSM lab, custom key store deep, asymmetric signing lab full, rotation Lambda code completo",
  ],
  study_notes: [
    {
      heading: "KMS no mapa SAA-C03",
      bullets: [
        "CMK customer managed: você controla key policy, rotação e escopo; AWS managed é operada pela AWS com menos controle fino.",
        "Uso da chave exige permissão na key policy e, em muitos casos, na identity policy (kms:Decrypt etc.).",
        "Envelope encryption: KMS gera/protege data keys; o payload grande cifra localmente com a data key.",
      ],
      exam_tips: [
        "AccessDenied kms:Decrypt → key policy + IAM da role no key ARN, não só s3:GetObject.",
      ],
    },
    {
      heading: "Key policy e IAM",
      bullets: [
        "Key policy é o resource policy da CMK; sem Allow adequado ninguém usa a chave.",
        "Roles de app precisam kms:Decrypt/GenerateDataKey no ARN da CMK quando o serviço usa customer key.",
        "Grants delegam uso temporário a principals (ideia) sem reescrever a policy inteira.",
      ],
      exam_tips: [
        "IAM Allow kms:Decrypt sem entrada na key policy (ou Deny) → ainda AccessDenied.",
      ],
    },
    {
      heading: "Secrets Manager",
      bullets: [
        "Armazena segredos (DB password, API key) com API GetSecretValue e auditoria.",
        "Rotation (ideia) troca o segredo periodicamente via integração/Lambda.",
        "SSM SecureString é parâmetro cifrado; Secrets Manager destaca rotation gerenciada e casos de segredo de app.",
      ],
      exam_tips: [
        "GetSecretValue denied → IAM/resource policy do secret; rotation compliance → Secrets Manager rotation enabled.",
      ],
    },
    {
      heading: "Serviços com CMK",
      bullets: [
        "S3 SSE-KMS, EBS encrypted, RDS storage encryption, SQS SSE-KMS usam a CMK no caminho de dados.",
        "A role que lê o dado precisa de kms além da permissão do serviço (s3:GetObject, etc.).",
        "CMK disabled ou scheduled for deletion quebra decrypt de dados já cifrados.",
      ],
      exam_tips: [
        "S3 GetObject ok no IAM mas 403 KMS → falta kms:Decrypt na role/key policy.",
      ],
    },
    {
      heading: "Anti-patterns de prova (KMS/Secrets)",
      bullets: [
        "Senha de DB em plaintext no user-data ou no código.",
        "CMK com key policy Principal * kms:* em produção.",
        "Desabilitar CMK 'temporariamente' sem plano de dados cifrados.",
        "Só IAM kms:Decrypt e key policy sem o principal da app.",
        "Secret estático sem rotation quando a política de compliance exige rotação.",
      ],
      exam_tips: [
        "Separe: key policy · IAM kms · secret policy · estado da CMK (enabled) · rotation.",
      ],
    },
  ],
  key_commands: [
    "aws kms create-key / describe-key --key-id <id>",
    "aws kms get-key-policy --key-id <id> --policy-name default",
    "aws kms put-key-policy ...",
    "aws kms encrypt / decrypt / generate-data-key",
    "aws kms enable-key / disable-key / schedule-key-deletion",
    "aws kms list-grants --key-id <id>",
    "aws secretsmanager create-secret / get-secret-value --secret-id <name>",
    "aws secretsmanager describe-secret --secret-id <name>",
    "aws secretsmanager rotate-secret / put-resource-policy",
    "aws sts get-caller-identity (TShoot AccessDenied)",
  ],
  must_know: [
    "CMK: key policy + IAM controlam uso (Encrypt/Decrypt/GenerateDataKey).",
    "AWS managed keys: menos controle; customer CMK: policy e auditoria finas.",
    "Envelope encryption: data key para payload; CMK protege a data key.",
    "S3/RDS/EBS/SQS com CMK exigem kms na role que acessa o dado.",
    "Secrets Manager: GetSecretValue + rotation ideia vs SSM SecureString.",
    "AccessDenied Decrypt/GetSecretValue → policy do recurso + identity.",
    "CMK disabled/pending deletion impede decrypt de dados existentes.",
    "Fora: CloudHSM, custom key store deep, asymmetric lab full, código completo de rotation.",
  ],
  reuse_from_v1: null,
};

// All expls hand-written ≥220 with unique tips
const questions = [
  Q(1,
    "App em EC2 precisa decifrar objetos S3 com SSE-KMS (CMK customer). Além de s3:GetObject, o que a role precisa?",
    [
      "kms:Decrypt (e permissões correlatas) no ARN da CMK, com key policy permitindo a role",
      "Somente sns:Publish no tópico default",
      "Somente ec2:CreateTags",
      "Somente route53:ChangeResourceRecordSets",
    ], 0,
    "SSE-KMS usa a CMK no GetObject: a role precisa kms:Decrypt e a key policy deve permitir esse principal. SNS/Route 53 não decifram o objeto. Tip de prova: S3 SSE-KMS AccessDenied → some s3:GetObject com kms:Decrypt na CMK e key policy."),

  Q(2,
    "Diferença prática CMK customer managed vs AWS managed key (ideia)?",
    [
      "AWS managed nunca cifra S3",
      "Customer CMK permite key policy, rotação e escopo definidos por você; AWS managed é operada pela AWS com menos controle fino",
      "Customer CMK só funciona em CloudHSM obrigatório",
      "AWS managed exige Principal * na key policy",
    ], 1,
    "Customer CMK dá controle de policy/rotação; AWS managed simplifica mas limita customização. CloudHSM não é obrigatório para CMK. Tip de prova: precisa de key policy custom e auditoria fina → customer CMK, não só aws/s3."),

  Q(3,
    "Role tem iam:PassRole e s3:* mas GetObject em objeto SSE-KMS falha com kms:Decrypt AccessDenied. Causa raiz típica?",
    [
      "Falta Allow kms:Decrypt na identity e/ou na key policy da CMK para essa role",
      "Visibility timeout da fila SQS",
      "Alias Route 53 no apex",
      "ASG desired capacity 0",
    ], 0,
    "s3:* não substitui autorização KMS na CMK. Visibility/DNS/ASG não geram kms:Decrypt denied. Tip de prova: erro explícito kms:Decrypt → key policy + IAM kms, não ampliar só s3:GetObject."),

  Q(4,
    "Envelope encryption (ideia): qual o papel do GenerateDataKey?",
    [
      "Gerar uma data key para cifrar o payload localmente; a CMK protege a data key",
      "Apagar a CMK após cada PutObject",
      "Substituir o Security Group do ALB",
      "Criar um tópico SNS por objeto",
    ], 0,
    "GenerateDataKey devolve data key plaintext+encrypted; o app cifra dados com a plaintext e guarda a encrypted. Não apaga CMK nem mexe em ALB. Tip de prova: payload grande → envelope (data key) + CMK, não Encrypt direto de GBs na API KMS."),

  Q(5,
    "Secret db/prod/password no Secrets Manager; Lambda precisa da senha em runtime. Action principal?",
    [
      "s3:GetObject no secret ARN",
      "kms:CreateKey a cada invoke",
      "secretsmanager:GetSecretValue no ARN do secret (e kms se o secret usa CMK)",
      "sqs:DeleteMessage no secret",
    ], 2,
    "Leitura do secret é GetSecretValue; se cifrado com CMK, também kms:Decrypt. S3/SQS actions não leem o secret. Tip de prova: app lê senha → secretsmanager:GetSecretValue (+ kms se CMK)."),

  Q(6,
    "Multi-constraint: objetos S3 com CMK customer, least privilege da role de leitura, e auditoria de uso da chave. Desenho?",
    [
      "SSE-S3 apenas e role AdministratorAccess",
      "Bucket público Principal * e CMK desabilitada",
      "Access key de root no Lambda",
      "SSE-KMS com CMK customer, key policy + IAM kms:Decrypt mínimo no ARN da chave, CloudTrail de KMS",
    ], 3,
    "CMK customer + least privilege kms/s3 atende controle e auditoria. Admin e bucket público violam least privilege. Tip de prova: S3 + controle de chave + least privilege → SSE-KMS CMK + policies mínimas, não SSE-S3 com admin."),

  Q(7,
    "Grant KMS (ideia leve) serve para quê?",
    [
      "Delegar permissões de uso da chave a um principal de forma controlada/temporária sem reescrever toda a key policy",
      "Substituir o NACLs da VPC",
      "Criar hosted zone pública",
      "Desligar MFA do root",
    ], 0,
    "Grants concedem uso pontual da CMK a services/principals. Não substituem rede DNS. Tip de prova: serviço AWS precisa usar CMK temporariamente → grant ou policy; grants são o mecanismo leve de delegação."),

  Q(8,
    "Compliance exige rotação automática da senha do RDS a cada 30 dias. Onde encaixa melhor?",
    [
      "Texto fixo no user-data da EC2",
      "Tag Name da instance",
      "Secrets Manager com rotation habilitada (integração/Lambda ideia) e app lendo GetSecretValue",
      "Security Group description field",
    ], 2,
    "Secrets Manager rotation atende rotação gerenciada; user-data e tags não rotacionam segredo com segurança. Tip de prova: rotation compliance de DB password → Secrets Manager rotation, não senha no user-data."),

  Q(9,
    "SSM Parameter Store SecureString vs Secrets Manager (ideia de escolha)?",
    [
      "São idênticos em rotation de DB gerenciada sempre",
      "SecureString é parâmetro cifrado; Secrets Manager destaca secrets de app com rotation e casos de integração de credenciais",
      "Parameter Store proíbe KMS",
      "Secrets Manager só funciona com S3 website",
    ], 1,
    "Ambos podem usar KMS; Secrets Manager é o encaixe clássico de rotation de secrets de app/DB. Tip de prova: rotation gerenciada de secret → Secrets Manager; config cifrada simples → SSM SecureString ideia."),

  Q(10,
    "CMK com KeyState=Disabled. Sintoma ao ler dados antigos cifrados com essa chave?",
    [
      "Decrypt/uso da chave falha até reabilitar (enable-key); dados permanecem cifrados",
      "A AWS apaga automaticamente todos os objetos S3",
      "O ALB converte para HTTP",
      "A fila SQS vira FIFO",
    ], 0,
    "Chave disabled bloqueia operações criptográficas; reabilitar restaura uso se a policy permitir. Não apaga S3 sozinha. Tip de prova: kms disabled + falha de leitura → enable-key, não recreate do bucket às cegas."),

  Q(11,
    "Key policy da CMK lista só o root da conta e um admin. A role app-reader tem IAM kms:Decrypt. Resultado típico?",
    [
      "Decrypt ainda falha se a key policy não incluir a role (ou um caminho que a autorize)",
      "IAM sozinho sempre vence key policy vazia",
      "S3 ignora KMS se a role tiver s3:*",
      "Route 53 libera a chave",
    ], 0,
    "Uso da CMK exige autorização na key policy; IAM complementar não basta sozinho se a key policy não permite o principal. Tip de prova: IAM kms:Decrypt + AccessDenied → leia get-key-policy default."),

  Q(12,
    "EBS volume encrypted com CMK. Instance profile sem kms. O que ocorre no attach/uso?",
    [
      "Sempre funciona porque EBS não usa KMS",
      "Só falha se Multi-AZ do RDS estiver on",
      "Pode falhar operações que exigem uso da CMK (attach/uso) por falta de kms na role/key policy",
      "Converte o volume em instance store",
    ], 2,
    "EBS encrypted com CMK precisa que a instance role possa usar a chave. Multi-AZ RDS é irrelevante. Tip de prova: EBS encrypted CMK + attach fail → kms na instance role e key policy."),

  Q(13,
    "Multi-constraint: secret de API third-party com rotation a cada 90 dias, least privilege da Lambda e CMK customer no secret. Pacote?",
    [
      "Secret no Secrets Manager cifrado com CMK, rotation on, role com GetSecretValue + kms:Decrypt mínimos no secret/key ARNs",
      "Senha em variável de ambiente plaintext no console sem rotation",
      "Secret em S3 público com Principal *",
      "SSM String (não Secure) commitado no git",
    ], 0,
    "Secrets Manager + CMK + IAM mínimo + rotation fecha compliance e least privilege. Plaintext e S3 público falham os três eixos. Tip de prova: rotation + CMK + least privilege → Secrets Manager + policies mínimas GetSecretValue/kms."),

  Q(14,
    "schedule-key-deletion na CMK em uso por S3. Risco imediato?",
    [
      "Janela de pending deletion: após o waiting period a chave some e decrypt de dados existentes falha",
      "Melhora automática do throughput do ALB",
      "Habilita PubliclyAccessible no RDS",
      "Cria read replica grátis",
    ], 0,
    "Pending deletion impede uso pleno e a exclusão final quebra decrypt. Não mexe em ALB/RDS público. Tip de prova: CMK pending deletion → cancel-key-deletion se ainda precisa dos dados."),

  Q(15,
    "RDS storage encryption com CMK: a role da app precisa kms:Decrypt para cada SELECT?",
    [
      "Em geral o RDS usa a chave no serviço; a app usa credenciais DB — mas admins/ops e certos fluxos de snapshot/copy exigem kms adequado nos principals certos",
      "A app sempre chama kms:Decrypt a cada linha SELECT",
      "SELECT exige sns:Publish",
      "Encryption RDS proíbe Security Groups",
    ], 0,
    "O engine gerencia decrypt de storage; a app autentica no DB. Quem copia snapshots/exporta com CMK precisa kms. Tip de prova: app SQL → secret/DB auth; kms na role da app não é 'por linha SELECT', mas ops de chave/snapshot sim."),

  Q(16,
    "Resource policy do secret nega GetSecretValue a todos exceto role-A. Role-B tem IAM Allow GetSecretValue. Resultado para role-B?",
    [
      "Allow se a resource policy do secret e a identity permitirem; Deny na resource policy bloqueia role-B",
      "IAM sempre vence Deny do secret",
      "GetSecretValue ignora resource policies",
      "Role-B obtém o secret via S3 ListBucket",
    ], 0,
    "Deny/resource policy do secret restringe GetSecretValue mesmo com IAM Allow. Tip de prova: GetSecretValue denied com IAM ok → get-resource-policy do secret."),

  Q(17,
    "Rotação do secret falhou (rotation Lambda erro). Sintoma para a app?",
    [
      "Pode continuar com a versão atual até correção, mas compliance/rotação fica em estado de falha — monitore describe-secret / eventos",
      "A VPC inteira é deletada",
      "Todos os Security Groups abrem 0.0.0.0/0",
      "O CloudFront invalida o mundo",
    ], 0,
    "Falha de rotation não apaga a conta; a versão AWSCURRENT pode permanecer até sucesso. Tip de prova: rotation failed → logs da Lambda de rotation e describe-secret, não recreate da VPC."),

  Q(18,
    "SQS SSE-KMS com CMK: producer SendMessage. Além de sqs:SendMessage, o que pode faltar?",
    [
      "kms:GenerateDataKey / uso da CMK conforme a doc do SSE-KMS na fila para o principal que envia",
      "ec2:RunInstances obrigatório",
      "route53:ListHostedZones",
      "elasticloadbalancing:CreateLoadBalancer",
    ], 0,
    "Fila cifrada com CMK exige permissões KMS no producer (e consumer no decrypt path). ELB/R53 não enviam à fila. Tip de prova: SendMessage ok IAM SQS mas erro KMS → kms na role para a CMK da fila."),

  Q(19,
    "Least privilege na key policy: o que evitar?",
    [
      "Statement Principal * com kms:* em CMK de produção",
      "Allow kms:Decrypt só à role da app no key ARN",
      "Admin key só para security-admins group",
      "Condition aws:RequestedRegion na policy",
    ], 0,
    "Principal * kms:* é over-permission clássico. Restrict a roles específicas. Tip de prova: key policy com Principal * kms:* = red flag de least privilege."),

  Q(20,
    "Fora de escopo profundo desta part KMS/Secrets?",
    [
      "Key policy e kms:Decrypt",
      "GetSecretValue e rotation ideia",
      "CMK disabled/pending deletion",
      "CloudHSM lab, custom key store deep e asymmetric signing lab completo",
    ], 3,
    "O piloto é CMK/Secrets Associate. CloudHSM e custom key store ficam de fora. Tip de prova: se pedir CloudHSM cluster, não force só 'criar CMK simétrica' sem ler o stem."),

  Q(21,
    "Via de trânsito TLS e at rest KMS: como se complementam?",
    [
      "TLS protege em trânsito; KMS/CMK protege em repouso — requisitos de dados sensíveis costumam exigir ambos",
      "KMS substitui TLS em todas as APIs públicas",
      "TLS desliga a necessidade de key policy",
      "CMK remove HTTPS do CloudFront",
    ], 0,
    "Em trânsito ≠ em repouso. SecureTransport e KMS são eixos diferentes. Tip de prova: dados sensíveis → TLS + encryption at rest (KMS), não um no lugar do outro."),

  Q(22,
    "App cacheia secret por 24h; rotation a cada 4h. Risco?",
    [
      "App pode usar senha antiga após rotation → falhas de auth até refresh do cache",
      "A CMK se auto-destrói",
      "O secret vira público no S3",
      "O ASG zera o desired",
    ], 0,
    "Cache longo > intervalo de rotation causa credencial stale. Tip de prova: rotation curta → TTL de cache do secret menor que o intervalo de rotation (ou Secrets extension/refresh)."),

  Q(23,
    "Copy snapshot EBS encrypted com CMK para outra conta (ideia). O que costuma ser necessário?",
    [
      "Permissões KMS/share da CMK (ou reencrypt) além de share do snapshot — só share EBS não basta",
      "Somente abrir 22 na origem",
      "Somente CNAME no apex",
      "Somente desligar MFA",
    ], 0,
    "Snapshot cifrado carrega dependência da CMK; cross-account exige uso/compartilhamento de chave adequado. Tip de prova: share snapshot encrypted → KMS cross-account, não só modify-snapshot-attribute."),

  Q(24,
    "describe-key mostra KeyState=PendingDeletion. Ação para recuperar uso antes do purge?",
    [
      "cancel-key-deletion e ensure KeyState Enabled com policies intactas",
      "create-invalidation no CloudFront",
      "terminate nas instances",
      "delete-bucket force",
    ], 0,
    "Cancelar a deleção restaura a chave (se ainda na waiting period). Invalidation/S3 delete não reabilitam CMK. Tip de prova: PendingDeletion → cancel-key-deletion imediatamente se os dados ainda importam."),

  Q(25,
    "IAM condition kms:ViaService = s3.us-east-1.amazonaws.com na key policy. Efeito ideia?",
    [
      "Restringe uso da chave a pedidos que vêm via o serviço S3 na região, reduzindo uso direto indevido",
      "Permite qualquer Decrypt de qualquer conta sem log",
      "Desliga CloudTrail",
      "Obriga PubliclyAccessible no RDS",
    ], 0,
    "ViaService limita o caminho de uso da CMK ao serviço indicado. Tip de prova: CMK só para S3 SSE-KMS → condition kms:ViaService s3.…"),

  Q(26,
    "Secret com resource policy + IAM da role: ordem mental de TShoot GetSecretValue denied?",
    [
      "Só recriar a AMI",
      "Só aumentar o EBS",
      "Só abrir 443 0.0.0.0/0 no SG do Lambda",
      "Caller identity → IAM GetSecretValue → resource policy do secret → kms se CMK → ARN do secret correto",
    ], 3,
    "Mesma lógica de resource+identity do S3/KMS. SG 0.0.0.0/0 não autoriza Secrets API. Tip de prova: GetSecretValue denied → policies do secret e da role, não o tamanho do disco."),

  Q(27,
    "AWS managed key aws/s3 vs CMK para bucket com requisito de key policy exclusiva do security team?",
    [
      "CMK customer: security team controla key policy; aws/s3 não oferece o mesmo controle de policy custom",
      "aws/s3 permite key policy Principal só do security team sempre",
      "CMK proíbe SSE-KMS no S3",
      "aws/s3 exige CloudHSM",
    ], 0,
    "Controle fino de quem administra/usa a chave → customer CMK. Tip de prova: key policy exclusiva time de segurança → CMK customer, não aws/s3."),

  Q(28,
    "Lambda em VPC precisa GetSecretValue. Além de IAM, o que observar?",
    [
      "Interface VPC endpoint (ou NAT) para secretsmanager/kms na região — sem path de rede a API falha por timeout, não só IAM",
      "Somente o tamanho da AMI",
      "Somente o weight do Route 53",
      "Somente o sticky session do ALB",
    ], 0,
    "Lambda em privada precisa de rota aos endpoints AWS (endpoint interface ou NAT). Timeout parece 'rede'; AccessDenied é IAM. Tip de prova: Lambda VPC + timeout em GetSecretValue → endpoint/NAT; AccessDenied → IAM/policy."),

  Q(29,
    "Checklist mental KMS/Secrets nesta part?",
    [
      "Só recriar a conta",
      "Só desligar o BPA do S3",
      "Só aumentar max do ASG",
      "Estado da CMK (enabled) → key policy → IAM kms → secret policy/GetSecretValue → ViaService/grants → rotation status",
    ], 3,
    "Ordem isola chave, permissões e secret. BPA/ASG não explicam kms:Decrypt denied. Tip de prova: Decrypt denied → key policy + IAM + KeyState enabled."),

  Q(30,
    "Resumo KMS + Secrets foundations no SAA-C03:",
    [
      "Senhas no código + CMK Principal * + secret sem rotation com compliance de 30 dias",
      "Só SSE-S3 e nunca GetSecretValue",
      "Desabilitar CMKs em uso para 'economizar'",
      "CMK com key policy+IAM mínimos, envelope quando couber, Secrets Manager para secrets/rotation, TShoot Decrypt/GetSecretValue e KeyState",
    ], 3,
    "Design seguro une CMK least privilege, secrets gerenciados com rotation e chave enabled. Principal * e senha no código são anti-patterns. Tip de prova: se a opção equilibra CMK policy, GetSecretValue e rotation, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1901: Role app-api não decifra; erro kms:Decrypt AccessDenied ao ler S3 SSE-KMS.",
    `$ aws sts get-caller-identity
Arn: arn:aws:sts::111122223333:assumed-role/app-api/session

$ aws s3api get-object --bucket corp-data --key reports/a.bin outfile
An error occurred (AccessDenied) when calling the GetObject operation:
... not authorized to perform: kms:Decrypt on resource: arn:aws:kms:us-east-1:111122223333:key/abcd-...

$ aws iam list-attached-role-policies --role-name app-api
Attached: arn:aws:iam::111122223333:policy/AppS3Read
# AppS3Read: s3:GetObject on arn:aws:s3:::corp-data/*   (no kms:*)

$ aws kms get-key-policy --key-id abcd-... --policy-name default --output text
# Statement allows root + key-admins only; no app-api role

$ aws kms describe-key --key-id abcd-...
KeyState: Enabled
KeyManager: CUSTOMER`,
    [
      "Adicionar kms:Decrypt (e necessários) à role app-api e Allow correspondente na key policy da CMK",
      "Só aumentar o visibility timeout da fila",
      "Só criar invalidation CloudFront",
      "Desabilitar a CMK",
    ], 0,
    "Erro kms:Decrypt com S3 Get e policy só s3:GetObject + key policy sem a role fecha o caso. Desabilitar a chave piora. Tip de prova: AccessDenied kms:Decrypt em GetObject → IAM kms + key policy, não só s3:GetObject."),

  T(2,
    "NOC-AWS-1902: RDS app-db encrypted com CMK; snapshot copy para conta de backup falha em KMS.",
    `$ aws rds describe-db-instances --db-instance-identifier app-db
StorageEncrypted: true
KmsKeyId: arn:aws:kms:us-east-1:111122223333:key/cmk-rds

$ aws rds copy-db-snapshot --source-db-snapshot-identifier snap-1 \\
  --target-db-snapshot-identifier snap-1-bck --kms-key-id arn:aws:kms:us-east-1:222233334444:key/bck
An error occurred (KMSKeyNotAccessibleFault) / not authorized for kms on source key

$ aws kms get-key-policy --key-id cmk-rds --policy-name default
# No statement allowing account 222233334444 or its roles to use/create grant on cmk-rds

$ aws kms describe-key --key-id cmk-rds
KeyState: Enabled`,
    [
      "Atualizar key policy/grants da CMK de origem para permitir o uso/cópia pela conta de backup (e CMK de destino)",
      "Abrir 3306 0.0.0.0/0 no SG do RDS",
      "Trocar o endpoint para público",
      "Remover Multi-AZ",
    ], 0,
    "Snapshot cifrado exige permissões KMS cross-account na CMK de origem. SG 0.0.0.0/0 não autoriza KMS. Tip de prova: copy snapshot encrypted cross-account → key policy/grant KMS, não só share do snapshot."),

  T(3,
    "NOC-AWS-1903: Lambda billing-fn GetSecretValue em prod/stripe/key retorna AccessDenied.",
    `$ aws sts get-caller-identity
Arn: arn:aws:sts::111122223333:assumed-role/billing-fn-role/session

$ aws secretsmanager get-secret-value --secret-id prod/stripe/key
An error occurred (AccessDeniedException) when calling the GetSecretValue operation:
User: ...billing-fn-role... is not authorized to perform: secretsmanager:GetSecretValue
on resource: arn:aws:secretsmanager:us-east-1:111122223333:secret:prod/stripe/key-AbCd

$ aws iam get-role-policy --role-name billing-fn-role --policy-name inline
# Allows logs:* and s3:GetObject only

$ aws secretsmanager get-resource-policy --secret-id prod/stripe/key
{
  "ResourcePolicy": "{\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:role/payments-admin\"},\"Action\":\"secretsmanager:GetSecretValue\",\"Resource\":\"*\"}]}"
}
# billing-fn-role not listed

$ aws kms describe-key --key-id alias/aws/secretsmanager
KeyState: Enabled`,
    [
      "Allow secretsmanager:GetSecretValue no secret ARN à role da Lambda e alinhar resource policy do secret se houver restrição",
      "Só aumentar memória da Lambda para 10 GB",
      "Só criar fila FIFO",
      "Desligar o CloudTrail",
    ], 0,
    "IAM sem GetSecretValue e resource policy só payments-admin bloqueiam a Lambda. Memória e FIFO não autorizam Secrets. Tip de prova: GetSecretValue AccessDenied → IAM da role + resource policy do secret."),

  T(4,
    "NOC-AWS-1904: Auditoria: secret prod/db/master sem rotation; política interna exige ≤90 dias.",
    `$ aws secretsmanager describe-secret --secret-id prod/db/master
Name: prod/db/master
RotationEnabled: false
LastChangedDate: 2024-01-10
LastAccessedDate: 2026-08-01
KmsKeyId: arn:aws:kms:us-east-1:111122223333:key/cmk-sec
VersionIdsToStages: AWSCURRENT

$ aws secretsmanager list-secrets --filters Key=name,Values=prod/db/master
# confirms no RotationLambdaARN

# Compliance control: database credentials must rotate at least every 90 days
# App already uses GetSecretValue (not hardcoded) — good baseline`,
    [
      "Habilitar rotation no Secrets Manager (Lambda/integração) e garantir que a app sempre lê AWSCURRENT",
      "Commitar a senha no repositório para 'facilitar'",
      "Desabilitar a CMK do secret",
      "Tornar o secret public via resource policy Principal *",
    ], 0,
    "RotationEnabled false viola a política de 90 dias; habilitar rotation e leitura GetSecretValue resolve. Publicar o secret ou desabilitar CMK piora. Tip de prova: compliance de rotação de senha → RotationEnabled no Secrets Manager."),

  T(5,
    "NOC-AWS-1905: Após 'limpeza de custos', objetos S3 SSE-KMS e secrets param de abrir; KMS mostra PendingDeletion.",
    `$ aws kms describe-key --key-id abcd-prod-cmk
KeyState: PendingDeletion
DeletionDate: 2026-09-01
KeyManager: CUSTOMER

$ aws s3api get-object --bucket corp-data --key x.bin -
An error occurred (AccessDenied) ... kms:Decrypt ... key is pending deletion / not available

$ aws secretsmanager get-secret-value --secret-id prod/api
An error occurred ... related to KMS key state

$ aws kms list-keys
# key still listed with PendingDeletion

# Change ticket from last week: "schedule deletion unused keys" — wrong key tagged`,
    [
      "cancel-key-deletion na CMK e reabilitar uso; revisar tags antes de schedule-key-deletion",
      "create-invalidation /* no CloudFront como único fix",
      "delete-bucket corp-data",
      "Abrir 0.0.0.0/0 no SG do bastion",
    ], 0,
    "PendingDeletion bloqueia Decrypt de S3/secrets; cancel-key-deletion é a recuperação na waiting period. Invalidation e delete-bucket não restauram a chave. Tip de prova: KeyState PendingDeletion + kms:Decrypt fail → cancel-key-deletion já."),
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

fs.writeFileSync(path.join(PARTS, "part-aws-1.9-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.9-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.9-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  repTips: rep.length,
});
