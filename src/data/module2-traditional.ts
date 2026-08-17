/**
 * Banco traditional do Módulo 2.0 (Network Access — partes 2.1–2.5).
 */

import type { Question } from "@/types/question";
import raw from "@/data/questions_module2_traditional.json";

function normalize(rawList: Question[]): Question[] {
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
    source: "module2" as const,
  }));
}

export const module2TraditionalQuestions: Question[] = normalize(
  raw as Question[]
);

export function getModule2TraditionalByPart(partId: string): Question[] {
  return module2TraditionalQuestions.filter((q) => q.part_id === partId);
}

export const module2TraditionalCounts = {
  total: module2TraditionalQuestions.length,
  byPart: module2TraditionalQuestions.reduce<Record<string, number>>(
    (acc, q) => {
      const k = q.part_id ?? "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {}
  ),
  free: module2TraditionalQuestions.filter((q) => !q.isPremium).length,
  pro: module2TraditionalQuestions.filter((q) => q.isPremium).length,
} as const;
