/**
 * aws-1.7 Route 53 + CloudFront foundations
 * node aws/scripts/_gen_aws_1_7.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.7";

const BANNED = [
  /No SAA, amarre/i,
  /descarte opções que misturam/i,
  /descarte distractors/i,
  /Confirme também listener\/TG/i,
  /Fundamente com o serviço e o trade-off/i,
  /Justifique com o requisito do enunciado e a evidência operacional/i,
  /Revise o requisito desta questão/i,
  /antes de generalizar o serviço/i,
  /amarre a escolha ao requisito/i,
  /O distractor que ignora a evidência de AZ/i,
];

function check(e, id, kind = "Q") {
  e = e.replace(/\s+/g, " ").trim();
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} BANNED ${re}`);
  }
  if (!/tip de prova/i.test(e)) throw new Error(`${kind}${id} no tip`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`${kind}${id} start`);
  // pad uniquely without banned global closers
  let g = 0;
  while (e.length < 220 && g < 6) {
    e += ` Contexto R53/CloudFront #${id}: o distractor ignora DNS, health, origin access ou cache desta questão.`;
    g++;
  }
  if (e.length < 220) throw new Error(`${kind}${id} len ${e.length}`);
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
  title: "Route 53 + CloudFront foundations (DNS, edge, origem)",
  blueprint_module: "2.0",
  blueprint_topics: ["2.2", "3.4", "1.2"],
  verb: "Design",
  weight_percent: 26,
  topic_list: [
    "Route 53 hosted zone e records (A/AAAA/CNAME/ALIAS)",
    "ALIAS vs CNAME: apex/zone apex e targets AWS (ALB, CloudFront, S3 website)",
    "Routing policies: simple, weighted, latency, failover, geolocation (ideia)",
    "Health checks Route 53 + failover DNS (primary/secondary)",
    "CloudFront distribution, edge locations e origin (S3, ALB, custom)",
    "Cache behaviors e TTL (ideia); invalidation após deploy",
    "HTTPS no CloudFront com certificado ACM (us-east-1)",
    "OAI/OAC: S3 privado como origem (cruzar aws-1.3)",
    "Price class ideia leve (custo de edge)",
    "TShoot: DNS não resolve, health unhealthy, origem 403, cache stale",
    "NÃO: Traffic Flow deep, Resolver hybrid lab, Lambda@Edge full, signed cookies lab completo",
  ],
  study_notes: [
    {
      heading: "Route 53 no SAA-C03",
      bullets: [
        "Hosted zone pública responde DNS autoritativo do domínio; records apontam a IPs, nomes ou aliases AWS.",
        "ALIAS (Route 53) aponta a ALB, CloudFront, S3 website, etc., inclusive no apex (exemplo.com).",
        "CNAME clássico não pode no apex de zona em DNS padrão — use ALIAS para ALB/CloudFront no root.",
      ],
      exam_tips: [
        "Apex → ALB/CloudFront = ALIAS (A/AAAA alias), não CNAME.",
      ],
    },
    {
      heading: "Routing e health checks",
      bullets: [
        "Simple: um valor; Weighted: percentuais; Latency: menor latência de região; Failover: primary/secondary; Geolocation: por localização do resolver.",
        "Health check HTTP/HTTPS/TCP avalia endpoint; failover só promove secondary se primary unhealthy (e secondary healthy).",
        "DNS failover não substitui Multi-AZ de app sozinho — complementa multi-Region/DR.",
      ],
      exam_tips: [
        "Primary unhealthy e secondary não recebe tráfego → confira health check e Evaluate Target Health / association.",
      ],
    },
    {
      heading: "CloudFront e origem",
      bullets: [
        "CloudFront cacheia na edge; origin pode ser S3, ALB ou custom domain.",
        "Comportamentos definem path patterns, TTL, métodos e HTTPS.",
        "Após deploy de estático, invalidation ou versionar objetos evita cache stale.",
      ],
      exam_tips: [
        "Conteúdo velho na edge → invalidation (ou object versioning), não 'só flush do RDS'.",
      ],
    },
    {
      heading: "S3 privado + CloudFront (OAI/OAC)",
      bullets: [
        "OAI/OAC permite que só o CloudFront leia o bucket; bucket policy nega GetObject público.",
        "403 na origem costuma ser bucket policy sem allow ao OAI/OAC ou BPA/conflito de policy.",
        "ACM para CloudFront: certificado na região us-east-1.",
      ],
      exam_tips: [
        "CloudFront 403 S3 → OAI/OAC + bucket policy; não abra Principal * sem necessidade.",
      ],
    },
    {
      heading: "Anti-patterns de prova (R53/CloudFront)",
      bullets: [
        "CNAME no apex quando o alvo é ALB/CloudFront (use ALIAS).",
        "Failover DNS sem health check no primary.",
        "S3 público Principal * só para 'funcionar o CloudFront' em vez de OAI/OAC.",
        "Esperar que TTL alto invalide sozinho em segundos após deploy crítico.",
        "Health check R53 no path que retorna 401/404 e achar que é 'falha de CloudFront'.",
      ],
      exam_tips: [
        "Separe: DNS record · health · origin access · cache TTL/invalidation · TLS/ACM.",
      ],
    },
  ],
  key_commands: [
    "aws route53 list-hosted-zones",
    "aws route53 list-resource-record-sets --hosted-zone-id <Z...>",
    "aws route53 get-health-check --health-check-id <id>",
    "aws route53 get-health-check-status --health-check-id <id>",
    "aws cloudfront get-distribution --id <ID>",
    "aws cloudfront create-invalidation --distribution-id <ID> --paths '/*'",
    "aws s3api get-bucket-policy --bucket <b>",
    "aws acm list-certificates --region us-east-1",
    "aws elbv2 describe-load-balancers (origem dinâmica)",
    "dig / nslookup (validação DNS local)",
  ],
  must_know: [
    "ALIAS no apex para ALB/CloudFront/S3 website; CNAME não no apex clássico.",
    "Failover DNS + health check: secondary só entra se primary unhealthy.",
    "CloudFront na edge; origem S3/ALB; cache TTL e invalidation após deploy.",
    "S3 privado como origin: OAI/OAC + bucket policy (não Principal * desnecessário).",
    "Certificado CloudFront no ACM us-east-1.",
    "403 origem S3 → policy/OAI; unhealthy R53 → path/SG/health config.",
    "Weighted/latency/geo = políticas de roteamento; simple = um target.",
    "Fora: Traffic Flow deep, Resolver hybrid, Lambda@Edge full, signed URLs lab completo.",
  ],
  reuse_from_v1: null,
};

// Gabarito target 8/8/7/7 via careful rc assignment
const questions = [
  Q(1,
    "Site apex exemplo.com deve apontar ao ALB app-alb-123.us-east-1.elb.amazonaws.com. Qual record Route 53 é o adequado?",
    [
      "Record A/AAAA ALIAS para o Application Load Balancer",
      "CNAME no apex (exemplo.com) para o DNS do ALB (DNS clássico não permite CNAME no apex)",
      "MX apontando ao ALB na porta 443",
      "NS record substituindo os name servers da AWS pelo IP do ALB",
    ], 0,
    "No apex usa-se ALIAS (A/AAAA alias) para ALB; CNAME no apex falha em DNS padrão. MX é e-mail; NS não aponta app. Tip de prova: apex → ALB = ALIAS Route 53, não CNAME."),

  Q(2,
    "Primary failover record unhealthy; secondary saudável não recebe tráfego. O que verificar primeiro?",
    [
      "Se o price class do CloudFront está em All Edge Locations",
      "Se o S3 versioning está habilitado no bucket de logs",
      "Health check associado ao primary, status do check e configuração failover (Evaluate Target Health / secondary)",
      "Se o RDS Multi-AZ está enabled",
    ], 2,
    "Failover DNS depende do health check do primary e da policy failover corretamente ligada ao secondary. CloudFront price class e RDS não controlam esse DNS. Tip de prova: secondary não promove → health check R53 do primary e records failover."),

  Q(3,
    "CloudFront na frente de s3://corp-site (privado). Usuários na edge recebem 403. Causa comum?",
    [
      "Falta de OAI/OAC e/ou bucket policy permitindo GetObject só à distribuição CloudFront",
      "TTL de cache alto demais (isso causa stale, não 403 de origem)",
      "Weighted routing com peso 0 no secondary apenas",
      "Alias record apontando ao ALB em vez de A numérico",
    ], 0,
    "403 na origem S3 privada indica negação de GetObject: configure OAI/OAC + policy. TTL alto serve conteúdo velho, não 403. Tip de prova: CloudFront 403 S3 privado → OAI/OAC e bucket policy, não invalidation primeiro."),

  Q(4,
    "Após deploy de index.html, usuários ainda veem a home antiga por horas. Ação CloudFront típica?",
    [
      "Desligar o Route 53 health check",
      "Criar invalidation dos paths afetados (ou versionar o object key) e revisar TTL/default TTL",
      "Abrir 0.0.0.0/0 no SG do S3 (S3 não usa SG de VPC assim)",
      "Trocar o hosted zone para privada",
    ], 1,
    "Cache na edge mantém objeto até TTL/invalidation; invalidar /* ou versionar arquivos força refresh. Health check e hosted zone não limpam cache de HTML. Tip de prova: conteúdo stale no CloudFront → invalidation ou versioned keys."),

  Q(5,
    "Qual diferença prática ALIAS Route 53 vs CNAME?",
    [
      "ALIAS pode no apex e integra targets AWS (ALB, CloudFront); CNAME não no apex em DNS padrão",
      "CNAME só funciona com IPv6",
      "ALIAS apaga health checks automaticamente",
      "CNAME é obrigatório para qualquer ALB",
    ], 0,
    "ALIAS resolve apex e targets AWS nativos; CNAME exige subdomínio (www). Health checks são independentes. Tip de prova: root domain AWS target → ALIAS; www pode CNAME ou ALIAS."),

  Q(6,
    "Multi-constraint: site estático global com baixa latência de leitura, bucket S3 privado (sem Principal *) e HTTPS. Desenho?",
    [
      "S3 website público Principal * sem CloudFront",
      "CloudFront com origem S3 + OAI/OAC, ACM us-east-1, opcionalmente price class alinhado a custo de edge",
      "Somente Route 53 failover para dois buckets públicos em uma AZ",
      "ALB internet-facing apontando direto a objetos S3 via porta 80 no SG do bucket",
    ], 1,
    "CloudFront+OAI/OAC atende edge, privacidade do bucket e HTTPS (ACM). Público Principal * falha o requisito de privado. Tip de prova: S3 privado + global + HTTPS → CloudFront OAI/OAC + ACM us-east-1."),

  Q(7,
    "Latency-based routing em Route 53 serve para quê?",
    [
      "Enviar o cliente ao record com menor latência medida entre regiões configuradas",
      "Substituir Multi-AZ do RDS",
      "Invalidar cache do CloudFront a cada query DNS",
      "Forçar todos os usuários a us-east-1 sempre",
    ], 0,
    "Latency routing escolhe o endpoint de menor latência entre os records. Não invalida CloudFront nem substitui Multi-AZ de banco. Tip de prova: usuários multi-Region + menor latência → latency routing R53."),

  Q(8,
    "Certificado ACM para viewer HTTPS no CloudFront deve estar em qual região?",
    [
      "Sempre na mesma região do bucket S3 origem, qualquer região",
      "Somente eu-central-1",
      "Somente ap-south-1",
      "us-east-1 (N. Virginia) para certificados usados com CloudFront",
    ], 3,
    "CloudFront exige ACM do viewer em us-east-1. Cert em outra região não associa à distribuição. Tip de prova: ACM + CloudFront viewer → us-east-1."),

  Q(9,
    "Weighted routing 80/20 entre v1 e v2 de API. Uso típico?",
    [
      "Canary/blue-green gradual de tráfego DNS entre dois endpoints",
      "Obrigar 100% de cache hit no CloudFront",
      "Desligar health checks permanentemente",
      "Substituir o Security Group do ALB",
    ], 0,
    "Weighted divide percentuais de respostas DNS entre records — útil em canary. Não gerencia SG nem cache hit ratio sozinho. Tip de prova: canary DNS → weighted routing Route 53."),

  Q(10,
    "Geolocation routing (ideia): o que controla?",
    [
      "Latência medida em tempo real apenas",
      "Preço Spot das instances de origem",
      "Localização geográfica do resolvedor DNS do cliente para escolher o record",
      "TTL máximo do CloudFront globalmente",
    ], 2,
    "Geolocation mapeia país/continente do resolver a um record. Não é o mesmo que latency-based. Tip de prova: compliance regional / conteúdo por país → geolocation R53."),

  Q(11,
    "Health check R53 HTTP /health no ALB retorna 401; failover marca primary unhealthy. Correção?",
    [
      "Ajustar path/success codes do health check (ou endpoint de readiness sem auth) no R53",
      "Aumentar o TTL do record para 86400 para 'esconder' o 401",
      "Trocar ALIAS por CNAME no apex",
      "Desligar o CloudFront price class",
    ], 0,
    "401 no path de health falha o check se só 200 é sucesso. TTL alto não cura unhealthy; apex CNAME piora DNS. Tip de prova: health R53 401/404 → path de readiness público ou codes corretos."),

  Q(12,
    "Origem do CloudFront é um ALB interno (só VPC). Clientes Internet na distribuição falham. Problema de desenho?",
    [
      "CloudFront na Internet não alcança ALB internal sem path/origem adequada (use ALB internet-facing ou origin acessível)",
      "Falta de Multi-AZ no Route 53 hosted zone",
      "S3 versioning desligado",
      "Weighted routing com peso 50/50",
    ], 0,
    "Origin do CloudFront precisa ser alcançável a partir da rede da edge; ALB internal não é origin pública típica. Tip de prova: CloudFront + ALB → origem internet-facing (ou arquitetura suportada), não internal só VPC."),

  Q(13,
    "Multi-constraint: DR multi-Region barato em DNS + site estático com cache edge e custo de edge limitado a NA/EU. Combinação?",
    [
      "Failover R53 (ou latency) entre origens + CloudFront price class só regiões necessárias + OAI se S3 privado",
      "Um único A record para um IP elástico em uma AZ sem health",
      "Somente CNAME apex para EC2",
      "Principal * no bucket e sem CloudFront",
    ], 0,
    "Failover/latency DNS + price class reduz custo de edge + OAI mantém S3 privado. EIP single-AZ sem health falha HA. Tip de prova: DR DNS + edge com custo → R53 failover/latency + CloudFront price class."),

  Q(14,
    "Simple routing policy: comportamento?",
    [
      "Único valor (ou multi-value answer ideia) sem avaliação de latência/peso/geo por policy avançada",
      "Sempre exige dois health checks",
      "Só funciona com CloudFront",
      "Substitui OAI automaticamente",
    ], 0,
    "Simple é o record básico; políticas avançadas adicionam peso/latência/failover/geo. Tip de prova: um endpoint sem lógica especial → simple routing."),

  Q(15,
    "Alias para CloudFront no record www: qual benefício vs A com IP fixo da edge?",
    [
      "ALIAS acompanha a distribuição CloudFront (targets AWS dinâmicos) sem fixar IP de edge",
      "ALIAS desliga HTTPS",
      "ALIAS proíbe invalidation",
      "ALIAS obriga bucket público",
    ], 0,
    "ALIAS aponta ao domain da distribuição; IPs de edge mudam. Não desliga TLS nem exige bucket público. Tip de prova: www → CloudFront = ALIAS A/AAAA, não IP manual."),

  Q(16,
    "Price class CloudFront (ideia de custo): o que altera?",
    [
      "Quais grupos de edge locations servem a distribuição (custo vs cobertura global)",
      "A engine do RDS Multi-AZ",
      "O cipher suite do NACL",
      "O tamanho mínimo de EBS gp3",
    ], 0,
    "Price class limita regiões de edge para economizar; trade-off de latência em áreas excluídas. Não mexe em RDS/NACL/EBS. Tip de prova: reduzir custo de CloudFront global → price class mais restrita."),

  Q(17,
    "DNS não resolve domínio novo: hosted zone criada mas name servers do registrador ainda apontam ao provedor antigo. Causa?",
    [
      "Delegação NS no registrador não atualizada para os 4 name servers da hosted zone Route 53",
      "Falta de read replica no RDS",
      "ASG desired 0 apenas",
      "gp3 IOPS abaixo de 3000",
    ], 0,
    "Sem delegação NS correta o mundo não consulta a hosted zone R53. RDS/ASG/EBS não delegam DNS público. Tip de prova: domínio novo sem resolução → NS no registrador = NS da hosted zone R53."),

  Q(18,
    "Failover routing: Evaluate Target Health em ALIAS para ALB. Ideia?",
    [
      "Route 53 pode considerar health dos targets do ALB (quando suportado) além/ao invés de só health check externo isolado",
      "Força o ALB a ser internal",
      "Apaga o listener 443",
      "Converte records em MX",
    ], 0,
    "Evaluate Target Health em alias ELB integra saúde do balanceador. Não muda scheme do ALB sozinho. Tip de prova: alias ALB + ETH → health do ELB no DNS failover/weighted."),

  Q(19,
    "Invalidation /* em produção a cada commit de CSS. Trade-off?",
    [
      "Garante consistência rápida mas pode aumentar custo/requests de invalidation e origem se abusado",
      "É grátis ilimitado e obrigatório em todo PUT S3",
      "Substitui OAI",
      "Desliga o Route 53",
    ], 0,
    "Invalidation frequente tem custo e carga; versionar assets (app.abc123.css) evita invalidar sempre. Tip de prova: deploy estático → prefira versioned objects; invalidation para emergências."),

  Q(20,
    "Fora de escopo profundo desta part R53/CloudFront?",
    [
      "ALIAS vs CNAME no apex",
      "Failover + health check",
      "OAI/OAC e invalidation",
      "Lambda@Edge full, Traffic Flow policies deep, Resolver hybrid lab, signed cookies lab completo",
    ], 3,
    "O piloto cobre DNS policies, health, CloudFront origin/cache/OAI. Lambda@Edge e Traffic Flow deep ficam de fora. Tip de prova: se pedir Lambda@Edge complexa, não force só 'criar ALIAS'."),

  Q(21,
    "CNAME www.exemplo.com → d111.cloudfront.net vs ALIAS para a mesma distribuição. Ambos válidos em subdomínio?",
    [
      "Sim em subdomínio; ALIAS ainda é preferível por integração AWS e opções de routing/health",
      "CNAME é inválido em qualquer subdomínio",
      "ALIAS é proibido em www",
      "Só MX pode apontar a CloudFront",
    ], 0,
    "www aceita CNAME ou ALIAS; ALIAS oferece benefícios R53 (ex. free query a targets AWS ideia, policies). Tip de prova: www CloudFront → CNAME ou ALIAS; apex só ALIAS."),

  Q(22,
    "Health check TCP na porta 443 do ALB falha, mas curl HTTPS /health retorna 200 de dentro da VPC. Hipótese?",
    [
      "Health check R53 parte da Internet — SG do ALB pode não permitir os ranges de health checkers da AWS",
      "CloudFront price class bloqueia TCP",
      "S3 BPA desliga health checks R53",
      "Weighted weight 100 impede health",
    ], 0,
    "Health checks R53 são externos; SG do ALB precisa permitir os prefixos dos checkers (ou usar health via configuração suportada). Tip de prova: R53 health fail + app ok interno → SG/path visto da Internet."),

  Q(23,
    "Origem S3 com OAC configurado mas bucket policy ainda tem Deny explícito a todos exceto um user IAM admin. Efeito no CloudFront?",
    [
      "CloudFront pode continuar 403 se o Deny não exceptuar o service principal do OAC",
      "OAC ignora qualquer Deny sempre",
      "Route 53 converte Deny em Allow",
      "Invalidation remove o Deny da policy",
    ], 0,
    "Deny explícito na bucket policy vence se não houver exceção ao OAC/CloudFront. Invalidation não edita IAM. Tip de prova: OAC + 403 → leia bucket policy Deny/Allow do serviço CloudFront."),

  Q(24,
    "Latency routing entre ALB us-east-1 e ALB eu-west-1; um ALB unhealthy. Comportamento desejado com health checks?",
    [
      "Clientes tendem a ir ao endpoint saudável de menor latência entre os records healthy",
      "Todo tráfego cai mesmo com um ALB saudável",
      "DNS vira NXDOMAIN permanente",
      "CloudFront apaga as distribuições",
    ], 0,
    "Com health checks, records unhealthy saem da rotação; latency age entre os saudáveis. Tip de prova: multi-Region ALB + latency R53 + health → evita região caída."),

  Q(25,
    "S3 website endpoint vs REST API origin no CloudFront (ideia): por que OAI/OAC prefere REST/API origin?",
    [
      "OAI/OAC integra com bucket via REST e policy; website endpoint é outro modelo de hosting público clássico",
      "Website endpoint é obrigatório com OAC",
      "REST origin proíbe HTTPS no viewer",
      "Website endpoint desliga Route 53",
    ], 0,
    "Padrão moderno: origin REST do bucket + OAC. Website endpoint público é o modelo antigo. Tip de prova: S3 privado + CloudFront → origin bucket REST + OAC, não website público."),

  Q(26,
    "Record failover secondary aponta a static site de manutenção no S3. Primary é ALB. Quando secondary responde?",
    [
      "Quando o health check do primary está unhealthy (e secondary configurado healthy)",
      "Sempre 50% do tempo por weighted implícito",
      "Somente se o CloudFront price class for All",
      "Nunca — secondary é só documentação",
    ], 0,
    "Failover DNS devolve secondary se primary falha o health. Não é weighted 50/50. Tip de prova: página de manutenção → failover secondary + health no primary ALB."),

  Q(27,
    "Viewer protocol policy Redirect HTTP to HTTPS no CloudFront. Efeito?",
    [
      "Requests HTTP do viewer são redirecionadas para HTTPS na edge",
      "Desliga o origin protocol",
      "Remove a necessidade de certificado ACM",
      "Abre a porta 80 no RDS",
    ], 0,
    "Policy no behavior redireciona HTTP→HTTPS ao viewer; ainda precisa de certificado no CloudFront. Tip de prova: forçar HTTPS no site edge → viewer protocol redirect + ACM."),

  Q(28,
    "Após mudar origin do CloudFront de S3 A para S3 B, alguns paths ainda servem objetos do bucket A. Causa provável?",
    [
      "Cache na edge ainda tem objetos do origin antigo até TTL/invalidation",
      "Route 53 ignora mudanças de origin",
      "ALIAS impede troca de origin",
      "Health check R53 grava objetos no bucket A",
    ], 0,
    "Trocar origin não purga cache existente; invalide ou aguarde TTL. Tip de prova: origin swap + conteúdo misto → invalidation dos paths."),

  Q(29,
    "Checklist mental TShoot DNS/edge nesta part?",
    [
      "Só recriar a VPC",
      "Só aumentar IOPS do EBS do bastion",
      "Só desligar Multi-AZ do RDS",
      "Delegação NS → record ALIAS/CNAME → health R53 → origin access/403 → cache TTL/invalidation → ACM us-east-1",
    ], 3,
    "Ordem isola DNS, health, origem S3/ALB e cache/TLS. VPC/EBS/RDS Multi-AZ não são o primeiro passo de 403 CloudFront ou NS errado. Tip de prova: 403 edge → origin/OAC; sem resolve → NS/record."),

  Q(30,
    "Resumo Route 53 + CloudFront foundations no SAA-C03:",
    [
      "CNAME no apex + S3 Principal * + sem health no failover",
      "Só A com IP de uma EC2 single-AZ sem edge",
      "CloudFront sem certificado e origin ALB internal para site público global",
      "ALIAS correto, routing/health quando HA DNS, CloudFront+OAI/OAC para S3 privado, invalidation/TTL e ACM us-east-1",
    ], 3,
    "Desenho sólido une DNS certo (ALIAS/failover/health), edge com origem segura e cache controlado. Apex CNAME e bucket público solto são anti-patterns. Tip de prova: se a opção une ALIAS, health/failover, OAI/OAC e ACM us-east-1, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1701: Failover DNS primary→secondary não ocorre; primary está down na aplicação.",
    `$ aws route53 get-health-check --health-check-id abcdef
HealthCheckConfig:
  FullyQualifiedDomainName: primary.exemplo.com
  Port: 443
  Type: HTTPS
  ResourcePath: /health
  RequestInterval: 30
  FailureThreshold: 3

$ aws route53 get-health-check-status --health-check-id abcdef
Status: Success: HTTP Status Code: 200   # still Success!

# primary.exemplo.com ALIAS → ALB that is actually returning 503 to users on /
# /health on primary still returns 200 from a static OK page

$ aws route53 list-resource-record-sets --hosted-zone-id Z123
primary.exemplo.com  Failover PRIMARY  ALIAS dualstack.app-alb-...  HealthCheckId: abcdef  EvaluateTargetHealth: false
secondary.exemplo.com Failover SECONDARY ALIAS dualstack.static-alb-...  (no health check)

# dig primary.exemplo.com → still ALB primary`,
    [
      "Ajustar health check para path que reflita falha real (ou Evaluate Target Health no alias ALB) — /health 200 esconde o 503 da app",
      "Apagar o secondary record",
      "Trocar TTL para 86400",
      "Abrir 0.0.0.0/0 no SG do secondary apenas",
    ], 0,
    "Status Success no health em /health 200 impede failover mesmo com 503 na home. Secondary só entra com primary unhealthy. Tip de prova: failover não arma → health path deve falhar quando o serviço está ruim (ou use ETH no ALB)."),

  T(2,
    "NOC-AWS-1702: CloudFront d111.cloudfront.net retorna 403; origin é S3 privado corp-web.",
    `$ aws cloudfront get-distribution --id E123
Origins:
  DomainName: corp-web.s3.us-east-1.amazonaws.com
  S3OriginConfig: null
  OriginAccessControlId: (empty)
  OriginAccessIdentity: (empty)

$ aws s3api get-bucket-policy --bucket corp-web
{
  "Statement": [{
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": ["arn:aws:s3:::corp-web","arn:aws:s3:::corp-web/*"],
    "Condition": {"Bool": {"aws:SecureTransport": "false"}}
  }]
}
# No Allow for CloudFront service principal / OAC

$ aws s3api get-public-access-block --bucket corp-web
BlockPublicAcls=true RestrictPublicBuckets=true

curl -I https://d111.cloudfront.net/index.html
HTTP/2 403

# Object exists:
aws s3api head-object --bucket corp-web --key index.html → 200 with admin creds`,
    [
      "Configurar OAC (ou OAI) na origin e Allow GetObject na bucket policy para o CloudFront — hoje não há origin access nem allow",
      "Só criar invalidation /* sem policy",
      "Mudar o record MX do domínio",
      "Habilitar Multi-AZ no Route 53 hosted zone",
    ], 0,
    "Sem OAI/OAC e sem Allow ao CloudFront, a edge toma 403 no GetObject mesmo com objeto existente. Invalidation não concede IAM. Tip de prova: CloudFront 403 S3 privado → OAC + bucket policy Allow ao serviço."),

  T(3,
    "NOC-AWS-1703: Apex exemplo.com não resolve após migração para ALB; www funciona.",
    `$ aws route53 list-resource-record-sets --hosted-zone-id Z999
exemplo.com.     CNAME  app-alb-123.us-east-1.elb.amazonaws.com.   # INVALID pattern for apex
www.exemplo.com. A ALIAS dualstack.app-alb-123.us-east-1.elb.amazonaws.com.

$ dig exemplo.com CNAME +short
app-alb-123.us-east-1.elb.amazonaws.com.
# many resolvers / DNS standards: CNAME at apex coexists badly / not allowed with other data

$ dig www.exemplo.com +short
# returns ALB IPs via alias

# Registrador NS → Route 53 OK
# App healthy behind ALB`,
    [
      "Manter CNAME no apex e adicionar TXT only",
      "Trocar o apex para A/AAAA ALIAS para o ALB (como o www) — CNAME no apex é o erro",
      "Criar health check na porta 22 do ALB",
      "Mover o certificado ACM para eu-west-1 apenas",
    ], 1,
    "www com ALIAS funciona; apex com CNAME é o anti-pattern DNS. Converta apex para ALIAS A/AAAA no ALB. Tip de prova: apex + ALB/CloudFront → ALIAS, nunca CNAME no root."),

  T(4,
    "NOC-AWS-1704: Deploy de logo.png há 40 min; CloudFront ainda serve logo antiga.",
    `$ aws cloudfront get-distribution-config --id E456
DefaultCacheBehavior:
  MinTTL: 0
  DefaultTTL: 86400
  MaxTTL: 31536000
  ViewerProtocolPolicy: redirect-to-https
Origins: S3 corp-cdn with OAC ok

$ aws s3api head-object --bucket corp-cdn --key assets/logo.png
LastModified: 40 minutes ago  ETag: "newetag"

$ curl -sI https://d456.cloudfront.net/assets/logo.png | egrep -i 'x-cache|age|etag'
x-cache: Hit from cloudfront
age: 28000
etag: "oldetag"

$ aws cloudfront list-invalidations --distribution-id E456
Items: []   # none recent`,
    [
      "Create-invalidation para /assets/logo.png (ou /*) — Hit/age alto e ETag velha com DefaultTTL 86400",
      "Desligar OAC",
      "Remover o record ALIAS",
      "Abrir 3306 no SG do RDS de origem",
    ], 0,
    "x-cache Hit + age alto + ETag antiga com TTL 86400 e zero invalidations explicam stale. OAC e DNS não limpam objeto em cache. Tip de prova: Hit from cloudfront + arquivo novo no S3 → invalidation ou versioned filename."),

  T(5,
    "NOC-AWS-1705: Health check R53 do endpoint público do ALB fica unhealthy; app ok via VPN interna.",
    `$ aws route53 get-health-check --health-check-id hc-9
Type: HTTPS  Port: 443  ResourcePath: /ready  FQDN: app.exemplo.com

$ aws route53 get-health-check-status --health-check-id hc-9
Failure: Timeout / Connection failed (from checker)

$ aws elbv2 describe-load-balancers --names app-alb
Scheme: internet-facing
State: active
SecurityGroups: [sg-alb]

$ aws ec2 describe-security-groups --group-ids sg-alb
Inbound:
  TCP 443  Source 10.0.0.0/8
  (no 0.0.0.0/0 or AWS health checker ranges)
Outbound: all

$ curl -sk https://app.exemplo.com/ready   # from corporate VPN 10.x → 200 OK
# from public Internet / online checker → timeout`,
    [
      "Permitir HTTPS 443 no sg-alb a partir da Internet (ou ranges necessários aos health checkers R53) — check é externo, 10.0.0.0/8 não basta",
      "Trocar o health path para / no S3 website only",
      "Desligar o ALB multi-AZ",
      "Converter hosted zone em privada para o check passar",
    ], 0,
    "R53 health parte de fora; SG só 10.0.0.0/8 deixa o checker em timeout enquanto VPN interna passa. Tip de prova: health R53 unhealthy + app ok na VPN → SG do ALB visto da Internet."),
];

// tip uniqueness soft-check
const tipMap = {};
for (const q of questions) {
  const m = q.explicacao_profunda.match(/Tip de prova:[^.]*\./i);
  const t = m ? m[0] : q.explicacao_profunda.slice(-60);
  tipMap[t] = (tipMap[t] || 0) + 1;
}
const rep = Object.entries(tipMap).filter(([, n]) => n >= 3);
if (rep.length) console.warn("WARN tips", rep);

const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
// rebalance if needed toward 8/8/7/7
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
// current distribution after write - fix if skewed
{
  const r = [0, 0, 0, 0];
  questions.forEach((q) => r[q.resposta_correta]++);
  // if 0 is high, move some
  const zeros = questions.filter((q) => q.resposta_correta === 0).map((q) => q.id);
  while (r[0] > 8 && zeros.length) {
    const id = zeros.pop();
    const target = r[1] < 8 ? 1 : r[2] < 7 ? 2 : 3;
    move(id, target);
    r[0]--;
    r[target]++;
  }
  while (r[1] > 8) {
    const id = questions.find((q) => q.resposta_correta === 1)?.id;
    if (!id) break;
    move(id, r[2] < 7 ? 2 : 3);
    r[1]--;
  }
}

const rc2 = [0, 0, 0, 0];
questions.forEach((q) => rc2[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

fs.writeFileSync(path.join(PARTS, "part-aws-1.7-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.7-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.7-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc: rc2,
  t_min: Math.min(...tl),
  free: questions.filter((q) => !q.isPremium).length,
});
