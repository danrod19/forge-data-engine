import type { Question } from "@/types/question";
/** Legacy FINAL (backup — não apagado) */
import traditionalFinal from "@/data/questions_traditional_FINAL.json";
import {
  v2TraditionalQuestions,
  v2Tickets,
  TOTAL_V2_TRADITIONAL,
  TOTAL_V2_TICKETS,
} from "@/data/v2-banks";
import {
  awsTraditionalQuestions,
  TOTAL_AWS_TRADITIONAL,
} from "@/data/aws-banks";
import { module1TraditionalQuestions } from "@/data/module1-traditional";
import { module2TraditionalQuestions } from "@/data/module2-traditional";
import { module3TraditionalQuestions } from "@/data/module3-traditional";
import { module4TraditionalQuestions } from "@/data/module4-traditional";
import { module5TraditionalQuestions } from "@/data/module5-traditional";
import { module6TraditionalQuestions } from "@/data/module6-traditional";
import type { TrackId } from "@/lib/track-context";
import {
  filterQuestionsByLangMode,
  type SimuladoLangMode,
} from "@/lib/question-lang";

/**
 * Fração de tickets (troubleshooting) na sessão do Simulado track ccna-v2.
 * Ajustável 0.25–0.35; só afeta pick/sessão — não reescreve bancos.
 */
export const V2_SIMULADO_TICKET_RATIO = 0.3;

export type { SimuladoLangMode };

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
    part_id: q.part_id,
  }));
}

function mergeByEnunciado(pools: Question[][]): Question[] {
  const seen = new Set<string>();
  const out: Question[] = [];
  for (const pool of pools) {
    for (const q of pool) {
      const key = (q.enunciado ?? "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({
        ...q,
        id: out.length + 1,
        question_type: "traditional",
      });
    }
  }
  return out;
}

/** Pool v2 canônico (CCNA v2.0) */
export const simuladoQuestionsV2: Question[] = v2TraditionalQuestions;

/** Pool AWS SAA foundations */
export const simuladoQuestionsAws: Question[] = awsTraditionalQuestions;

/** Pool legacy FINAL (backup / CCNA clássico volume) */
export const simuladoQuestionsLegacy: Question[] = normalizeSimuladoPool(
  traditionalFinal as Question[]
);

/** Pools v1 por módulo (fallback / seletor legado) */
export const simuladoQuestionsModule1: Question[] = module1TraditionalQuestions;
export const simuladoQuestionsModule2: Question[] = module2TraditionalQuestions;
export const simuladoQuestionsModule3: Question[] = module3TraditionalQuestions;
export const simuladoQuestionsModule4: Question[] = module4TraditionalQuestions;
export const simuladoQuestionsModule5: Question[] = module5TraditionalQuestions;
export const simuladoQuestionsModule6: Question[] = module6TraditionalQuestions;

/** Curado v1 módulos 1–6 (legado) */
export const simuladoQuestionsCurated: Question[] = mergeByEnunciado([
  module1TraditionalQuestions,
  module2TraditionalQuestions,
  module3TraditionalQuestions,
  module4TraditionalQuestions,
  module5TraditionalQuestions,
  module6TraditionalQuestions,
]);

export type SimuladoSource =
  | "v2"
  | "aws"
  | "module1"
  | "module2"
  | "module3"
  | "module4"
  | "module5"
  | "module6"
  | "curated"
  | "legacy";

/**
 * Pool principal padrão do Simulado: banco v2 consolidado.
 * Fallback: curated v1 → legacy FINAL se v2 vazio.
 */
export const simuladoQuestions: Question[] =
  simuladoQuestionsV2.length > 0
    ? simuladoQuestionsV2
    : simuladoQuestionsCurated.length > 0
      ? simuladoQuestionsCurated
      : simuladoQuestionsLegacy;

/** Alias de compatibilidade */
export const simuladoQuestionsBulk: Question[] = simuladoQuestions;

