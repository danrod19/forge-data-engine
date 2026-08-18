/**
 * Progresso real do Modo Estudo — persistido em localStorage.
 * Chave Módulo 1: ccna-forge-estudo-m1 (por part_id).
 * Chave legada: ccna-forge-estudo-progress (domínios oficiais) — mantida.
 */

import type { DomainId } from "@/data/domains";
import { CCNA_DOMAINS } from "@/data/domains";
import { MODULE_1_PARTS } from "@/data/module-1-fundamentos";
import { MODULE_2_PARTS } from "@/data/module-2-acesso";
import { MODULE_3_PARTS } from "@/data/module-3-ip";
import { MODULE_4_PARTS } from "@/data/module-4-services";
import { MODULE_5_PARTS } from "@/data/module-5-security";
import { MODULE_6_PARTS } from "@/data/module-6-automation";
import { v2PartsIndex } from "@/data/v2-banks";

export const ESTUDO_PROGRESS_KEY = "ccna-forge-estudo-progress";
/** Progresso do Estudo por partes do Módulo 1.0 */
export const ESTUDO_M1_PROGRESS_KEY = "ccna-forge-estudo-m1";

/** Progresso namespaced por track (multi-cert). */
export type EstudoTrackId = "ccna-v1" | "ccna-v2" | "aws";

export function estudoProgressKeyForTrack(track: EstudoTrackId): string {
  return `ccna-forge-estudo-progress:${track}`;
}

export interface DomainProgressEntry {
  /** Quantidade de questões únicas já acertadas neste domínio/part */
  completed: number;
  /** Tamanho do pool de questões (atualizado a cada sessão) */
  total: number;
  /** ISO 8601 da última prática */
  lastPracticed: string;
  /**
   * IDs únicos acertados (interno — garante completed sem double-count).
   */
  masteredIds?: number[];
  /** Conteúdo didático marcado como lido */
  contentRead?: boolean;
  /** ISO 8601 da última leitura / marcar como lido */
  lastReadAt?: string;
}

export type EstudoProgressMap = Partial<
  Record<DomainId | string, DomainProgressEntry>
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
    contentRead: false,
    lastReadAt: "",
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
  const lastReadAt = typeof o.lastReadAt === "string" ? o.lastReadAt : "";
  const contentRead = o.contentRead === true || Boolean(lastReadAt);

  const completed =
    masteredIds.length > 0
      ? completedFromIds
      : Math.min(completedRaw, total || completedRaw);

  return {
    completed,
    total,
    lastPracticed,
    masteredIds,
    contentRead,
    lastReadAt,
  };
}

function loadProgressFromKey(
  storageKey: string,
  knownIds: string[]
): EstudoProgressMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    const map: EstudoProgressMap = {};
    for (const id of knownIds) {
      const entry = (parsed as Record<string, unknown>)[id];
      if (entry !== undefined) {
        map[id] = normalizeEntry(entry);
      }
    }
    // também carrega ids extras (ex.: 1.4-drill)
    for (const [key, entry] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (map[key] === undefined && entry !== undefined) {
        map[key] = normalizeEntry(entry);
      }
    }
    return map;
  } catch {
    return {};
  }
}

/** Lê o mapa completo do localStorage (domínios legados). */
export function loadEstudoProgress(): EstudoProgressMap {
  return loadProgressFromKey(
    ESTUDO_PROGRESS_KEY,
    CCNA_DOMAINS.map((d) => d.id)
  );
}

/** Progresso do Estudo por part_id (v2 + v1 legados + drill). */
export function loadEstudoM1Progress(): EstudoProgressMap {
  const ids = [
    ...v2PartsIndex.map((p) => p.part_id),
    ...MODULE_1_PARTS.map((p) => p.part_id),
    ...MODULE_2_PARTS.map((p) => p.part_id),
    ...MODULE_3_PARTS.map((p) => p.part_id),
    ...MODULE_4_PARTS.map((p) => p.part_id),
    ...MODULE_5_PARTS.map((p) => p.part_id),
    ...MODULE_6_PARTS.map((p) => p.part_id),
    "1.4-drill",
  ];
  return loadProgressFromKey(ESTUDO_M1_PROGRESS_KEY, ids);
}

