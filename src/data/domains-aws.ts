/**
 * Domínios de estudo AWS SAA-C03 Foundations (piloto 1.1–1.12).
 * Agrupa parts de aws-parts.ts para o Modo Estudo.
 */

import type { Question } from "@/types/question";
import { AWS_PARTS, type AwsPartMeta } from "@/data/aws-parts";

export type AwsStudyDomainId =
  | "aws-identity"
  | "aws-networking"
  | "aws-storage"
  | "aws-compute"
  | "aws-databases"
  | "aws-decoupling"
  | "aws-serverless"
  | "aws-observability";

export type AwsDomainAccent =
  | "green"
  | "cyan"
  | "gold"
  | "violet"
  | "rose"
  | "blue"
  | "amber";

export interface AwsStudyDomain {
  id: AwsStudyDomainId;
  name: string;
  description: string;
  /** Parts aws-x.y cobertas */
  partIds: string[];
  keywords: string[];
  /** Peso relativo no estudo (hint SAA / ênfase) */
  weightPct: number;
  accent: AwsDomainAccent;
}

export const AWS_STUDY_DOMAINS: AwsStudyDomain[] = [
  {
    id: "aws-identity",
    name: "Identity & Access",
    description:
      "IAM (users, roles, policies, STS) e crypto operacional (KMS CMK, Secrets Manager, rotation).",
    partIds: ["aws-1.1", "aws-1.9"],
    keywords: [
      "iam",
      "role",
      "policy",
      "sts",
      "assume",
      "kms",
      "cmk",
      "secret",
      "decrypt",
      "least privilege",
      "accessdenied",
    ],
    weightPct: 18,
    accent: "rose",
  },
  {
    id: "aws-networking",
    name: "Networking",
    description:
      "VPC (subnets, SG, NACL, NAT/IGW) e borda DNS/CDN (Route 53, CloudFront, OAI/OAC).",
    partIds: ["aws-1.2", "aws-1.7"],
    keywords: [
      "vpc",
      "subnet",
      "security group",
      "nacl",
      "nat",
      "igw",
      "route 53",
      "cloudfront",
      "alias",
      "failover",
      "oai",
      "oac",
    ],
    weightPct: 16,
    accent: "cyan",
  },
  {
    id: "aws-storage",
    name: "Storage",
    description:
      "S3: bucket policy, Block Public Access, encryption, versioning e lifecycle/custo.",
    partIds: ["aws-1.3"],
    keywords: [
      "s3",
      "bucket",
      "bpa",
      "versioning",
      "lifecycle",
      "sse",
      "getobject",
      "putobject",
    ],
    weightPct: 10,
    accent: "gold",
  },
  {
    id: "aws-compute",
    name: "Compute & HA",
    description:
      "EC2/EBS (lifecycle, volumes, Spot) e ALB/ASG (health, multi-AZ, capacity).",
    partIds: ["aws-1.4", "aws-1.5"],
    keywords: [
      "ec2",
      "ebs",
      "ami",
      "snapshot",
      "spot",
      "alb",
      "asg",
      "target",
      "health",
      "auto scaling",
    ],
    weightPct: 16,
    accent: "green",
  },
  {
    id: "aws-databases",
    name: "Databases",
    description:
      "RDS (Multi-AZ, backup, SG) e DynamoDB (PK/SK, RCU/WCU, GSI, throttle).",
    partIds: ["aws-1.6", "aws-1.11"],
    keywords: [
      "rds",
      "multi-az",
      "snapshot",
      "dynamodb",
      "partition",
      "gsi",
      "rcu",
      "wcu",
      "throttle",
    ],
    weightPct: 14,
    accent: "blue",
  },
  {
    id: "aws-decoupling",
    name: "Decoupling",
    description:
      "SQS/SNS: filas, FIFO, visibility, DLQ e fan-out pub/sub.",
    partIds: ["aws-1.8"],
    keywords: [
      "sqs",
      "sns",
      "fifo",
      "visibility",
      "dlq",
      "fan-out",
      "redrive",
      "queue",
    ],
    weightPct: 10,
    accent: "violet",
  },
  {
    id: "aws-serverless",
    name: "Serverless",
    description:
      "Lambda: execution role, timeout, concurrency, triggers e VPC path.",
    partIds: ["aws-1.10"],
    keywords: [
      "lambda",
      "timeout",
      "concurrency",
      "throttle",
      "execution role",
      "event source",
      "cold start",
    ],
    weightPct: 10,
    accent: "amber",
  },
  {
    id: "aws-observability",
    name: "Observability",
    description:
      "CloudWatch: metrics, alarms, log retention, metric filters e actions SNS/ASG.",
    partIds: ["aws-1.12"],
    keywords: [
      "cloudwatch",
      "alarm",
      "metric",
      "log group",
      "retention",
      "insufficient_data",
      "namespace",
    ],
    weightPct: 6,
    accent: "cyan",
  },
];

