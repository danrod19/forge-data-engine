import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { TRACK_META, type TrackId } from "@/lib/track-context";
import type {
  InsertSimuladoAttemptInput,
  SimuladoAttemptRow,
  SimuladoAttemptTrack,
} from "@/types/simulado-attempt";

const TABLE = "simulado_attempts";

const ATTEMPT_TRACKS: readonly SimuladoAttemptTrack[] = [
  "ccna1",
  "ccna2",
  "aws",
];

export function isSimuladoAttemptTrack(
  value: string
): value is SimuladoAttemptTrack {
  return (ATTEMPT_TRACKS as readonly string[]).includes(value);
}

/** App `ccna-v1` → banco `ccna1`. Sem quarto track. */
export function trackIdToAttemptTrack(track: TrackId): SimuladoAttemptTrack {
  if (track === "ccna-v2") return "ccna2";
  if (track === "aws") return "aws";
  return "ccna1";
}

export function attemptTrackToTrackId(
  track: SimuladoAttemptTrack
): TrackId {
  if (track === "ccna2") return "ccna-v2";
  if (track === "aws") return "aws";
  return "ccna-v1";
}

/** Rótulo da TopBar (shortLabel mobile): CCNA1 · CCNA2 · AWS */
export function attemptTrackLabel(track: SimuladoAttemptTrack): string {
  return TRACK_META[attemptTrackToTrackId(track)].shortLabel;
}

export function roundAttemptPercent(
  acertos: number,
  nQuestoes: number
): number {
  if (nQuestoes <= 0) return 0;
  return Math.round((acertos * 10000) / nQuestoes) / 100;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseAttemptRow(raw: unknown): SimuladoAttemptRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id : "";
  const userId = typeof row.user_id === "string" ? row.user_id : "";
  const track = typeof row.track === "string" ? row.track : "";
  const nQuestoes = asFiniteNumber(row.n_questoes);
  const acertos = asFiniteNumber(row.acertos);
  const percentual = asFiniteNumber(row.percentual);
  const createdAt =
    typeof row.created_at === "string" ? row.created_at : "";
  if (
    !id ||
    !userId ||
    !isSimuladoAttemptTrack(track) ||
    nQuestoes === null ||
    nQuestoes <= 0 ||
    acertos === null ||
    percentual === null ||
    !createdAt
  ) {
    return null;
  }
  const durationRaw = row.duration_seconds;
  let durationSeconds: number | null = null;
  if (durationRaw !== null && durationRaw !== undefined) {
    durationSeconds = asFiniteNumber(durationRaw);
    if (durationSeconds === null) return null;
  }
  return {
    id,
    user_id: userId,
    track,
    n_questoes: nQuestoes,
    acertos,
    percentual,
    duration_seconds: durationSeconds,
    created_at: createdAt,
  };
}

/**
 * Grava uma tentativa. Sem session.user.id → skip silencioso.
 * Falha de rede não lança — o resultado do simulado já foi mostrado.
 */
export async function insertAttempt(
  input: InsertSimuladoAttemptInput
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    console.debug("[simulado] skip history: supabase not configured");
    return { error: null };
  }

  const { data: sessionData } = await supabase.auth.getUser();
  const sessionUserId = sessionData.user?.id;
  if (!sessionUserId) {
    console.debug("[simulado] skip history: no session.user.id");
    return { error: null };
  }
  if (!input.userId || input.userId !== sessionUserId) {
    console.debug("[simulado] skip history: user.id mismatch or empty");
    return { error: null };
  }
  if (input.nQuestoes <= 0) {
    console.debug("[simulado] skip history: n_questoes <= 0");
    return { error: null };
  }

  const acertos = Math.min(Math.max(0, input.acertos), input.nQuestoes);
  const durationSeconds =
    input.durationSeconds === null
      ? null
      : Math.max(0, Math.floor(input.durationSeconds));

  const { error } = await supabase.from(TABLE).insert({
    user_id: sessionUserId,
    track: input.track,
    n_questoes: input.nQuestoes,
    acertos,
    duration_seconds: durationSeconds,
  });

  if (error) {
    console.debug("[simulado] history insert failed:", error.message);
    return { error: error.message };
  }
  return { error: null };
}

export async function listAttempts(
  limit = 10
): Promise<{ rows: SimuladoAttemptRow[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: null };
  }

  const take = Math.min(Math.max(1, limit), 50);
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "id, user_id, track, n_questoes, acertos, percentual, duration_seconds, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(take);

  if (error) {
    console.debug("[simulado] history select failed:", error.message);
    return { rows: [], error: error.message };
  }

  const rows: SimuladoAttemptRow[] = [];
  for (const item of data ?? []) {
    const parsed = parseAttemptRow(item);
    if (parsed) rows.push(parsed);
  }
  return { rows, error: null };
}
