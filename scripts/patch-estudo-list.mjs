import fs from "fs";

const path = "src/components/estudo/EstudoMode.tsx";
const s = fs.readFileSync(path, "utf8");
const endMark = "  // ─── DETAIL ───────────────────────────────────────────────";
const endIdx = s.indexOf(endMark);
const h1End = s.indexOf("Trilha CCNA</span>");
const p0 = s.indexOf('<p className="text-xs text-slate-500">', h1End);
if (p0 < 0 || endIdx < 0) {
  console.error("markers not found", { p0, endIdx });
  process.exit(1);
}

const newMiddle = `              <p className="text-xs text-slate-500">
                CCNA 200-301 v2.0 · {allParts.length} parts · {V2_STUDY_TOTAL}{" "}
                questões no banco
              </p>
            </div>
          </div>

          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
            <span>Progresso geral</span>
            <span className="font-semibold tabular-nums text-neon-cyan">
              {hydrated ? \`\${overallProgress}%\` : "—"}
            </span>
          </div>
          <Progress
            value={hydrated ? overallProgress : 0}
            className="h-1.5 bg-slate-800"
          />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Pratique por part_id (v2). Progresso salvo neste dispositivo.
          </p>
        </div>

        {partsByModule.map(([mod, parts]) => (
          <div key={mod} className="space-y-3">
            <p className="mt-4 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Módulo {mod}
            </p>
            {parts.map((part, i) => {
              const accent = partAccentClasses(part.accent);
              const qCount = partCounts.get(part.part_id) ?? 0;
              const entry = getEntry(part.part_id);
              const pct = hydrated ? getDomainProgressPercent(entry) : 0;
              const last = formatLastPracticed(entry.lastPracticed);
              const verb =
                "verb" in part && part.verb ? String(part.verb) : undefined;
              const tickets =
                "ticketCount" in part && typeof part.ticketCount === "number"
                  ? part.ticketCount
                  : undefined;

              return (
                <motion.button
                  key={part.part_id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => openPart(part)}
                  className={cn(
                    "w-full rounded-2xl border bg-slate-900/50 p-4 text-left transition-all hover:bg-slate-900/80",
                    accent.border,
                    accent.glow
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                            accent.border,
                            accent.bg,
                            accent.text
                          )}
                        >
                          {part.part_id}
                        </span>
                        {verb && (
                          <span className="text-[10px] text-slate-500">
                            {verb}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          {qCount} questões
                          {tickets != null ? \` · \${tickets} tickets\` : ""}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-100">
                        {part.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                        {part.description}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-slate-600" />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                      <span className="tabular-nums">
                        {hydrated
                          ? \`\${entry.completed}/\${entry.total || qCount} dominadas\`
                          : "…"}
                      </span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          accent.text
                        )}
                      >
                        {hydrated ? \`\${pct}%\` : "—"}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          accent.bar
                        )}
                        style={{ width: \`\${pct}%\` }}
                      />
                    </div>
                    {last && (
                      <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-600">
                        <Calendar className="size-2.5" />
                        Última prática: {last}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ))}
      </motion.div>
    );
  }

`;

const out = s.slice(0, p0) + newMiddle + s.slice(endIdx);
fs.writeFileSync(path, out);
console.log("ok", { p0, endIdx, newlen: out.length });
