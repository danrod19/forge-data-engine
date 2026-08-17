/**
 * Tickets do Módulo 4.0 (IP Services).
 */

import type { Question } from "@/types/question";
import raw from "@/data/tickets_module4.json";

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
    source: "module4" as const,
  }));
}

export const module4Tickets: Question[] = normalize(raw as Question[]);

export const MODULE4_TOTAL_TICKETS = module4Tickets.length;

export function getModule4TicketsByPart(partId: string): Question[] {
  return module4Tickets.filter((t) => t.part_id === partId);
}

export const module4TicketCounts = {
  total: module4Tickets.length,
  byPart: module4Tickets.reduce<Record<string, number>>((acc, t) => {
    const k = t.part_id ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {}),
} as const;
