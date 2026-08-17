/**
 * Bancos canônicos CCNA 200-301 v2.0 (standby consolidado).
 * Fonte: v2/final/* copiado para src/data/.
 */

import type { Question } from "@/types/question";
import rawTraditional from "@/data/questions_v2_traditional.json";
import rawTickets from "@/data/tickets_v2.json";
import rawPartsIndex from "@/data/parts_index_v2.json";

export interface V2PartIndexEntry {
  part_id: string;
  title: string;
  blueprint_module: string;
  blueprint_topics: string[];
  verb: string;
  weight_percent: number;
  questions_count: number;
  tickets_count: number;
  content_path: string;
}

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
    source: q.source ?? "v2",
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
    source: t.source ?? "v2",
  }));
}

/** Traditional v2 (Simulado + Estudo) */
export const v2TraditionalQuestions: Question[] = normalizeTraditional(
  rawTraditional as Question[]
);

/** Tickets v2 (Trilha) */
export const v2Tickets: Question[] = normalizeTickets(rawTickets as Question[]);

/** Índice de parts para o modo Estudo */
export const v2PartsIndex: V2PartIndexEntry[] =
  rawPartsIndex as V2PartIndexEntry[];

export const TOTAL_V2_TRADITIONAL = v2TraditionalQuestions.length;
export const TOTAL_V2_TICKETS = v2Tickets.length;
export const TOTAL_V2_PARTS = v2PartsIndex.length;

export function getV2TraditionalByPart(partId: string): Question[] {
  return v2TraditionalQuestions.filter((q) => q.part_id === partId);
}

export function getV2TicketsByPart(partId: string): Question[] {
  return v2Tickets.filter((t) => t.part_id === partId);
}

export const v2TraditionalFreeCount = v2TraditionalQuestions.filter(
  (q) => !q.isPremium
).length;
export const v2TraditionalProCount = v2TraditionalQuestions.filter(
  (q) => q.isPremium
).length;