/**
 * Progresso namespaced por track — nunca mistura CCNA V1 / V2 / AWS.
 * CCNA: se a chave do track estiver vazia, migra uma vez do progresso M1 legado.
 */
export function loadEstudoProgressForTrack(
  track: EstudoTrackId,
  knownIds: string[]
): EstudoProgressMap {
  const key = estudoProgressKeyForTrack(track);
  const map = loadProgressFromKey(key, knownIds);
  if (Object.keys(map).length > 0) return map;

  // Migração suave só para tracks CCNA a partir da chave module1 legada
  if (track === "ccna-v1" || track === "ccna-v2") {
    const legacy = loadEstudoM1Progress();
    if (Object.keys(legacy).length > 0) {
      saveEstudoProgressForTrack(track, legacy);
      return legacy;
    }
  }
  return {};
}

export function saveEstudoProgressForTrack(
  track: EstudoTrackId,
  map: EstudoProgressMap
): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(estudoProgressKeyForTrack(track), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Persiste o mapa completo (legado). */
export function saveEstudoProgress(map: EstudoProgressMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ESTUDO_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function saveEstudoM1Progress(map: EstudoProgressMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(ESTUDO_M1_PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Entrada de um domínio/part (sempre definida). */
export function getDomainProgress(
  map: EstudoProgressMap,
  domainId: DomainId | string,
  poolTotal?: number
): DomainProgressEntry {
  const entry = map[domainId] ?? emptyEntry(poolTotal ?? 0);
  if (poolTotal !== undefined && poolTotal >= 0) {
    return {
      ...entry,
      total: poolTotal,
      completed: Math.min(entry.completed, poolTotal || entry.completed),
    };
  }
  return entry;
}

/** Percentual 0–100. */
export function getDomainProgressPercent(entry: DomainProgressEntry): number {
  const total = entry.total;
  if (!total || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((entry.completed / total) * 100));
}

/** Média aritmética do progresso (0–100). */
export function getOverallProgressPercent(
  map: EstudoProgressMap,
  poolTotals: Partial<Record<string, number>>,
  ids?: string[]
): number {
  const list =
    ids ??
    (Object.keys(poolTotals).length > 0
      ? Object.keys(poolTotals)
      : CCNA_DOMAINS.map((d) => d.id));
  if (list.length === 0) return 0;
  let sum = 0;
  for (const id of list) {
    const entry = getDomainProgress(map, id, poolTotals[id]);
    sum += getDomainProgressPercent(entry);
  }
  return Math.round(sum / list.length);
}

export interface RecordPracticeInput {
  domainId: DomainId | string;
  correctQuestionIds: number[];
  poolTotal: number;
  /** default: legado ESTUDO_PROGRESS_KEY */
  storage?: "legacy" | "module1" | "track";
  /** Obrigatório quando storage === "track" */
  track?: EstudoTrackId;
}

/**
 * Atualiza progresso após uma sessão de prática.
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

  if (input.storage === "track" && input.track) {
    saveEstudoProgressForTrack(input.track, updated);
  } else if (input.storage === "module1") {
    saveEstudoM1Progress(updated);
    // espelha no namespace do track v2 se possível
    if (input.track) {
      saveEstudoProgressForTrack(input.track, updated);
    }
  } else {
    saveEstudoProgress(updated);
  }
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

/**
 * Marca conteúdo didático como lido (namespaced por track).
 */
export function recordContentRead(
  map: EstudoProgressMap,
  input: {
    domainId: string;
    track: EstudoTrackId;
    poolTotal?: number;
  }
): EstudoProgressMap {
  const prev = getDomainProgress(map, input.domainId, input.poolTotal);
  const next: DomainProgressEntry = {
    ...prev,
    contentRead: true,
    lastReadAt: new Date().toISOString(),
  };
  const updated: EstudoProgressMap = {
    ...map,
    [input.domainId]: next,
  };
  saveEstudoProgressForTrack(input.track, updated);
  return updated;
}
