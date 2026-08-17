/**
 * Manifest do Módulo 5.0 — Security Fundamentals (CCNA 200-301).
 */

import part51 from "@/data/parts/part-5.1-content.json";
import part52 from "@/data/parts/part-5.2-content.json";
import part53 from "@/data/parts/part-5.3-content.json";
import part54 from "@/data/parts/part-5.4-content.json";
import part55 from "@/data/parts/part-5.5-content.json";

export const MODULE_5_ID = "5.0";
export const MODULE_5_TITLE = "Fundamentos de Segurança";
export const MODULE_5_WEIGHT = 15;

export interface Module5PartContent {
  part_id: string;
  title: string;
  blueprint_module: string;
  weight_percent: number;
  topic_list: string[];
}

export interface Module5PartManifest {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  content: Module5PartContent;
  questionCount: number;
  ticketCount: number;
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  description: string;
}

const ACCENTS = ["rose", "violet", "gold", "cyan", "blue"] as const;

const COUNTS: Record<string, { questions: number; tickets: number }> = {
  "5.1": { questions: 30, tickets: 5 },
  "5.2": { questions: 30, tickets: 5 },
  "5.3": { questions: 30, tickets: 5 },
  "5.4": { questions: 30, tickets: 5 },
  "5.5": { questions: 30, tickets: 5 },
};

const RAW = [
  part51,
  part52,
  part53,
  part54,
  part55,
] as Module5PartContent[];

function shortDescription(topics: string[]): string {
  return topics.slice(0, 3).join(" · ") + (topics.length > 3 ? "…" : "");
}

export const MODULE_5_PARTS: Module5PartManifest[] = RAW.map((content, i) => {
  const counts = COUNTS[content.part_id] ?? { questions: 0, tickets: 0 };
  return {
    part_id: content.part_id,
    title: content.title,
    weight_percent: content.weight_percent ?? 3,
    topic_list: content.topic_list ?? [],
    content,
    questionCount: counts.questions,
    ticketCount: counts.tickets,
    accent: ACCENTS[i % ACCENTS.length],
    description: shortDescription(content.topic_list ?? []),
  };
});

export function getModule5Part(
  partId: string
): Module5PartManifest | undefined {
  return MODULE_5_PARTS.find((p) => p.part_id === partId);
}
