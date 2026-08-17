"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TrackId = "ccna-v1" | "ccna-v2" | "aws";

export type TrackMeta = {
  id: TrackId;
  label: string;
  shortLabel: string;
  examCode: string;
  color: string;
  description: string;
};

export const TRACK_STORAGE_KEY = "ccna-forge-active-track";

export const TRACK_META: Record<TrackId, TrackMeta> = {
  "ccna-v1": {
    id: "ccna-v1",
    label: "CCNA V1",
    shortLabel: "CCNA1",
    examCode: "200-301",
    color: "cyan",
    description: "CCNA clássico · módulos 1–6",
  },
  "ccna-v2": {
    id: "ccna-v2",
    label: "CCNA V2",
    shortLabel: "CCNA2",
    examCode: "200-301 v2.0",
    color: "green",
    description: "Posture troubleshooting · v2.0",
  },
  aws: {
    id: "aws",
    label: "AWS SAA",
    shortLabel: "AWS",
    examCode: "SAA-C03",
    color: "amber",
    description: "Foundations piloto 1.1–1.12",
  },
};

export const TRACK_ORDER: TrackId[] = ["ccna-v1", "ccna-v2", "aws"];

export function getTrackMeta(track: TrackId): TrackMeta {
  return TRACK_META[track] ?? TRACK_META["ccna-v1"];
}

export function isTrackId(value: unknown): value is TrackId {
  return value === "ccna-v1" || value === "ccna-v2" || value === "aws";
}

/** Chaves de progresso / vidas namespaced por track */
export function livesStorageKey(track: TrackId): string {
  return `ccna-forge-lives:${track}`;
}

export function streakStorageKey(track: TrackId): string {
  return `ccna-forge-streak:${track}`;
}

export function estudoProgressStorageKey(track: TrackId): string {
  return `ccna-forge-estudo-progress:${track}`;
}

type TrackContextValue = {
  track: TrackId;
  meta: TrackMeta;
  setTrack: (track: TrackId) => void;
  /** true após hidratar localStorage no client */
  trackReady: boolean;
};

const TrackContext = createContext<TrackContextValue | null>(null);

export function TrackProvider({ children }: { children: ReactNode }) {
  const [track, setTrackState] = useState<TrackId>("ccna-v1");
  const [trackReady, setTrackReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TRACK_STORAGE_KEY);
      if (isTrackId(raw)) {
        setTrackState(raw);
      }
    } catch {
      /* ignore */
    }
    setTrackReady(true);
  }, []);

  const setTrack = useCallback((next: TrackId) => {
    setTrackState(next);
    try {
      localStorage.setItem(TRACK_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<TrackContextValue>(
    () => ({
      track,
      meta: getTrackMeta(track),
      setTrack,
      trackReady,
    }),
    [track, setTrack, trackReady]
  );

  return (
    <TrackContext.Provider value={value}>{children}</TrackContext.Provider>
  );
}

export function useTrack(): TrackContextValue {
  const ctx = useContext(TrackContext);
  if (!ctx) {
    throw new Error("useTrack must be used within TrackProvider");
  }
  return ctx;
}