/** Alias pedido no contrato */
export const awsDomains = AWS_STUDY_DOMAINS;

export function getAwsDomainById(
  id: string
): AwsStudyDomain | undefined {
  return AWS_STUDY_DOMAINS.find((d) => d.id === id);
}

export function getAwsPartsForDomain(domain: AwsStudyDomain): AwsPartMeta[] {
  return domain.partIds
    .map((id) => AWS_PARTS.find((p) => p.id === id))
    .filter((p): p is AwsPartMeta => Boolean(p));
}

/** Conta questões do pool cujo part_id pertence ao domínio. */
export function countQuestionsForAwsDomain(
  pool: Question[],
  domain: AwsStudyDomain
): number {
  const set = new Set(domain.partIds);
  return pool.filter((q) => q.part_id && set.has(q.part_id)).length;
}

/** Filtra pool do domínio (part_id match; fallback keywords no enunciado). */
export function filterQuestionsForAwsDomain(
  pool: Question[],
  domain: AwsStudyDomain
): Question[] {
  const set = new Set(domain.partIds);
  const byPart = pool.filter((q) => q.part_id && set.has(q.part_id));
  if (byPart.length > 0) return byPart;

  const kws = domain.keywords.map((k) => k.toLowerCase());
  return pool.filter((q) => {
    const text = `${q.enunciado ?? ""} ${q.sintoma ?? ""}`.toLowerCase();
    return kws.some((k) => text.includes(k));
  });
}

export function awsDomainAccentClasses(accent: AwsDomainAccent): {
  border: string;
  bg: string;
  text: string;
  glow: string;
  bar: string;
} {
  switch (accent) {
    case "green":
      return {
        border: "border-neon-green/30",
        bg: "bg-neon-green/10",
        text: "text-neon-green",
        glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.12)]",
        bar: "bg-neon-green",
      };
    case "cyan":
      return {
        border: "border-neon-cyan/30",
        bg: "bg-neon-cyan/10",
        text: "text-neon-cyan",
        glow: "hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]",
        bar: "bg-neon-cyan",
      };
    case "gold":
    case "amber":
      return {
        border: "border-amber-400/30",
        bg: "bg-amber-400/10",
        text: "text-amber-300",
        glow: "hover:shadow-[0_0_20px_rgba(251,191,36,0.12)]",
        bar: "bg-amber-400",
      };
    case "violet":
      return {
        border: "border-violet-400/30",
        bg: "bg-violet-400/10",
        text: "text-violet-300",
        glow: "hover:shadow-[0_0_20px_rgba(167,139,250,0.12)]",
        bar: "bg-violet-400",
      };
    case "rose":
      return {
        border: "border-rose-400/30",
        bg: "bg-rose-400/10",
        text: "text-rose-300",
        glow: "hover:shadow-[0_0_20px_rgba(251,113,133,0.12)]",
        bar: "bg-rose-400",
      };
    case "blue":
    default:
      return {
        border: "border-sky-400/30",
        bg: "bg-sky-400/10",
        text: "text-sky-300",
        glow: "hover:shadow-[0_0_20px_rgba(56,189,248,0.12)]",
        bar: "bg-sky-400",
      };
  }
}
