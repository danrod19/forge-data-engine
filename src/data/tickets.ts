import type { Question } from "@/types/question";
import rawUnique from "@/data/tickets_unique.json";
import rawFromBulk from "@/data/tickets_from_bulk.json";
import {
  v2Tickets,
  TOTAL_V2_TICKETS,
  getV2TicketsByPart,
} from "@/data/v2-banks";
import {
  awsTickets,
  awsTraditionalQuestions,
  TOTAL_AWS_TICKETS,
  TOTAL_AWS_TRADITIONAL,
  getAwsTicketsByPart,
} from "@/data/aws-banks";
import {
  module1Tickets,
  MODULE1_TOTAL_TICKETS,
  shuffleArray as m1Shuffle,
} from "@/data/module1-tickets";
import {
  module2Tickets,
  MODULE2_TOTAL_TICKETS,
} from "@/data/module2-tickets";
import {
  module3Tickets,
  MODULE3_TOTAL_TICKETS,
} from "@/data/module3-tickets";
import {
  module4Tickets,
  MODULE4_TOTAL_TICKETS,
} from "@/data/module4-tickets";
import {
  module5Tickets,
  MODULE5_TOTAL_TICKETS,
} from "@/data/module5-tickets";
import {
  module6Tickets,
  MODULE6_TOTAL_TICKETS,
} from "@/data/module6-tickets";
import type { TrackId } from "@/lib/track-context";

/**
 * Fonte primária da Trilha: tickets v2 consolidados.
 * Legacy (unique + bulk) e módulos v1 permanecem como backup/fallback.
 */

/** Normaliza sintoma para dedupe. */
function normalizeSintoma(text: string, max = 160): string {
  return text
    .toLowerCase()
    .replace(/chamado\s*#?\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function asTicket(
  raw: Question,
  source:
    | "legacy"
    | "v2"
    | "aws"
    | "module1"
    | "module2"
    | "module3"
    | "module4"
    | "module5"
    | "module6" = "legacy"
): Question {
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
    part_id: raw.part_id,
    source: raw.source ?? source,
  };
}

