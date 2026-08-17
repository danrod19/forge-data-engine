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
  /** Parte da trilha (ex.: "1.1", "1.4-drill") */
  part_id?: string;
  /** Origem do item quando há merge de bancos */
  source?:
    | "v2"
    | "aws"
    | "module1"
    | "module2"
    | "module3"
    | "module4"
    | "module5"
    | "module6"
    | "legacy";
}

export type NavTab =
  | "home"
  | "trilha"
  | "simulado"
  | "estudo"
  | "sobre"
  | "conta";

/** E-mail de suporte / contato do produto */
export const CONTACT_EMAIL = "ccnaforge19@gmail.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

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

/** Drill de subnetting (cálculo IPv4) — fora do simulado cronometrado padrão */
export function isDrillQuestion(q: Question): boolean {
  return q.part_id === "1.4-drill";
}
