/**
 * Banco didático do Estudo (study_notes) — gerado a partir dos *-content.json.
 * Não altera alternativas/respostas. Só texto de estudo.
 * Regenerar: node scripts/gen-estudo-content.mjs
 */

import c_1_1 from "./estudo-content-bank/1.1.json";
import c_1_2 from "./estudo-content-bank/1.2.json";
import c_1_3 from "./estudo-content-bank/1.3.json";
import c_1_4 from "./estudo-content-bank/1.4.json";
import c_1_5 from "./estudo-content-bank/1.5.json";
import c_1_6 from "./estudo-content-bank/1.6.json";
import c_2_1 from "./estudo-content-bank/2.1.json";
import c_2_2 from "./estudo-content-bank/2.2.json";
import c_2_3 from "./estudo-content-bank/2.3.json";
import c_2_4 from "./estudo-content-bank/2.4.json";
import c_2_5 from "./estudo-content-bank/2.5.json";
import c_3_1 from "./estudo-content-bank/3.1.json";
import c_3_2 from "./estudo-content-bank/3.2.json";
import c_3_3 from "./estudo-content-bank/3.3.json";
import c_3_4 from "./estudo-content-bank/3.4.json";
import c_3_5 from "./estudo-content-bank/3.5.json";
import c_4_1 from "./estudo-content-bank/4.1.json";
import c_4_2 from "./estudo-content-bank/4.2.json";
import c_4_3 from "./estudo-content-bank/4.3.json";
import c_4_4 from "./estudo-content-bank/4.4.json";
import c_4_5 from "./estudo-content-bank/4.5.json";
import c_5_1 from "./estudo-content-bank/5.1.json";
import c_5_2 from "./estudo-content-bank/5.2.json";
import c_5_3 from "./estudo-content-bank/5.3.json";
import c_5_4 from "./estudo-content-bank/5.4.json";
import c_5_5 from "./estudo-content-bank/5.5.json";
import c_6_1 from "./estudo-content-bank/6.1.json";
import c_6_2 from "./estudo-content-bank/6.2.json";
import c_6_3 from "./estudo-content-bank/6.3.json";
import c_6_4 from "./estudo-content-bank/6.4.json";
import c_6_5 from "./estudo-content-bank/6.5.json";
import c_v2_1_1 from "./estudo-content-bank/v2-1.1.json";
import c_v2_1_5 from "./estudo-content-bank/v2-1.5.json";
import c_v2_1_6 from "./estudo-content-bank/v2-1.6.json";
import c_v2_1_7 from "./estudo-content-bank/v2-1.7.json";
import c_v2_2_2 from "./estudo-content-bank/v2-2.2.json";
import c_v2_2_4 from "./estudo-content-bank/v2-2.4.json";
import c_v2_2_5 from "./estudo-content-bank/v2-2.5.json";
import c_v2_3_2 from "./estudo-content-bank/v2-3.2.json";
import c_v2_3_3 from "./estudo-content-bank/v2-3.3.json";
import c_v2_3_4 from "./estudo-content-bank/v2-3.4.json";
import c_v2_4_2 from "./estudo-content-bank/v2-4.2.json";
import c_v2_4_3 from "./estudo-content-bank/v2-4.3.json";
import c_v2_4_4 from "./estudo-content-bank/v2-4.4.json";
import c_v2_4_6 from "./estudo-content-bank/v2-4.6.json";
import c_v2_4_7 from "./estudo-content-bank/v2-4.7.json";
import c_v2_5_1 from "./estudo-content-bank/v2-5.1.json";
import c_v2_5_2 from "./estudo-content-bank/v2-5.2.json";
import c_aws_1_1 from "./estudo-content-bank/aws-1.1.json";
import c_aws_1_10 from "./estudo-content-bank/aws-1.10.json";
import c_aws_1_11 from "./estudo-content-bank/aws-1.11.json";
import c_aws_1_12 from "./estudo-content-bank/aws-1.12.json";
import c_aws_1_2 from "./estudo-content-bank/aws-1.2.json";
import c_aws_1_3 from "./estudo-content-bank/aws-1.3.json";
import c_aws_1_4 from "./estudo-content-bank/aws-1.4.json";
import c_aws_1_5 from "./estudo-content-bank/aws-1.5.json";
import c_aws_1_6 from "./estudo-content-bank/aws-1.6.json";
import c_aws_1_7 from "./estudo-content-bank/aws-1.7.json";
import c_aws_1_8 from "./estudo-content-bank/aws-1.8.json";
import c_aws_1_9 from "./estudo-content-bank/aws-1.9.json";

