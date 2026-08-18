import fs from "fs";
import path from "path";

function normalize(raw, fallbackId) {
  const notes = Array.isArray(raw.study_notes)
    ? raw.study_notes.map((n) => ({
        heading: String(n.heading ?? ""),
        bullets: Array.isArray(n.bullets) ? n.bullets.map(String) : [],
        exam_tips: Array.isArray(n.exam_tips) ? n.exam_tips.map(String) : [],
      }))
    : [];
  return {
    part_id: String(raw.part_id ?? fallbackId),
    title: String(raw.title ?? fallbackId),
    topic_list: Array.isArray(raw.topic_list) ? raw.topic_list.map(String) : [],
    study_notes: notes,
    key_commands: Array.isArray(raw.key_commands)
      ? raw.key_commands.map(String)
      : [],
    must_know: Array.isArray(raw.must_know) ? raw.must_know.map(String) : [],
  };
}

const outDir = "src/data/estudo-content-bank";
fs.mkdirSync(outDir, { recursive: true });

const maps = [];

function ingest(globDir, mapName) {
  const files = fs
    .readdirSync(globDir)
    .filter((f) => f.endsWith("-content.json"));
  const entries = [];
  for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(globDir, f), "utf8"));
    const id =
      raw.part_id ||
      f.replace("-content.json", "").replace(/^part-/, "");
    const norm = normalize(raw, id);
    const outName =
      norm.part_id.replace(/[^a-zA-Z0-9._-]/g, "_") + ".json";
    fs.writeFileSync(path.join(outDir, outName), JSON.stringify(norm));
    entries.push({ id: norm.part_id, file: outName });
  }
  maps.push({ mapName, entries });
  console.log(mapName, entries.length);
}

ingest("src/data/parts", "V1");
ingest("v2/parts", "V2");
ingest("aws/parts", "AWS");

const allImports = [];
let ts = `/**
 * Banco didático do Estudo (study_notes) — gerado a partir dos *-content.json.
 * Não altera alternativas/respostas. Só texto de estudo.
 * Regenerar: node scripts/gen-estudo-content.mjs
 */

`;

for (const m of maps) {
  for (const e of m.entries) {
    const varName = "c_" + e.id.replace(/[^a-zA-Z0-9]/g, "_");
    allImports.push({ varName, file: e.file, id: e.id, map: m.mapName });
    ts += `import ${varName} from "./estudo-content-bank/${e.file}";\n`;
  }
}

ts += `
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

`;

for (const mapName of ["V1", "V2", "AWS"]) {
  const items = allImports.filter((i) => i.map === mapName);
  ts += `const MAP_${mapName}: Record<string, EstudoDidacticContent> = {\n`;
  for (const i of items) {
    ts += `  "${i.id}": asContent(${i.varName} as EstudoDidacticContent),\n`;
  }
  ts += `};\n\n`;
}

ts += `
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
        heading: \`\${p.title} · \${n.heading}\`,
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
`;

fs.writeFileSync("src/data/estudo-content.ts", ts);
console.log("wrote estudo-content.ts", allImports.length, "parts");
