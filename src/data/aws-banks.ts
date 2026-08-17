/**
 * Bancos AWS SAA-C03 Foundations (piloto 1.1–1.12).
 * Fonte: aws/final/* copiado para src/data/.
 */

import type { Question } from "@/types/question";
import rawTraditional from "@/data/questions_aws_traditional.json";
import rawTickets from "@/data/tickets_aws.json";

function normalizeTraditional(rawList: Question[]): Question[] {
  return rawList.map((q, index) => ({
    ...q,
    id: typeof q.id === "number" ? q.id : index + 1,
    question_type: "traditional" as const,
    isPremium: q.isPremium ?? true,
    enunciado: q.enunciado ?? "",
    alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
    resposta_correta:
      typeof q.resposta_correta === "number" ? q.resposta_correta : 0,
    explicacao_profunda: q.explicacao_profunda ?? "",
    part_id: q.part_id,
    source: q.source ?? "aws",
  }));
}

function normalizeTickets(rawList: Question[]): Question[] {
  return rawList.map((t, index) => ({
    ...t,
    id: typeof t.id === "number" ? t.id : index + 1,
    question_type: "ticket" as const,
    isPremium: t.isPremium ?? true,
    sintoma: t.sintoma ?? "",
    cli_output: t.cli_output ?? "",
    alternativas: Array.isArray(t.alternativas) ? t.alternativas : [],
    resposta_correta:
      typeof t.resposta_correta === "number" ? t.resposta_correta : 0,
    explicacao_profunda: t.explicacao_profunda ?? "",
    part_id: t.part_id,
    source: t.source ?? "aws",
  }));
}

/** Traditional AWS (Simulado) */
export const awsTraditionalQuestions: Question[] = normalizeTraditional(
  rawTraditional as Question[]
);

/** Tickets AWS (Trilha) */
export const awsTickets: Question[] = normalizeTickets(
  rawTickets as Question[]
);

export const TOTAL_AWS_TRADITIONAL = awsTraditionalQuestions.length;
export const TOTAL_AWS_TICKETS = awsTickets.length;

export function getAwsTraditionalByPart(partId: string): Question[] {
  return awsTraditionalQuestions.filter((q) => q.part_id === partId);
}

export function getAwsTicketsByPart(partId: string): Question[] {
  return awsTickets.filter((t) => t.part_id === partId);
}
