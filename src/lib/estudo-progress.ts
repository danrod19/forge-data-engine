/**
 * Progresso real do Modo Estudo — persistido em localStorage.
 * Conta questões únicas acertadas por domínio CCNA.
 */

import type { DomainId } from "@/data/domains";
import { CCNA_DOMAINS } from "@/data/domains";

export const ESTUDO_PROGRESS_KEY = "ccna-forge-estudo-progress";

export interface DomainProgressEntry {
  /** Quantidade de questões únicas já acertadas neste domínio */
  completed: number;
  /** Tamanho do pool de questões do domínio (atualizado a cada sessão) */
  total: number;
  /** ISO 8601 da última prática */
  lastPracticed: string;
  /**
   * IDs únicos acertados (interno — garante completed sem double-count).
   * Opcional na leitura de dados legados.
   */
  masteredIds?: number[];
}

export type EstudoProgressMap = Partial<
  Record<DomainId, DomainProgressEntry>
>;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function emptyEntry(total = 0): DomainProgressEntry {
  return {
    completed: 0,
    total,
    lastPracticed: "",
    masteredIds: [],
  };
}

function normalizeEntry(
  raw: unknown,
  fallbackTotal = 0
): DomainProgressEntry {
  if (!raw || typeof raw !== "object") return emptyEntry(fallbackTotal);
  const o = raw as Record<string, unknown>;
  const masteredIds = Array.isArray(o.masteredIds)
    ? o.masteredIds.filter((id): id is number => typeof id === "number")
    : [];
  const completedFromIds = masteredIds.length;
  const completedRaw =
    typeof o.completed === "number" && o.completed >= 0 ? o.completed : 0;
  const total =
    typeof o.total === "number" && o.total >= 0 ? o.total : fallbackTotal;
  const lastPracticed =
    typeof o.lastPracticed === "string" ? o.lastPracticed : "";

  // Preferir IDs quando existirem; senão usar completed salvo
  const completed =
    masteredIds.length > 0
      ? completedFromIds
      : Math.min(completedRaw, total || completedRaw);

  return {
    completed,
    total,
    lastPracticed,
    masteredIds,
  };
}

/** Lê o mapa completo do localStorage (seguro em SSR). */
export function loadEstudoProgress(): EstudoProgressMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(ESTUDO_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const map: EstudoProgressMap = {};
    for (const domain of CCNA_DOMAINS) {
      const entry = (parsed as Record<string, unknown>)[domain.id];
      if (entry !== undefined) {
        map[domain.id] = normalizeEntry(entry);
      }
    }
    return map;
  } catch {
    return {};
  }
}

/** Persiste o mapa completo. */
export function saveEstudoProgress(map: EstudoProgressMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ESTUDO_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    // quota / private mode — ignora silenciosamente
  }
}

/** Entrada de um domínio (sempre definida). */
export function getDomainProgress(
  map: EstudoProgressMap,
  domainId: DomainId,
  poolTotal?: number
): DomainProgressEntry {
  const entry = map[domainId] ?? emptyEntry(poolTotal ?? 0);
  if (poolTotal !== undefined && poolTotal >= 0) {
    return {
      ...entry,
      total: poolTotal,
      // completed não pode ultrapassar o pool atual
      completed: Math.min(entry.completed, poolTotal || entry.completed),
    };
  }
  return entry;
}

/** Percentual 0–100 para o domínio. */
export function getDomainProgressPercent(entry: DomainProgressEntry): number {
  const total = entry.total;
  if (!total || total <= 0) {
    // Sem pool conhecido: se há completed, não inventar 100%
    return 0;
  }
  return Math.min(100, Math.round((entry.completed / total) * 100));
}

/** Média aritmética do progresso dos 6 domínios (0–100). */
export function getOverallProgressPercent(
  map: EstudoProgressMap,
  poolTotals: Partial<Record<DomainId, number>>
): number {
  if (CCNA_DOMAINS.length === 0) return 0;
  let sum = 0;
  for (const d of CCNA_DOMAINS) {
    const entry = getDomainProgress(map, d.id, poolTotals[d.id]);
    sum += getDomainProgressPercent(entry);
  }
  return Math.round(sum / CCNA_DOMAINS.length);
}

export interface RecordPracticeInput {
  domainId: DomainId;
  /** IDs das questões acertadas nesta sessão */
  correctQuestionIds: number[];
  /** Tamanho atual do pool do domínio */
  poolTotal: number;
}

/**
 * Atualiza progresso após uma sessão de prática.
 * Conta apenas IDs únicos acertados (não reconta o mesmo ID).
 */
export function recordDomainPractice(
  map: EstudoProgressMap,
  input: RecordPracticeInput
): EstudoProgressMap {
  const prev = getDomainProgress(map, input.domainId, input.poolTotal);
  const mastered = new Set(prev.masteredIds ?? []);
  for (const id of input.correctQuestionIds) {
    if (typeof id === "number" && Number.isFinite(id)) {
      mastered.add(id);
    }
  }

  const masteredIds = [...mastered];
  const next: DomainProgressEntry = {
    completed: masteredIds.length,
    total: Math.max(0, input.poolTotal),
    lastPracticed: new Date().toISOString(),
    masteredIds,
  };

  const updated: EstudoProgressMap = {
    ...map,
    [input.domainId]: next,
  };
  saveEstudoProgress(updated);
  return updated;
}

/** Formata lastPracticed para UI (pt-BR). */
export function formatLastPracticed(iso: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
