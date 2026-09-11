import fs from "fs";

const all = JSON.parse(
  fs.readFileSync("src/data/questions_v2_traditional.json", "utf8")
);
fs.mkdirSync("scripts/output", { recursive: true });

const BATCH = 50;
let bi = 0;
for (let i = 0; i < all.length; i += BATCH) {
  const chunk = all.slice(i, i + BATCH);
  fs.writeFileSync(
    `scripts/output/v2t_batch_${bi}.json`,
    JSON.stringify(chunk, null, 2) + "\n"
  );
  console.log(
    `v2t_batch_${bi}`,
    chunk.length,
    `ids ${chunk[0].id}-${chunk[chunk.length - 1].id}`
  );
  bi++;
}
console.log("total", all.length, "batches", bi);