export const TOTAL_SIMULADO_QUESTIONS = simuladoQuestions.length;
export const TOTAL_SIMULADO_V2 = TOTAL_V2_TRADITIONAL;
export const TOTAL_SIMULADO_AWS = TOTAL_AWS_TRADITIONAL;
export const TOTAL_SIMULADO_MODULE1 = simuladoQuestionsModule1.length;
export const TOTAL_SIMULADO_MODULE2 = simuladoQuestionsModule2.length;
export const TOTAL_SIMULADO_MODULE3 = simuladoQuestionsModule3.length;
export const TOTAL_SIMULADO_MODULE4 = simuladoQuestionsModule4.length;
export const TOTAL_SIMULADO_MODULE5 = simuladoQuestionsModule5.length;
export const TOTAL_SIMULADO_MODULE6 = simuladoQuestionsModule6.length;
export const TOTAL_SIMULADO_CURATED = simuladoQuestionsCurated.length;
export const TOTAL_SIMULADO_LEGACY = simuladoQuestionsLegacy.length;

/**
 * Pool traditional por track de certificação (namespace separado).
 * - ccna-v1: curado módulos 1–6 (fallback legacy FINAL)
 * - ccna-v2: banco v2 consolidado
 * - aws: SAA foundations 360Q
 */
export function getSimuladoPoolByTrack(track: TrackId): Question[] {
  switch (track) {
    case "aws":
      return simuladoQuestionsAws.length > 0
        ? simuladoQuestionsAws
        : [];
    case "ccna-v1":
      return simuladoQuestionsCurated.length > 0
        ? simuladoQuestionsCurated
        : simuladoQuestionsLegacy;
    case "ccna-v2":
    default:
      return simuladoQuestionsV2.length > 0
        ? simuladoQuestionsV2
        : simuladoQuestionsCurated.length > 0
          ? simuladoQuestionsCurated
          : simuladoQuestionsLegacy;
  }
}

/** Alias pedido no contrato multi-track */
export function getSimuladoPoolForTrack(track: TrackId): Question[] {
  return getSimuladoPoolByTrack(track);
}

export function defaultSimuladoSourceForTrack(track: TrackId): SimuladoSource {
  if (track === "aws") return "aws";
  if (track === "ccna-v1") return "curated";
  return "v2";
}

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

/**
 * Split estável ~70% traditional / ~30% ticket para sessão V2.
 * Se tickets insuficientes, completa com traditional.
 * Ex.: 20 → 14+6 · 40 → 28+12 · 60 → 42+18
 */
export function computeV2MixCounts(
  sessionSize: number,
  tradAvailable: number,
  ticketAvailable: number,
  ratio: number = V2_SIMULADO_TICKET_RATIO
): { traditional: number; ticket: number } {
  if (sessionSize <= 0) return { traditional: 0, ticket: 0 };

  let ticketTarget = Math.round(sessionSize * ratio);
  let tradTarget = sessionSize - ticketTarget;

  if (ticketTarget > ticketAvailable) {
    ticketTarget = ticketAvailable;
    tradTarget = sessionSize - ticketTarget;
  }
  if (tradTarget > tradAvailable) {
    tradTarget = tradAvailable;
    const remaining = sessionSize - tradTarget;
    ticketTarget = Math.min(ticketAvailable, remaining);
  }
  // Ainda curto? devolve o que couber (nunca inventa itens)
  const total = tradTarget + ticketTarget;
  if (total > sessionSize) {
    // não deve ocorrer; safety
    const overflow = total - sessionSize;
    if (tradTarget >= overflow) tradTarget -= overflow;
    else ticketTarget = Math.max(0, ticketTarget - overflow);
  }

  return {
    traditional: Math.max(0, tradTarget),
    ticket: Math.max(0, ticketTarget),
  };
}

/**
 * Pool traditional (+ tickets só na montagem V2) filtrado por modo de idioma.
 * Regra mixed: pt+mixed no modo Conhecimento; en+mixed no modo Prova.
 */
export function getSimuladoPoolByTrackAndLang(
  track: TrackId,
  lang: SimuladoLangMode
): Question[] {
  return filterQuestionsByLangMode(getSimuladoPoolByTrack(track), lang);
}

/**
 * Sessão Simulado CCNA V2 com bias de posture (~30% tickets).
 * IDs renumerados 1..N (trad e tickets v2 colidem no JSON).
 * Não altera pools de ccna-v1 / aws.
 */
