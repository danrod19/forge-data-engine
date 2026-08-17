/**
 * Manifest do Módulo 2.0 — Network Access (CCNA 200-301).
 */

import part21 from "@/data/parts/part-2.1-content.json";
import part22 from "@/data/parts/part-2.2-content.json";
import part23 from "@/data/parts/part-2.3-content.json";
import part24 from "@/data/parts/part-2.4-content.json";
import part25 from "@/data/parts/part-2.5-content.json";

export const MODULE_2_ID = "2.0";
export const MODULE_2_TITLE = "Acesso à rede";
export const MODULE_2_WEIGHT = 20;

export interface Module2PartContent {
  part_id: string;
  title: string;
  blueprint_module: string;
  weight_percent: number;
  topic_list: string[];
}

export interface Module2PartManifest {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  content: Module2PartContent;
  questionCount: number;
  ticketCount: number;
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  description: string;
}

const ACCENTS = ["cyan", "blue", "gold", "violet", "rose"] as const;

const COUNTS: Record<string, { questions: number; tickets: number }> = {
  "2.1": { questions: 30, tickets: 5 },
  "2.2": { questions: 30, tickets: 5 },
  "2.3": { questions: 30, tickets: 5 },
  "2.4": { questions: 30, tickets: 5 },
  "2.5": { questions: 30, tickets: 5 },
};

const RAW = [
  part21,
  part22,
  part23,
  part24,
  part25,
] as Module2PartContent[];

function shortDescription(topics: string[]): string {
  return topics.slice(0, 3).join(" · ") + (topics.length > 3 ? "…" : "");
}

export const MODULE_2_PARTS: Module2PartManifest[] = RAW.map((content, i) => {
  const counts = COUNTS[content.part_id] ?? { questions: 0, tickets: 0 };
  return {
    part_id: content.part_id,
    title: content.title,
    weight_percent: content.weight_percent ?? 4,
    topic_list: content.topic_list ?? [],
    content,
    questionCount: counts.questions,
    ticketCount: counts.tickets,
    accent: ACCENTS[i % ACCENTS.length],
    description: shortDescription(content.topic_list ?? []),
  };
});

export function getModule2Part(
  partId: string
): Module2PartManifest | undefined {
  return MODULE_2_PARTS.find((p) => p.part_id === partId);
}