function mergeTicketBanks(
  primary: Question[],
  secondary: Question[]
): Question[] {
  const seen = new Set<string>();
  const merged: Question[] = [];

  for (const item of [...primary, ...secondary]) {
    const t = asTicket(item, "legacy");
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

/** Banco legacy completo (volume extra / fallback). */
export const legacyTickets: Question[] = mergeTicketBanks(
  rawUnique as Question[],
  rawFromBulk as Question[]
);

/** Tickets canônicos v2 (Trilha CCNA v2). */
export const v2ModuleTickets: Question[] = v2Tickets.map((t) =>
  asTicket(t, "v2")
);

/**
 * Tickets AWS com CLI (legado / banco preservado em tickets_aws.json).
 * NÃO é mais a fonte principal da Trilha AWS — permanece disponível
 * via getAwsTicketsByPart / awsModuleTickets se precisar no futuro.
 */
export const awsModuleTickets: Question[] = awsTickets.map((t) =>
  asTicket(t, "aws")
);

/**
 * Trilha AWS = cenários de arquitetura (traditional SAA), sem terminal.
 * Fonte: questions_aws_traditional.json via aws-banks.
 */
export const awsTrilhaScenarios: Question[] = awsTraditionalQuestions.map(
  (q, index) => ({
    ...q,
    id: typeof q.id === "number" ? q.id : index + 1,
    question_type: "scenario" as const,
    isPremium: q.isPremium ?? true,
    enunciado: q.enunciado ?? "",
    sintoma: q.sintoma,
    cli_output: undefined,
    alternativas: Array.isArray(q.alternativas) ? q.alternativas : [],
    resposta_correta:
      typeof q.resposta_correta === "number" ? q.resposta_correta : 0,
    explicacao_profunda: q.explicacao_profunda ?? "",
    part_id: q.part_id,
    source: q.source ?? "aws",
  })
);

/**
 * Tickets curados v1 módulos 1–6 — pool da Trilha track `ccna-v1`.
 * Fontes: parts/part-1.1…1.6-tickets.json + tickets_module2…6.json
 * (não usa tickets_all_merged / unique / bulk).
 */
export const curatedModuleTickets: Question[] = (() => {
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const item of [
    ...module1Tickets.map((t) => asTicket(t, "module1")),
    ...module2Tickets.map((t) => asTicket(t, "module2")),
    ...module3Tickets.map((t) => asTicket(t, "module3")),
    ...module4Tickets.map((t) => asTicket(t, "module4")),
    ...module5Tickets.map((t) => asTicket(t, "module5")),
    ...module6Tickets.map((t) => asTicket(t, "module6")),
  ]) {
    const key = normalizeSintoma(item.sintoma ?? "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.map((t, index) => ({ ...t, id: index + 1 }));
})();

/**
 * Merge full: v2 first, then curated v1, then legacy (dedupe).
 */
export const ticketsMerged: Question[] = (() => {
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const item of [
    ...v2ModuleTickets,
    ...curatedModuleTickets,
    ...legacyTickets,
  ]) {
    const t = asTicket(item, item.source ?? "legacy");
    const key = normalizeSintoma(t.sintoma ?? "", 160);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out.map((t, index) => ({ ...t, id: index + 1 }));
})();

/**
 * Banco usado pela Trilha: v2 se existir; senão curated v1; senão legacy.
 */
export const tickets: Question[] =
  v2ModuleTickets.length > 0
    ? v2ModuleTickets
    : curatedModuleTickets.length > 0
      ? curatedModuleTickets
      : legacyTickets;

export const TOTAL_TICKETS = tickets.length;
export const TOTAL_V2_TICKETS_BANK = TOTAL_V2_TICKETS;
/** Banco CLI legado (JSON tickets_aws) — não é o hub da Trilha. */
export const TOTAL_AWS_TICKETS_BANK = TOTAL_AWS_TICKETS;
/** Pool da Trilha AWS (cenários traditional). */
export const TOTAL_AWS_TRILHA_SCENARIOS =
  awsTrilhaScenarios.length || TOTAL_AWS_TRADITIONAL;
export const TOTAL_LEGACY_TICKETS = legacyTickets.length;
export const TOTAL_MODULE1_TICKETS = MODULE1_TOTAL_TICKETS;
export const TOTAL_MODULE2_TICKETS = MODULE2_TOTAL_TICKETS;
export const TOTAL_MODULE3_TICKETS = MODULE3_TOTAL_TICKETS;
export const TOTAL_MODULE4_TICKETS = MODULE4_TOTAL_TICKETS;
export const TOTAL_MODULE5_TICKETS = MODULE5_TOTAL_TICKETS;
export const TOTAL_MODULE6_TICKETS = MODULE6_TOTAL_TICKETS;
export const TOTAL_CURATED_TICKETS =
  v2ModuleTickets.length > 0
    ? v2ModuleTickets.length
    : curatedModuleTickets.length;

/** Quantidade de tickets por sessão da Trilha. */
export const TRILHA_SESSION_SIZE = 10;

export function shuffleArray<T>(items: readonly T[]): T[] {
  return m1Shuffle(items);
}

/**
 * Pool da Trilha por track.
 * - ccna-v1: tickets módulos curados (fallback legacy)
 * - ccna-v2: tickets v2 (troubleshooting + CLI)
 * - aws: cenários traditional SAA (sem CLI) — tickets_aws.json permanece no disco
 */
export function getTicketsPool(track: TrackId): Question[] {
  switch (track) {
    case "aws":
      return awsTrilhaScenarios.length > 0
        ? awsTrilhaScenarios
        : awsModuleTickets;
    case "ccna-v1":
      return curatedModuleTickets.length > 0
        ? curatedModuleTickets
        : legacyTickets;
    case "ccna-v2":
    default:
      return v2ModuleTickets.length > 0
        ? v2ModuleTickets
        : curatedModuleTickets.length > 0
          ? curatedModuleTickets
          : legacyTickets;
  }
}

/**
 * Nova sessão da Trilha a partir do pool do track (default: pool canônico v2).
 */
export function createTrilhaSession(
  size: number = TRILHA_SESSION_SIZE,
  track: TrackId = "ccna-v2"
): Question[] {
  const pool = getTicketsPool(track);
  if (pool.length === 0) return [];
  const n = Math.min(Math.max(1, size), pool.length);
  return shuffleArray(pool).slice(0, n);
}

export function getTicketsByPartId(partId: string): Question[] {
  if (partId.startsWith("v2-")) return getV2TicketsByPart(partId);
  if (partId.startsWith("aws-")) return getAwsTicketsByPart(partId);
  return [];
}

export function trilhaSessionCopy(track: TrackId): {
  title: string;
  subtitle: string;
  bankSize: number;
} {
  const bankSize = getTicketsPool(track).length;
  if (track === "aws") {
    return {
      title: "Cenário · Arquitetura",
      subtitle: `${bankSize} cenários SAA Foundations (sem terminal)`,
      bankSize,
    };
  }
  if (track === "ccna-v1") {
    return {
      title: "Trilha · CCNA V1",
      subtitle: `${bankSize} tickets com sintoma + CLI (módulos 1–6)`,
      bankSize,
    };
  }
  return {
    title: "Trilha · CCNA V2",
    subtitle: `Troubleshooting · v2.0 · ${bankSize} tickets no banco`,
    bankSize,
  };
}

export {
  module1Tickets,
  module2Tickets,
  module3Tickets,
  module4Tickets,
  module5Tickets,
  module6Tickets,
};
