/**
 * Tickets do Módulo 3.0 (IP Connectivity).
 */

import type { Question } from "@/types/question";
import raw from "@/data/tickets_module3.json";

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
    source: "module3" as const,
  }));
}

export const module3Tickets: Question[] = normalize(raw as Question[]);

export const MODULE3_TOTAL_TICKETS = module3Tickets.length;

export function getModule3TicketsByPart(partId: string): Question[] {
  return module3Tickets.filter((t) => t.part_id === partId);
}

export const module3TicketCounts = {
  total: module3Tickets.length,
  byPart: module3Tickets.reduce<Record<string, number>>((acc, t) => {
    const k = t.part_id ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {}),
} as const;
