import type { Question } from "@/types/question";
import rawUnique from "@/data/tickets_unique.json";
import rawFromBulk from "@/data/tickets_from_bulk.json";

/** Normaliza sintoma para dedupe (180 chars). */
function normalizeSintoma(text: string): string {
  return text
    .toLowerCase()
    .replace(/chamado\s*#?\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function asTicket(raw: Question): Question {
  return {
    ...raw,
    question_type: "ticket",
    isPremium: raw.isPremium ?? true,
    sintoma: raw.sintoma ?? "",
    cli_output: raw.cli_output ?? "",
    alternativas: Array.isArray(raw.alternativas) ? raw.alternativas : [],
    resposta_correta:
      typeof raw.resposta_correta === "number" ? raw.resposta_correta : 0,
    explicacao_profunda: raw.explicacao_profunda ?? "",
  };
}

/**
 * Merge tickets_unique (359) + tickets_from_bulk (81),
 * dedupe por sintoma normalizado, reindex 1..N.
 */
function mergeTicketBanks(
  primary: Question[],
  secondary: Question[]
): Question[] {
  const seen = new Set<string>();
  const merged: Question[] = [];

  for (const item of [...primary, ...secondary]) {
    const t = asTicket(item);
    const key = normalizeSintoma(t.sintoma ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(t);
  }

  return merged.map((t, index) => ({
    ...t,
    id: index + 1,
  }));
}

/** Banco completo de Tickets de Suporte / Troubleshooting (CCNA 200-301). */
export const tickets: Question[] = mergeTicketBanks(
  rawUnique as Question[],
  rawFromBulk as Question[]
);

export const TOTAL_TICKETS = tickets.length;

/** Quantidade de tickets por sessão da Trilha (evita sessão eterna). */
export const TRILHA_SESSION_SIZE = 10;

/**
 * Fisher–Yates shuffle (cópia imutável).
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Nova sessão da Trilha: embaralha o banco e pega os primeiros `size` tickets.
 */
export function createTrilhaSession(
  size: number = TRILHA_SESSION_SIZE
): Question[] {
  if (tickets.length === 0) return [];
  const n = Math.min(Math.max(1, size), tickets.length);
  return shuffleArray(tickets).slice(0, n);
}
