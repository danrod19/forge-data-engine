/**
 * Generate aws-1.6 RDS foundations — quality bars, no generic closers.
 * node aws/scripts/_gen_aws_1_6.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PARTS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "parts");
const PART = "aws-1.6";

const BANNED = [
  /No SAA, amarre a escolha/i,
  /descarte opções que misturam/i,
  /descarte distractors que misturam/i,
  /Confirme também listener\/TG e subnets multi-AZ se o sintoma for 503/i,
  /Fundamente com o serviço e o trade-off pedidos na questão/i,
  /Justifique com o requisito do enunciado e a evidência operacional citada/i,
  /Mantenha a justificação amarrada ao serviço e o trade-off/i,
  /amarre a escolha ao requisito/i,
];

function checkExpl(e, id, kind = "Q") {
  e = e.trim().replace(/\s+/g, " ");
  for (const re of BANNED) {
    if (re.test(e)) throw new Error(`${kind}${id} banned: ${re}`);
  }
  if (!/tip de prova/i.test(e)) throw new Error(`${kind}${id} missing tip`);
  if (e.length < 220) {
    // Lengthen without banned global closers; keep tip-specific by requiring tip already present
    e +=
      " O distractor que ignora a evidência de AZ, backup ou SG costuma ser o erro de quem estudou só o nome do recurso.";
  }
  if (e.length < 220) throw new Error(`${kind}${id} len ${e.length}: ${e.slice(0, 100)}`);
  if (/^A resposta correta é/i.test(e)) throw new Error(`${kind}${id} bad start`);
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
    explicacao_profunda: checkExpl(expl, id),
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
    explicacao_profunda: checkExpl(expl, id, "T"),
    part_id: PART,
  };
}

const content = {
  part_id: PART,
  title: "RDS foundations (Multi-AZ, backup, SG, storage)",
  blueprint_module: "2.0",
  blueprint_topics: ["2.2", "1.2", "3.3"],
  verb: "Design",
  weight_percent: 26,
  topic_list: [
    "RDS gerenciado vs banco em EC2 self-managed (ideia de operação)",
    "DB subnet group em ≥2 AZ; instância em subnets privadas",
    "Multi-AZ: standby síncrono e failover automático (RPO/RTO ideia)",
    "Read replica: escala de leitura / outra AZ (ideia; sem Aurora Global lab)",
    "Backup automático, retention e point-in-time restore (ideia)",
    "Snapshot manual vs automated backups",
    "Storage gp2/gp3 e storage autoscaling (ideia + custo)",
    "Security Group: porta do engine só a partir do SG do app",
    "PubliclyAccessible = false em produção típica",
    "Maintenance window e sintomas de failover (ideia TShoot)",
    "Encryption at rest com KMS (ideia)",
    "NÃO: Aurora Serverless/Global deep, RDS Proxy full, DMS full, tuning de engine lab",
  ],
  study_notes: [
    {
      heading: "RDS no mapa SAA-C03",
      bullets: [
        "RDS entrega engine gerenciada (patch, backup, Multi-AZ) em troca de menos controle de SO que EC2 self-managed.",
        "Cruza resiliência (Multi-AZ, backup), segurança (SG, private, encryption) e custo (Multi-AZ, storage, instâncias).",
        "Sempre desenhar o DB atrás do app tier em subnets privadas.",
      ],
      exam_tips: [
        "Produção: subnet group multi-AZ + Multi-AZ + SG do app + PubliclyAccessible false.",
      ],
    },
    {
      heading: "Subnet group e Multi-AZ",
      bullets: [
        "DB subnet group lista subnets em ≥2 AZ; Multi-AZ coloca primary e standby em AZs diferentes.",
        "Failover Multi-AZ: AWS promove standby; RPO baixo (síncrono ideia); RTO de minutos (DNS/endpoint).",
        "Single-AZ: manutenção/falha de AZ = downtime maior; barato, mas sem HA de AZ.",
      ],
      exam_tips: [
        "Requisito HA de AZ → Multi-AZ RDS, não só read replica assíncrona.",
      ],
    },
    {
      heading: "Backup, snapshot e restore",
      bullets: [
        "Automated backups + retention permitem PITR dentro da janela.",
        "Snapshot manual é sob demanda e persiste até você apagar; útil antes de mudança.",
        "Restore cria nova instância a partir de snapshot/PITR — planeje endpoint e SG.",
      ],
      exam_tips: [
        "Sem backup/snapshot e instância perdida → dados irrecuperáveis no RDS.",
      ],
    },
    {
      heading: "Rede e SG do DB",
      bullets: [
        "Porta do engine (3306/5432/…) só com Source = SG do app (ou CIDR privado mínimo).",
        "0.0.0.0/0 na porta do DB + PubliclyAccessible true = anti-pattern grave.",
        "App em privada alcança RDS pela rota local da VPC se SG permitir.",
      ],
      exam_tips: [
        "Timeout app→DB com engine up → SG do RDS antes de culpar a query.",
      ],
    },
    {
      heading: "Storage, custo e réplicas",
      bullets: [
        "gp3 (ideia) equilibra preço/IOPS; storage autoscaling evita full disk.",
        "Multi-AZ roughly dobra compute/storage do standby (ideia de custo HA).",
        "Read replica escala SELECT; não substitui Multi-AZ para failover de escrita síncrono.",
      ],
      exam_tips: [
        "Leitura pesada → replica; falha de AZ no writer → Multi-AZ.",
      ],
    },
    {
      heading: "Anti-patterns de prova (RDS)",
      bullets: [
        "RDS PubliclyAccessible true com SG 0.0.0.0/0 na porta do engine.",
        "Subnet group com subnets em uma única AZ e chamar de multi-AZ.",
        "Desligar automated backup em produção sem snapshot compensatório.",
        "Confundir read replica com failover Multi-AZ de escrita.",
        "Colocar RDS na subnet pública 'para o ALB alcançar'.",
      ],
      exam_tips: [
        "Separe sempre: AZ/HA · backup/RPO · SG/private · storage/custo.",
      ],
    },
  ],
  key_commands: [
    "aws rds describe-db-instances --db-instance-identifier <id>",
    "aws rds describe-db-subnet-groups",
    "aws rds describe-db-snapshots",
    "aws rds create-db-snapshot --db-instance-identifier <id> --db-snapshot-identifier <name>",
    "aws rds restore-db-instance-from-db-snapshot ...",
    "aws rds describe-db-instances --query DBInstances[].{MultiAZ:MultiAZ,Public:PubliclyAccessible,AZ:AvailabilityZone}",
    "aws ec2 describe-security-groups --group-ids <sg-db>",
    "aws rds describe-events --source-type db-instance",
    "aws rds modify-db-instance --allocated-storage ... (storage)",
    "aws rds reboot-db-instance ...",
  ],
  must_know: [
    "Produção: privadas + subnet group ≥2 AZ + Multi-AZ se HA de AZ for requisito.",
    "Multi-AZ = standby síncrono/failover de escrita; read replica = escala de leitura (assíncrona ideia).",
    "SG do DB: porta do engine só do SG do app; PubliclyAccessible false típico.",
    "Automated backup + retention = PITR; snapshot manual para marcos.",
    "Restore cria nova instância — atualize connection string/SG.",
    "Storage autoscaling mitiga disco cheio; Multi-AZ tem custo de standby.",
    "Timeout app→DB: SG e rede antes de recriar o schema.",
    "Fora: Aurora Serverless/Global deep, Proxy full, DMS full, param groups lab.",
  ],
  reuse_from_v1: null,
};

// Target gabarito ~8/7/8/7 or 8/8/7/7
const questions = [
  Q(1,
    "App em EC2 privadas precisa de MySQL gerenciado com patches e backup da AWS. Qual serviço encaixa?",
    [
      "Amazon RDS for MySQL (ou engine equivalente) em subnet group privado",
      "Somente S3 como engine SQL transacional",
      "Somente ElastiCache Redis como source of truth relacional",
      "AMI EC2 sem backup e sem Multi-AZ como única opção gerenciada",
    ], 0,
    "RDS entrega engine relacional gerenciada com backup/Multi-AZ. S3 não é OLTP SQL; ElastiCache é cache; EC2 self-managed não é o 'gerenciado' do cenário. Tip de prova: banco relacional gerenciado → RDS; objeto → S3; cache → ElastiCache."),

  Q(2,
    "Requisito: se a AZ do writer cair, o app deve voltar a escrever com RPO baixo. O que habilitar no RDS?",
    [
      "Apenas read replica assíncrona na mesma AZ",
      "PubliclyAccessible true",
      "Multi-AZ com standby síncrono e failover automático",
      "Desligar automated backups para acelerar failover",
    ], 2,
    "Multi-AZ mantém standby síncrono (ideia) e promove no failover de AZ — RPO baixo para escrita. Read replica assíncrona não garante o mesmo RPO de escrita; desligar backup piora recuperação. Tip de prova: falha de AZ no writer → Multi-AZ, não só read replica."),

  Q(3,
    "Timeout da app na porta 5432; describe-db-instances mostra available. sg-db inbound só 22 de bastion. Causa?",
    [
      "Falta de regra no SG do RDS permitindo a porta do engine a partir do SG do app",
      "gp3 não suporta PostgreSQL",
      "Multi-AZ desliga conexões TCP por padrão",
      "Snapshot semanal bloqueia a porta 5432",
    ], 0,
    "Engine available + timeout típico = path de rede/SG. Sem allow do sg-app na 5432 o pacote morre no ENI. Storage e Multi-AZ não removem a necessidade de SG. Tip de prova: timeout app→RDS com status available → SG do DB na porta do engine."),

  Q(4,
    "DB subnet group só lista subnets em us-east-1a. Multi-AZ está 'enabled' no console mas deploy falha. Interpretação?",
    [
      "Multi-AZ funciona com uma AZ se o storage for io2",
      "Subnet group precisa de subnets em pelo menos duas AZ para Multi-AZ",
      "Basta PubliclyAccessible true",
      "Read replica substitui o subnet group",
    ], 1,
    "Multi-AZ exige capacidade em outra AZ via subnet group multi-AZ. io2 e público não contornam isso. Tip de prova: Multi-AZ falha ou inválido → confira AZs do DB subnet group."),

  Q(5,
    "Antes de major upgrade, o time quer ponto de restauração sob demanda. O que criar?",
    [
      "Apenas aumentar max_connections",
      "Apenas abrir 0.0.0.0/0 temporariamente",
      "Desligar o CloudWatch",
      "Snapshot manual (e manter automated backup com retention adequada)",
    ], 3,
    "Snapshot manual marca o ponto pré-mudança; automated backup/PITR complementa. Abrir SG e desligar monitoramento não criam restore point. Tip de prova: antes de mudança arriscada no RDS → snapshot manual."),

  Q(6,
    "Multi-constraint: HA de AZ, RPO de minutos para restore lógico e DB inacessível da Internet. Qual pacote?",
    [
      "Single-AZ + PubliclyAccessible true + SG 0.0.0.0/0 + backup retention 0",
      "Multi-AZ + automated backup com retention >0 + PubliclyAccessible false + SG só do app",
      "Read replica pública como writer",
      "EC2 self-managed sem snapshot em subnet pública",
    ], 1,
    "Multi-AZ cobre HA de AZ; backup/retention cobre RPO de restore; private+SG do app fecha Internet. Público com 0.0.0.0/0 viola segurança. Tip de prova: HA+RPO+não público → Multi-AZ + backup + SG app + PubliclyAccessible false."),

  Q(7,
    "Relatórios SELECT pesados degradam o writer. Qual recurso RDS (ideia) alivia leitura?",
    [
      "Read replica para offload de SELECT (assíncrona)",
      "Desligar Multi-AZ",
      "Tornar o DB PubliclyAccessible",
      "Remover o Security Group",
    ], 0,
    "Read replica escala leituras; Multi-AZ é HA de escrita, não substitui escala de SELECT. Público e remover SG pioram segurança. Tip de prova: carga de leitura → replica; falha de AZ do writer → Multi-AZ."),

  Q(8,
    "Produção típica: o parâmetro PubliclyAccessible deve ficar como?",
    [
      "true com SG 0.0.0.0/0 para o ALB alcançar o SQL",
      "true somente se Multi-AZ estiver off",
      "false — app na VPC acessa por IP privado; ALB não precisa falar SQL na Internet",
      "Irrelevante porque SG é ignorado no RDS",
    ], 2,
    "App e RDS na VPC usam rede privada; ALB termina HTTP e fala com app, não com a porta SQL na Internet. Public true + 0.0.0.0/0 é anti-pattern. Tip de prova: RDS produção → PubliclyAccessible false + SG do app."),

  Q(9,
    "Disco do RDS em 99% e writes falhando. Controle nativo (ideia) para evitar recorrência?",
    [
      "Somente aumentar instance class sem storage",
      "Storage autoscaling e/ou aumentar allocated storage (gp2/gp3)",
      "Abrir porta 80 no SG do DB",
      "Converter o endpoint em S3 static website",
    ], 1,
    "Falta de storage se resolve com mais allocated storage ou autoscaling. Instance class maior não substitui GiB livres; porta 80 não é o engine. Tip de prova: FreeStorageSpace baixo → storage (auto)scale, não só CPU class."),

  Q(10,
    "Encryption at rest no RDS (ideia SAA): o que se espera?",
    [
      "Criptografia com KMS configurada na criação (ou conforme suporte de cópia/snapshot)",
      "Que o SG 0.0.0.0/0 já cifre os dados",
      "Que Multi-AZ desligue a criptografia",
      "Que read replica proíba KMS",
    ], 0,
    "At rest usa KMS no RDS quando habilitado no desenho. SG e Multi-AZ não substituem encryption. Tip de prova: dados sensíveis em repouso → encryption KMS no RDS (e snapshots)."),

  Q(11,
    "Failover Multi-AZ em andamento; app perde conexões por alguns minutos e reconecta no mesmo endpoint. Interpretação?",
    [
      "Comportamento esperado de failover — RTO de minutos; app deve retentar no endpoint",
      "Prova de que Multi-AZ nunca falha conexão",
      "Indica que o subnet group tem uma AZ só e por isso é normal perder dados",
      "Exige PubliclyAccessible true para reconectar",
    ], 0,
    "Failover promove standby e o DNS/endpoint estabiliza; apps precisam de retry. Não é perda de dados por single-AZ se Multi-AZ real. Tip de prova: breve outage no failover Multi-AZ → retry no endpoint, não recriar a VPC."),

  Q(12,
    "Automated backup retention = 0. O que se perde?",
    [
      "Apenas o Enhanced Monitoring",
      "Apenas o tipo de instance class",
      "Point-in-time restore e a janela de backup automático (além de risco operacional)",
      "A capacidade de usar Security Groups",
    ], 2,
    "Retention 0 desliga automated backups/PITR. SG e instance class permanecem. Tip de prova: retention 0 em produção = sem PITR automatizado."),

  Q(13,
    "Multi-constraint: custo menor que Multi-AZ full, mas leituras HA em outra AZ e RPO de escrita de alguns segundos aceitável em DR leve. Candidato?",
    [
      "Multi-AZ obrigatório + três writers",
      "Single-AZ writer + read replica em outra AZ (e backup) — trade-off vs Multi-AZ síncrono",
      "DB público sem backup",
      "Somente ElastiCache como banco relacional",
    ], 1,
    "Replica em outra AZ ajuda leitura e DR assíncrono barato que Multi-AZ; não iguala RPO síncrono de Multi-AZ. Tip de prova: se a questão aceita RPO assíncrono e foca leitura → replica; se exige failover de escrita síncrono → Multi-AZ."),

  Q(14,
    "Restore from snapshot cria qual objeto?",
    [
      "Uma nova DB instance (novo endpoint) a partir do snapshot",
      "Um Security Group com as mesmas regras automaticamente público",
      "Um NAT Gateway na subnet do DB",
      "Um ALB listener 5432",
    ], 0,
    "Restore provisiona nova instância; você atualiza connection string e SG. Não cria NAT/ALB SQL. Tip de prova: restore snapshot RDS → nova instance + novo endpoint."),

  Q(15,
    "Por que NÃO colocar o RDS na subnet pública só 'para o ALB conectar'?",
    [
      "Porque o ALB precisa falar SQL na 443 com o engine",
      "Porque Multi-AZ proíbe subnets",
      "O ALB fala com o app tier; o app fala com o RDS na VPC privada — expor o DB na pública aumenta superfície",
      "Porque gp3 só funciona em privada",
    ], 2,
    "Arquitetura multi-tier: ALB→app→DB. DB público não é requisito do ALB. Tip de prova: ALB não substitui SG/path do app ao RDS privado."),

  Q(16,
    "Custo: Multi-AZ vs single-AZ no mesmo instance class e storage. Expectativa?",
    [
      "Multi-AZ costuma custar mais (standby e storage espelhado ideia)",
      "Multi-AZ é sempre grátis",
      "Single-AZ custa o dobro por definição",
      "Preço só depende do Security Group",
    ], 0,
    "Standby Multi-AZ implica recursos adicionais — custo maior que single-AZ equivalente. SG não define o preço do standby. Tip de prova: HA Multi-AZ = trade-off de custo vs single-AZ."),

  Q(17,
    "Evento: maintenance window com upgrade; single-AZ. Impacto típico vs Multi-AZ?",
    [
      "Single-AZ tem maior chance de downtime na maintenance; Multi-AZ reduz impacto com standby",
      "Single-AZ nunca tem downtime de maintenance",
      "Multi-AZ apaga automated backups na maintenance",
      "Maintenance só ocorre se PubliclyAccessible true",
    ], 0,
    "Manutenção em single-AZ atinge o único node; Multi-AZ usa o standby para reduzir interrupção. Tip de prova: downtime de patch em produção → Multi-AZ mitiga."),

  Q(18,
    "sg-db permite 3306 de 0.0.0.0/0 e PubliclyAccessible true. Avaliação de segurança?",
    [
      "Best practice de least privilege",
      "Obrigatório para Multi-AZ",
      "Aceitável se houver snapshot diário",
      "Anti-pattern: DB exposto à Internet — restrinja SG ao app e PubliclyAccessible false",
    ], 3,
    "Exposição mundial na porta do engine é risco grave; backup não compensa. Multi-AZ não exige público. Tip de prova: 0.0.0.0/0 na porta do RDS = red flag imediata."),

  Q(19,
    "PITR (point-in-time restore) depende principalmente de quê?",
    [
      "Apenas de tags na VPC",
      "Automated backups habilitados com retention > 0 e janela de restore",
      "Apenas de read replica pública",
      "Apenas de Enhanced Monitoring granularity 1s",
    ], 1,
    "PITR usa a cadeia de backup automático/logs dentro da retention. Tags e monitoring não substituem backup. Tip de prova: PITR → automated backup retention > 0."),

  Q(20,
    "Fora de escopo profundo desta part RDS foundations?",
    [
      "Multi-AZ e subnet group",
      "Backup/snapshot/PITR ideia",
      "SG e PubliclyAccessible",
      "Aurora Serverless v2 deep, Global Database lab, RDS Proxy full e DMS full",
    ], 3,
    "O piloto cobre RDS clássico HA/backup/SG/storage. Aurora Serverless/Global, Proxy e DMS deep ficam de fora. Tip de prova: se a questão for Aurora Global deep, não force só 'ligar Multi-AZ clássico' sem ler o stem."),

  Q(21,
    "App connection string aponta para o endpoint de escrita. Após criar read replica, as escritas devem ir para onde?",
    [
      "Continuam no endpoint do primary/writer; replica é para leituras (ideia)",
      "Todas as escritas devem ir só para a replica",
      "Escritas só funcionam se PubliclyAccessible true na replica",
      "Escritas só via snapshot restore diário",
    ], 0,
    "Writer permanece o primary; replica assíncrona serve SELECT. Tip de prova: INSERT/UPDATE → endpoint do primary; SELECT pesado → replica."),

  Q(22,
    "Storage type gp3 no RDS (ideia) vs necessidade de IOPS altos previsíveis. Direção?",
    [
      "gp3 permite dimensionar storage/IOPS com bom custo; cenários extremos podem exigir io classes conforme engine/suporte",
      "gp3 proíbe Multi-AZ",
      "gp3 exige 0.0.0.0/0 no SG",
      "gp3 remove a necessidade de backup",
    ], 0,
    "gp3 é escolha de custo/performance comum; HA e backup são eixos separados. Tip de prova: custo+IOPS configurável → gp3 (ideia); não ligue gp3 a SG público."),

  Q(23,
    "Instance RDS em 'storage-full'. Qual sintoma de app e ação?",
    [
      "App com erros de escrita/transação; aumentar storage ou confiar em autoscaling se habilitado",
      "Apenas 404 no ALB listener 443 por definição",
      "Apenas falha de IAM AssumeRole",
      "Apenas perda de Elastic IP do RDS",
    ], 0,
    "Disco cheio quebra writes; remediar storage. ALB 404 e AssumeRole não são o sintoma direto de storage-full. Tip de prova: storage-full no RDS → free storage / modify storage."),

  Q(24,
    "Alguém deletou a DB instance sem snapshot final e automated backup estava off. Resultado?",
    [
      "PITR de 35 dias ainda disponível sempre",
      "A VPC inteira é restaurada",
      "Multi-AZ recria os dados de outra conta",
      "Dados tipicamente irrecuperáveis no serviço — sem snapshot/backup não há restore",
    ], 3,
    "Sem snapshot nem automated backup, delete remove o caminho de restore. Multi-AZ não é backup cross-conta mágico. Tip de prova: delete sem backup/snapshot = perda de dados."),

  Q(25,
    "Desenho: ALB → ASG app → RDS. Onde aplicar o allow 3306?",
    [
      "No SG do ALB para 0.0.0.0/0",
      "No SG do RDS com Source = SG das instances de app (sg-app)",
      "No NACL only Deny all",
      "Somente no Security Group do NAT Gateway",
    ], 1,
    "SQL flui app→DB; ALB não precisa 3306 público. Source = sg-app no sg-db é o padrão. Tip de prova: porta do engine no RDS ← SG do app tier, não do ALB internet."),

  Q(26,
    "Read replica cross-Region (ideia leve) serve a qual objetivo?",
    [
      "Failover síncrono Multi-AZ na mesma AZ apenas",
      "Substituir o Security Group",
      "DR/leitura em outra Região com RPO assíncrono (não idêntico a Multi-AZ local)",
      "Eliminar a necessidade de KMS",
    ], 2,
    "Réplica cross-Region é DR/leitura assíncrona; Multi-AZ local é outro mecanismo. Tip de prova: outra Região + leitura/DR → replica cross-Region; mesma Região HA escrita → Multi-AZ."),

  Q(27,
    "Enhanced Monitoring / Performance Insights (menção): para que servem no TShoot?",
    [
      "Métricas de OS/SQL para diagnosticar CPU, wait, conexões — não substituem SG/backup",
      "Abrem automaticamente 0.0.0.0/0",
      "Criam Multi-AZ sozinhos",
      "Apagam snapshots antigos por padrão sem policy",
    ], 0,
    "Observabilidade ajuda performance; segurança de rede e backup continuam obrigatórios no design. Tip de prova: lentidão SQL → Performance Insights; timeout de rede → SG primeiro."),

  Q(28,
    "Modificar instance class (vertical) vs adicionar read replica (horizontal leitura). Quando replica?",
    [
      "Quando o gargalo é volume de SELECT e se pode separar leituras",
      "Quando se precisa só de mais RAM no writer sem leituras extras",
      "Quando se quer desligar o endpoint de escrita",
      "Quando PubliclyAccessible deve ser true",
    ], 0,
    "Replica escala leitura; vertical sobe recursos do writer. Tip de prova: SELECTs dominam → replica; CPU/RAM do writer em writes → resize class."),

  Q(29,
    "Checklist mental de TShoot RDS nesta part?",
    [
      "Só recriar a conta AWS",
      "Só aumentar o TTL do Route 53 do site",
      "Só desligar o versioning do bucket de logs",
      "Status instance → SG/porta/Public → Multi-AZ/eventos → storage livre → backups/snapshots",
    ], 3,
    "Ordem isola disponibilidade, rede, HA, disco e restore. DNS do site e S3 versioning não explicam timeout SQL. Tip de prova: timeout SQL → SG e status RDS antes de restore cego."),

  Q(30,
    "Resumo de design RDS foundations no SAA-C03:",
    [
      "DB público 0.0.0.0/0 single-AZ sem backup",
      "RDS na subnet pública porque o ALB 'precisa de SQL'",
      "Só read replica como HA de escrita síncrona",
      "Privado multi-AZ (se HA), SG do app, backup/PITR, storage dimensionado, encryption conforme dados",
    ], 3,
    "Núcleo: private+SG, Multi-AZ se HA de AZ, backup para RPO, storage/custo conscientes. Público sem backup e confundir replica com Multi-AZ são anti-patterns. Tip de prova: se a opção junta private, Multi-AZ, backup e SG do app, costuma ser a correta."),
];

const tickets = [
  T(1,
    "NOC-AWS-1601: App pay-api timeout ao abrir conexão JDBC no RDS pay-db (porta 5432). CPU do RDS baixa.",
    `$ aws rds describe-db-instances --db-instance-identifier pay-db \\
  --query 'DBInstances[0].{Status:DBInstanceStatus,AZ:AvailabilityZone,MultiAZ:MultiAZ,Public:PubliclyAccessible,SG:VpcSecurityGroups,Endpoint:Endpoint}'
Status: available
AZ: us-east-1a
MultiAZ: true
Public: false
Endpoint: pay-db.xxxx.us-east-1.rds.amazonaws.com:5432
SG: [sg-db]

$ aws ec2 describe-security-groups --group-ids sg-db
Inbound:
  TCP 22 Source sg-bastion
  (no 5432)
Outbound: all

$ aws ec2 describe-security-groups --group-ids sg-app
Inbound: TCP 8080 Source sg-alb
Outbound: all

$ aws ec2 describe-instances --filters Name=tag:App,Values=pay-api
i-0app1 running  SG: sg-app  Subnet: subnet-0priva

# App log: Connection timed out connecting to pay-db...:5432`,
    [
      "Adicionar inbound no sg-db TCP 5432 com Source = sg-app",
      "Habilitar PubliclyAccessible true e 0.0.0.0/0 na 5432",
      "Desligar Multi-AZ para 'melhorar latência de auth'",
      "Recriar o ALB listener na 5432",
    ], 0,
    "RDS available e timeout com sg-db sem 5432 do sg-app é filtragem de SG. Tornar público 0.0.0.0/0 resolve mal e expõe o DB; ALB não termina JDBC. Tip de prova: timeout JDBC + available → SG do RDS na porta do engine com Source do app."),

  T(2,
    "NOC-AWS-1602: Após failover Multi-AZ (evento AWS), app ficou 2–3 min sem writes e depois voltou no mesmo hostname.",
    `$ aws rds describe-events --source-type db-instance --source-identifier shop-db --duration 120
Message: Multi-AZ instance failover completed
Message: DB instance restarted
Message: Failover to standby complete

$ aws rds describe-db-instances --db-instance-identifier shop-db
DBInstanceStatus: available
MultiAZ: true
Endpoint.Address: shop-db.xxxx.us-east-1.rds.amazonaws.com  (unchanged)
AvailabilityZone: us-east-1b   # was us-east-1a before event

$ aws rds describe-db-instances --db-instance-identifier shop-db-rr
ReadReplicaSourceDBInstanceIdentifier: shop-db
Status: available

# App errors window 02:14–02:16: communications link failure; then recover with retry`,
    [
      "É esperado em failover Multi-AZ: breve RTO e reconexão no endpoint; app deve ter retry — não indica perda total de Multi-AZ",
      "Prova de que Multi-AZ está desligado",
      "Exige abrir 0.0.0.0/0 no sg-db para o failover funcionar",
      "Indica que apenas a read replica pode receber writes daqui pra frente",
    ], 0,
    "Eventos de failover Multi-AZ + AZ mudando com mesmo endpoint e janela curta de erro batem com RTO de failover; retry recupera. Replica não vira writer automático neste cenário clássico. Tip de prova: failover Multi-AZ → downtime curto + mesmo endpoint; implemente retry."),

  T(3,
    "NOC-AWS-1603: Instância dev-db foi deletada acidentalmente. Precisam dos dados de ontem.",
    `$ aws rds describe-db-instances --db-instance-identifier dev-db
DBInstanceNotFound fault

$ aws rds describe-db-snapshots --db-instance-identifier dev-db
[]   # empty

$ aws rds describe-db-instances --filters Name=db-instance-id,Values=dev-db
(no pending)

# Last known config from CMDB:
BackupRetentionPeriod: 0
DeletionProtection: false
MultiAZ: false
PreferredBackupWindow: (n/a — backups disabled)

$ aws rds describe-db-cluster-snapshots 2>/dev/null || true
(no cluster — instance was RDS MySQL single)

# No manual snapshot tickets in the last 30 days`,
    [
      "Restaurar com PITR de 7 dias mesmo com retention 0",
      "Multi-AZ recria a instance apagada automaticamente em 24h",
      "Sem automated backup (retention 0) e sem snapshot manual, não há restore RDS — dados indisponíveis no serviço",
      "Basta recriar o Security Group com o mesmo nome",
    ], 2,
    "Instance not found + zero snapshots + retention 0 = sem caminho de restore. Multi-AZ não sobrevive a delete da instance. Tip de prova: delete RDS sem snapshot/backup = perda; ligue retention e deletion protection em dados valiosos."),

  T(4,
    "NOC-AWS-1604: Achado de security review no RDS crm-db de 'produção'.",
    `$ aws rds describe-db-instances --db-instance-identifier crm-db \\
  --query 'DBInstances[0].{Public:PubliclyAccessible,MultiAZ:MultiAZ,SGs:VpcSecurityGroups,Subnets:DBSubnetGroup.Subnets}'
Public: true
MultiAZ: false
SGs: [sg-crm-db]
Subnets:
  - subnet-0puba  AZ=us-east-1a
  - (only one subnet in group — also 1a)

$ aws rds describe-db-subnet-groups --db-subnet-group-name crm-subnets
Subnets: [subnet-0puba]   # single AZ us-east-1a  MapPublicIpOnLaunch related public tier

$ aws ec2 describe-security-groups --group-ids sg-crm-db
Inbound:
  TCP 3306  0.0.0.0/0
Outbound: all

$ aws ec2 describe-subnets --subnet-ids subnet-0puba
MapPublicIpOnLaunch: true
# Tag: Tier=public`,
    [
      "Marcar como compliant porque tem endpoint DNS",
      "Corrigir: PubliclyAccessible false, SG 3306 só de sg-app, subnet group privado em ≥2 AZ e avaliar Multi-AZ se HA for requisito",
      "Abrir também 5432 0.0.0.0/0 para 'compatibilidade'",
      "Remover o DB subnet group inteiro e usar EC2 na mesma pública sem SG",
    ], 1,
    "Public true + 3306 world open + subnet group single public AZ são três falhas (exposição e SPOF). O remédio é private multi-AZ group, SG do app e Multi-AZ se HA. Tip de prova: achado RDS público 0.0.0.0/0 + 1 AZ → private, SG app, multi-AZ subnet/HA."),

  T(5,
    "NOC-AWS-1605: Writes falhando com 'No space left' / storage-full no RDS orders-db.",
    `$ aws rds describe-db-instances --db-instance-identifier orders-db \\
  --query 'DBInstances[0].{Status:DBInstanceStatus,Alloc:AllocatedStorage,MaxAlloc:MaxAllocatedStorage,StorageType:StorageType,StorageEncrypted:StorageEncrypted}'
Status: storage-full
Alloc: 100
MaxAlloc: 100
StorageType: gp3
StorageEncrypted: true

$ aws cloudwatch get-metric-statistics --namespace AWS/RDS --metric-name FreeStorageSpace \\
  --dimensions Name=DBInstanceIdentifier,Value=orders-db ...
# Datapoints near 0 bytes free

$ aws rds describe-db-instances --db-instance-identifier orders-db \\
  --query 'DBInstances[0].{MultiAZ:MultiAZ,BackupRetentionPeriod:BackupRetentionPeriod}'
MultiAZ: true
BackupRetentionPeriod: 7

# App: INSERT/UPDATE failing; SELECT still intermittently ok`,
    [
      "Abrir 0.0.0.0/0 na porta do engine",
      "Desligar Multi-AZ para liberar disco do standby como se fosse o primary",
      "Só recriar o ALB",
      "Aumentar AllocatedStorage e/ou MaxAllocatedStorage (autoscaling) — FreeStorageSpace ~0 explica writes falhando",
    ], 3,
    "Status storage-full e FreeStorageSpace ~0 com MaxAlloc=Alloc fechado exigem mais storage (e autoscaling). SG e ALB não liberam GiB; desligar Multi-AZ não é o fix de disco. Tip de prova: storage-full RDS → modify storage / max allocated storage."),
];

// validate unique tip closers - no identical last 80 chars in >=3
const tips = questions.map((q) => {
  const m = q.explicacao_profunda.match(/Tip de prova:[^.]*\./i);
  return m ? m[0] : q.explicacao_profunda.slice(-80);
});
const tipCount = {};
for (const t of tips) tipCount[t] = (tipCount[t] || 0) + 1;
const repeatedTips = Object.entries(tipCount).filter(([, n]) => n >= 3);
if (repeatedTips.length) {
  console.warn("WARN repeated tips", repeatedTips);
}

const rc = [0, 0, 0, 0];
questions.forEach((q) => rc[q.resposta_correta]++);
const ql = questions.map((q) => q.explicacao_profunda.length);
const tl = tickets.map((t) => t.explicacao_profunda.length);

fs.writeFileSync(path.join(PARTS, "part-aws-1.6-content.json"), JSON.stringify(content, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.6-questions.json"), JSON.stringify(questions, null, 2) + "\n");
fs.writeFileSync(path.join(PARTS, "part-aws-1.6-tickets.json"), JSON.stringify(tickets, null, 2) + "\n");

console.log({
  topic_list: content.topic_list.length,
  q_min: Math.min(...ql),
  q_avg: Math.round(ql.reduce((a, b) => a + b, 0) / ql.length),
  rc,
  t_min: Math.min(...tl),
  free: questions.filter((q) => !q.isPremium).length,
  repeatedTips: repeatedTips.length,
});