export type StudyNoteBlock = {
  heading: string;
  bullets: string[];
  exam_tips: string[];
};

export type EstudoDidacticContent = {
  part_id: string;
  title: string;
  topic_list: string[];
  study_notes: StudyNoteBlock[];
  key_commands: string[];
  must_know: string[];
};

function asContent(raw: EstudoDidacticContent): EstudoDidacticContent {
  return {
    part_id: raw.part_id,
    title: raw.title,
    topic_list: Array.isArray(raw.topic_list) ? raw.topic_list : [],
    study_notes: Array.isArray(raw.study_notes) ? raw.study_notes : [],
    key_commands: Array.isArray(raw.key_commands) ? raw.key_commands : [],
    must_know: Array.isArray(raw.must_know) ? raw.must_know : [],
  };
}

const MAP_V1: Record<string, EstudoDidacticContent> = {
  "1.1": asContent(c_1_1 as EstudoDidacticContent),
  "1.2": asContent(c_1_2 as EstudoDidacticContent),
  "1.3": asContent(c_1_3 as EstudoDidacticContent),
  "1.4": asContent(c_1_4 as EstudoDidacticContent),
  "1.5": asContent(c_1_5 as EstudoDidacticContent),
  "1.6": asContent(c_1_6 as EstudoDidacticContent),
  "2.1": asContent(c_2_1 as EstudoDidacticContent),
  "2.2": asContent(c_2_2 as EstudoDidacticContent),
  "2.3": asContent(c_2_3 as EstudoDidacticContent),
  "2.4": asContent(c_2_4 as EstudoDidacticContent),
  "2.5": asContent(c_2_5 as EstudoDidacticContent),
  "3.1": asContent(c_3_1 as EstudoDidacticContent),
  "3.2": asContent(c_3_2 as EstudoDidacticContent),
  "3.3": asContent(c_3_3 as EstudoDidacticContent),
  "3.4": asContent(c_3_4 as EstudoDidacticContent),
  "3.5": asContent(c_3_5 as EstudoDidacticContent),
  "4.1": asContent(c_4_1 as EstudoDidacticContent),
  "4.2": asContent(c_4_2 as EstudoDidacticContent),
  "4.3": asContent(c_4_3 as EstudoDidacticContent),
  "4.4": asContent(c_4_4 as EstudoDidacticContent),
  "4.5": asContent(c_4_5 as EstudoDidacticContent),
  "5.1": asContent(c_5_1 as EstudoDidacticContent),
  "5.2": asContent(c_5_2 as EstudoDidacticContent),
  "5.3": asContent(c_5_3 as EstudoDidacticContent),
  "5.4": asContent(c_5_4 as EstudoDidacticContent),
  "5.5": asContent(c_5_5 as EstudoDidacticContent),
  "6.1": asContent(c_6_1 as EstudoDidacticContent),
  "6.2": asContent(c_6_2 as EstudoDidacticContent),
  "6.3": asContent(c_6_3 as EstudoDidacticContent),
  "6.4": asContent(c_6_4 as EstudoDidacticContent),
  "6.5": asContent(c_6_5 as EstudoDidacticContent),
};

