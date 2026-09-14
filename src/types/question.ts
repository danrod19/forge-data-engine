export type QuestionType = "ticket" | "traditional" | "scenario";

export interface Question {
  id: number;
  /**
   * ticket = sintoma + CLI (Trilha CCNA);
   * traditional = enunciado (Simulado/Estudo);
   * scenario = enunciado de arquitetura (Trilha AWS) — sem terminal obrigatório
   */
  question_type?: QuestionType;
  isPremium: boolean;
  /** Ticket de suporte — sintoma do problema */
  sintoma?: string;
  /** Ticket de suporte — saída do terminal */
  cli_output?: string;
  /** Modo traditional / simulado / cenário — enunciado da questão */
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
  if (
    q.question_type === "traditional" ||
    q.question_type === "scenario"
  ) {
    return q.enunciado ?? q.sintoma ?? "";
  }
  return q.sintoma ?? q.enunciado ?? "";
}

/** Traditional ou cenário de arquitetura (sem CLI obrigatório). */
export function isTraditionalQuestion(q: Question): boolean {
  return (
    q.question_type === "traditional" ||
    q.question_type === "scenario" ||
    (!!q.enunciado && !q.sintoma && !q.cli_output)
  );
}

/** Cenário AWS / enunciado-first na Trilha (não mostra TerminalCLI). */
export function isArchitectureScenario(q: Question): boolean {
  return (
    q.question_type === "scenario" ||
    (q.question_type === "traditional" && !q.cli_output)
  );
}

/** Mostra terminal só em tickets com cli_output. */
export function shouldShowTerminalCli(q: Question): boolean {
  return (
    q.question_type !== "traditional" &&
    q.question_type !== "scenario" &&
    Boolean(q.cli_output?.trim())
  );
}

export function hasDeepExplanation(q: Question): boolean {
  return Boolean(q.explicacao_profunda?.trim());
}

export function getDeepExplanation(q: Question): string {
  return (q.explicacao_profunda ?? "").trim();
}

/**
 * ID numérico do banco. Nunca retorna "#" vazio.
 * Aceita number ou dígitos em string; qualquer outro valor → "".
 */
export function formatBankId(id: number | string | null | undefined): string {
  if (typeof id === "number" && Number.isFinite(id)) {
    return `#${id}`;
  }
  if (typeof id === "string") {
    const t = id.trim();
    if (/^\d+$/.test(t)) return `#${Number(t)}`;
  }
  return "";
}

/** part_id estilo tópico: "v2-2.2", "1.1", "aws-1.3", "1.4-drill". */
export function isTopicPartId(partId: string | undefined | null): boolean {
  if (!partId?.trim()) return false;
  return /^(v2-|aws-)?\d+(\.\d+)*(-[a-z0-9]+)?$/i.test(partId.trim());
}

/** Exibe tópico estável: v2-2.2 → V2-2.2 */
export function formatTopicCode(partId: string | undefined | null): string | null {
  if (!partId || !isTopicPartId(partId)) return null;
  const p = partId.trim();
  if (/^v2-/i.test(p)) return `V2-${p.slice(p.indexOf("-") + 1)}`;
  if (/^aws-/i.test(p)) return `AWS-${p.slice(p.indexOf("-") + 1)}`;
  return p;
}

/**
 * ID visível no header: prefere #id numérico.
 * Se houver código de tópico (V2-2.2), mostra os dois: "V2-2.2 · #184".
 * Nunca "#".
 */
export function formatQuestionId(
  q: Pick<Question, "id" | "part_id">
): string {
  const bank = formatBankId(q.id);
  const topic = formatTopicCode(q.part_id);
  if (topic && bank) return `${topic} · ${bank}`;
  if (bank) return bank;
  if (topic) return topic;
  return "";
}

/** Drill de subnetting (cálculo IPv4) — fora do simulado cronometrado padrão */
export function isDrillQuestion(q: Question): boolean {
  return q.part_id === "1.4-drill";
}
