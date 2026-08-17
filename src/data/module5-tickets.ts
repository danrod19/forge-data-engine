/**
 * Tickets do Módulo 5.0 (Security Fundamentals).
 */

import type { Question } from "@/types/question";
import raw from "@/data/tickets_module5.json";

function normalize(rawList: Question[]): Question[] {
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
    source: "module5" as const,
  }));
}

export const module5Tickets: Question[] = normalize(raw as Question[]);

export const MODULE5_TOTAL_TICKETS = module5Tickets.length;

export function getModule5TicketsByPart(partId: string): Question[] {
  return module5Tickets.filter((t) => t.part_id === partId);
}

export const module5TicketCounts = {
  total: module5Tickets.length,
  byPart: module5Tickets.reduce<Record<string, number>>((acc, t) => {
    const k = t.part_id ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {}),
} as const;
