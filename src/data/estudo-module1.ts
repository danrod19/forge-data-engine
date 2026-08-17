/**
 * Estudo por partes — Módulos 1.0–6.0.
 */

import type { Question } from "@/types/question";
import {
  MODULE_1_PARTS,
  MODULE_1_ID,
  MODULE_1_TITLE,
  MODULE_1_WEIGHT,
  type Module1PartManifest,
} from "@/data/module-1-fundamentos";
import {
  MODULE_2_PARTS,
  MODULE_2_ID,
  MODULE_2_TITLE,
  MODULE_2_WEIGHT,
  type Module2PartManifest,
} from "@/data/module-2-acesso";
import {
  MODULE_3_PARTS,
  MODULE_3_ID,
  MODULE_3_TITLE,
  MODULE_3_WEIGHT,
  type Module3PartManifest,
} from "@/data/module-3-ip";
import {
  MODULE_4_PARTS,
  MODULE_4_ID,
  MODULE_4_TITLE,
  MODULE_4_WEIGHT,
  type Module4PartManifest,
} from "@/data/module-4-services";
import {
  MODULE_5_PARTS,
  MODULE_5_ID,
  MODULE_5_TITLE,
  MODULE_5_WEIGHT,
  type Module5PartManifest,
} from "@/data/module-5-security";
import {
  MODULE_6_PARTS,
  MODULE_6_ID,
  MODULE_6_TITLE,
  MODULE_6_WEIGHT,
  type Module6PartManifest,
} from "@/data/module-6-automation";
import {
  getTraditionalByPart,
  module1DrillQuestions,
  module1TraditionalQuestions,
} from "@/data/module1-traditional";
import {
  getModule2TraditionalByPart,
  module2TraditionalQuestions,
} from "@/data/module2-traditional";
import {
  getModule3TraditionalByPart,
  module3TraditionalQuestions,
} from "@/data/module3-traditional";
import {
  getModule4TraditionalByPart,
  module4TraditionalQuestions,
} from "@/data/module4-traditional";
import {
  getModule5TraditionalByPart,
  module5TraditionalQuestions,
} from "@/data/module5-traditional";
import {
  getModule6TraditionalByPart,
  module6TraditionalQuestions,
} from "@/data/module6-traditional";
import { getTicketsByPart } from "@/data/module1-tickets";
import { getModule2TicketsByPart } from "@/data/module2-tickets";
import { getModule3TicketsByPart } from "@/data/module3-tickets";
import { getModule4TicketsByPart } from "@/data/module4-tickets";
import { getModule5TicketsByPart } from "@/data/module5-tickets";
import { getModule6TicketsByPart } from "@/data/module6-tickets";
import {
  v2PartsIndex,
  getV2TraditionalByPart,
  getV2TicketsByPart,
  TOTAL_V2_TRADITIONAL,
  type V2PartIndexEntry,
} from "@/data/v2-banks";
import { shuffleQuestions } from "@/data/simulado-questions";
import { domainAccentClasses } from "@/data/domains";

const V2_ACCENTS = [
  "green",
  "cyan",
  "gold",
  "blue",
  "rose",
  "violet",
] as const;

export type V2StudyPartManifest = {
  part_id: string;
  title: string;
  weight_percent: number;
  topic_list: string[];
  questionCount: number;
  ticketCount: number;
  accent: (typeof V2_ACCENTS)[number];
  description: string;
  verb: string;
  blueprint_module: string;
  blueprint_topics: string[];
};

function buildV2StudyParts(entries: V2PartIndexEntry[]): V2StudyPartManifest[] {
  return entries.map((e, i) => ({
    part_id: e.part_id,
    title: e.title,
    weight_percent: e.weight_percent ?? 0,
    topic_list:
      e.blueprint_topics?.length > 0
        ? e.blueprint_topics.map((t) => `Blueprint ${t}`)
        : [`Módulo ${e.blueprint_module}`],
    questionCount: e.questions_count,
    ticketCount: e.tickets_count,
    accent: V2_ACCENTS[i % V2_ACCENTS.length],
    description: `${e.verb} · módulo ${e.blueprint_module} · ${e.questions_count} questões · ${e.tickets_count} tickets`,
    verb: e.verb,
    blueprint_module: e.blueprint_module,
    blueprint_topics: e.blueprint_topics ?? [],
  }));
}

/** Parts canônicas v2 (Estudo primary) */
export const V2_STUDY_PARTS: V2StudyPartManifest[] =
  buildV2StudyParts(v2PartsIndex);

