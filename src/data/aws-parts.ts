/**
 * Índice leve das 12 parts do piloto AWS SAA-C03 Foundations.
 */

export type AwsDomainGroup =
  | "Identity"
  | "Network"
  | "Storage"
  | "Compute"
  | "Data"
  | "Serverless"
  | "Messaging"
  | "Observability";

export interface AwsPartMeta {
  id: string;
  title: string;
  domainGroup: AwsDomainGroup;
  shortTitle: string;
}

export const AWS_PARTS: AwsPartMeta[] = [
  {
    id: "aws-1.1",
    title: "IAM foundations",
    shortTitle: "IAM",
    domainGroup: "Identity",
  },
  {
    id: "aws-1.2",
    title: "VPC foundations",
    shortTitle: "VPC",
    domainGroup: "Network",
  },
  {
    id: "aws-1.3",
    title: "S3 foundations",
    shortTitle: "S3",
    domainGroup: "Storage",
  },
  {
    id: "aws-1.4",
    title: "EC2 + EBS foundations",
    shortTitle: "EC2/EBS",
    domainGroup: "Compute",
  },
  {
    id: "aws-1.5",
    title: "ALB + Auto Scaling",
    shortTitle: "ALB/ASG",
    domainGroup: "Compute",
  },
  {
    id: "aws-1.6",
    title: "RDS foundations",
    shortTitle: "RDS",
    domainGroup: "Data",
  },
  {
    id: "aws-1.7",
    title: "Route 53 + CloudFront",
    shortTitle: "R53/CF",
    domainGroup: "Network",
  },
  {
    id: "aws-1.8",
    title: "SQS + SNS + desacoplamento",
    shortTitle: "SQS/SNS",
    domainGroup: "Messaging",
  },
  {
    id: "aws-1.9",
    title: "KMS + Secrets Manager",
    shortTitle: "KMS/Secrets",
    domainGroup: "Identity",
  },
  {
    id: "aws-1.10",
    title: "Lambda foundations",
    shortTitle: "Lambda",
    domainGroup: "Serverless",
  },
  {
    id: "aws-1.11",
    title: "DynamoDB foundations",
    shortTitle: "DynamoDB",
    domainGroup: "Data",
  },
  {
    id: "aws-1.12",
    title: "CloudWatch foundations",
    shortTitle: "CloudWatch",
    domainGroup: "Observability",
  },
];

export const TOTAL_AWS_PARTS = AWS_PARTS.length;

export function getAwsPart(id: string): AwsPartMeta | undefined {
  return AWS_PARTS.find((p) => p.id === id);
}

export function getAwsPartsByDomain(group: AwsDomainGroup): AwsPartMeta[] {
  return AWS_PARTS.filter((p) => p.domainGroup === group);
}
