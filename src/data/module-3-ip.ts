/**
 * Manifest do Módulo 3.0 — IP Connectivity (CCNA 200-301).
 */

import part31 from "@/data/parts/part-3.1-content.json";
import part32 from "@/data/parts/part-3.2-content.json";
import part33 from "@/data/parts/part-3.3-content.json";
import part34 from "@/data/parts/part-3.4-content.json";
import part35 from "@/data/parts/part-3.5-content.json";

export const MODULE_3_ID = "3.0";
export const MODULE_3_TITLE = "Conectividade IP";
export const MODULE_3_WEIGHT = 25;

export interface Module3PartContent {
  part_id: string;
  title: string;
  blueprint_module: string;
  weight_percent: number;
  topic_list: string[];
}

export interface Module3PartManifest {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  content: Module3PartContent;
  questionCount: number;
  ticketCount: number;
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  description: string;
}

const ACCENTS = ["gold", "cyan", "violet", "blue", "rose"] as const;

const COUNTS: Record<string, { questions: number; tickets: number }> = {
  "3.1": { questions: 30, tickets: 5 },
  "3.2": { questions: 30, tickets: 5 },
  "3.3": { questions: 30, tickets: 5 },
  "3.4": { questions: 30, tickets: 5 },
  "3.5": { questions: 30, tickets: 5 },
};

const RAW = [
  part31,
  part32,
  part33,
  part34,
  part35,
] as Module3PartContent[];

function shortDescription(topics: string[]): string {
  return topics.slice(0, 3).join(" · ") + (topics.length > 3 ? "…" : "");
}

export const MODULE_3_PARTS: Module3PartManifest[] = RAW.map((content, i) => {
  const counts = COUNTS[content.part_id] ?? { questions: 0, tickets: 0 };
  return {
    part_id: content.part_id,
    title: content.title,
    weight_percent: content.weight_percent ?? 5,
    topic_list: content.topic_list ?? [],
    content,
    questionCount: counts.questions,
    ticketCount: counts.tickets,
    accent: ACCENTS[i % ACCENTS.length],
    description: shortDescription(content.topic_list ?? []),
  };
});

export function getModule3Part(
  partId: string
): Module3PartManifest | undefined {
  return MODULE_3_PARTS.find((p) => p.part_id === partId);
}
