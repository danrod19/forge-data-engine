"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Target,
  Layers,
  Play,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  Calculator,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ALL_STUDY_PARTS,
  V2_STUDY_TOTAL,
  pickPartPracticeQuestions,
  pickDrillQuestions,
  getPartQuestions,
  partAccentClasses,
  type StudyPartManifest,
} from "@/data/estudo-module1";
import { module1DrillQuestions } from "@/data/module1-traditional";
import {
  awsDomains,
  getAwsDomainById,
  countQuestionsForAwsDomain,
  filterQuestionsForAwsDomain,
  awsDomainAccentClasses,
  type AwsStudyDomain,
} from "@/data/domains-aws";
import {
  awsTraditionalQuestions,
  TOTAL_AWS_TRADITIONAL,
} from "@/data/aws-banks";
import type { Question } from "@/types/question";
import { getQuestionPrompt } from "@/types/question";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import {
  loadEstudoProgressForTrack,
  recordDomainPractice,
  getDomainProgress,
  getDomainProgressPercent,
  getOverallProgressPercent,
  formatLastPracticed,
  type EstudoProgressMap,
  type EstudoTrackId,
} from "@/lib/estudo-progress";
import { useTrack, type TrackId } from "@/lib/track-context";

type View = "list" | "detail" | "practice" | "result";

interface AnswerRecord {
  questionId: number;
  selected: number;
  correct: boolean;
}

interface AccentStyle {
  border: string;
  bg: string;
  text: string;
  glow: string;
  bar: string;
}

interface EstudoModeProps {
  lives: number;
  onWrongAnswer: () => void;
  disabled: boolean;
}

