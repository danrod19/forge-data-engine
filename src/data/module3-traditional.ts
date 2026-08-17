/**
 * Banco traditional do Módulo 3.0 (IP Connectivity — partes 3.1–3.5).
 */

import type { Question } from "@/types/question";
import raw from "@/data/questions_module3_traditional.json";

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
    source: "module3" as const,
  }));
}

export const module3TraditionalQuestions: Question[] = normalize(
  raw as Question[]
);

export function getModule3TraditionalByPart(partId: string): Question[] {
  return module3TraditionalQuestions.filter((q) => q.part_id === partId);
}

export const module3TraditionalCounts = {
  total: module3TraditionalQuestions.length,
  byPart: module3TraditionalQuestions.reduce<Record<string, number>>(
    (acc, q) => {
      const k = q.part_id ?? "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {}
  ),
  free: module3TraditionalQuestions.filter((q) => !q.isPremium).length,
  pro: module3TraditionalQuestions.filter((q) => q.isPremium).length,
} as const;
