/**
 * Manifest do Módulo 4.0 — IP Services (CCNA 200-301).
 */

import part41 from "@/data/parts/part-4.1-content.json";
import part42 from "@/data/parts/part-4.2-content.json";
import part43 from "@/data/parts/part-4.3-content.json";
import part44 from "@/data/parts/part-4.4-content.json";
import part45 from "@/data/parts/part-4.5-content.json";

export const MODULE_4_ID = "4.0";
export const MODULE_4_TITLE = "Serviços IP";
export const MODULE_4_WEIGHT = 10;

export interface Module4PartContent {
  part_id: string;
  title: string;
  blueprint_module: string;
  weight_percent: number;
  topic_list: string[];
}

export interface Module4PartManifest {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  content: Module4PartContent;
  questionCount: number;
  ticketCount: number;
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  description: string;
}

const ACCENTS = ["blue", "cyan", "violet", "gold", "rose"] as const;

const COUNTS: Record<string, { questions: number; tickets: number }> = {
  "4.1": { questions: 30, tickets: 5 },
  "4.2": { questions: 30, tickets: 5 },
  "4.3": { questions: 30, tickets: 5 },
  "4.4": { questions: 30, tickets: 5 },
  "4.5": { questions: 30, tickets: 5 },
};

const RAW = [
  part41,
  part42,
  part43,
  part44,
  part45,
] as Module4PartContent[];

function shortDescription(topics: string[]): string {
  return topics.slice(0, 3).join(" · ") + (topics.length > 3 ? "…" : "");
}

export const MODULE_4_PARTS: Module4PartManifest[] = RAW.map((content, i) => {
  const counts = COUNTS[content.part_id] ?? { questions: 0, tickets: 0 };
  return {
    part_id: content.part_id,
    title: content.title,
    weight_percent: content.weight_percent ?? 2,
    topic_list: content.topic_list ?? [],
    content,
    questionCount: counts.questions,
    ticketCount: counts.tickets,
    accent: ACCENTS[i % ACCENTS.length],
    description: shortDescription(content.topic_list ?? []),
  };
});

export function getModule4Part(
  partId: string
): Module4PartManifest | undefined {
  return MODULE_4_PARTS.find((p) => p.part_id === partId);
}
