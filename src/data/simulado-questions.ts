import type { Question } from "@/types/question";
/** Banco traditional final (585 questões) — fonte principal do Simulado e Estudo */
import traditionalFinal from "@/data/questions_traditional_FINAL.json";

function normalizeSimuladoPool(raw: Question[]): Question[] {
  return raw.map((q, index) => ({
    ...q,
    id: typeof q.id === "number" ? q.id : index + 1,
    question_type: "traditional" as const,
    isPremium: q.isPremium ?? true,
    enunciado: q.enunciado ?? "",
    alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
    resposta_correta:
      typeof q.resposta_correta === "number" ? q.resposta_correta : 0,
    explicacao_profunda: q.explicacao_profunda ?? "",
  }));
}

/**
 * Pool principal do Modo Simulado e filtros de Estudo.
 */
export const simuladoQuestions: Question[] = normalizeSimuladoPool(
  traditionalFinal as Question[]
);

/** Alias de compatibilidade (mesmo pool) */
export const simuladoQuestionsBulk: Question[] = simuladoQuestions;

export const TOTAL_SIMULADO_QUESTIONS = simuladoQuestions.length;

export const SIMULADO_COUNTS = [20, 40, 60] as const;
export type SimuladoCountOption = (typeof SIMULADO_COUNTS)[number] | "all";

/** Fisher–Yates shuffle (cópia) */
export function shuffleQuestions<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickSimuladoQuestions(
  count: SimuladoCountOption
): Question[] {
  const pool = shuffleQuestions(simuladoQuestions);
  if (count === "all") return pool;
  return pool.slice(0, Math.min(count, pool.length));
}

/** Minutos sugeridos de timer por quantidade */
export function getSimuladoTimerMinutes(
  count: number,
  totalAvailable: number
): number {
  if (count >= totalAvailable) {
    return Math.max(30, Math.round(count * 1.5));
  }
  if (count <= 20) return 30;
  if (count <= 40) return 60;
  if (count <= 60) return 90;
  return Math.round(count * 1.5);
}
