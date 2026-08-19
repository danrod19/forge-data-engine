/**
 * Detecção heurística de idioma de questões (PT / EN / mixed).
 * Não altera bancos — só classifica texto existente.
 */

import type { Question } from "@/types/question";

export type QuestionLang = "pt" | "en" | "mixed";

/** Modo de Simulado: conhecimento (PT) vs prova (EN). */
export type SimuladoLangMode = "pt" | "en";

const PT_WORDS = [
  "qual",
  "quais",
  "quando",
  "onde",
  "como",
  "sobre",
  "rede",
  "redes",
  "configur",
  "endereço",
  "endereco",
  "após",
  "apos",
  "antes",
  "correto",
  "incorreto",
  "alternativa",
  "comando",
  "interface",
  "roteador",
  "comutador",
  "pacote",
  "quadro",
  "camada",
  "protocolo",
  "seguinte",
  "melhor",
  "deve",
  "precisa",
  "falha",
  "sintoma",
  "usuário",
  "usuario",
  "empresa",
  "cenário",
  "cenario",
  "arquitetura",
  "armazenamento",
  "segurança",
  "seguranca",
];

const EN_WORDS = [
  "which",
  "what",
  "when",
  "where",
  "how",
  "following",
  "command",
  "router",
  "switch",
  "address",
  "configure",
  "configuration",
  "correct",
  "incorrect",
  "packet",
  "frame",
  "layer",
  "protocol",
  "should",
  "must",
  "failure",
  "symptom",
  "customer",
  "company",
  "scenario",
  "architecture",
  "storage",
  "security",
  "network",
  "interface",
  "best",
  "describe",
  "based",
  "according",
];

/** Acentos / chars típicos de PT-BR */
const PT_CHAR_RE = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/;

function normalizeText(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function countWordHits(text: string, words: string[]): number {
  let hits = 0;
  for (const w of words) {
    if (text.includes(w)) hits += 1;
  }
  return hits;
}

/**
 * Extrai texto base da questão para classificação.
 */
export function questionLangSourceText(q: Question): string {
  const parts = [
    q.enunciado ?? "",
    q.sintoma ?? "",
    ...(Array.isArray(q.alternativas) ? q.alternativas : []),
  ];
  return normalizeText(parts.join(" "));
}

/**
 * Heurística estável:
 * - Sinais PT: acentuação + palavras PT
 * - Sinais EN: palavras EN
 * - mixed se ambos fortes
 * - default conservador: se só um lado fraco, escolhe o dominante;
 *   se empatados fracos → mixed
 */
export function detectQuestionLang(q: Question): QuestionLang {
  const text = questionLangSourceText(q);
  if (!text) return "mixed";

  const accentBonus = PT_CHAR_RE.test(text) ? 2 : 0;
  const ptHits = countWordHits(text, PT_WORDS) + accentBonus;
  const enHits = countWordHits(text, EN_WORDS);

  const STRONG = 2;

  if (ptHits >= STRONG && enHits >= STRONG) return "mixed";
  if (ptHits > enHits && ptHits >= 1) return "pt";
  if (enHits > ptHits && enHits >= 1) return "en";
  if (ptHits === enHits && ptHits >= 1) return "mixed";

  // Sem sinais claros: acento sozinho → PT; senão mixed (conservador)
  if (accentBonus > 0) return "pt";
  return "mixed";
}

/**
 * Regra de inclusão no modo de Simulado:
 * - Conhecimento (PT): pt + mixed
 * - Prova (EN): en + mixed
 * Mixed entra nos dois modos (útil no estudo e no treino de prova).
 */
export function langMatchesMode(
  lang: QuestionLang,
  mode: SimuladoLangMode
): boolean {
  if (mode === "pt") return lang === "pt" || lang === "mixed";
  return lang === "en" || lang === "mixed";
}

export function filterQuestionsByLangMode(
  pool: Question[],
  mode: SimuladoLangMode
): Question[] {
  return pool.filter((q) => langMatchesMode(detectQuestionLang(q), mode));
}

/** Preferir PT no Estudo; retorna { pool, usedFallbackEn } */
export function preferPtQuestions(pool: Question[]): {
  pool: Question[];
  usedEnglishFallback: boolean;
} {
  const ptOnly = pool.filter((q) => detectQuestionLang(q) === "pt");
  if (ptOnly.length > 0) {
    return { pool: ptOnly, usedEnglishFallback: false };
  }
  const ptAndMixed = pool.filter((q) => {
    const lang = detectQuestionLang(q);
    return lang === "pt" || lang === "mixed";
  });
  if (ptAndMixed.length > 0) {
    return { pool: ptAndMixed, usedEnglishFallback: false };
  }
  return { pool, usedEnglishFallback: pool.length > 0 };
}