function pickRandom(pool: Question[], n: number): Question[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

function trackToEstudo(track: TrackId): EstudoTrackId {
  return track;
}

export function EstudoMode({ onWrongAnswer, disabled }: EstudoModeProps) {
  const { track } = useTrack();
  const isAws = track === "aws";
  const estudoTrack = trackToEstudo(track);

  const [view, setView] = useState<View>("list");
  const [selectedPart, setSelectedPart] = useState<StudyPartManifest | null>(
    null
  );
  const [selectedAwsDomain, setSelectedAwsDomain] =
    useState<AwsStudyDomain | null>(null);
  /** part_id, domain id ou "1.4-drill" */
  const [practiceKey, setPracticeKey] = useState<string>("");
  const [practiceLabel, setPracticeLabel] = useState("");
  const [practiceAccent, setPracticeAccent] = useState<AccentStyle | null>(
    null
  );
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [progressMap, setProgressMap] = useState<EstudoProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const progressSavedRef = useRef(false);

  // Known progress keys depend on track
  const knownProgressIds = useMemo(() => {
    if (isAws) return awsDomains.map((d) => d.id);
    return [
      ...ALL_STUDY_PARTS.map((p) => p.part_id),
      "1.4-drill",
    ];
  }, [isAws]);

  // Reload progress when track changes (component also remounts via page key)
  useEffect(() => {
    setProgressMap(loadEstudoProgressForTrack(estudoTrack, knownProgressIds));
    setHydrated(true);
    setView("list");
    setSelectedPart(null);
    setSelectedAwsDomain(null);
    setPracticeQuestions([]);
    setPracticeKey("");
  }, [estudoTrack, knownProgressIds]);

  // ─── CCNA parts ───────────────────────────────────────────
  const allParts = useMemo(() => ALL_STUDY_PARTS, []);

  const partsByModule = useMemo(() => {
    const map = new Map<string, StudyPartManifest[]>();
    for (const p of allParts) {
      const mod =
        "blueprint_module" in p && p.blueprint_module
          ? String(p.blueprint_module)
          : p.part_id.startsWith("v2-")
            ? p.part_id.slice(3, 4) + ".0"
            : p.part_id.split(".")[0] + ".0";
      if (!map.has(mod)) map.set(mod, []);
      map.get(mod)!.push(p);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [allParts]);

  const partCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allParts) {
      map.set(p.part_id, getPartQuestions(p.part_id).length);
    }
    map.set("1.4-drill", module1DrillQuestions.length);
    return map;
  }, [allParts]);

  // ─── AWS domains ──────────────────────────────────────────
  const awsDomainCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of awsDomains) {
      map.set(d.id, countQuestionsForAwsDomain(awsTraditionalQuestions, d));
    }
    return map;
  }, []);

  const poolTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    if (isAws) {
      for (const d of awsDomains) {
        totals[d.id] = awsDomainCounts.get(d.id) ?? 0;
      }
    } else {
      for (const p of allParts) {
        totals[p.part_id] = partCounts.get(p.part_id) ?? 0;
      }
    }
    return totals;
  }, [isAws, allParts, partCounts, awsDomainCounts]);

  const overallProgress = useMemo(
    () =>
      getOverallProgressPercent(
        progressMap,
        poolTotals,
        isAws
          ? awsDomains.map((d) => d.id)
          : allParts.map((p) => p.part_id)
      ),
    [progressMap, poolTotals, isAws, allParts]
  );

  const getEntry = useCallback(
    (id: string, fallbackTotal = 0) =>
      getDomainProgress(progressMap, id, fallbackTotal),
    [progressMap]
  );

  const openPart = (part: StudyPartManifest) => {
    setSelectedPart(part);
    setSelectedAwsDomain(null);
    setView("detail");
  };

  const openAwsDomain = (domain: AwsStudyDomain) => {
    setSelectedAwsDomain(domain);
    setSelectedPart(null);
    setView("detail");
  };

  const beginPractice = useCallback(
    (opts: {
      key: string;
      label: string;
      questions: Question[];
      accent: AccentStyle;
      part?: StudyPartManifest | null;
      domain?: AwsStudyDomain | null;
    }) => {
      if (opts.questions.length === 0) return;
      progressSavedRef.current = false;
      setPracticeQuestions(opts.questions);
      setPracticeKey(opts.key);
      setPracticeLabel(opts.label);
      setPracticeAccent(opts.accent);
      setCurrentIndex(0);
      setSelected(null);
      setHasAnswered(false);
      setAnswers([]);
      if (opts.part !== undefined) setSelectedPart(opts.part);
      if (opts.domain !== undefined) setSelectedAwsDomain(opts.domain);
      setView("practice");
    },
    []
  );

  const startCcnaPractice = useCallback(
    (part: StudyPartManifest, mode: "part" | "drill" = "part") => {
      const picked =
        mode === "drill"
          ? pickDrillQuestions(15)
          : pickPartPracticeQuestions(part.part_id, 15);
      const accent = partAccentClasses(part.accent);
      beginPractice({
        key: mode === "drill" ? "1.4-drill" : part.part_id,
        label:
          mode === "drill"
            ? "Drill de subnetting"
            : `${part.part_id} · ${part.title}`,
        questions: picked,
        accent,
        part,
        domain: null,
      });
    },
    [beginPractice]
  );

  const startAwsPractice = useCallback(
    (domain: AwsStudyDomain) => {
      const filtered = filterQuestionsForAwsDomain(
        awsTraditionalQuestions,
        domain
      );
      const picked = pickRandom(filtered, 15);
      const accent = awsDomainAccentClasses(domain.accent);
      beginPractice({
        key: domain.id,
        label: `${domain.name}`,
        questions: picked,
        accent,
        part: null,
        domain,
      });
    },
    [beginPractice]
  );

  const question = practiceQuestions[currentIndex];
  const total = practiceQuestions.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const scorePct =
    answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 0;

  const persistSessionProgress = useCallback(
    (key: string, sessionAnswers: AnswerRecord[]) => {
      if (progressSavedRef.current) return;
      const correctIds = sessionAnswers
        .filter((a) => a.correct)
        .map((a) => a.questionId);

      let poolTotal = 0;
      if (isAws) {
        const domain = getAwsDomainById(key);
        poolTotal = domain
          ? countQuestionsForAwsDomain(awsTraditionalQuestions, domain)
          : 0;
      } else if (key === "1.4-drill") {
        poolTotal = module1DrillQuestions.length;
      } else {
        poolTotal = getPartQuestions(key).length;
      }

      const next = recordDomainPractice(progressMap, {
        domainId: key,
        correctQuestionIds: correctIds,
        poolTotal,
        storage: "track",
        track: estudoTrack,
      });
      setProgressMap(next);
      progressSavedRef.current = true;
    },
    [progressMap, isAws, estudoTrack]
  );

  const handleSelect = (index: number) => {
    if (hasAnswered || !question || disabled) return;
    setSelected(index);
    setHasAnswered(true);
    const correct = index === question.resposta_correta;
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, selected: index, correct },
    ]);
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
      onWrongAnswer();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      if (practiceKey) {
        persistSessionProgress(practiceKey, answers);
      }
      setView("result");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setHasAnswered(false);
  };

  useEffect(() => {
    if (view === "result" && practiceKey && answers.length > 0) {
      persistSessionProgress(practiceKey, answers);
    }
  }, [view, practiceKey, answers, persistSessionProgress]);

  const backToList = () => {
    setView("list");
    setSelectedPart(null);
    setSelectedAwsDomain(null);
    setPracticeQuestions([]);
    setPracticeKey("");
    setPracticeAccent(null);
  };

  const titleLabel = isAws ? "AWS SAA" : "CCNA";
  const titleAccent = isAws ? "text-amber-300" : "text-neon-green";

  // ─── LIST ─────────────────────────────────────────────────
  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 terminal-glow">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl border shadow-[0_0_18px_rgba(34,197,94,0.15)]",
                isAws
                  ? "border-amber-400/30 bg-amber-400/10"
                  : "border-neon-green/30 bg-neon-green/10"
              )}
            >
              <BookOpen
                className={cn(
                  "size-5",
                  isAws ? "text-amber-300" : "text-neon-green"
                )}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-50">
                Estudo · <span className={titleAccent}>{titleLabel}</span>
              </h1>
              <p className="text-xs text-slate-500">
                {isAws
                  ? `SAA-C03 Foundations · ${awsDomains.length} domínios · ${TOTAL_AWS_TRADITIONAL} questões`
                  : track === "ccna-v2"
                    ? `CCNA 200-301 v2.0 · ${allParts.length} parts · ${V2_STUDY_TOTAL} questões`
                    : `CCNA 200-301 · ${allParts.length} parts · ${V2_STUDY_TOTAL} questões no banco`}
              </p>
            </div>
          </div>

          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
            <span>Progresso geral</span>
            <span className="font-semibold tabular-nums text-neon-cyan">
              {hydrated ? `${overallProgress}%` : "—"}
            </span>
          </div>
          <Progress
            value={hydrated ? overallProgress : 0}
            className="h-1.5 bg-slate-800"
          />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            {isAws
              ? "Pratique por domínio AWS (parts 1.1–1.12). Progresso salvo neste dispositivo · track AWS."
              : "Pratique por part_id. Progresso namespaced por track (V1/V2)."}
          </p>
        </div>

        {isAws
          ? awsDomains.map((domain, i) => {
              const accent = awsDomainAccentClasses(domain.accent);
              const qCount = awsDomainCounts.get(domain.id) ?? 0;
              const entry = getEntry(domain.id, qCount);
              const pct = hydrated ? getDomainProgressPercent(entry) : 0;
              const last = formatLastPracticed(entry.lastPracticed);

              return (
                <motion.button
                  key={domain.id}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => openAwsDomain(domain)}
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
                          {domain.partIds.join(" · ")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {qCount} questões · ~{domain.weightPct}% estudo
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-100">
                        {domain.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                        {domain.description}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-slate-600" />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-slate-500">
                      <span className="tabular-nums">
                        {hydrated
                          ? `${entry.completed}/${entry.total || qCount} dominadas`
                          : "…"}
                      </span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          accent.text
                        )}
                      >
                        {hydrated ? `${pct}%` : "—"}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          accent.bar
                        )}
                        style={{ width: `${pct}%` }}
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
            })
          : partsByModule.map(([mod, parts]) => (
              <div key={mod} className="space-y-3">
                <p className="mt-4 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Módulo {mod}
                </p>
                {parts.map((part, i) => {
                  const accent = partAccentClasses(part.accent);
                  const qCount = partCounts.get(part.part_id) ?? 0;
                  const entry = getEntry(part.part_id, qCount);
                  const pct = hydrated ? getDomainProgressPercent(entry) : 0;
                  const last = formatLastPracticed(entry.lastPracticed);
                  const verb =
                    "verb" in part && part.verb
                      ? String(part.verb)
                      : undefined;
                  const tickets =
                    "ticketCount" in part &&
                    typeof part.ticketCount === "number"
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
                              {tickets != null ? ` · ${tickets} tickets` : ""}
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
                              ? `${entry.completed}/${entry.total || qCount} dominadas`
                              : "…"}
                          </span>
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              accent.text
                            )}
                          >
                            {hydrated ? `${pct}%` : "—"}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              accent.bar
                            )}
                            style={{ width: `${pct}%` }}
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

  // ─── DETAIL AWS ───────────────────────────────────────────
  if (view === "detail" && isAws && selectedAwsDomain) {
    const domain = selectedAwsDomain;
    const accent = awsDomainAccentClasses(domain.accent);
    const qCount = awsDomainCounts.get(domain.id) ?? 0;
    const entry = getEntry(domain.id, qCount);
    const pct = hydrated ? getDomainProgressPercent(entry) : 0;
    const last = formatLastPracticed(entry.lastPracticed);

    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <button
          type="button"
          onClick={backToList}
          className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-amber-300"
        >
          <ChevronLeft className="size-4" />
          Todos os domínios
        </button>

        <div
          className={cn(
            "rounded-2xl border bg-slate-900/60 p-5",
            accent.border,
            accent.glow
          )}
        >
          <div className="mb-3 flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                accent.border,
                accent.bg
              )}
            >
              <Layers className={cn("size-5", accent.text)} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    accent.border,
                    accent.bg,
                    accent.text
                  )}
                >
                  {domain.partIds.join(" · ")}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-50">{domain.name}</h1>
              <p className="text-xs text-slate-400">
                SAA Foundations · hint ~{domain.weightPct}% do estudo piloto
              </p>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-400">
            {domain.description}
          </p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] text-slate-500">
              <span>
                Progresso · {entry.completed}/{entry.total || qCount} questões
              </span>
              <span className={cn("font-semibold tabular-nums", accent.text)}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn("h-full rounded-full transition-all", accent.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
            {last && (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="size-3" />
                Última prática: {last}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Keywords / foco
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {domain.keywords.slice(0, 10).map((kw) => (
              <li
                key={kw}
                className="rounded-md border border-slate-800 bg-slate-950/50 px-2 py-1 font-mono text-[10px] text-slate-400"
              >
                {kw}
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="button"
          disabled={qCount === 0 || disabled}
          onClick={() => startAwsPractice(domain)}
          className={cn(
            "h-12 w-full gap-2 rounded-xl border font-bold",
            accent.border,
            accent.bg,
            accent.text,
            "hover:opacity-90"
          )}
        >
          <Play className="size-4" fill="currentColor" />
          Praticar este domínio
          {qCount > 0 && (
            <span className="text-[10px] font-normal opacity-80">
              (até {Math.min(15, qCount)})
            </span>
          )}
        </Button>
      </motion.div>
    );
  }

  // ─── DETAIL CCNA ──────────────────────────────────────────
  if (view === "detail" && selectedPart) {
    const part = selectedPart;
    const accent = partAccentClasses(part.accent);
    const qCount = partCounts.get(part.part_id) ?? 0;
    const drillCount = partCounts.get("1.4-drill") ?? 0;
    const entry = getEntry(part.part_id, qCount);
    const pct = hydrated ? getDomainProgressPercent(entry) : 0;
    const last = formatLastPracticed(entry.lastPracticed);
    const hasDrill = "hasDrill" in part && part.hasDrill;

    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <button
          type="button"
          onClick={backToList}
          className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-neon-green"
        >
          <ChevronLeft className="size-4" />
          Todas as partes
        </button>

        <div
          className={cn(
            "rounded-2xl border bg-slate-900/60 p-5",
            accent.border,
            accent.glow
          )}
        >
          <div className="mb-3 flex items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                accent.border,
                accent.bg
              )}
            >
              <Layers className={cn("size-5", accent.text)} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                    accent.border,
                    accent.bg,
                    accent.text
                  )}
                >
                  Parte {part.part_id}
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-50">{part.title}</h1>
              <p className="text-xs text-slate-400">
                {"blueprint_module" in part && part.blueprint_module
                  ? `Módulo ${part.blueprint_module}${"verb" in part && part.verb ? ` · ${part.verb}` : ""}`
                  : part.part_id.startsWith("v2-5")
                    ? "Módulo 5.0 · AI & Network Ops"
                    : part.part_id.startsWith("v2-4") ||
                        part.part_id.startsWith("4.")
                      ? "Módulo 4.0 · Services & Security"
                      : part.part_id.startsWith("v2-3") ||
                          part.part_id.startsWith("3.")
                        ? "Módulo 3.0 · IP Routing"
                        : part.part_id.startsWith("v2-2") ||
                            part.part_id.startsWith("2.")
                          ? "Módulo 2.0 · Switching & Access"
                          : "Módulo 1.0 · Infrastructure"}
              </p>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-400">
            {part.description}
          </p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] text-slate-500">
              <span>
                Progresso · {entry.completed}/{entry.total || qCount} questões
              </span>
              <span className={cn("font-semibold tabular-nums", accent.text)}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn("h-full rounded-full transition-all", accent.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
            {last && (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="size-3" />
                Última prática: {last}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Tópicos principais
          </p>
          <ul className="space-y-2">
            {part.topic_list.map((topic) => (
              <li
                key={topic}
                className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5"
              >
                <span
                  className={cn("size-1.5 shrink-0 rounded-full", accent.bar)}
                />
                <span className="text-xs font-medium text-slate-200">
                  {topic}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          type="button"
          disabled={qCount === 0 || disabled}
          onClick={() => startCcnaPractice(part, "part")}
          className={cn(
            "h-12 w-full gap-2 rounded-xl border font-bold",
            accent.border,
            accent.bg,
            accent.text,
            "hover:opacity-90"
          )}
        >
          <Play className="size-4" fill="currentColor" />
          Praticar esta parte
          {qCount > 0 && (
            <span className="text-[10px] font-normal opacity-80">
              (até {Math.min(15, qCount)})
            </span>
          )}
        </Button>

        {hasDrill && (
          <Button
            type="button"
            disabled={drillCount === 0 || disabled}
            variant="outline"
            onClick={() => startCcnaPractice(part, "drill")}
            className="h-12 w-full gap-2 rounded-xl border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <Calculator className="size-4" />
            Drill de subnetting
            {drillCount > 0 && (
              <span className="text-[10px] font-normal opacity-80">
                (até {Math.min(15, drillCount)})
              </span>
            )}
          </Button>
        )}
      </motion.div>
    );
  }

  // ─── PRACTICE ─────────────────────────────────────────────
  if (view === "practice" && question && practiceAccent) {
    const accent = practiceAccent;
    const progressPct =
      total > 0 ? ((currentIndex + (hasAnswered ? 1 : 0)) / total) * 100 : 0;
    const isCorrect = selected === question.resposta_correta;
    const backLabel = isAws
      ? (selectedAwsDomain?.name ?? "Domínio")
      : (selectedPart?.part_id ?? "Parte");

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setView("detail")}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-neon-green"
          >
            <ChevronLeft className="size-4" />
            {backLabel}
          </button>
          <span className="text-[10px] tabular-nums text-slate-500">
            {currentIndex + 1}/{total}
          </span>
        </div>

        <Progress value={progressPct} className="h-1 bg-slate-800" />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target className={cn("size-3.5", accent.text)} />
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                accent.text
              )}
            >
              {practiceLabel}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-100">
            {getQuestionPrompt(question)}
          </p>
        </div>

        <div className="space-y-2">
          {question.alternativas.map((alt, idx) => {
            let state: "idle" | "correct" | "wrong" | "muted" = "idle";
            if (hasAnswered) {
              if (idx === question.resposta_correta) state = "correct";
              else if (idx === selected) state = "wrong";
              else state = "muted";
            }
            return (
              <button
                key={idx}
                type="button"
                disabled={hasAnswered || disabled}
                onClick={() => handleSelect(idx)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left text-xs leading-relaxed transition-all sm:text-sm",
                  state === "idle" &&
                    "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500 hover:bg-slate-900",
                  state === "correct" &&
                    "border-neon-green bg-neon-green/15 text-neon-green",
                  state === "wrong" &&
                    "border-rose-500 bg-rose-500/15 text-rose-300",
                  state === "muted" &&
                    "border-slate-800 bg-slate-950/30 text-slate-600"
                )}
              >
                <span className="mr-2 font-bold opacity-60">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {alt}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-3"
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold",
                  isCorrect ? "text-neon-green" : "text-rose-400"
                )}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="size-4" /> Correto
                  </>
                ) : (
                  <>
                    <XCircle className="size-4" /> Incorreto
                  </>
                )}
              </div>
              <Button
                type="button"
                onClick={handleNext}
                className="gap-1 rounded-xl bg-neon-green px-4 font-bold text-slate-950 hover:bg-neon-green/90"
              >
                {currentIndex + 1 >= total ? "Ver resultado" : "Próxima"}
                <ChevronRight className="size-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────
  if (view === "result" && practiceAccent) {
    const accent = practiceAccent;
    const poolTotalFallback = isAws
      ? (awsDomainCounts.get(practiceKey) ?? 0)
      : practiceKey === "1.4-drill"
        ? (partCounts.get("1.4-drill") ?? 0)
        : (partCounts.get(practiceKey) ?? 0);
    const entry = getEntry(practiceKey, poolTotalFallback);
    const domainPct = getDomainProgressPercent(entry);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div
          className={cn(
            "rounded-2xl border bg-slate-900/60 p-6 text-center",
            accent.border
          )}
        >
          <div
            className={cn(
              "mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border",
              accent.border,
              accent.bg
            )}
          >
            <Target className={cn("size-6", accent.text)} />
          </div>
          <h2 className="text-lg font-bold text-slate-50">Sessão concluída</h2>
          <p className="mt-1 text-xs text-slate-500">{practiceLabel}</p>
          <p className={cn("mt-4 text-4xl font-bold tabular-nums", accent.text)}>
            {scorePct}%
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {correctCount} de {answers.length} corretas nesta sessão
          </p>

          <div className="mx-auto mt-5 max-w-xs rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Progresso
            </p>
            <div className="mt-2 mb-1 flex justify-between text-[11px] text-slate-400">
              <span className="tabular-nums">
                {entry.completed}/{entry.total} dominadas
              </span>
              <span className={cn("font-bold tabular-nums", accent.text)}>
                {domainPct}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn("h-full rounded-full transition-all", accent.bar)}
                style={{ width: `${domainPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (isAws && selectedAwsDomain) {
                startAwsPractice(selectedAwsDomain);
              } else if (selectedPart) {
                startCcnaPractice(
                  selectedPart,
                  practiceKey === "1.4-drill" ? "drill" : "part"
                );
              }
            }}
            className="h-11 gap-2 rounded-xl border-slate-700"
          >
            <RotateCcw className="size-3.5" />
            Refazer
          </Button>
          <Button
            type="button"
            onClick={backToList}
            className="h-11 gap-2 rounded-xl bg-neon-green font-bold text-slate-950 hover:bg-neon-green/90"
          >
            <BookOpen className="size-3.5" />
            {isAws ? "Domínios" : "Partes"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
