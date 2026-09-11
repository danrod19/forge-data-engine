import fs from "fs";

const sources = [];
for (const n of [1, 2, 3, 4, 5, 6]) {
  const file = `src/data/parts/part-1.${n}-tickets.json`;
  sources.push({ file, tickets: JSON.parse(fs.readFileSync(file, "utf8")) });
}
for (const n of [2, 3, 4, 5, 6]) {
  const file = `src/data/tickets_module${n}.json`;
  sources.push({ file, tickets: JSON.parse(fs.readFileSync(file, "utf8")) });
}

const flat = [];
for (const s of sources) {
  s.tickets.forEach((t, idx) => {
    flat.push({
      ...t,
      _sourceFile: s.file,
      _sourceIndex: idx,
    });
  });
}

fs.mkdirSync("scripts/output", { recursive: true });
fs.writeFileSync(
  "scripts/output/tickets_v1_trilha_before_review.json",
  JSON.stringify(flat, null, 2) + "\n"
);

const BATCH = 31;
let bi = 0;
for (let i = 0; i < flat.length; i += BATCH) {
  const chunk = flat.slice(i, i + BATCH);
  fs.writeFileSync(
    `scripts/output/v1_batch_${bi}.json`,
    JSON.stringify(chunk, null, 2) + "\n"
  );
  console.log(
    `v1_batch_${bi}`,
    chunk.length,
    chunk[0].id,
    chunk[chunk.length - 1].id
  );
  bi++;
}
console.log("total", flat.length, "batches", bi);
