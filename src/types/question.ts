export type QuestionType = "ticket" | "traditional";

export interface Question {
  id: number;
  /** "ticket" = sintoma + CLI; "traditional" = enunciado puro */
  question_type?: QuestionType;
  isPremium: boolean;
  /** Ticket de suporte — sintoma do problema */
  sintoma?: string;
  /** Ticket de suporte — saída do terminal */
  cli_output?: string;
  /** Modo traditional / simulado — enunciado da questão */
  enunciado?: string;
  alternativas: string[];
  /** Índice 0-based da alternativa correta */
  resposta_correta: number;
  /** Vazio ou omitido no modo traditional limpo */
  explicacao_profunda?: string;
}

export type NavTab = "trilha" | "simulado" | "estudo" | "sobre";

/** Prompt principal da questão (enunciado ou sintoma) */
export function getQuestionPrompt(q: Question): string {
  if (q.question_type === "traditional") {
    return q.enunciado ?? q.sintoma ?? "";
  }
  return q.sintoma ?? q.enunciado ?? "";
}

export function isTraditionalQuestion(q: Question): boolean {
  return (
    q.question_type === "traditional" ||
    (!!q.enunciado && !q.sintoma && !q.cli_output)
  );
}

export function hasDeepExplanation(q: Question): boolean {
  return Boolean(q.explicacao_profunda?.trim());
}
