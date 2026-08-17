/**
 * Banco de tickets do Módulo 1.0 — fonte canônica da Trilha para Fundamentals.
 * O banco legacy (tickets.ts) permanece para volume extra / fallback.
 */

import type { Question } from "@/types/question";

import t11 from "@/data/parts/part-1.1-tickets.json";
import t12 from "@/data/parts/part-1.2-tickets.json";
import t13 from "@/data/parts/part-1.3-tickets.json";
import t14 from "@/data/parts/part-1.4-tickets.json";
import t15 from "@/data/parts/part-1.5-tickets.json";
import t16 from "@/data/parts/part-1.6-tickets.json";

type RawTicket = {
  id?: number;
  question_type?: string;
  isPremium?: boolean;
  sintoma?: string;
  cli_output?: string;
  alternativas?: string[];
  resposta_correta?: number;
  explicacao_profunda?: string;
  part_id?: string;
};

function asTicket(raw: RawTicket, globalId: number): Question | null {
  const alternativas = Array.isArray(raw.alternativas) ? raw.alternativas : [];
  if (alternativas.length !== 4) return null;
  const rc = raw.resposta_correta;
  if (typeof rc !== "number" || rc < 0 || rc > 3) return null;

  return {
    id: globalId,
    question_type: "ticket",
    isPremium: raw.isPremium ?? true,
    sintoma: raw.sintoma ?? "",
    cli_output: raw.cli_output ?? "",
    alternativas,
    resposta_correta: rc,
    explicacao_profunda: raw.explicacao_profunda ?? "",
    part_id: raw.part_id,
    source: "module1",
  };
}

function concatTickets(banks: RawTicket[][]): Question[] {
  const out: Question[] = [];
  let nextId = 1;
  for (const bank of banks) {
    for (const item of bank) {
      const t = asTicket(item, nextId);
      if (!t) continue;
      out.push(t);
      nextId += 1;
    }
  }
  return out;
}

/** Tickets do módulo 1.0 (ordem 1.1 → 1.6), ids 1..N */
export const module1Tickets: Question[] = concatTickets([
  t11 as RawTicket[],
  t12 as RawTicket[],
  t13 as RawTicket[],
  t14 as RawTicket[],
  t15 as RawTicket[],
  t16 as RawTicket[],
]);

export const MODULE1_TOTAL_TICKETS = module1Tickets.length;

export function getTicketsByPart(partId: string): Question[] {
  return module1Tickets.filter((t) => t.part_id === partId);
}

export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sessão da Trilha a partir do banco do módulo 1.
 */
export function createTrilhaSession(size = 10): Question[] {
  if (module1Tickets.length === 0) return [];
  const n = Math.min(Math.max(1, size), module1Tickets.length);
  return shuffleArray(module1Tickets).slice(0, n);
}

export const module1TicketCounts = {
  total: module1Tickets.length,
  byPart: module1Tickets.reduce<Record<string, number>>((acc, t) => {
    const k = t.part_id ?? "unknown";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {}),
} as const;
