/** Track persistido no histórico (espelho canônico do banco). */
export type SimuladoAttemptTrack = "ccna1" | "ccna2" | "aws";

/** Linha de `public.simulado_attempts` (SELECT do próprio user). */
export type SimuladoAttemptRow = {
  id: string;
  user_id: string;
  track: SimuladoAttemptTrack;
  n_questoes: number;
  acertos: number;
  percentual: number;
  duration_seconds: number | null;
  created_at: string;
};

export type InsertSimuladoAttemptInput = {
  userId: string;
  track: SimuladoAttemptTrack;
  nQuestoes: number;
  acertos: number;
  durationSeconds: number | null;
};
