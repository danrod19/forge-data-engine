/**
 * Banco traditional do Módulo 4.0 (IP Services — partes 4.1–4.5).
 */

import type { Question } from "@/types/question";
import raw from "@/data/questions_module4_traditional.json";

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
    source: "module4" as const,
  }));
}

export const module4TraditionalQuestions: Question[] = normalize(
  raw as Question[]
);

export function getModule4TraditionalByPart(partId: string): Question[] {
  return module4TraditionalQuestions.filter((q) => q.part_id === partId);
}

export const module4TraditionalCounts = {
  total: module4TraditionalQuestions.length,
  byPart: module4TraditionalQuestions.reduce<Record<string, number>>(
    (acc, q) => {
      const k = q.part_id ?? "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {}
  ),
  free: module4TraditionalQuestions.filter((q) => !q.isPremium).length,
  pro: module4TraditionalQuestions.filter((q) => q.isPremium).length,
} as const;