export const V2_STUDY_TOTAL = TOTAL_V2_TRADITIONAL;

export {
  MODULE_1_ID,
  MODULE_1_TITLE,
  MODULE_1_WEIGHT,
  MODULE_1_PARTS,
  MODULE_2_ID,
  MODULE_2_TITLE,
  MODULE_2_WEIGHT,
  MODULE_2_PARTS,
  MODULE_3_ID,
  MODULE_3_TITLE,
  MODULE_3_WEIGHT,
  MODULE_3_PARTS,
  MODULE_4_ID,
  MODULE_4_TITLE,
  MODULE_4_WEIGHT,
  MODULE_4_PARTS,
  MODULE_5_ID,
  MODULE_5_TITLE,
  MODULE_5_WEIGHT,
  MODULE_5_PARTS,
  MODULE_6_ID,
  MODULE_6_TITLE,
  MODULE_6_WEIGHT,
  MODULE_6_PARTS,
};
export type {
  Module1PartManifest,
  Module2PartManifest,
  Module3PartManifest,
  Module4PartManifest,
  Module5PartManifest,
  Module6PartManifest,
};

export type StudyPartManifest =
  | V2StudyPartManifest
  | Module1PartManifest
  | Module2PartManifest
  | Module3PartManifest
  | Module4PartManifest
  | Module5PartManifest
  | Module6PartManifest;

export function getPartQuestions(partId: string): Question[] {
  if (partId.startsWith("v2-")) {
    return getV2TraditionalByPart(partId);
  }
  if (partId.startsWith("6.")) {
    return getModule6TraditionalByPart(partId);
  }
  if (partId.startsWith("5.")) {
    return getModule5TraditionalByPart(partId);
  }
  if (partId.startsWith("4.")) {
    return getModule4TraditionalByPart(partId);
  }
  if (partId.startsWith("3.")) {
    return getModule3TraditionalByPart(partId);
  }
  if (partId.startsWith("2.")) {
    return getModule2TraditionalByPart(partId);
  }
  return getTraditionalByPart(partId);
}

export function getPartTickets(partId: string): Question[] {
  if (partId.startsWith("v2-")) {
    return getV2TicketsByPart(partId);
  }
  if (partId.startsWith("6.")) {
    return getModule6TicketsByPart(partId);
  }
  if (partId.startsWith("5.")) {
    return getModule5TicketsByPart(partId);
  }
  if (partId.startsWith("4.")) {
    return getModule4TicketsByPart(partId);
  }
  if (partId.startsWith("3.")) {
    return getModule3TicketsByPart(partId);
  }
  if (partId.startsWith("2.")) {
    return getModule2TicketsByPart(partId);
  }
  return getTicketsByPart(partId);
}

export function pickPartPracticeQuestions(
  partId: string,
  count = 15
): Question[] {
  const pool = getPartQuestions(partId);
  return shuffleQuestions(pool).slice(0, Math.min(count, pool.length));
}

export function pickDrillQuestions(count = 15): Question[] {
  return shuffleQuestions(module1DrillQuestions).slice(
    0,
    Math.min(count, module1DrillQuestions.length)
  );
}

export function partAccentClasses(
  accent: StudyPartManifest["accent"]
): ReturnType<typeof domainAccentClasses> {
  return domainAccentClasses(accent);
}

export const MODULE1_STUDY_TOTAL = module1TraditionalQuestions.length;
export const MODULE2_STUDY_TOTAL = module2TraditionalQuestions.length;
export const MODULE3_STUDY_TOTAL = module3TraditionalQuestions.length;
export const MODULE4_STUDY_TOTAL = module4TraditionalQuestions.length;
export const MODULE5_STUDY_TOTAL = module5TraditionalQuestions.length;
export const MODULE6_STUDY_TOTAL = module6TraditionalQuestions.length;
export const MODULE1_DRILL_TOTAL = module1DrillQuestions.length;

/**
 * Todas as partes de estudo — primary v2 (parts_index).
 * Fallback: módulos v1 se v2 vazio.
 */
export const ALL_STUDY_PARTS: StudyPartManifest[] =
  V2_STUDY_PARTS.length > 0
    ? V2_STUDY_PARTS
    : [
        ...MODULE_1_PARTS,
        ...MODULE_2_PARTS,
        ...MODULE_3_PARTS,
        ...MODULE_4_PARTS,
        ...MODULE_5_PARTS,
        ...MODULE_6_PARTS,
      ];
