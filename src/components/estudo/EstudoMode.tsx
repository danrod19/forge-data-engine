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
  pickDrillQuestions,
  getPartQuestions,
  partAccentClasses,
  getStudyPartsForTrack,
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
import { awsTraditionalQuestions } from "@/data/aws-banks";
import {
  getV1DidacticContent,
  getV2DidacticContent,
  getAwsDidacticContent,
  mergeDidacticContents,
  hasReadableContent,
  type EstudoDidacticContent,
} from "@/data/estudo-content";
import { ESTUDO_PRACTICE_LIMIT, estudoHeaderCopy, estudoUiCopy } from "@/data/copy";
import { EstudoContentPanel } from "@/components/estudo/EstudoContentPanel";
import type { Question } from "@/types/question";
import {
  getQuestionPrompt,
  isTraditionalQuestion,
} from "@/types/question";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import {
  loadEstudoProgressForTrack,
  recordDomainPractice,
  recordContentRead,
  getDomainProgress,
  getDomainProgressPercent,
  getOverallProgressPercent,
  formatLastPracticed,
  type EstudoProgressMap,
  type EstudoTrackId,
} from "@/lib/estudo-progress";
import { useTrack, type TrackId } from "@/lib/track-context";
import { TerminalCLI } from "@/components/ticket/TerminalCLI";
import { shuffleQuestions } from "@/data/simulado-questions";
import { preferPtQuestions } from "@/lib/question-lang";

type View = "list" | "detail" | "practice" | "result";
type DetailTab = "content" | "practice";

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

function trackToEstudo(track: TrackId): EstudoTrackId {
  return track;
}

function resolveCcnaContent(
  track: TrackId,
  partId: string
): EstudoDidacticContent | null {
  if (track === "ccna-v1") return getV1DidacticContent(partId);
  if (track === "ccna-v2") {
    return getV2DidacticContent(partId) ?? getV1DidacticContent(partId);
  }
  return null;
}

function resolveAwsDomainContent(
  domain: AwsStudyDomain
): EstudoDidacticContent | null {
  const parts = domain.partIds
    .map((id) => getAwsDidacticContent(id))
    .filter((c): c is EstudoDidacticContent => Boolean(c));
  return mergeDidacticContents(parts, domain.name, domain.id);
}

