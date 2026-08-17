/**
 * Manifest do Módulo 1.0 — Network Fundamentals (CCNA 200-301).
 * Conteúdo canônico em @/data/parts (cópias de trilha-content/parts).
 */

import part11Content from "@/data/parts/part-1.1-content.json";
import part12Content from "@/data/parts/part-1.2-content.json";
import part13Content from "@/data/parts/part-1.3-content.json";
import part14Content from "@/data/parts/part-1.4-content.json";
import part15Content from "@/data/parts/part-1.5-content.json";
import part16Content from "@/data/parts/part-1.6-content.json";

export const MODULE_1_ID = "1.0";
export const MODULE_1_TITLE = "Fundamentos de redes";
export const MODULE_1_WEIGHT = 20;

export interface Module1PartContent {
  part_id: string;
  title: string;
  blueprint_module: string;
  weight_percent: number;
  topic_list: string[];
  study_notes?: unknown[];
  key_commands?: string[];
  must_know?: string[];
}

export interface Module1PartManifest {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  content: Module1PartContent;
  questionCount: number;
  ticketCount: number;
  hasDrill?: boolean;
  /** Accent para UI de Estudo */
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  description: string;
}

const ACCENTS = [
  "green",
  "cyan",
  "gold",
  "blue",
  "rose",
  "violet",
] as const;

function shortDescription(topics: string[]): string {
  return topics.slice(0, 3).join(" · ") + (topics.length > 3 ? "…" : "");
}

/** Contagens fixas do material gerado (validadas no banco). */
const COUNTS: Record<
  string,
  { questions: number; tickets: number; hasDrill?: boolean }
> = {
  "1.1": { questions: 30, tickets: 5 },
  "1.2": { questions: 30, tickets: 5 },
  "1.3": { questions: 30, tickets: 5 },
  "1.4": { questions: 30, tickets: 5, hasDrill: true },
  "1.5": { questions: 30, tickets: 5 },
  "1.6": { questions: 30, tickets: 5 },
};

const RAW_CONTENTS: Module1PartContent[] = [
  part11Content as Module1PartContent,
  part12Content as Module1PartContent,
  part13Content as Module1PartContent,
  part14Content as Module1PartContent,
  part15Content as Module1PartContent,
  part16Content as Module1PartContent,
];

export const MODULE_1_PARTS: Module1PartManifest[] = RAW_CONTENTS.map(
  (content, index) => {
    const counts = COUNTS[content.part_id] ?? {
      questions: 0,
      tickets: 0,
    };
    return {
      part_id: content.part_id,
      title: content.title,
      weight_percent: content.weight_percent ?? MODULE_1_WEIGHT,
      topic_list: content.topic_list ?? [],
      content,
      questionCount: counts.questions,
      ticketCount: counts.tickets,
      hasDrill: counts.hasDrill ?? false,
      accent: ACCENTS[index % ACCENTS.length],
      description: shortDescription(content.topic_list ?? []),
    };
  }
);

export function getModule1Part(
  partId: string
): Module1PartManifest | undefined {
  return MODULE_1_PARTS.find((p) => p.part_id === partId);
}

export const MODULE_1_PART_IDS = MODULE_1_PARTS.map((p) => p.part_id);