export function pickSimuladoV2MixedSession(
  count: SimuladoCountOption,
  lang: SimuladoLangMode = "pt"
): Question[] {
  const tradPool = shuffleQuestions(
    filterQuestionsByLangMode(v2TraditionalQuestions, lang)
  );
  const ticketPool = shuffleQuestions(
    filterQuestionsByLangMode(v2Tickets, lang)
  );

  let takeTrad: number;
  let takeTickets: number;

  if (count === "all") {
    // Todas: full traditional + tickets até o ideal ~30% da sessão final
    takeTrad = tradPool.length;
    const idealTickets = Math.round(
      (tradPool.length * V2_SIMULADO_TICKET_RATIO) /
        (1 - V2_SIMULADO_TICKET_RATIO)
    );
    takeTickets = Math.min(ticketPool.length, idealTickets);
  } else {
    const sessionSize = Math.min(
      count,
      tradPool.length + ticketPool.length
    );
    const split = computeV2MixCounts(
      sessionSize,
      tradPool.length,
      ticketPool.length,
      V2_SIMULADO_TICKET_RATIO
    );
    takeTrad = split.traditional;
    takeTickets = split.ticket;
  }

  const picked: Question[] = [
    ...tradPool.slice(0, takeTrad).map((q) => ({
      ...q,
      question_type: "traditional" as const,
    })),
    ...ticketPool.slice(0, takeTickets).map((q) => ({
      ...q,
      question_type: "ticket" as const,
    })),
  ];

  // Shuffle final + IDs únicos de sessão (evita colisão trad/ticket)
  return shuffleQuestions(picked).map((q, index) => ({
    ...q,
    id: index + 1,
  }));
}

/** Alias pedido no contrato */
export function createSimuladoSession(
  count: SimuladoCountOption,
  track: TrackId,
  lang: SimuladoLangMode = "pt"
): Question[] {
  return pickSimuladoQuestionsForTrack(count, track, lang);
}

/** Pool por fonte legada (seletor interno do Simulado em tracks CCNA). */
export function getSimuladoPool(source: SimuladoSource = "v2"): Question[] {
  switch (source) {
    case "v2":
      return simuladoQuestionsV2.length > 0
        ? simuladoQuestionsV2
        : simuladoQuestions;
    case "aws":
      return simuladoQuestionsAws;
    case "module1":
      return simuladoQuestionsModule1;
    case "module2":
      return simuladoQuestionsModule2;
    case "module3":
      return simuladoQuestionsModule3;
    case "module4":
      return simuladoQuestionsModule4;
    case "module5":
      return simuladoQuestionsModule5;
    case "module6":
      return simuladoQuestionsModule6;
    case "legacy":
      return simuladoQuestionsLegacy;
    case "curated":
      return simuladoQuestionsCurated.length > 0
        ? simuladoQuestionsCurated
        : simuladoQuestionsLegacy;
    default:
      return simuladoQuestions;
  }
}

/**
 * Pick por fonte legada (seletor interno).
 * source "v2" sem track = pure traditional (sem mix) — o mix só em track ccna-v2.
 */
export function pickSimuladoQuestions(
  count: SimuladoCountOption,
  source: SimuladoSource = "v2",
  lang: SimuladoLangMode = "pt"
): Question[] {
  const pool = shuffleQuestions(
    filterQuestionsByLangMode(getSimuladoPool(source), lang)
  );
  if (count === "all") return pool;
  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Pick por track + idioma.
 * ccna-v2 aplica mix ~30% tickets (posture diagnóstico) no pool já filtrado.
 * ccna-v1 e aws: traditional only.
 */
export function pickSimuladoQuestionsForTrack(
  count: SimuladoCountOption,
  track: TrackId,
  lang: SimuladoLangMode = "pt"
): Question[] {
  if (track === "ccna-v2") {
    return pickSimuladoV2MixedSession(count, lang);
  }
  const pool = shuffleQuestions(getSimuladoPoolByTrackAndLang(track, lang));
  if (count === "all") return pool;
  return pool.slice(0, Math.min(count, pool.length));
}

/** Conta quantos tickets há numa sessão (UX / badge). */
export function countTicketsInSession(session: Question[]): number {
  return session.filter((q) => q.question_type === "ticket").length;
}

export { TOTAL_V2_TICKETS };

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
