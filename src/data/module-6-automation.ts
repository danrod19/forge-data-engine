/**
 * Manifest do Módulo 6.0 — Automação e Programabilidade (CCNA 200-301).
 */

import part61 from "@/data/parts/part-6.1-content.json";
import part62 from "@/data/parts/part-6.2-content.json";
import part63 from "@/data/parts/part-6.3-content.json";
import part64 from "@/data/parts/part-6.4-content.json";
import part65 from "@/data/parts/part-6.5-content.json";

export const MODULE_6_ID = "6.0";
export const MODULE_6_TITLE = "Automação e Programabilidade";
export const MODULE_6_WEIGHT = 10;

export interface Module6PartContent {
  part_id: string;
  title: string;
  blueprint_module: string;
  weight_percent: number;
  topic_list: string[];
}

export interface Module6PartManifest {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  content: Module6PartContent;
  questionCount: number;
  ticketCount: number;
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  description: string;
}

const ACCENTS = ["violet", "blue", "cyan", "gold", "rose"] as const;

const COUNTS: Record<string, { questions: number; tickets: number }> = {
  "6.1": { questions: 30, tickets: 5 },
  "6.2": { questions: 30, tickets: 5 },
  "6.3": { questions: 30, tickets: 5 },
  "6.4": { questions: 30, tickets: 5 },
  "6.5": { questions: 29, tickets: 5 },
};

const RAW = [
  part61,
  part62,
  part63,
  part64,
  part65,
] as Module6PartContent[];

function shortDescription(topics: string[]): string {
  return topics.slice(0, 3).join(" · ") + (topics.length > 3 ? "…" : "");
}

export const MODULE_6_PARTS: Module6PartManifest[] = RAW.map((content, i) => {
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

export function getModule6Part(
  partId: string
): Module6PartManifest | undefined {
  return MODULE_6_PARTS.find((p) => p.part_id === partId);
}
