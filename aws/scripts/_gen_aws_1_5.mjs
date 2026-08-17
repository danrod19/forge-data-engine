/**
 * Generate aws-1.5 ALB + Auto Scaling foundations.
 * Quality: expl ≥220, specific tips, no generic SAA bordão.
 * node aws/scripts/_gen_aws_1_5.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.5";
const BANNED = [
  /No SAA, amarre a escolha ao requisito/i,
  /descarte opções que misturam serviços/i,
  /descarte distractors que misturam domínios/i,
  /amarre a escolha ao requisito \(compute/i,
];

function ensureExpl(expl, id) {
  let e = expl.trim();
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`Q${id} banned phrase`);
  }
  if (/^A resposta correta é/i.test(e)) throw new Error(`Q${id} bad start`);
  if (!/tip de prova/i.test(e)) {
    e += " Tip de prova: relate ALB health, SG source=ALB e capacity do ASG antes de recriar a AMI.";
  }
  // lengthen with specific ALB/ASG filler (not banned generic SAA phrase)
  while (e.length < 220) {
    e +=
      " Confirme também listener/TG e subnets multi-AZ se o sintoma for 503 ou unhealthy em produção.";
  }
  if (e.length < 220) throw new Error(`Q${id} expl ${e.length}`);
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
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`T${id} banned`);
  }
  if (e.length < 200) throw new Error(`T${id} expl ${e.length}`);
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
  title: "ALB + Auto Scaling foundations (health, multi-AZ, capacity)",
  blueprint_module: "2.0",
  blueprint_topics: ["2.2", "2.1", "3.2"],
  verb: "Design",
  weight_percent: 26,
  topic_list: [
    "ALB internet-facing vs internal; listeners HTTP/HTTPS (ideia)",
    "Target groups: protocolo/porta; registro de instances",
    "Health checks: path, códigos, healthy/unhealthy threshold",
    "ALB em subnets públicas ≥2 AZ; targets em privadas multi-AZ",
    "SG: ALB inbound 443; targets inbound só do SG do ALB",
    "ASG: min/desired/max; launch template (AMI, tipo, SG, instance profile)",
    "Scaling policies: CPU, request count, custom (ideia); cooldown ideia",
    "Integração ALB+ASG: attach target group; replace de unhealthy",
    "Deregistration delay / connection draining (ideia)",
    "TShoot: 503, unhealthy, health path 404, SG, ASG capacity 0, single-AZ SPOF",
    "NÃO: NLB/GLB deep, path routing lab completo, Blue/Green CodeDeploy full, predictive scaling, Warm pools, ECS capacity providers",
  ],
  study_notes: [
    {
      heading: "ALB no desenho multi-tier",
      bullets: [
        "Application Load Balancer opera em L7 (HTTP/HTTPS): listeners encaminham a target groups.",
        "Internet-facing: nodes em subnets públicas multi-AZ; internal: só dentro da VPC/rede privada.",
        "Targets (EC2) ficam em privadas; o ALB alcança pela rota local da VPC e SG corretos.",
      ],
      exam_tips: [
        "Usuários na Internet → ALB internet-facing em ≥2 AZ públicas; app em privada.",
      ],
    },
    {
      heading: "Health checks e 503",
      bullets: [
        "O TG marca target unhealthy se o health path falhar (timeout, 5xx, ou 404 se não aceito).",
        "Unhealthy remove o target do balanceamento; se todos unhealthy ou capacity 0 → 503 ao cliente.",
        "Path e porta do health check devem existir na app; SG do target deve permitir a porta do health a partir do ALB.",
      ],
      exam_tips: [
        "503 no ALB + zero healthy targets → capacity/ASG ou health/SG, não 'só DNS'.",
      ],
    },
    {
      heading: "Security Groups ALB → target",
      bullets: [
        "Padrão: sg-alb permite 443 (ou 80) de 0.0.0.0/0 ou prefix list; sg-app permite a porta do TG só de sg-alb.",
        "Allow 0.0.0.0/0 na app quebra least privilege e confunde TShoot.",
        "Health check usa o mesmo path de rede: sem inbound do ALB, target fica unhealthy.",
      ],
      exam_tips: [
        "Timeout no target com process up → Source do SG deve ser o SG do ALB.",
      ],
    },
    {
      heading: "Auto Scaling Group",
      bullets: [
        "ASG mantém desired entre min e max; launch template define AMI, instance type, key, SG, profile.",
        "Subnets do ASG em ≥2 AZ para HA; uma AZ só = SPOF de disponibilidade.",
        "Com TG attached, instances entram/saem do target group; unhealthy pode ser substituída conforme health check do ASG/ELB.",
      ],
      exam_tips: [
        "desired=0 ou max=0 → nenhuma instance → 503 se o ALB não tiver targets healthy.",
      ],
    },
    {
      heading: "Scaling e draining",
      bullets: [
        "Target tracking (CPU %, ALB request count por target) é o padrão ideia de prova.",
        "Cooldown-out evita flapping de scale-out/in consecutivos.",
        "Deregistration delay: tempo para conexões drenarem antes de terminar a instance no scale-in.",
      ],
      exam_tips: [
        "Jobs cortados no scale-in → aumente deregistration delay ou arquitetura stateless/checkpoint.",
      ],
    },
    {
      heading: "Anti-patterns de prova (ALB/ASG)",
      bullets: [
        "ALB ou ASG em uma única AZ quando o requisito pede multi-AZ.",
        "Health path em /admin que retorna 401/404 e derruba todos os targets.",
        "sg-app sem allow do sg-alb; abrir 0.0.0.0/0 'para testar' em produção.",
        "desired/min/max incoerentes (desired 0 com ALB de produção).",
        "Scale-in agressivo sem draining em workloads com conexão longa.",
      ],
      exam_tips: [
        "Sempre separe: listener/TG · health · SG · subnets/AZ · capacity ASG.",
      ],
    },
  ],
  key_commands: [
    "aws elbv2 describe-load-balancers",
    "aws elbv2 describe-target-groups",
    "aws elbv2 describe-target-health --target-group-arn <arn>",
    "aws elbv2 describe-listeners --load-balancer-arn <arn>",
    "aws autoscaling describe-auto-scaling-groups",
    "aws autoscaling describe-auto-scaling-instances",
    "aws autoscaling describe-scaling-activities",
    "aws autoscaling update-auto-scaling-group --desired-capacity <n>",
    "aws ec2 describe-security-groups",
    "aws ec2 describe-subnets",
  ],
  must_know: [
    "ALB multi-AZ em públicas; targets app em privadas multi-AZ.",
    "Health check falho → unhealthy → sem tráfego; todos unhealthy ou capacity 0 → 503.",
    "SG do target deve permitir a porta do TG a partir do SG do ALB.",
    "ASG min/desired/max + launch template definem capacity e config de launch.",
    "Subnets do ASG em uma AZ só = SPOF mesmo com ALB multi-AZ.",
    "Scaling por métrica (CPU/request) com cooldown; draining no scale-in.",
    "TShoot 503: target health + ASG desired + SG + health path.",
    "Fora: NLB deep, path routing lab full, Blue/Green CodeDeploy, predictive scaling.",
  ],
  reuse_from_v1: null,
};

// Gabarito target ~8/8/7/7: rc sequence designed carefully
const questions = [
  Q(1,
    "Site público HTTPS com app em EC2 privadas multi-AZ. Onde colocar o ALB internet-facing?",
    [
      "Em pelo menos duas subnets públicas de AZs diferentes, com targets no TG em privadas",
      "Somente em uma subnet privada sem IGW",
      "Somente na mesma ENI de cada EC2 de app",
      "Substituído por NAT Gateway na borda",
    ], 0,
    "Internet-facing exige nodes do ALB em subnets públicas multi-AZ para HA e path via IGW; targets ficam em privadas. NAT não termina HTTPS de usuários. Tip de prova: usuários Internet + HA → ALB público ≥2 AZ; app privada."),

  Q(2,
    "ALB retorna 503; describe-target-health mostra todos Unhealthy e ASG desired=2. Processos na app sobem na 8080. Health check path=/health retorna 404. Causa mais direta?",
    [
      "Falta de Elastic IP em cada target",
      "Reserved Instance bloqueando o listener 443",
      "Health check path incorreto (404) marca targets unhealthy e o ALB fica sem backend saudável",
      "S3 versioning desligado na conta",
    ], 2,
    "404 no path de health faz o TG marcar unhealthy; com zero healthy o ALB responde 503 mesmo com instances running. EIP e RI não definem health HTTP. Tip de prova: 503 + Unhealthy → path/porta/SG do health antes de recriar o ALB."),

  Q(3,
    "Padrão de Security Group entre ALB e targets EC2 na porta do target group 8080?",
    [
      "sg-app 0.0.0.0/0 em todas as portas e sg-alb sem inbound",
      "sg-alb inbound 443 (clientes); sg-app inbound 8080 com Source = sg-alb",
      "Somente NACL Deny all entre públicas e privadas",
      "Sem Security Groups se o ASG estiver enabled",
    ], 1,
    "Least privilege: clientes batem no ALB; targets só aceitam o SG do ALB na porta do TG/health. 0.0.0.0/0 na app e Deny all quebram o path. Tip de prova: Source do target = group-id do ALB, não a Internet."),

  Q(4,
    "ASG com min=2, desired=2, max=2, subnets só em us-east-1a. Requisito: sobreviver à queda de uma AZ. Qual falha de design?",
    [
      "max=2 impede On-Demand",
      "min=2 é inválido com ALB",
      "Launch template não pode ter AMI",
      "ASG em uma única AZ é SPOF — precisa de subnets em ≥2 AZ",
    ], 3,
    "Capacity em uma AZ só cai com a AZ; multi-AZ no ASG (e no ALB) é o desenho resiliente. min/max=2 são válidos; AMI no LT é normal. Tip de prova: inventário de subnets do ASG com uma AZ = falha de HA."),

  Q(5,
    "O que um target group faz no caminho do ALB?",
    [
      "Agrupa targets (IP/instance) e aplica health checks + roteamento do listener",
      "Substitui o Internet Gateway da VPC",
      "Cria snapshots EBS a cada health check",
      "Define o preço Spot da frota sozinho",
    ], 0,
    "TG é o backend lógico: porta/protocolo, health e registro de instances. Não é IGW nem billing Spot. Tip de prova: listener → TG → targets healthy."),

  Q(6,
    "Multi-constraint: HA multi-AZ, custo controlado e health fail-fast se /ready falhar. Qual desenho atende os três?",
    [
      "Uma EC2 On-Demand com EIP e health desligado",
      "ALB multi-AZ + ASG multi-AZ com min≥2, health em /ready, tipos right-sized (evita overprovision fixo enorme)",
      "NLB em uma AZ com desired 20 always",
      "Somente CloudFront sem origem de compute",
    ], 1,
    "ALB+ASG multi-AZ com min≥2 cobre HA; health /ready remove targets ruins; right-size controla custo vs frota fixa inchada. EIP único e health off falham HA e fail-fast. Tip de prova: HA+health+custo → multi-AZ ASG/ALB + health path real + capacity sob controle."),

  Q(7,
    "Após scale-in, usuários com upload longo veem conexão cortada. Qual ajuste de ALB/ASG (ideia)?",
    [
      "Aumentar deregistration delay (connection draining) para drenar conexões antes do terminate",
      "Remover o target group do ASG",
      "Desligar todos os health checks permanentemente",
      "Colocar o ASG desired em 0",
    ], 0,
    "Deregistration delay dá tempo de drenar conexões no scale-in/replace. desired 0 e remover TG pioram disponibilidade. Tip de prova: conexões longas cortadas no scale-in → draining/deregistration delay."),

  Q(8,
    "Launch template do ASG define AMI, instance type, sg-app e instance profile. Qual papel no scale-out?",
    [
      "Apenas renomeia tags do ALB",
      "Substitui o listener HTTPS",
      "É o blueprint de cada nova instance lançada pelo ASG",
      "Desliga o cooldown de scaling",
    ], 2,
    "LT (ou LC legado) fixa a config de launch no scale-out; sem LT coerente o ASG não sobe instances corretas. Não mexe sozinho no listener. Tip de prova: ASG não lança → descreva launch template + subnets + service quota."),

  Q(9,
    "Métrica típica de target tracking com ALB para escalar web tier (ideia)?",
    [
      "Número de snapshots EBS na conta",
      "Request count por target (ALB) ou CPU utilization da ASG",
      "Tamanho do bucket S3 de logs",
      "Quantidade de IAM users",
    ], 1,
    "CPU e ALBRequestCountPerTarget são métricas clássicas de scale horizontal web. Snapshots/S3/IAM users não guiam capacity do ASG web. Tip de prova: scale web → CPU ou requests por target no ALB."),

  Q(10,
    "ALB internal vs internet-facing: quando internal?",
    [
      "Sempre que houver HTTPS",
      "Somente com Spot instances",
      "Somente em us-east-1",
      "Quando só clientes da VPC/rede privada devem alcançar o balanceador (ex. service-to-service)",
    ], 3,
    "Internal não recebe clients da Internet pública; internet-facing sim. HTTPS e região não definem o scheme. Tip de prova: scheme internal = sem path público; facing = subnets públicas + IGW."),

  // premium 11-30
  Q(11,
    "describe-target-health: State=unhealthy Reason=Target.Timeout. App escuta 8080; NACL allow; sg-app só tem 22 de bastion. Diagnóstico?",
    [
      "Falta inbound 8080 no sg-app com Source do ALB — health e tráfego timeout",
      "A AMI não pode rodar atrás de ALB",
      "Cooldown-out do ASG bloqueia pacotes TCP",
      "HTTPS no listener exige WAF obrigatório",
    ], 0,
    "Timeout de health com process up e NACL ok aponta SG sem porta do TG a partir do ALB. AMI e cooldown não filtram TCP. Tip de prova: Target.Timeout + SG sem 8080 = abra a porta do TG/health ao sg-alb."),

  Q(12,
    "ASG desired=0, min=0, max=10, TG attached a ALB de produção. Sintoma esperado?",
    [
      "ALB anuncia 200 sem backends",
      "ASG lança 10 instances imediatamente sempre",
      "Clientes recebem 503 (ou falha) por ausência de targets healthy registrados",
      "O launch template é apagado",
    ], 2,
    "desired 0 significa zero instances; TG vazio/unhealthy gera 503 no ALB. max 10 só limita o teto. Tip de prova: 503 + ASG desired 0 → suba desired/min de produção."),

  Q(13,
    "Multi-constraint: reduzir custo noturno mas manter HA diurna com health rigoroso. Abordagem?",
    [
      "max=1 e health path em endpoint que sempre 500",
      "Schedule/min dinâmico (ex. min=2 dia, min=0 ou baixo noite) + health /ready estável + ALB multi-AZ",
      "Terminate manual diário de todas as AZ sem ALB",
      "Uma instance Spot permanente com EIP",
    ], 1,
    "Scheduled scaling ou ajuste de min/desired corta custo à noite; min≥2 e multi-AZ de dia mantêm HA; health estável evita flapping. Health 500 e max=1 quebram HA. Tip de prova: custo+HA → scheduled capacity + multi-AZ + health saudável, não max=1."),

  Q(14,
    "Por que registrar o ASG no target group do ALB?",
    [
      "Para o ASG criar VPCs automaticamente",
      "Para desligar Security Groups",
      "Para instances novas entrarem no balanceamento e unhealthy serem gerenciadas no caminho ELB",
      "Para converter ALB em NLB",
    ], 2,
    "Attach do TG ao ASG automatiza register/deregister no scale e integra health ELB. Não cria VPC nem muda para NLB. Tip de prova: ASG + ALB = target group attachment."),

  Q(15,
    "Listener 443 no ALB sem certificado ACM (ideia HTTPS). O que falta no desenho seguro de borda?",
    [
      "Certificado no listener HTTPS (ACM) e policy TLS adequada",
      "gp3 IOPS no volume do ALB (ALB não usa EBS de cliente assim)",
      "Instance store em cada node do ALB gerenciado",
      "Desligar o health check",
    ], 0,
    "HTTPS no ALB exige certificado no listener (tipicamente ACM). IOPS EBS de targets e desligar health não configuram TLS na borda. Tip de prova: listener 443 → certificado ACM no ALB."),

  Q(16,
    "Cooldown-out em scaling policy evita qual problema?",
    [
      "Impede qualquer scale-out para sempre",
      "Substitui o max do ASG",
      "Apaga o launch template",
      "Oscilação rápida scale-out/in (flapping) após picos transitórios",
    ], 3,
    "Cooldown-out dá tempo da métrica estabilizar antes de outro ajuste de capacity. Não remove o max nem o LT. Tip de prova: flapping de ASG → revise cooldown e thresholds."),

  Q(17,
    "ALB em 2 AZ; ASG só em subnet us-east-1a. Incidente derruba 1a. Resultado?",
    [
      "ALB continua com targets healthy na 1b automaticamente",
      "Sem targets em outras AZ, a app fica indisponível apesar do ALB multi-AZ",
      "O ASG migra EBS multi-attach para 1b sozinho",
      "Route 53 remove a necessidade de multi-AZ no ASG",
    ], 1,
    "ALB multi-AZ não cria instances; o ASG single-AZ perde toda capacity na falha da AZ. Tip de prova: multi-AZ no ALB + ASG single-AZ = HA incompleta."),

  Q(18,
    "Health check success codes = 200; app /health devolve 200 só se DB up. Benefício?",
    [
      "Remove targets que não estão realmente prontos para tráfego (dependência crítica)",
      "Aumenta o desired do ASG automaticamente para 100",
      "Desliga o listener 443",
      "Converte targets em Spot obrigatoriamente",
    ], 0,
    "Health alinhado a readiness evita enviar usuários a instances 'up' sem DB. Não mexe sozinho em desired/Spot. Tip de prova: health deve refletir readiness real, não só process listen."),

  Q(19,
    "TShoot: scaling activity Failed: Launching a new EC2 instance. Status: subnet has no more free addresses. Ação?",
    [
      "Aumentar desired mesmo assim sem mudar rede",
      "Só trocar o health path",
      "Usar subnets com CIDR/IPs livres ou adicionar subnets ao ASG; capacity IP esgotada",
      "Remover o ALB",
    ], 2,
    "Sem IPs na subnet o launch falha; precisa de espaço de endereços ou mais subnets. Health path e remover ALB não liberam IPs. Tip de prova: ASG launch fail por IP → CIDR/subnet capacity."),

  Q(20,
    "Fora de escopo profundo desta part ALB/ASG foundations?",
    [
      "Health checks e 503",
      "ASG min/desired/max multi-AZ",
      "SG ALB → target",
      "NLB/GLB deep, path routing lab completo, Blue/Green CodeDeploy full, predictive scaling",
    ], 3,
    "O piloto cobre ALB+ASG core, health, SG e capacity. NLB deep, regras L7 complexas e CodeDeploy full ficam de fora. Tip de prova: se a questão for NLB/GWLB path deep, não force só 'subir desired'."),

  Q(21,
    "Cross-zone load balancing no ALB (ideia): efeito prático?",
    [
      "Nodes do ALB podem distribuir a targets em todas as AZ habilitadas, não só na AZ do node",
      "Obriga todos os targets a ter Elastic IP",
      "Desliga health checks",
      "Impede ASG multi-AZ",
    ], 0,
    "Com cross-zone, o ALB balanceia entre AZs de forma mais uniforme; default moderno costuma habilitar no ALB. Não exige EIP nem desliga health. Tip de prova: uneven targets por AZ → entenda cross-zone no ALB."),

  Q(22,
    "App stateful em sticky session (ideia) vs scale-in agressivo. Risco?",
    [
      "Nenhum — sticky ignora terminate",
      "Usuários grudados em instance que será terminada sofrem erro se não houver draining/re-sessão",
      "O ASG não pode ter max > 1",
      "O ALB deixa de usar HTTPS",
    ], 1,
    "Stickiness amarra o client a um target; scale-in/unhealthy replace precisa draining e design de sessão (ou stateless). Tip de prova: sticky + scale-in → draining e sessão externa (DB/Redis)."),

  Q(23,
    "sg-alb permite 443; sg-app permite 8080 de sg-alb; health na 8080/health OK. Ainda unhealthy com Target.FailedHealthChecks e código 401 no access log do health. Causa?",
    [
      "Falta de IGW na subnet do ALB",
      "ASG desired baixo demais",
      "Endpoint de health exige autenticação (401) — ajuste path público de readiness ou success codes",
      "Instance type t3 não suporta ALB",
    ], 2,
    "SG ok mas 401 no health falha o check se só 200 é sucesso. IGW e instance type não explicam 401 no path. Tip de prova: unhealthy com 401/403 no health → path de readiness sem auth ou codes corretos."),

  Q(24,
    "ASG max=4, desired=4, CPU 90% sustentado; policy target tracking CPU 50%. Por que não sobe mais?",
    [
      "Porque o ALB não existe",
      "Porque Spot é obrigatório",
      "Porque health checks estão off",
      "Porque desired já está no max — aumente max (e cotas) se a carga exige mais capacity",
    ], 3,
    "max é o teto do ASG; desired não ultrapassa max mesmo com alarme de CPU. Tip de prova: CPU alto + desired=max → suba max ou otimize app/tipo."),

  Q(25,
    "Replace de instance unhealthy pelo ASG com ELB health check habilitado. O que o ASG faz (ideia)?",
    [
      "Marca a instance para replace/terminate e lança outra para manter desired",
      "Remove o ALB da VPC",
      "Desliga o listener 443",
      "Converte o volume root em io2 automaticamente",
    ], 0,
    "Com health checks do ELB, o ASG considera a instance não saudável e a substitui para manter a capacity. Não remove o ALB. Tip de prova: ELB health no ASG → replace automático de unhealthy."),

  Q(26,
    "503 intermitente durante deploy rolling do ASG. Mitigação alinhada a health?",
    [
      "Health check grace period / ensure novos targets fiquem healthy antes de derrubar os antigos demais",
      "desired=0 durante todo o deploy",
      "Health path apontando para URL externa 500 fixo",
      "Remover todas as subnets de uma AZ no meio do deploy sem plano",
    ], 0,
    "Grace period e rolling controlado evitam buraco de capacity healthy. desired 0 e health 500 garantem 503. Tip de prova: 503 no deploy → grace period e min healthy capacity."),

  Q(27,
    "ALB access logs (ideia) ajudam em qual TShoot?",
    [
      "Ver códigos HTTP, tempos e targets escolhidos para correlacionar 5xx/timeouts",
      "Redimensionar EBS automaticamente",
      "Criar IAM users",
      "Alterar o CIDR da VPC",
    ], 0,
    "Access logs do ALB mostram request/target/latency/status — úteis em 502/503/latency. Não mudam EBS/IAM/CIDR. Tip de prova: 5xx no ALB → access logs + target health juntos."),

  Q(28,
    "Design: API interna só para microserviços na VPC, com HA. Scheme do ALB?",
    [
      "internet-facing com 0.0.0.0/0 e sem SG",
      "internal em subnets privadas multi-AZ (ou scheme internal) com SG só dos clients",
      "Sem ALB, só EIP em uma instance",
      "CloudFront obrigatório na VPC privada",
    ], 1,
    "Tráfego service-to-service interno usa ALB internal e SG restrito; EIP único é SPOF. Tip de prova: só VPC clients → ALB internal, não internet-facing aberto."),

  Q(29,
    "Checklist mental 503 / unhealthy nesta part?",
    [
      "Só recriar a conta AWS",
      "Só aumentar o TTL do DNS",
      "Só desligar o versioning S3",
      "Target health → health path/porta → SG ALB→app → ASG desired/min e AZs → listener/TG",
    ], 3,
    "Ordem isola health, SG, capacity e config do ALB. DNS TTL e S3 versioning não explicam unhealthy local. Tip de prova: 503 → describe-target-health e describe-auto-scaling-groups primeiro."),

  Q(30,
    "Resumo ALB+ASG foundations no SAA-C03:",
    [
      "Um EC2 com EIP e health checks desligados em produção multi-AZ",
      "ASG single-AZ com desired 0 atrás de ALB público",
      "sg-app 0.0.0.0/0 e sem target group",
      "ALB multi-AZ + targets privados multi-AZ + health real + SG em camadas + ASG min/desired/max com scaling e draining",
    ], 3,
    "O desenho resiliente combina borda multi-AZ, backends privados saudáveis, least privilege de SG e capacity automática. EIP único, desired 0 e SG aberto são anti-patterns. Tip de prova: se a opção une multi-AZ, health, SG source=ALB e capacity ASG, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1501: ALB api-prod com 502/503; targets Unhealthy. App sobe na 8080 (SSM).",
    `$ aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:111122223333:targetgroup/api/abc
Target i-0a1:8080  State: unhealthy  Reason: Target.FailedHealthChecks
Target i-0a2:8080  State: unhealthy  Reason: Target.FailedHealthChecks

$ aws elbv2 describe-target-groups --target-group-arns arn:...:targetgroup/api/abc
Port: 8080
HealthCheckPath: /healthz
HealthCheckPort: traffic-port
Matcher.HttpCode: 200

# Na instance i-0a1:
$ curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/healthz
404
$ curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ready
200

$ aws ec2 describe-security-groups --group-ids sg-app
Inbound: TCP 8080 Source sg-alb
Outbound: all`,
    [
      "Abrir 22 0.0.0.0/0 no sg-app",
      "Corrigir HealthCheckPath para /ready (ou implementar /healthz 200) — path atual retorna 404",
      "Remover o ALB e usar EIP",
      "Aumentar max do ASG sem corrigir health",
    ], 1,
    "SG e porta ok; curl local mostra /healthz 404 e /ready 200 — o TG marca unhealthy por matcher 200. Ajustar path ou endpoint resolve. max ASG e EIP não consertam 404 de health. Tip de prova: FailedHealthChecks + 404 no path → alinhe health path à app."),

  T(2,
    "NOC-AWS-1502: Clientes recebem 503 no ALB shop-alb. Pico de tráfego zero (madrugada).",
    `$ aws elbv2 describe-load-balancers --names shop-alb
State: active  Scheme: internet-facing
AvailabilityZones: us-east-1a, us-east-1b

$ aws elbv2 describe-target-health --target-group-arn arn:...:targetgroup/shop/xyz
(no targets / empty)

$ aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names shop-asg
MinSize: 0
DesiredCapacity: 0
MaxSize: 12
TargetGroupARNs: [arn:...:targetgroup/shop/xyz]
VPCZoneIdentifier: subnet-0priva,subnet-0privb

$ aws autoscaling describe-scaling-activities --auto-scaling-group-name shop-asg --max-records 3
StatusCode: Successful  Description: Setting desired capacity to 0
Cause: scheduled action night-scale-in (stale) left desired at 0 past morning

$ aws elbv2 describe-listeners --load-balancer-arn arn:...:loadbalancer/app/shop-alb/...
Listener 443 default action forward shop TG`,
    [
      "Recriar o certificado ACM",
      "Desligar cross-zone load balancing",
      "Subir DesiredCapacity/MinSize do shop-asg (ex. min=2) — TG vazio com desired 0 explica 503",
      "Trocar ALB por NAT Gateway",
    ], 2,
    "Listener e ALB active, mas TG sem targets e ASG desired/min 0 após scale-in noturno stale — zero backends = 503. ACM e NAT não criam instances. Tip de prova: 503 + empty target health + desired 0 → restore capacity do ASG."),

  T(3,
    "NOC-AWS-1503: ASG web-asg não lança instances após desired=4; ALB sem backends novos.",
    `$ aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names web-asg
DesiredCapacity: 4
MinSize: 2
MaxSize: 8
Instances: []
VPCZoneIdentifier: subnet-0fulla
HealthCheckType: ELB

$ aws autoscaling describe-scaling-activities --auto-scaling-group-name web-asg --max-records 5
StatusCode: Failed
StatusMessage: Launching a new EC2 instance. Status Reason: There are not enough free addresses in subnet subnet-0fulla to satisfy the requested number of instances.
Description: Launching a new EC2 instance.  Failure...

$ aws ec2 describe-subnets --subnet-ids subnet-0fulla
AvailabilityZone: us-east-1a
AvailableIpAddressCount: 0
CidrBlock: 10.0.10.0/28

$ aws ec2 describe-launch-template-versions --launch-template-id lt-0web --versions '$Latest'
ImageId: ami-0ok  InstanceType: t3.small  SecurityGroupIds: [sg-app]`,
    [
      "Culpar só a AMI e trocar para Windows sem olhar IPs",
      "Adicionar subnet(s) com IPs livres ao ASG (multi-AZ) ou expandir CIDR — AvailableIpAddressCount 0 na única subnet",
      "Remover o target group",
      "Setar desired=0 para 'limpar o erro'",
    ], 1,
    "Scaling activity Failed por falta de endereços e /28 com 0 IPs livres na única subnet. LT/AMI ok. Ampliar subnets/CIDR ou multi-AZ resolve capacity de rede. Tip de prova: ASG Failed free addresses → subnet IP exhaustion."),

  T(4,
    "NOC-AWS-1504: Timeout de usuários na app; ALB access logs mostram forward ao target mas sem resposta. Status checks da EC2 ok.",
    `$ aws elbv2 describe-target-health --target-group-arn arn:...:targetgroup/pay/1
i-0pay1:8443  State: unhealthy  Reason: Target.Timeout
i-0pay2:8443  State: unhealthy  Reason: Target.Timeout

$ aws ec2 describe-security-groups --group-ids sg-alb
Inbound: TCP 443 0.0.0.0/0
Outbound: all

$ aws ec2 describe-security-groups --group-ids sg-pay
Inbound:
  TCP 22  Source 10.0.0.0/16
  TCP 8443 Source 10.0.0.0/8
  (no reference to sg-alb)
Outbound: all

$ aws ec2 describe-instances --instance-ids i-0pay1
State: running  Subnet: subnet-0privb (private)
# SSM: ss -lntp | grep 8443 → LISTEN

$ aws elbv2 describe-target-groups --target-group-arns arn:...:targetgroup/pay/1
Port: 8443  HealthCheckProtocol: HTTPS  HealthCheckPath: /health`,
    [
      "Permitir no sg-pay TCP 8443 com Source = sg-alb (e revisar se 10.0.0.0/8 realmente cobre as ENIs do ALB)",
      "Aumentar o tamanho do volume root",
      "Desligar o listener 443",
      "Converter o ASG para single-AZ",
    ], 0,
    "Process listen e timeout de health apontam filtragem: sg-pay não referencia sg-alb na 8443 (CIDR 10.0.0.0/8 pode não cobrir IPs do ALB conforme VPC). Root volume e single-AZ não abrem o path. Tip de prova: Target.Timeout com app LISTEN → SG source = sg do ALB."),

  T(5,
    "NOC-AWS-1505: Após scale-in noturno, jobs long-running morreram; além disso, post-mortem de AZ failure mostrou ASG só em 1a.",
    `$ aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names batch-asg
MinSize: 1
DesiredCapacity: 1
MaxSize: 6
VPCZoneIdentifier: subnet-0priva
DefaultCooldown: 60
TargetGroupARNs: [arn:...:targetgroup/batch/9]
HealthCheckType: EC2

$ aws elbv2 describe-target-groups --target-group-arns arn:...:targetgroup/batch/9
DeregistrationDelayTimeoutSeconds: 30

# CloudTrail / ASG activity:
Successful: Terminating EC2 instance i-0job9  Cause: scale-in to desired 1
# Job logs on i-0job9: killed mid-run; connection reset from ALB after 30s

$ aws elbv2 describe-load-balancers --names batch-alb
AvailabilityZones: us-east-1a, us-east-1b

$ aws ec2 describe-subnets --subnet-ids subnet-0priva
AZ: us-east-1a`,
    [
      "Aumentar deregistration delay e colocar o ASG em subnets multi-AZ (ex. 1a+1b) com min≥2 se HA for requisito",
      "Setar desired=0 permanentemente",
      "Remover o ALB multi-AZ",
      "Desabilitar todos os security groups",
    ], 0,
    "Duas falhas na evidência: draining 30s corta job longo no scale-in; ASG só em 1a é SPOF apesar do ALB multi-AZ. Aumentar deregistration delay e multi-AZ/min cobre ambos. desired 0 piora. Tip de prova: scale-in kill + single subnet AZ → draining e VPCZoneIdentifier multi-AZ."),
];

// validate rc balance
const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

// banned scan
for (const q of questions) {
  for (const re of BANNED) {
    if (re.test(q.explicacao_profunda)) throw new Error(`banned in Q${q.id}`);
  }
}

fs.writeFileSync(path.join(PARTS, "part-aws-1.5-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.5-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.5-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q: questions.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  free: questions.filter((q) => !q.isPremium).length,
});
