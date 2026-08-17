/**
 * Banco traditional do Módulo 5.0 (Security — partes 5.1–5.5).
 */

import type { Question } from "@/types/question";
import raw from "@/data/questions_module5_traditional.json";

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
    source: "module5" as const,
  }));
}

export const module5TraditionalQuestions: Question[] = normalize(
  raw as Question[]
);

export function getModule5TraditionalByPart(partId: string): Question[] {
  return module5TraditionalQuestions.filter((q) => q.part_id === partId);
}

export const module5TraditionalCounts = {
  total: module5TraditionalQuestions.length,
  byPart: module5TraditionalQuestions.reduce<Record<string, number>>(
    (acc, q) => {
      const k = q.part_id ?? "unknown";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    },
    {}
  ),
  free: module5TraditionalQuestions.filter((q) => !q.isPremium).length,
  pro: module5TraditionalQuestions.filter((q) => q.isPremium).length,
} as const;
