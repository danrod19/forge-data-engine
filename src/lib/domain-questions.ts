import type { Question } from "@/types/question";
import { getQuestionPrompt } from "@/types/question";
import type { CcnaDomain, DomainId } from "@/data/domains";
import { CCNA_DOMAINS } from "@/data/domains";
import {
  simuladoQuestions,
  shuffleQuestions,
} from "@/data/simulado-questions";

/**
 * Filtra questões do banco por keywords do domínio.
 * Matching simples case-insensitive no enunciado + alternativas.
 * Pool padrão: simuladoQuestions (v2 primary).
 */
export function filterQuestionsByDomain(
  domain: CcnaDomain,
  pool: Question[] = simuladoQuestions
): Question[] {
  const keywords = domain.keywords.map((k) => k.toLowerCase());
  return pool.filter((q) => {
    const hay = [
      getQuestionPrompt(q),
      ...(q.alternativas ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return keywords.some((kw) => hay.includes(kw));
  });
}

export function countQuestionsByDomain(domainId: DomainId): number {
  const domain = CCNA_DOMAINS.find((d) => d.id === domainId);
  if (!domain) return 0;
  return filterQuestionsByDomain(domain).length;
}

export function pickDomainPracticeQuestions(
  domainId: DomainId,
  count = 15
): Question[] {
  const domain = CCNA_DOMAINS.find((d) => d.id === domainId);
  if (!domain) return [];
  const matched = filterQuestionsByDomain(domain);
  return shuffleQuestions(matched).slice(0, Math.min(count, matched.length));
}
