/**
 * Banco traditional do Módulo 1.0 (partes 1.1–1.6 + drill IPv4).
 */

import type { Question } from "@/types/question";
import { isDrillQuestion } from "@/types/question";

import q11 from "@/data/parts/part-1.1-questions.json";
import q12 from "@/data/parts/part-1.2-questions.json";
import q13 from "@/data/parts/part-1.3-questions.json";
import q14 from "@/data/parts/part-1.4-questions.json";
import q14Drill from "@/data/parts/part-1.4-drill-questions.json";
import q15 from "@/data/parts/part-1.5-questions.json";
import q16 from "@/data/parts/part-1.6-questions.json";

type RawTraditional = {
  id?: number;
  question_type?: string;
  isPremium?: boolean;
  enunciado?: string;
  alternativas?: string[];
  resposta_correta?: number;
  explicacao_profunda?: string;
  part_id?: string;
};

function validateAndNormalize(
  raw: RawTraditional,
  globalId: number
): Question | null {
  const alternativas = Array.isArray(raw.alternativas) ? raw.alternativas : [];
  if (alternativas.length !== 4) return null;
  if (alternativas.some((a) => !a || !String(a).trim())) return null;
  const rc = raw.resposta_correta;
  if (typeof rc !== "number" || rc < 0 || rc > 3) return null;

  return {
    id: globalId,
    question_type: "traditional",
    isPremium: raw.isPremium ?? true,
    enunciado: raw.enunciado ?? "",
    alternativas,
    resposta_correta: rc,
    explicacao_profunda: raw.explicacao_profunda ?? "",
    part_id: raw.part_id,
    source: "module1",
  };
}

function concatBanks(banks: RawTraditional[][]): Question[] {
  const out: Question[] = [];
  let nextId = 1;
  for (const bank of banks) {
    for (const item of bank) {
      const q = validateAndNormalize(item, nextId);
      if (!q) continue;
      out.push(q);
      nextId += 1;
    }
  }
  return out;
}

/** Ordem estável: 1.1 → … → 1.6 → drill */
const ALL_WITH_DRILL = concatBanks([
  q11 as RawTraditional[],
  q12 as RawTraditional[],
  q13 as RawTraditional[],
  q14 as RawTraditional[],
  q15 as RawTraditional[],
  q16 as RawTraditional[],
  q14Drill as RawTraditional[],
]);

/** Pool principal (simulado/estudo por part) — sem drill */
export const module1TraditionalQuestions: Question[] = ALL_WITH_DRILL.filter(
  (q) => !isDrillQuestion(q)
);

/** Apenas drill de subnetting (part_id 1.4-drill) */
export const module1DrillQuestions: Question[] = ALL_WITH_DRILL.filter(
  isDrillQuestion
);

/** Todas incluindo drill (referência) */
export const module1TraditionalIncludingDrill: Question[] = ALL_WITH_DRILL;

export function getTraditionalByPart(partId: string): Question[] {
  if (partId === "1.4-drill") return module1DrillQuestions;
  return module1TraditionalQuestions.filter((q) => q.part_id === partId);
}

function countByPart(pool: Question[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const q of pool) {
    const key = q.part_id ?? "unknown";
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}

const free = module1TraditionalQuestions.filter((q) => !q.isPremium).length;
const pro = module1TraditionalQuestions.filter((q) => q.isPremium).length;

export const module1TraditionalCounts = {
  total: module1TraditionalQuestions.length,
  totalWithDrill: ALL_WITH_DRILL.length,
  byPart: countByPart(ALL_WITH_DRILL),
  free,
  pro,
  drill: module1DrillQuestions.length,
} as const;