export function EstudoMode({ onWrongAnswer, disabled }: EstudoModeProps) {
  const { track } = useTrack();
  const isAws = track === "aws";
  const estudoTrack = trackToEstudo(track);
  const headerCopy = estudoHeaderCopy(track);

  const [view, setView] = useState<View>("list");
  const [detailTab, setDetailTab] = useState<DetailTab>("content");
  const [selectedPart, setSelectedPart] = useState<StudyPartManifest | null>(
    null
  );
  const [selectedAwsDomain, setSelectedAwsDomain] =
    useState<AwsStudyDomain | null>(null);
  const [practiceKey, setPracticeKey] = useState("");
  const [practiceLabel, setPracticeLabel] = useState("");
  const [practiceAccent, setPracticeAccent] = useState<AccentStyle | null>(
    null
  );
  const [practiceEnFallback, setPracticeEnFallback] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [progressMap, setProgressMap] = useState<EstudoProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  const progressSavedRef = useRef(false);

  const ccnaParts = useMemo(
    () => (isAws ? [] : getStudyPartsForTrack(track)),
    [isAws, track]
  );

  const knownProgressIds = useMemo(() => {
    if (isAws) return awsDomains.map((d) => d.id);
    return [...ccnaParts.map((p) => p.part_id), "1.4-drill"];
  }, [isAws, ccnaParts]);

  useEffect(() => {
    setProgressMap(loadEstudoProgressForTrack(estudoTrack, knownProgressIds));
    setHydrated(true);
    setView("list");
    setDetailTab("content");
    setSelectedPart(null);
    setSelectedAwsDomain(null);
    setPracticeQuestions([]);
    setPracticeKey("");
  }, [estudoTrack, knownProgressIds]);

  const partsByModule = useMemo(() => {
    const map = new Map<string, StudyPartManifest[]>();
    for (const p of ccnaParts) {
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
  }, [ccnaParts]);

  const partCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of ccnaParts) {
      map.set(p.part_id, getPartQuestions(p.part_id).length);
    }
    map.set("1.4-drill", module1DrillQuestions.length);
    return map;
  }, [ccnaParts]);

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
      for (const p of ccnaParts) {
        totals[p.part_id] = partCounts.get(p.part_id) ?? 0;
      }
    }
    return totals;
  }, [isAws, ccnaParts, partCounts, awsDomainCounts]);

  const overallProgress = useMemo(
    () =>
      getOverallProgressPercent(
        progressMap,
        poolTotals,
        isAws ? awsDomains.map((d) => d.id) : ccnaParts.map((p) => p.part_id)
      ),
    [progressMap, poolTotals, isAws, ccnaParts]
  );

  const getEntry = useCallback(
    (id: string, fallbackTotal = 0) =>
      getDomainProgress(progressMap, id, fallbackTotal),
    [progressMap]
  );

  const activeContent = useMemo(() => {
    if (isAws && selectedAwsDomain) {
      return resolveAwsDomainContent(selectedAwsDomain);
    }
    if (selectedPart) {
      return resolveCcnaContent(track, selectedPart.part_id);
    }
    return null;
  }, [isAws, selectedAwsDomain, selectedPart, track]);

  const activeProgressId = isAws
    ? selectedAwsDomain?.id ?? ""
    : selectedPart?.part_id ?? "";

  const openPart = (part: StudyPartManifest) => {
    setSelectedPart(part);
    setSelectedAwsDomain(null);
    setDetailTab("content");
    setView("detail");
  };

  const openAwsDomain = (domain: AwsStudyDomain) => {
    setSelectedAwsDomain(domain);
    setSelectedPart(null);
    setDetailTab("content");
    setView("detail");
  };

  const markContentRead = useCallback(() => {
    if (!activeProgressId) return;
    const poolTotal = isAws
      ? (awsDomainCounts.get(activeProgressId) ?? 0)
      : (partCounts.get(activeProgressId) ?? 0);
    setProgressMap((prev) =>
      recordContentRead(prev, {
        domainId: activeProgressId,
        track: estudoTrack,
        poolTotal,
      })
    );
  }, [
    activeProgressId,
    isAws,
    awsDomainCounts,
    partCounts,
    estudoTrack,
  ]);

  const beginPractice = useCallback(
    (opts: {
      key: string;
      label: string;
      questions: Question[];
      accent: AccentStyle;
      usedEnglishFallback?: boolean;
      part?: StudyPartManifest | null;
      domain?: AwsStudyDomain | null;
    }) => {
      if (opts.questions.length === 0) return;
      progressSavedRef.current = false;
      // Mantém ids originais do banco (progresso masteredIds)
      setPracticeQuestions(opts.questions);
      setPracticeEnFallback(opts.usedEnglishFallback === true);
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
      if (mode === "drill") {
        const picked = pickDrillQuestions(ESTUDO_PRACTICE_LIMIT);
        beginPractice({
          key: "1.4-drill",
          label: "Drill de subnetting",
          questions: picked,
          accent: partAccentClasses(part.accent),
          part,
          domain: null,
        });
        return;
      }
      const full = getPartQuestions(part.part_id);
      const { pool, usedEnglishFallback } = preferPtQuestions(full);
      const picked = shuffleQuestions(pool).slice(
        0,
        Math.min(ESTUDO_PRACTICE_LIMIT, pool.length)
      );
      beginPractice({
        key: part.part_id,
        label: `${part.part_id} · ${part.title}`,
        questions: picked,
        accent: partAccentClasses(part.accent),
        usedEnglishFallback,
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
      const { pool, usedEnglishFallback } = preferPtQuestions(filtered);
      const picked = shuffleQuestions(pool).slice(
        0,
        Math.min(ESTUDO_PRACTICE_LIMIT, pool.length)
      );
      beginPractice({
        key: domain.id,
        label: domain.name,
        questions: picked,
        accent: awsDomainAccentClasses(domain.accent),
        usedEnglishFallback,
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
    if (correct) playCorrectSound();
    else {
      playWrongSound();
      onWrongAnswer();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      if (practiceKey) persistSessionProgress(practiceKey, answers);
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
    setDetailTab("content");
    setSelectedPart(null);
    setSelectedAwsDomain(null);
    setPracticeQuestions([]);
    setPracticeKey("");
    setPracticeAccent(null);
  };

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
                "flex size-11 items-center justify-center rounded-xl border",
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
                Estudo ·{" "}
                <span
                  className={isAws ? "text-amber-300" : "text-neon-green"}
                >
                  {headerCopy.titleAccent}
                </span>
              </h1>
              <p className="text-xs text-slate-500">{headerCopy.subtitle}</p>
            </div>
          </div>
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
            <span>Progresso geral (questões)</span>
            <span className="font-semibold tabular-nums text-neon-cyan">
              {hydrated ? `${overallProgress}%` : "—"}
            </span>
          </div>
          <Progress
            value={hydrated ? overallProgress : 0}
            className="h-1.5 bg-slate-800"
          />
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            {headerCopy.hint}
          </p>
          <p className="mt-1.5 text-[11px] font-medium text-neon-cyan/80">
            {estudoUiCopy.journeyLine}
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
                        {entry.contentRead && (
                          <span className="text-[10px] text-neon-green">
                            lido
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          {qCount} questões
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-slate-100">
                        {domain.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-[11px] text-slate-500">
                        {domain.description}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-slate-600" />
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                      <span className="tabular-nums">
                        {hydrated
                          ? `${entry.completed}/${entry.total || qCount} dominadas`
                          : "…"}
                      </span>
                      <span className={cn("font-semibold", accent.text)}>
                        {hydrated ? `${pct}%` : "—"}
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={cn("h-full rounded-full", accent.bar)}
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
                            {entry.contentRead && (
                              <span className="text-[10px] text-neon-green">
                                lido
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500">
                              {qCount} questões
                            </span>
                          </div>
                          <h2 className="text-sm font-bold text-slate-100">
                            {part.title}
                          </h2>
                          <p className="mt-2 line-clamp-2 text-[11px] text-slate-500">
                            {part.description}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-slate-600" />
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-[10px] text-slate-500">
                          <span className="tabular-nums">
                            {hydrated
                              ? `${entry.completed}/${entry.total || qCount} dominadas`
                              : "…"}
                          </span>
                          <span className={cn("font-semibold", accent.text)}>
                            {hydrated ? `${pct}%` : "—"}
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className={cn("h-full rounded-full", accent.bar)}
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

  // ─── DETAIL ───────────────────────────────────────────────
  if (view === "detail" && (selectedPart || selectedAwsDomain)) {
    const accent = selectedAwsDomain
      ? awsDomainAccentClasses(selectedAwsDomain.accent)
      : partAccentClasses(selectedPart!.accent);
    const qCount = selectedAwsDomain
      ? (awsDomainCounts.get(selectedAwsDomain.id) ?? 0)
      : (partCounts.get(selectedPart!.part_id) ?? 0);
    const progressId = selectedAwsDomain?.id ?? selectedPart!.part_id;
    const entry = getEntry(progressId, qCount);
    const pct = hydrated ? getDomainProgressPercent(entry) : 0;
    const title = selectedAwsDomain?.name ?? selectedPart!.title;
    const subtitle = selectedAwsDomain
      ? `SAA · ${selectedAwsDomain.partIds.join(" · ")}`
      : `Parte ${selectedPart!.part_id}`;
    const readable = hasReadableContent(activeContent);
    const canPractice =
      qCount > 0 && (!readable || entry.contentRead === true);

    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <button
          type="button"
          onClick={backToList}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-neon-green"
        >
          <ChevronLeft className="size-4" />
          {estudoUiCopy.backToList}
        </button>

        <div
          className={cn(
            "rounded-2xl border bg-slate-900/60 p-5",
            accent.border
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
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                {subtitle}
              </p>
              <h1 className="text-lg font-bold text-slate-50">{title}</h1>
              <p className="mt-1 text-[11px] text-slate-500">
                {entry.contentRead ? "Conteúdo lido · " : ""}
                {entry.completed}/{entry.total || qCount} questões dominadas ·{" "}
                {pct}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDetailTab("content")}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                detailTab === "content"
                  ? cn(accent.border, accent.bg, accent.text)
                  : "border-slate-700 text-slate-400 hover:border-slate-600"
              )}
            >
              {estudoUiCopy.tabContent}
            </button>
            <button
              type="button"
              onClick={() => setDetailTab("practice")}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-xs font-bold transition-all",
                detailTab === "practice"
                  ? cn(accent.border, accent.bg, accent.text)
                  : "border-slate-700 text-slate-400 hover:border-slate-600"
              )}
            >
              {estudoUiCopy.tabPractice}
            </button>
          </div>
        </div>

        {detailTab === "content" ? (
          <EstudoContentPanel
            content={activeContent}
            contentRead={entry.contentRead === true}
            onMarkRead={markContentRead}
            accentText={accent.text}
            accentBorder={accent.border}
            accentBg={accent.bg}
          />
        ) : (
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <p className="text-[12px] leading-relaxed text-slate-400">
              {estudoUiCopy.practiceHint}
            </p>
            <p className="text-[11px] text-slate-500">
              {estudoUiCopy.journeyLine}
            </p>
            {!canPractice && readable && !entry.contentRead && (
              <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/90">
                {estudoUiCopy.practiceCtaLocked}
              </p>
            )}
            <Button
              type="button"
              disabled={qCount === 0 || disabled || (!canPractice && readable)}
              onClick={() => {
                if (selectedAwsDomain) startAwsPractice(selectedAwsDomain);
                else if (selectedPart) startCcnaPractice(selectedPart, "part");
              }}
              className={cn(
                "h-12 w-full gap-2 rounded-xl border font-bold",
                accent.border,
                accent.bg,
                accent.text,
                "hover:opacity-90"
              )}
            >
              <Play className="size-4" fill="currentColor" />
              {estudoUiCopy.practiceCta} (até{" "}
              {Math.min(ESTUDO_PRACTICE_LIMIT, qCount || ESTUDO_PRACTICE_LIMIT)})
            </Button>
            {selectedPart &&
              "hasDrill" in selectedPart &&
              selectedPart.hasDrill && (
                <Button
                  type="button"
                  disabled={disabled}
                  variant="outline"
                  onClick={() => startCcnaPractice(selectedPart, "drill")}
                  className="h-11 w-full gap-2 rounded-xl border-neon-cyan/40 text-neon-cyan"
                >
                  <Calculator className="size-4" />
                  Drill de subnetting
                </Button>
              )}
            {!readable && qCount > 0 && (
              <p className="text-[11px] text-slate-500">
                Sem apostila neste tópico — a prática está liberada.
              </p>
            )}
          </div>
        )}

        {detailTab === "content" && (entry.contentRead || !readable) && (
          <Button
            type="button"
            disabled={qCount === 0 || disabled}
            onClick={() => setDetailTab("practice")}
            className="h-11 w-full gap-2 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 font-semibold text-neon-cyan hover:bg-neon-cyan/20"
          >
            Ir para praticar
            <ChevronRight className="size-4" />
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
    const isTicket =
      question.question_type === "ticket" || !isTraditionalQuestion(question);
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
            onClick={() => {
              setView("detail");
              setDetailTab("practice");
            }}
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
        {practiceEnFallback && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-200/90">
            {estudoUiCopy.practiceEnFallback}
          </p>
        )}
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
        {isTicket && question.cli_output && (
          <TerminalCLI output={question.cli_output} />
        )}
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
                  "w-full rounded-xl border px-3 py-3 text-left text-xs leading-relaxed sm:text-sm",
                  state === "idle" &&
                    "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500",
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
                className="gap-1 rounded-xl bg-neon-green px-4 font-bold text-slate-950"
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
              Progresso do tópico
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {entry.contentRead ? "Conteúdo lido · " : ""}
              {entry.completed}/{entry.total} dominadas · {domainPct}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn("h-full rounded-full", accent.bar)}
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
              if (isAws && selectedAwsDomain) startAwsPractice(selectedAwsDomain);
              else if (selectedPart)
                startCcnaPractice(
                  selectedPart,
                  practiceKey === "1.4-drill" ? "drill" : "part"
                );
            }}
            className="h-11 gap-2 rounded-xl border-slate-700"
          >
            <RotateCcw className="size-3.5" />
            Refazer
          </Button>
          <Button
            type="button"
            onClick={backToList}
            className="h-11 gap-2 rounded-xl bg-neon-green font-bold text-slate-950"
          >
            <BookOpen className="size-3.5" />
            Tópicos
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
