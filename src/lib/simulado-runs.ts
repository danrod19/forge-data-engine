import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { TrackId } from "@/lib/track-context";

export type SimuladoRunTrack = "ccna_v1" | "ccna_v2" | "aws";

export type SimuladoRunRow = {
  id: string;
  created_at: string;
  track: SimuladoRunTrack;
  total: number;
  acertos: number;
  percentual: number;
  duration_seconds: number | null;
};

export const SIMULADO_RUN_TRACK_LABEL: Record<SimuladoRunTrack, string> = {
  ccna_v1: "CCNA V1",
  ccna_v2: "CCNA V2",
  aws: "AWS SAA",
};

export function trackIdToRunTrack(track: TrackId): SimuladoRunTrack {
  if (track === "ccna-v2") return "ccna_v2";
  if (track === "aws") return "aws";
  return "ccna_v1";
}

export async function saveSimuladoRun(input: {
  userId: string;
  track: TrackId;
  total: number;
  acertos: number;
  durationSeconds: number | null;
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) return { error: null };
  if (input.total <= 0) return { error: null };

  const acertos = Math.min(Math.max(0, input.acertos), input.total);
  const percentual = Math.round((acertos / input.total) * 100);

  const { error } = await supabase.from("simulado_runs").insert({
    user_id: input.userId,
    track: trackIdToRunTrack(input.track),
    total: input.total,
    acertos,
    percentual,
    duration_seconds: input.durationSeconds,
  });

  if (error) {
    console.warn("[simulado] hist insert failed:", error.message);
    return { error: error.message };
  }
  return { error: null };
}

export async function listSimuladoRuns(
  limit = 20
): Promise<{ rows: SimuladoRunRow[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: null };
  }

  const { data, error } = await supabase
    .from("simulado_runs")
    .select("id, created_at, track, total, acertos, percentual, duration_seconds")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("[simulado] hist select failed:", error.message);
    return { rows: [], error: error.message };
  }

  return { rows: (data ?? []) as SimuladoRunRow[], error: null };
}