const MAP_V2: Record<string, EstudoDidacticContent> = {
  "v2-1.1": asContent(c_v2_1_1 as EstudoDidacticContent),
  "v2-1.5": asContent(c_v2_1_5 as EstudoDidacticContent),
  "v2-1.6": asContent(c_v2_1_6 as EstudoDidacticContent),
  "v2-1.7": asContent(c_v2_1_7 as EstudoDidacticContent),
  "v2-2.2": asContent(c_v2_2_2 as EstudoDidacticContent),
  "v2-2.4": asContent(c_v2_2_4 as EstudoDidacticContent),
  "v2-2.5": asContent(c_v2_2_5 as EstudoDidacticContent),
  "v2-3.2": asContent(c_v2_3_2 as EstudoDidacticContent),
  "v2-3.3": asContent(c_v2_3_3 as EstudoDidacticContent),
  "v2-3.4": asContent(c_v2_3_4 as EstudoDidacticContent),
  "v2-4.2": asContent(c_v2_4_2 as EstudoDidacticContent),
  "v2-4.3": asContent(c_v2_4_3 as EstudoDidacticContent),
  "v2-4.4": asContent(c_v2_4_4 as EstudoDidacticContent),
  "v2-4.6": asContent(c_v2_4_6 as EstudoDidacticContent),
  "v2-4.7": asContent(c_v2_4_7 as EstudoDidacticContent),
  "v2-5.1": asContent(c_v2_5_1 as EstudoDidacticContent),
  "v2-5.2": asContent(c_v2_5_2 as EstudoDidacticContent),
};

const MAP_AWS: Record<string, EstudoDidacticContent> = {
  "aws-1.1": asContent(c_aws_1_1 as EstudoDidacticContent),
  "aws-1.10": asContent(c_aws_1_10 as EstudoDidacticContent),
  "aws-1.11": asContent(c_aws_1_11 as EstudoDidacticContent),
  "aws-1.12": asContent(c_aws_1_12 as EstudoDidacticContent),
  "aws-1.2": asContent(c_aws_1_2 as EstudoDidacticContent),
  "aws-1.3": asContent(c_aws_1_3 as EstudoDidacticContent),
  "aws-1.4": asContent(c_aws_1_4 as EstudoDidacticContent),
  "aws-1.5": asContent(c_aws_1_5 as EstudoDidacticContent),
  "aws-1.6": asContent(c_aws_1_6 as EstudoDidacticContent),
  "aws-1.7": asContent(c_aws_1_7 as EstudoDidacticContent),
  "aws-1.8": asContent(c_aws_1_8 as EstudoDidacticContent),
  "aws-1.9": asContent(c_aws_1_9 as EstudoDidacticContent),
};


export function getDidacticContentByPartId(
  partId: string
): EstudoDidacticContent | null {
  return MAP_V2[partId] ?? MAP_V1[partId] ?? MAP_AWS[partId] ?? null;
}

export function getV1DidacticContent(
  partId: string
): EstudoDidacticContent | null {
  return MAP_V1[partId] ?? null;
}

export function getV2DidacticContent(
  partId: string
): EstudoDidacticContent | null {
  return MAP_V2[partId] ?? null;
}

export function getAwsDidacticContent(
  partId: string
): EstudoDidacticContent | null {
  return MAP_AWS[partId] ?? null;
}

export function mergeDidacticContents(
  parts: EstudoDidacticContent[],
  title: string,
  id: string
): EstudoDidacticContent | null {
  if (parts.length === 0) return null;
  if (parts.length === 1) {
    return { ...parts[0], part_id: id, title: title || parts[0].title };
  }
  return {
    part_id: id,
    title,
    topic_list: parts.flatMap((p) => p.topic_list),
    study_notes: parts.flatMap((p) =>
      p.study_notes.map((n) => ({
        ...n,
        heading: `${p.title} · ${n.heading}`,
      }))
    ),
    key_commands: parts.flatMap((p) => p.key_commands),
    must_know: parts.flatMap((p) => p.must_know),
  };
}

export function hasReadableContent(
  c: EstudoDidacticContent | null | undefined
): boolean {
  if (!c) return false;
  return (
    c.study_notes.some((n) => n.bullets.length > 0) ||
    c.must_know.length > 0 ||
    c.key_commands.length > 0 ||
    c.topic_list.length > 0
  );
}
