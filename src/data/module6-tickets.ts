/**
 * Tickets do Módulo 6.0 (Automação e Programabilidade).
 */

import type { Question } from "@/types/question";
import raw from "@/data/tickets_module6.json";

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
    source: "module6" as const,
  }));
}

export const module6Tickets: Question[] = normalize(raw as Question[]);

export const MODULE6_TOTAL_TICKETS = module6Tickets.length;

export function getModule6TicketsByPart(partId: string): Question[] {
  return module6Tickets.filter((t) => t.part_id === partId);
}

export const module6TicketCounts = {
  total: module6Tickets.length,
  byPart: module6Tickets.reduce<Record<string, number>>((acc, t) => {
    const k = t.part_id ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {}),
} as const;
