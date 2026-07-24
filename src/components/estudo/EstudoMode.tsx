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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CCNA_DOMAINS,
  domainAccentClasses,
  type CcnaDomain,
  type DomainId,
} from "@/data/domains";
import {
  filterQuestionsByDomain,
  pickDomainPracticeQuestions,
} from "@/lib/domain-questions";
import type { Question } from "@/types/question";
import { getQuestionPrompt } from "@/types/question";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import {
  loadEstudoProgress,
  recordDomainPractice,
  getDomainProgress,
  getDomainProgressPercent,
  getOverallProgressPercent,
  formatLastPracticed,
  type EstudoProgressMap,
} from "@/lib/estudo-progress";

type View = "list" | "detail" | "practice" | "result";

interface AnswerRecord {
  questionId: number;
  selected: number;
  correct: boolean;
}

interface EstudoModeProps {
  lives: number;
  onWrongAnswer: () => void;
  disabled: boolean;
}

export function EstudoMode({ onWrongAnswer, disabled }: EstudoModeProps) {
  const [view, setView] = useState<View>("list");
  const [selectedDomain, setSelectedDomain] = useState<CcnaDomain | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [progressMap, setProgressMap] = useState<EstudoProgressMap>({});
  const [hydrated, setHydrated] = useState(false);
  /** Evita gravar a mesma sessão de resultado mais de uma vez */
  const progressSavedRef = useRef(false);

  // Carrega progresso real do localStorage (client-only)
  useEffect(() => {
    setProgressMap(loadEstudoProgress());
    setHydrated(true);
  }, []);

  const domainCounts = useMemo(() => {
    const map = new Map<DomainId, number>();
    for (const d of CCNA_DOMAINS) {
      map.set(d.id, filterQuestionsByDomain(d).length);
    }
    return map;
  }, []);

  const poolTotals = useMemo(() => {
    const totals: Partial<Record<DomainId, number>> = {};
    for (const d of CCNA_DOMAINS) {
      totals[d.id] = domainCounts.get(d.id) ?? 0;
    }
    return totals;
  }, [domainCounts]);

  const overallProgress = useMemo(
    () => getOverallProgressPercent(progressMap, poolTotals),
    [progressMap, poolTotals]
  );

  const getEntry = useCallback(
    (domainId: DomainId) =>
      getDomainProgress(progressMap, domainId, poolTotals[domainId] ?? 0),
    [progressMap, poolTotals]
  );

  const openDomain = (domain: CcnaDomain) => {
    setSelectedDomain(domain);
    setView("detail");
  };

  const startPractice = useCallback((domain: CcnaDomain) => {
    const picked = pickDomainPracticeQuestions(domain.id, 15);
    if (picked.length === 0) return;
    progressSavedRef.current = false;
    setPracticeQuestions(picked);
    setCurrentIndex(0);
    setSelected(null);
    setHasAnswered(false);
    setAnswers([]);
    setSelectedDomain(domain);
    setView("practice");
  }, []);

  const question = practiceQuestions[currentIndex];
  const total = practiceQuestions.length;
  const correctCount = answers.filter((a) => a.correct).length;
  const scorePct =
    answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 0;

  const persistSessionProgress = useCallback(
    (domain: CcnaDomain, sessionAnswers: AnswerRecord[]) => {
      if (progressSavedRef.current) return;
      const correctIds = sessionAnswers
        .filter((a) => a.correct)
        .map((a) => a.questionId);
      const poolTotal = filterQuestionsByDomain(domain).length;
      const next = recordDomainPractice(progressMap, {
        domainId: domain.id,
        correctQuestionIds: correctIds,
        poolTotal,
      });
      setProgressMap(next);
      progressSavedRef.current = true;
    },
    [progressMap]
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
      if (selectedDomain) {
        // Inclui a resposta atual (já em answers) e grava progresso
        persistSessionProgress(selectedDomain, answers);
      }
      setView("result");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setHasAnswered(false);
  };

  // Quando a última resposta acaba de ser registrada e o user clica "Ver resultado",
  // answers já está atualizado. Mas se handleNext roda no mesmo tick após setAnswers
  // de uma resposta anterior, answers está completo. OK.
  // Edge case: se o user responde a última e clica next, answers includes last.
  // Good.

  // Se chegar em result sem ter salvo (ex.: re-render), garante save
  useEffect(() => {
    if (view === "result" && selectedDomain && answers.length > 0) {
      persistSessionProgress(selectedDomain, answers);
    }
  }, [view, selectedDomain, answers, persistSessionProgress]);

  const backToList = () => {
    setView("list");
    setSelectedDomain(null);
    setPracticeQuestions([]);
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
            <div className="flex size-11 items-center justify-center rounded-xl border border-neon-green/30 bg-neon-green/10 shadow-[0_0_18px_rgba(34,197,94,0.15)]">
              <BookOpen className="size-5 text-neon-green" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-50">
                Estudo por <span className="text-neon-green">Tópicos</span>
              </h1>
              <p className="text-xs text-slate-500">
                Domínios CCNA 200-301 · progresso salvo neste dispositivo
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
            Acertos únicos contam para o domínio. Pratique, revise erros e
            feche lacunas antes do simulado completo.
          </p>
        </div>

        <div className="space-y-3">
          {CCNA_DOMAINS.map((domain, i) => {
            const accent = domainAccentClasses(domain.accent);
            const qCount = domainCounts.get(domain.id) ?? 0;
            const entry = getEntry(domain.id);
            const pct = hydrated ? getDomainProgressPercent(entry) : 0;
            const last = formatLastPracticed(entry.lastPracticed);

            return (
              <motion.button
                key={domain.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openDomain(domain)}
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
                        ~{domain.weightPct}%
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {qCount} questões
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-100">
                      {domain.name}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {domain.namePt}
                    </p>
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
                    <span className={cn("font-semibold tabular-nums", accent.text)}>
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
      </motion.div>
    );
  }

  // ─── DETAIL ───────────────────────────────────────────────
  if (view === "detail" && selectedDomain) {
    const domain = selectedDomain;
    const accent = domainAccentClasses(domain.accent);
    const qCount = domainCounts.get(domain.id) ?? 0;
    const entry = getEntry(domain.id);
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
          className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-neon-green"
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
                  Peso ~{domain.weightPct}%
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-50">{domain.name}</h1>
              <p className="text-xs text-slate-400">{domain.namePt}</p>
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
            Tópicos principais
          </p>
          <ul className="space-y-2">
            {domain.topics.map((topic) => (
              <li
                key={topic.id}
                className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5"
              >
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    accent.bar
                  )}
                />
                <span className="text-xs font-medium text-slate-200">
                  {topic.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
            O progresso é por domínio (questões únicas acertadas). Pratique para
            aumentar o percentual.
          </p>
        </div>

        <Button
          type="button"
          disabled={qCount === 0 || disabled}
          onClick={() => startPractice(domain)}
          className={cn(
            "h-12 w-full gap-2 rounded-xl border font-bold",
            accent.border,
            accent.bg,
            accent.text,
            "hover:opacity-90"
          )}
        >
          <Play className="size-4" fill="currentColor" />
          Praticar questões deste domínio
          {qCount > 0 && (
            <span className="text-[10px] font-normal opacity-80">
              (até {Math.min(15, qCount)})
            </span>
          )}
        </Button>
        {qCount === 0 && (
          <p className="text-center text-[11px] text-slate-500">
            Nenhuma questão correspondente no banco ainda.
          </p>
        )}
      </motion.div>
    );
  }

  // ─── PRACTICE ─────────────────────────────────────────────
  if (view === "practice" && question && selectedDomain) {
    const accent = domainAccentClasses(selectedDomain.accent);
    const progressPct =
      total > 0 ? ((currentIndex + (hasAnswered ? 1 : 0)) / total) * 100 : 0;
    const isCorrect = selected === question.resposta_correta;

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
            {selectedDomain.name}
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
              Prática · {selectedDomain.namePt}
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
  if (view === "result" && selectedDomain) {
    const accent = domainAccentClasses(selectedDomain.accent);
    const entry = getEntry(selectedDomain.id);
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
          <p className="mt-1 text-xs text-slate-500">{selectedDomain.name}</p>
          <p className={cn("mt-4 text-4xl font-bold tabular-nums", accent.text)}>
            {scorePct}%
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {correctCount} de {answers.length} corretas nesta sessão
          </p>

          <div className="mx-auto mt-5 max-w-xs rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Progresso do domínio
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
            <p className="mt-2 text-[10px] text-slate-600">
              Progresso salvo neste dispositivo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => startPractice(selectedDomain)}
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
            Domínios
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
