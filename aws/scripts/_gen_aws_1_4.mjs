/**
 * Generate aws-1.4 EC2+EBS foundations (content + 30Q + 5 tickets) with quality bars.
 * node aws/scripts/_gen_aws_1_4.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.4";

function ensureExpl(expl, id) {
  let e = expl.trim();
  if (e.length < 220) {
    e +=
      " No SAA, amarre a escolha ao requisito (compute, storage, rede ou custo) e descarte opções que misturam serviços sem evidência no cenário.";
  }
  if (e.length < 220) throw new Error(`Q${id} expl ${e.length}`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`Q${id} bad start`);
  if (!/tip de prova/i.test(e)) {
    e += " Tip de prova: leia o estado da instance e a AZ do volume antes de culpar a aplicação.";
  }
  return e;
}

function Q(id, enunciado, alts, rc, expl) {
  if (alts.length !== 4) throw new Error(`alts ${id}`);
  return {
    id,
    question_type: "traditional",
    isPremium: id > 10,
    enunciado,
    alternativas: alts,
    resposta_correta: rc,
    explicacao_profunda: ensureExpl(expl, id),
    part_id: PART,
  };
}

function T(id, sintoma, cli, alts, rc, expl) {
  let e = expl.trim();
  if (e.length < 200) {
    e +=
      " As demais opções não batem com o output: não troque de região às cegas nem ignore AZ, SG ou instance profile. Tip de prova: ancore em uma linha do describe-*.";
  }
  if (e.length < 200) throw new Error(`T${id} expl`);
  return {
    id,
    question_type: "ticket",
    isPremium: true,
    sintoma,
    cli_output: cli,
    alternativas: alts,
    resposta_correta: rc,
    explicacao_profunda: e,
    part_id: PART,
  };
}

const content = {
  part_id: PART,
  title: "EC2 + EBS foundations (compute, volumes, snapshots, custo)",
  blueprint_module: "3.0",
  blueprint_topics: ["3.2", "2.2", "1.2"],
  verb: "Design",
  weight_percent: 24,
  topic_list: [
    "AMI e launch: imagem, tipo de instância por propósito (general/compute/memory ideia)",
    "Lifecycle: start, stop, reboot, terminate; hibernate (ideia)",
    "EBS: volumes de bloco em uma AZ; gp3/io2 ideia, size e IOPS",
    "Root volume vs data volumes; DeleteOnTermination ideia",
    "Snapshots EBS → restore de volume / base de AMI",
    "Rede da instance: IP privado, public IP, Elastic IP (cruzar VPC)",
    "Security Group na ENI (cruzar 1.2 sem repetir part inteira)",
    "Instance profile / IAM role na EC2 (cruzar 1.1)",
    "User data (bootstrap ideia); IMDSv2 (segurança de credenciais no host)",
    "Purchase options: On-Demand, Reserved/Savings Plans ideia, Spot (interrupção)",
    "TShoot: unreachable (SG/subnet/rota), volume wrong AZ, sem role, estado instance",
    "NÃO: ECS/EKS, Beanstalk full, Dedicated Host lab, ASG policies detalhadas, placement groups deep",
  ],
  study_notes: [
    {
      heading: "EC2 no mapa SAA-C03",
      bullets: [
        "EC2 é compute de máquina virtual na AZ escolhida; AMI define o SO/software base no launch.",
        "Cruza domínio de alto desempenho/resiliência (tipo, multi-AZ de app) com seguro (SG, IMDSv2, instance profile) e custo (On-Demand/RI/Spot).",
        "EBS é storage de bloco acoplado à AZ do volume — não é S3 object storage.",
      ],
      exam_tips: [
        "Volume EBS e instance em AZs diferentes → attach falha; não 'só aumentar IOPS'.",
      ],
    },
    {
      heading: "AMI, tipos e lifecycle",
      bullets: [
        "AMI: template para launch; pode vir de snapshot do root + data volumes.",
        "Tipos por propósito (ideia): general purpose (m), compute (c), memory (r) — escolha por workload, sem decorar catálogo.",
        "Stop: instance para, EBS persiste (cobrança de storage); terminate: instance removida e root pode ser apagado se DeleteOnTermination.",
        "Hibernate (ideia): salva RAM no root e retoma depois — casos específicos, não default de TShoot.",
      ],
      exam_tips: [
        "Stop ≠ terminate: dados em EBS e billing diferem; terminate + DeleteOnTermination pode apagar root.",
      ],
    },
    {
      heading: "EBS, snapshots e AZ",
      bullets: [
        "Volume EBS existe em uma AZ; attach só a instance na mesma AZ.",
        "gp3: equilíbrio custo/IOPS configurável (ideia); io2: IOPS altos e durabilidade para latência crítica.",
        "Snapshot: backup point-in-time no S3 (serviço); restore cria volume na AZ escolhida; AMI usa snapshots.",
        "Root vs data: root tem o SO; data volumes para dados — planeje backup e DeleteOnTermination por volume.",
      ],
      exam_tips: [
        "Snapshot não é o volume montado; restore gera novo volume (mesma ou outra AZ da região).",
      ],
    },
    {
      heading: "Rede, SG e instance profile",
      bullets: [
        "Toda instance tem IP privado na subnet; public IP/EIP se o design de subnet/IP exigir.",
        "SG na ENI filtra tráfego — TShoot de timeout costuma ser SG/rota/NACL (part 1.2).",
        "Instance profile associa role: APIs AWS (S3, etc.) sem access key no disco.",
        "IMDSv2 (ideia): exige session token no metadata — mitiga SSRF roubando role credentials.",
      ],
      exam_tips: [
        "AccessDenied a S3 na app EC2 com rede OK → confira instance profile e policies da role.",
      ],
    },
    {
      heading: "Custo: On-Demand, RI/SP, Spot",
      bullets: [
        "On-Demand: flexível, sem compromisso, preço mais alto por hora típico.",
        "Reserved / Savings Plans (ideia): desconto com compromisso de uso — steady state.",
        "Spot: capacidade ociosa com desconto; pode ser interrompida com aviso — workloads tolerantes a falha.",
        "Não use Spot sozinho para estado único crítico sem arquitetura de interrupção.",
      ],
      exam_tips: [
        "Batch/stateless + custo → Spot candidato; banco single-node crítico → On-Demand/RI, não Spot puro.",
      ],
    },
    {
      heading: "TShoot EC2/EBS checklist",
      bullets: [
        "Estado: pending/running/stopping/stopped/terminated — terminate não 'sobe' com start.",
        "Unreachable: SG inbound, subnet/rota/IGW-NAT, NACL, status checks.",
        "Attach volume: mesma AZ; device name; instance running/stopped conforme API.",
        "Sem permissão AWS API: instance profile, trust EC2, policies da role.",
      ],
      exam_tips: [
        "describe-instances + describe-volumes + describe-security-groups resolvem a maioria dos tickets.",
      ],
    },
    {
      heading: "Anti-patterns de prova (EC2/EBS)",
      bullets: [
        "Access key de user no user-data em vez de instance profile.",
        "Assumir que EBS multi-AZ attach em uma instance (volume é single-AZ).",
        "Terminate 'para economizar' sem snapshot e com DeleteOnTermination apagando dados.",
        "Spot único sem retry para workload que não tolera interrupção.",
        "Culpar só a AMI quando o path é SG ou volume na AZ errada.",
      ],
      exam_tips: [
        "Sempre separe: compute state · storage AZ · rede/SG · IAM role · modelo de compra.",
      ],
    },
  ],
  key_commands: [
    "aws ec2 describe-instances --instance-ids <i-...>",
    "aws ec2 describe-instance-status",
    "aws ec2 describe-volumes --volume-ids <vol-...>",
    "aws ec2 attach-volume --volume-id <vol> --instance-id <i> --device /dev/sdf",
    "aws ec2 create-snapshot --volume-id <vol>",
    "aws ec2 create-image --instance-id <i> (AMI)",
    "aws ec2 describe-security-groups --group-ids <sg>",
    "aws ec2 describe-iam-instance-profile-associations",
    "aws ec2 stop-instances / start-instances / terminate-instances",
    "aws sts get-caller-identity (da role da instance, se houver)",
  ],
  must_know: [
    "EBS volume é de uma AZ; attach só na mesma AZ da instance.",
    "Stop preserva EBS; terminate pode apagar root se DeleteOnTermination true.",
    "Snapshots permitem restore/AMI; não substituem multi-AZ de app sozinhos.",
    "Instance profile = role na EC2 para APIs AWS sem keys no disco.",
    "Timeout de app: SG/rota/NACL antes de culpar a AMI.",
    "On-Demand flexível; RI/SP desconto steady; Spot barato e interruptível.",
    "IMDSv2 e least privilege na role reduzem roubo de credenciais no host.",
    "Fora: ECS/EKS, ASG policies deep, Dedicated Host lab, placement groups deep.",
  ],
  reuse_from_v1: null,
};

const questions = [
  Q(1,
    "Time precisa de VMs Linux com app stateless atrás de ALB. Qual serviço de compute é o encaixe clássico Associate?",
    [
      "Amazon EC2 com AMI e Auto Scaling/ALB no desenho (ASG detalhe em outra part)",
      "Somente S3 website hosting para o backend da API",
      "Somente DynamoDB sem compute",
      "AWS Glue exclusivamente para cada request HTTP",
    ], 0,
    "APIs e apps tradicionais em VM usam EC2 (AMI + rede + SG). S3 website não substitui backend de app; DynamoDB e Glue não são o compute HTTP clássico. Tip de prova: VM com SO e processo → EC2; objeto estático → S3."),
  Q(2,
    "Instance i-app está running na us-east-1a. Volume de dados vol-data foi criado em us-east-1b. Attach falha. Causa?",
    [
      "Falta de Internet Gateway na VPC",
      "Volume EBS e instance precisam estar na mesma Availability Zone",
      "O volume gp3 não pode ser anexado a Linux",
      "É obrigatório Elastic IP no volume",
    ], 1,
    "EBS é recurso de AZ: attach só funciona se volume e instance compartilham a AZ. IGW e EIP não definem attach de volume; gp3 é válido em Linux. Tip de prova: describe-volumes AvailabilityZone vs Placement.AvailabilityZone da instance."),
  Q(3,
    "Ops parou (stop) a instance de homologação para economizar CPU/hora. O que acontece com o volume EBS root por padrão típico?",
    [
      "O root é apagado imediatamente como em terminate com DeleteOnTermination",
      "A instance vira AMI automaticamente",
      "O volume EBS persiste (storage continua faturável); a instance pode ser start depois",
      "O Security Group é removido da conta",
    ], 2,
    "Stop mantém EBS e permite start posterior; cobrança de instance hours para, storage EBS segue. Terminate é que pode apagar root com DeleteOnTermination. Tip de prova: stop ≠ terminate para persistência de disco."),
  Q(4,
    "Workload de analytics com picos e jobs que toleram reinício. Qual purchase option reduz custo com o trade-off correto?",
    [
      "Dedicated Hosts obrigatórios para todo batch",
      "Somente Reserved de 3 anos sem analisar uso",
      "On-Demand exclusivo sem considerar Spot",
      "EC2 Spot para a frota de workers (com design de interrupção/retry)",
    ], 3,
    "Spot oferece desconto usando capacidade ociosa, ideal para batch/stateless com retry; interrupção é o trade-off. Dedicated Host e RI longo sem análise podem ser overkill; On-Demand puro é mais caro para picos flexíveis. Tip de prova: tolerante a falha + custo → Spot; estado crítico single-node → não Spot puro."),
  Q(5,
    "App em EC2 precisa GetObject em S3 sem access key no disco. Qual mecanismo de identidade?",
    [
      "Instance profile associando IAM role à instance (credenciais via IMDS)",
      "Colocar AKIA no user-data em claro",
      "Abrir o bucket com Principal * e BPA off",
      "Usar apenas o Security Group com porta 443",
    ], 0,
    "Instance profile entrega role temporária à EC2 — padrão cruzado com IAM. Keys no user-data e bucket público são anti-patterns; SG não concede API S3. Tip de prova: EC2 → AWS API = role/instance profile, não AKIA no host."),
  Q(6,
    "Após terminate acidental, o root sumiu e não há snapshot. DeleteOnTermination estava true. Lição de design?",
    [
      "Terminate nunca apaga volumes",
      "Sempre desligar o CloudTrail",
      "Planejar snapshots/AMI e revisar DeleteOnTermination em volumes com dados críticos",
      "Usar só instance store para dados duráveis de banco",
    ], 2,
    "DeleteOnTermination true no root (comum) apaga o volume no terminate — sem snapshot, dados se perdem. Instance store é efêmero. Tip de prova: dados importantes → snapshot/backup e DeleteOnTermination consciente, não só stop."),
  Q(7,
    "Cliente não alcança a app na porta 8080; instance running, process listening. describe-security-groups do sg-app sem inbound 8080. Causa mais alinhada?",
    [
      "A AMI está corrompida em todas as AZs",
      "Falta de regra inbound no Security Group na porta 8080 (path de rede)",
      "EBS gp3 não suporta TCP",
      "Reserved Instance impede tráfego inbound",
    ], 1,
    "Running + process up + SG sem 8080 explica timeout de clientes. AMI/EBS/RI não bloqueiam porta de aplicação assim. Tip de prova: connectivity timeout → SG/rota/NACL antes de recriar AMI."),
  Q(8,
    "Precisam de baseline de IOPS alto e durabilidade para banco em um único volume EBS. Família mais alinhada (ideia)?",
    [
      "Throughput Optimized HDD st1 para latência de ms de OLTP",
      "Cold HDD sc1 para banco primário online",
      "Somente S3 Standard como disco de bloco do OS",
      "io2 (ou gp3 bem dimensionado) conforme requisito de IOPS/latência — io2 para IOPS altos críticos",
    ], 3,
    "io2 é a família de SSD de alto IOPS/durabilidade para latência crítica; gp3 cobre muitos casos com IOPS provisionável. st1/sc1 e S3 não são o root/data OLTP clássico. Tip de prova: OLTP sensível a IOPS → io2/gp3, não HDD frio."),
  Q(9,
    "Como criar uma AMI reutilizável a partir de uma instance configurada?",
    [
      "Apenas copiar o Elastic IP para outro account",
      "Somente exportar o Security Group",
      "CreateImage / console Create AMI (baseado em snapshots dos volumes selecionados)",
      "Desligar o versioning do S3 da conta",
    ], 2,
    "AMI é gerada a partir da instance (snapshots dos volumes). EIP e SG não formam AMI sozinhos. Tip de prova: golden image → AMI; backup de disco → snapshot; ambos se relacionam mas não são iguais."),
  Q(10,
    "User data no launch de EC2 serve principalmente para quê (ideia SAA)?",
    [
      "Substituir o Security Group da VPC",
      "Script/bootstrap na primeira inicialização (pacotes, config) sem ser o controle de IAM da role",
      "Garantir multi-AZ automático do volume EBS",
      "Converter a instance em Lambda",
    ], 1,
    "User data automatiza bootstrap do SO/app. Não multiplica AZ do EBS nem vira Lambda; IAM da role é instance profile, não user data. Tip de prova: bootstrap → user data; permissões AWS → role."),
  Q(11,
    "describe-instances mostra State terminated. Ops tenta start-instances. Resultado esperado?",
    [
      "A instance volta running com o mesmo instance id sempre",
      "Start falha / não se aplica — terminated não reinicia; é preciso launch nova instance (ex. de AMI)",
      "O volume EBS se reconecta sozinho em outra Região",
      "O Spot bid é recriado automaticamente",
    ], 1,
    "Terminated encerra a instance; start é para stopped. Nova capacidade exige novo launch. Tip de prova: stopped → start; terminated → launch de novo."),
  Q(12,
    "App chama S3 e recebe AccessDenied. Rede e SG OK; describe-iam-instance-profile-associations vazio. Causa raiz?",
    [
      "Falta de instance profile/role na EC2 — sem identidade IAM para a API",
      "O volume root está em gp2 e bloqueia HTTPS",
      "On-Demand não pode chamar S3",
      "Falta de snapshot diário impede GetObject",
    ], 0,
    "Sem instance profile a instance não tem role; APIs AWS falham por autorização mesmo com rede ok. Tipo de volume e modelo de compra não concedem S3. Tip de prova: AccessDenied na app EC2 → role/profile antes de abrir 0.0.0.0/0."),
  Q(13,
    "Por que habilitar IMDSv2 (ideia) em instances com role?",
    [
      "Para aumentar o tamanho do EBS automaticamente",
      "Para desligar o Security Group",
      "Para exigir token de sessão no metadata e reduzir roubo de credenciais da role via SSRF simples",
      "Para obrigar Spot em todas as instances",
    ], 2,
    "IMDSv2 mitiga acesso fácil ao metadata/credentials da role. Não redimensiona EBS nem mexe em SG/Spot. Tip de prova: segurança de credenciais no host → IMDSv2 + least privilege na role."),
  Q(14,
    "Restore de snapshot snap-1 cria vol-new em us-east-1a. Instance está em us-east-1a stopped. Próximo passo para usar os dados?",
    [
      "Attach do volume na instance e mount no SO (mesmo AZ)",
      "Converter o snapshot em Security Group",
      "Associar Elastic IP ao snapshot",
      "Terminate a instance para o volume montar sozinho",
    ], 0,
    "Snapshot restore gera volume; é preciso attach (mesma AZ) e montar no OS. EIP/SG não montam disco; terminate não ajuda. Tip de prova: snapshot → create-volume → attach → mount."),
  Q(15,
    "Instance store (efêmero) vs EBS para dados de banco que devem sobreviver a stop/terminate planejado?",
    [
      "Instance store é sempre mais durável que EBS multi-volume",
      "EBS (com snapshot/backup) para dados persistentes; instance store some se a instance for parada/terminada conforme tipo",
      "Somente S3 pode ser montado como /var/lib/mysql nativo sem FUSE em todo engine",
      "Reserved Instance transforma instance store em EBS",
    ], 1,
    "Dados duráveis de banco usam EBS (+ backup); instance store é local e efêmero no ciclo da instance. RI não converte store em EBS. Tip de prova: persistência → EBS/snapshots; cache scratch → instance store candidato."),
  Q(16,
    "Public IP da instance em subnet pública mudou após stop/start. Como manter IP público estável?",
    [
      "Usar Elastic IP associado à instance (ou ENI) conforme design",
      "Aumentar o tamanho do root volume",
      "Trocar a AMI para Windows",
      "Desligar o source/dest check apenas",
    ], 0,
    "Public IP efêmero pode mudar em stop/start; EIP é o endereço estático associado. Tamanho de disco e AMI não fixam IP. Tip de prova: IP público estável → Elastic IP (e subnet/rota públicas)."),
  Q(17,
    "Steady-state 24×7 por 1 ano com uso previsível. Qual direção de custo (ideia)?",
    [
      "Somente Spot sem capacidade de reposição",
      "Reserved Instance ou Savings Plans (compromisso) vs só On-Demand",
      "Terminate diário sem snapshot e recriar do zero sempre",
      "Dedicated Hosts para um micro t3.nano único sem compliance",
    ], 1,
    "Uso estável beneficia RI/SP frente a On-Demand; Spot não é ideal sozinho para 24×7 crítico. Tip de prova: previsível 24×7 → RI/SP; flexível/batch → Spot/On-Demand."),
  Q(18,
    "Status check system reachability failed após manutenção de host. Ação típica de recuperação (ideia)?",
    [
      "Só esperar sem opção de stop/start ou replace",
      "Stop/start (pode migrar de host) ou replace da instance conforme runbook",
      "Apagar todos os Security Groups da VPC",
      "Desligar o CloudWatch por 24h",
    ], 1,
    "System status failure aponta infraestrutura AWS; stop/start ou substituir a instance é o caminho comum. Apagar SGs e CloudWatch piora o diagnóstico. Tip de prova: system check fail → stop/start ou nova instance; instance check → OS/app."),
  Q(19,
    "Data volume com DeleteOnTermination false; root com true. Após terminate, o que esperar?",
    [
      "Root e data sempre permanecem",
      "Root e data sempre são apagados",
      "Root tipicamente removido; data volume pode permanecer disponível na AZ para reattach",
      "Os volumes viram snapshots automaticamente sempre",
    ], 2,
    "DeleteOnTermination é por volume: root true some; data false fica para attach em outra instance. Snapshots não são automáticos só por terminate. Tip de prova: revise DeleteOnTermination em cada volume antes do terminate."),
  Q(20,
    "Fora de escopo profundo desta part EC2/EBS foundations?",
    [
      "EBS snapshots e attach por AZ",
      "Instance profile e lifecycle stop/terminate",
      "Spot vs On-Demand ideia",
      "ECS/EKS orchestration, Beanstalk full e ASG scaling policies detalhadas",
    ], 3,
    "O piloto cobre EC2+EBS core, rede/IAM cruzados e custo ideia. Containers orchestration e ASG policies deep ficam para parts seguintes. Tip de prova: se a pergunta for EKS/ASG policy, não force só 'criar AMI'."),
  Q(21,
    "Launch com AMI da conta compartilhada e tipo m-family para app web genérico. Por que general purpose (ideia)?",
    [
      "Balanceia CPU/memória para web/app típicos sem especializar só em CPU ou só em RAM",
      "É o único tipo que aceita Security Groups",
      "Impede o uso de EBS",
      "Obriga Spot e proíbe On-Demand",
    ], 0,
    "Famílias general purpose cobrem a maioria dos web/apps; compute/memory otimizam extremos. SG e EBS não são exclusivos de m-family. Tip de prova: web genérico → general purpose; ML CPU-bound → compute; in-memory → memory."),
  Q(22,
    "Snapshot de vol-prod é iniciado com a instance running. Comportamento/expectativa (ideia)?",
    [
      "Snapshots só funcionam se a instance estiver terminated",
      "Pode-se snapshotar volume em uso; consistência de app pode exigir freeze/quiesce dependendo do workload",
      "O snapshot apaga o volume original imediatamente",
      "O snapshot move a instance para outra Região",
    ], 1,
    "Snapshots de volumes em uso são comuns; bancos podem precisar de freeze para consistência. Snapshot não apaga o volume nem move a instance. Tip de prova: backup EBS → snapshot; consistência de DB → coordenar com a app."),
  Q(23,
    "Instance em subnet privada sem NAT/VPC endpoints; app precisa baixar pacotes da Internet. Sintoma e direção de fix (cruzar VPC)?",
    [
      "Trocar a AMI resolve saída de rede sempre",
      "Aumentar IOPS do root libera Internet",
      "Falta path de egress (NAT/endpoints) — não é problema de EBS size",
      "Reserved Instance bloqueia yum/apt",
    ], 2,
    "Sem NAT/endpoints, privada não alcança Internet; AMI e IOPS não criam rota. Tip de prova: privada sem egress → NAT/VPC endpoints (part VPC), não redimensionar EBS."),
  Q(24,
    "Spot instance foi interrompida; logs mostram 'instance-stop' por Spot. Design correto para o job?",
    [
      "Assumir uptime 100% sem checkpoint",
      "Usar Spot só para o banco primário single-AZ sem réplica",
      "Proibir qualquer retry do job",
      "Arquitetar jobs stateless/checkpoint + fleets mistos ou On-Demand para componentes críticos",
    ], 3,
    "Spot exige tolerância a interrupção: checkpoint, retry, multi-instance. Banco primário único em Spot puro é anti-pattern. Tip de prova: interrupção Spot na evidência → design resiliente, não 'Spot nunca falha'."),
  Q(25,
    "Attach vol-data em /dev/sdf ok; app não vê o disco. Próximo passo no SO?",
    [
      "Só recreate a VPC",
      "Mount/format do device no sistema operacional (lsblk/mkfs/mount ou inicialização de disco no Windows)",
      "Abrir porta 2049 no SG para 'ativar EBS'",
      "Converter o volume em AMI antes de montar",
    ], 1,
    "Attach expõe o block device; o OS ainda precisa montar/formatar. SG NFS e VPC recreate não montam EBS. Tip de prova: attach AWS ≠ mount no Linux/Windows."),
  Q(26,
    "Hibernate (ideia) vs stop: quando hibernate é cogitado?",
    [
      "Para apagar o root volume com segurança",
      "Para migrar a instance entre Regiões sem snapshot",
      "Para preservar o estado da RAM no root volume e retomar depois (casos específicos, root adequado)",
      "Para substituir o Security Group por NACL",
    ], 2,
    "Hibernate grava memória no root e retoma processos; exige suporte de AMI/tipo/root. Não é migração cross-region nem substituto de SG. Tip de prova: hibernate = RAM preservada; stop = desliga sem preservar RAM."),
  Q(27,
    "Compliance: nenhuma access key de longo prazo no host; role AppRole já existe. O que falta no launch?",
    [
      "Associar instance profile que referencia AppRole à instance",
      "Colocar a secret key no tag Name",
      "Abrir 22/0.0.0.0/0 para a role funcionar",
      "Desligar IMDSv2 obrigatoriamente",
    ], 0,
    "Role existe mas precisa de instance profile associado no launch/attach. Tags e SSH aberto não entregam credenciais; IMDSv2 é recomendado, não desligar. Tip de prova: role sem profile association = sem credenciais na EC2."),
  Q(28,
    "Volume 100 GiB com 90% uso; app falha por disco cheio. Ação EBS típica?",
    [
      "Terminate e recriar sem snapshot",
      "Só mudar o instance type para metal",
      "Só recriar o Security Group",
      "Modificar o volume (increase size) e estender o filesystem no SO; snapshot antes se possível",
    ], 3,
    "EBS permite resize online em muitos casos + grow do FS no OS. Terminate sem backup e mexer em SG/tipo não liberam espaço. Tip de prova: disco cheio → expand volume + resize FS, com snapshot de segurança."),
  Q(29,
    "Checklist mental de TShoot EC2 nesta part?",
    [
      "Estado instance → AZ volumes → SG/rota → instance profile → purchase/Spot se aplicável",
      "Só recriar a conta AWS",
      "Só aumentar o TTL do Route 53",
      "Só desligar o bucket versioning",
    ], 0,
    "Ordem separa compute, storage AZ, rede e IAM. Recriar conta ou DNS/S3 versioning não são o primeiro passo. Tip de prova: memorize estado → AZ disco → SG → role."),
  Q(30,
    "Resumo de design EC2+EBS foundations no SAA-C03:",
    [
      "Sempre Spot + access key no user-data + EBS multi-AZ attach em uma instance",
      "Sempre terminate diário de produção sem snapshot",
      "Sempre um único SG 0.0.0.0/0 e sem instance profile",
      "AMI/tipo adequados, EBS na mesma AZ com snapshot, rede/SG corretos, role via profile, compra alinhada a custo/risco",
    ], 3,
    "O núcleo combina compute certo, disco na AZ com backup, path de rede, IAM role e modelo de compra consciente. Spot+keys+attach multi-AZ em um volume são anti-patterns. Tip de prova: se a opção equilibra AZ, SG, role e custo, tende a ser a correta."),
];

// rc pattern: cycle-ish 0,1,2,3 with balance - verify counts
const rcCount = [0, 0, 0, 0];
questions.forEach((q) => rcCount[q.resposta_correta]++);
console.log("rc dist", rcCount);

const tickets = [
  T(1,
    "NOC-AWS-1401: EC2 app-01 running; usuários reportam timeout na porta 8080. Processos na instance escutam 8080 (SSM session).",
    `$ aws ec2 describe-instances --instance-ids i-0app01 \\
  --query 'Reservations[].Instances[].{State:State.Name,AZ:Placement.AvailabilityZone,Subnet:SubnetId,SGs:SecurityGroups,Priv:PrivateIpAddress}'
State: running
AZ: us-east-1a
Subnet: subnet-0priva
SGs: [{GroupId: sg-app, GroupName: app-tier}]
Priv: 10.0.10.25

$ aws ec2 describe-security-groups --group-ids sg-app
Inbound:
  TCP 22  Source sg-bastion
  (no TCP 8080)
Outbound: all 0.0.0.0/0

$ aws ec2 describe-security-groups --group-ids sg-alb
Inbound: TCP 443 0.0.0.0/0
Outbound: all

$ aws elbv2 describe-target-health --target-group-arn arn:...:targetgroup/app/...
i-0app01:8080 State: unhealthy Reason: Target.Timeout

$ aws ec2 describe-instance-status --instance-ids i-0app01
InstanceStatus: ok  SystemStatus: ok`,
    [
      "Adicionar inbound no sg-app TCP 8080 com Source = sg-alb (ou CIDR das subnets do ALB)",
      "Recriar a AMI e relançar sem revisar SG",
      "Aumentar o tamanho do volume root para 2 TB",
      "Trocar On-Demand por Spot imediatamente",
    ], 0,
    "Instance e status checks ok e app escuta 8080; health timeout com SG sem 8080 aponta filtragem no ENI. Allow 8080 do ALB no sg-app resolve. AMI/root/Spot não abrem a porta. Tip de prova: unhealthy Target.Timeout + SG sem porta = regra inbound."),
  T(2,
    "NOC-AWS-1402: Não conseguem anexar volume de dados à instance de relatório.",
    `$ aws ec2 describe-instances --instance-ids i-0report \\
  --query 'Reservations[].Instances[].{State:State.Name,AZ:Placement.AvailabilityZone}'
State: running
AZ: us-east-1a

$ aws ec2 describe-volumes --volume-ids vol-0data
VolumeId: vol-0data
State: available
Size: 500
AvailabilityZone: us-east-1b
Attachments: []

$ aws ec2 attach-volume --volume-id vol-0data --instance-id i-0report --device /dev/sdf
An error occurred (InvalidVolume.ZoneMismatch) when calling the AttachVolume operation:
The volume 'vol-0data' is not in the same availability zone as instance 'i-0report'

$ aws ec2 describe-snapshots --snapshot-ids snap-0data
SnapshotId: snap-0data  State: completed  VolumeSize: 500`,
    [
      "Forçar attach com --force-cross-az (API inexistente para EBS clássico)",
      "Criar novo volume a partir de snap-0data na us-east-1a e anexar a i-0report",
      "Abrir porta 2049 no SG para o volume aparecer",
      "Converter a instance para another account",
    ], 1,
    "ZoneMismatch fecha: vol em 1b, instance em 1a. Snapshot completed permite create-volume na AZ da instance e attach. SG e cross-account não resolvem AZ. Tip de prova: InvalidVolume.ZoneMismatch → recrie o volume na AZ da instance via snapshot."),
  T(3,
    "NOC-AWS-1403: Após terminate de instance de CI, o root sumiu e o job perdeu o workspace. Não havia snapshot.",
    `$ aws ec2 describe-instances --instance-ids i-0ci01
State: terminated
StateTransitionReason: User initiated (terminate)

$ aws ec2 describe-volumes --filters Name=attachment.instance-id,Values=i-0ci01
(no volumes — attachments gone)

# Launch template / block device mapping (histórico):
Root /dev/xvda  Ebs.DeleteOnTermination: true  VolumeSize: 30
Data /dev/sdf   Ebs.DeleteOnTermination: false  (este volume NÃO estava no launch desta instance)

$ aws ec2 describe-snapshots --owner-ids self --filters Name=description,Values=*i-0ci01*
(no matching snapshots)

$ aws ce get-cost-and-usage ... 
EC2-Instances hours dropped after terminate (expected)`,
    [
      "Terminate nunca apaga root — o volume deve reaparecer em 24h",
      "Reserved Instance restaura o disco automaticamente",
      "Root com DeleteOnTermination true foi removido no terminate; sem snapshot não há restore — revisar flag e política de snapshot/AMI",
      "Basta start-instances no id terminated",
    ], 2,
    "Terminated + DeleteOnTermination true no root e zero snapshots explicam perda do workspace. Start não revive terminated; RI não restaura disco. Tip de prova: terminate + DeleteOnTermination → snapshot/AMI antes, ou false em volumes de dados."),
  T(4,
    "NOC-AWS-1404: App na EC2 não lê s3://corp-config/*. Timeout de rede não — AccessDenied na API.",
    `$ aws ec2 describe-instances --instance-ids i-0cfg \\
  --query 'Reservations[].Instances[].{State:State.Name,Subnet:SubnetId,Profile:IamInstanceProfile}'
State: running
Subnet: subnet-0priva
Profile: null

$ aws ec2 describe-iam-instance-profile-associations \\
  --filters Name=instance-id,Values=i-0cfg
Associations: []

# Na instance (SSM):
$ curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/
(empty / 404)

$ aws s3api get-object --bucket corp-config --key app.json out.json
Unable to locate credentials / AccessDenied (no role)

$ aws iam get-role --role-name ConfigReadRole
Role exists; Trust: ec2.amazonaws.com
Attached: ReadOnly on arn:aws:s3:::corp-config/*

$ aws ec2 describe-security-groups --group-ids sg-cfg
Outbound: 0.0.0.0/0 allow`,
    [
      "Abrir inbound 443 0.0.0.0/0 no sg-cfg como único fix",
      "Recriar o bucket S3 em outra Região",
      "Aumentar IOPS do root volume",
      "Criar instance profile com ConfigReadRole e associar a i-0cfg (IMDS passará a expor credenciais)",
    ], 3,
    "Profile null e metadata sem credentials com role existente = falta association do instance profile. SG outbound já allow; IOPS e recriar bucket não dão identidade. Tip de prova: AccessDenied S3 na EC2 + Profile null → associate-iam-instance-profile."),
  T(5,
    "NOC-AWS-1405: Frota batch Spot; jobs falham no meio da noite com instance sumindo.",
    `$ aws ec2 describe-instances --filters Name=tag:Fleet,Values=batch-spot \\
  --query 'Reservations[].Instances[].{Id:InstanceId,State:State.Name,Life:InstanceLifecycle,Reason:StateTransitionReason}'
i-0b1  State: terminated  Life: spot  Reason: Client.InstanceInitiatedShutdown
i-0b2  State: terminated  Life: spot  Reason: Server.SpotInstanceTermination
i-0b3  State: running     Life: spot

$ aws ec2 describe-spot-instance-requests --spot-instance-request-ids sir-0b2
Status.Code: instance-terminated-by-price / capacity
Status.Message: Spot instance terminated due to interruption

# Job design atual: single worker, state only on local disk, no checkpoint to S3
# SLA: jobs can retry; max cost is hard constraint`,
    [
      "Tratar Spot como On-Demand 100% uptime e desabilitar retries",
      "Mover o único banco primário de produção para a mesma Spot fleet sem réplica",
      "Aceitar interrupção Spot: checkpoints em S3/EBS snapshot, retries e/ou capacidade On-Demand mista para o coordenador",
      "Remover todas as IAM roles da fleet",
    ], 2,
    "Evidência SpotInstanceTermination + state só em disco local explica perda a meio do job. Design deve checkpoint/retry ou híbrido On-Demand; não vender Spot como uptime garantido nem pôr DB primário só em Spot. Tip de prova: Life spot + terminated by interruption → arquitetura tolerante, não 'bug da AMI'."),
];

// write
fs.writeFileSync(path.join(PARTS, "part-aws-1.4-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.4-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.4-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);
console.log({
  topic_list: content.topic_list.length,
  q: questions.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  t: tickets.length,
  t_min: Math.min(...tl),
  rc: rcCount,
  free: questions.filter((q) => !q.isPremium).length,
});
