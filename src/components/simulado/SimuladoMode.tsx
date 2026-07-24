"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Timer,
  Play,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Target,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";
import { getQuestionPrompt } from "@/types/question";
import {
  SIMULADO_COUNTS,
  pickSimuladoQuestions,
  getSimuladoTimerMinutes,
  simuladoQuestions,
  TOTAL_SIMULADO_QUESTIONS,
  type SimuladoCountOption,
} from "@/data/simulado-questions";
import { SimuladoResult } from "@/components/simulado/SimuladoResult";
import { SimuladoReview } from "@/components/simulado/SimuladoReview";
import { Explicacao } from "@/components/ticket/Explicacao";
import { hasDeepExplanation } from "@/types/question";

type Phase = "config" | "quiz" | "result" | "review";

interface AnswerRecord {
  questionId: number;
  selected: number;
  correct: boolean;
}

interface SimuladoModeProps {
  lives: number;
  onWrongAnswer: () => void;
  disabled: boolean;
  onUpgrade: () => void;
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function SimuladoMode({
  lives,
  onWrongAnswer,
  disabled,
  onUpgrade,
}: SimuladoModeProps) {
  const [phase, setPhase] = useState<Phase>("config");
  const [countOption, setCountOption] = useState<SimuladoCountOption>(20);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  /** Orçamento inicial do timer (para calcular tempo gasto no resultado) */
  const [timerBudgetSeconds, setTimerBudgetSeconds] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  const [feedbackPulse, setFeedbackPulse] = useState<"correct" | "wrong" | null>(
    null
  );
  const [reviewIndex, setReviewIndex] = useState(0);

  const total = sessionQuestions.length;
  const question = sessionQuestions[currentIndex];
  const progressPct =
    total > 0 ? ((currentIndex + (hasAnswered ? 1 : 0)) / total) * 100 : 0;
  const isCorrect = selected === question?.resposta_correta;

  const correctCount = useMemo(
    () => answers.filter((a) => a.correct).length,
    [answers]
  );
  const wrongCount = answers.length - correctCount;
  const scorePct =
    answers.length > 0
      ? Math.round((correctCount / answers.length) * 100)
      : 0;

  const wrongAnswers = useMemo(
    () => answers.filter((a) => !a.correct),
    [answers]
  );

  const wrongQuestions = useMemo(() => {
    return wrongAnswers
      .map((a) => {
        const q = sessionQuestions.find((sq) => sq.id === a.questionId);
        return q ? { question: q, record: a } : null;
      })
      .filter(Boolean) as { question: Question; record: AnswerRecord }[];
  }, [wrongAnswers, sessionQuestions]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "quiz" || !timerEnabled || timerExpired) return;
    if (secondsLeft <= 0) {
      setTimerExpired(true);
      setPhase("result");
      return;
    }
    const id = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, timerEnabled, secondsLeft, timerExpired]);

  const startSimulado = useCallback(() => {
    const picked = pickSimuladoQuestions(countOption);
    setSessionQuestions(picked);
    setCurrentIndex(0);
    setSelected(null);
    setHasAnswered(false);
    setAnswers([]);
    setTimerExpired(false);
    setFeedbackPulse(null);
    setReviewIndex(0);

    if (timerEnabled) {
      const mins = getSimuladoTimerMinutes(
        picked.length,
        simuladoQuestions.length
      );
      const budget = mins * 60;
      setTimerBudgetSeconds(budget);
      setSecondsLeft(budget);
    } else {
      setTimerBudgetSeconds(0);
      setSecondsLeft(0);
    }

    setPhase("quiz");
  }, [countOption, timerEnabled]);

  const handleSelect = useCallback(
    (index: number) => {
      if (hasAnswered || !question || phase !== "quiz") return;
      // Simulado allows continuing even with 0 lives (exam mode)

      setSelected(index);
      setHasAnswered(true);

      const correct = index === question.resposta_correta;
      setAnswers((prev) => [
        ...prev,
        {
          questionId: question.id,
          selected: index,
          correct,
        },
      ]);

      if (correct) {
        setFeedbackPulse("correct");
        playCorrectSound();
      } else {
        setFeedbackPulse("wrong");
        playWrongSound();
        onWrongAnswer();
      }

      window.setTimeout(() => setFeedbackPulse(null), 700);
    },
    [hasAnswered, question, phase, onWrongAnswer]
  );

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      setPhase("result");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setHasAnswered(false);
    setFeedbackPulse(null);
  };

  const handleNewSimulado = () => {
    setPhase("config");
    setSessionQuestions([]);
    setCurrentIndex(0);
    setSelected(null);
    setHasAnswered(false);
    setAnswers([]);
    setTimerExpired(false);
    setSecondsLeft(0);
    setTimerBudgetSeconds(0);
    setReviewIndex(0);
  };

  const startReview = () => {
    if (wrongQuestions.length === 0) return;
    setReviewIndex(0);
    setPhase("review");
  };

  /** Tempo decorrido quando o timer estava ativo; null caso contrário */
  const elapsedSeconds =
    timerEnabled && timerBudgetSeconds > 0
      ? Math.max(0, timerBudgetSeconds - Math.max(0, secondsLeft))
      : null;

  // ─── CONFIG ───────────────────────────────────────────────
  if (phase === "config") {
    const previewCount =
      countOption === "all"
        ? simuladoQuestions.length
        : Math.min(countOption, simuladoQuestions.length);
    const timerMins = getSimuladoTimerMinutes(
      previewCount,
      simuladoQuestions.length
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 terminal-glow">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 shadow-[0_0_18px_rgba(34,211,238,0.15)]">
              <ClipboardList className="size-5 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-50">
                Modo <span className="text-neon-green">Simulado</span>
              </h1>
              <p className="text-xs text-slate-500">
                {TOTAL_SIMULADO_QUESTIONS} questões traditional · estilo prova
                CCNA 200-301
              </p>
            </div>
          </div>

          {/* Count selector */}
          <div className="mb-5">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Quantidade de questões
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SIMULADO_COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCountOption(n)}
                  className={cn(
                    "rounded-xl border px-3 py-3 font-mono text-sm font-bold transition-all",
                    countOption === n
                      ? "border-neon-green bg-neon-green/15 text-neon-green shadow-[0_0_16px_rgba(34,197,94,0.2)]"
                      : "border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCountOption("all")}
                className={cn(
                  "rounded-xl border px-3 py-3 text-sm font-bold transition-all sm:col-span-4",
                  countOption === "all"
                    ? "border-neon-green bg-neon-green/15 text-neon-green shadow-[0_0_16px_rgba(34,197,94,0.2)]"
                    : "border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                )}
              >
                Todas ({TOTAL_SIMULADO_QUESTIONS})
              </button>
            </div>
          </div>

          {/* Timer toggle */}
          <div className="mb-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Timer className="size-4 text-neon-cyan" />
              <div>
                <p className="text-sm font-medium text-slate-200">Timer</p>
                <p className="text-[10px] text-slate-500">
                  {timerEnabled
                    ? `~${timerMins} min para ${previewCount} questões`
                    : "Opcional — cronômetro regressivo"}
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={timerEnabled}
              onClick={() => setTimerEnabled((v) => !v)}
              className={cn(
                "relative h-7 w-12 shrink-0 rounded-full border transition-colors",
                timerEnabled
                  ? "border-neon-green/50 bg-neon-green/30"
                  : "border-slate-700 bg-slate-800"
              )}
            >
              <motion.span
                layout
                className={cn(
                  "absolute top-0.5 size-5 rounded-full shadow-md",
                  timerEnabled
                    ? "left-6 bg-neon-green"
                    : "left-0.5 bg-slate-500"
                )}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <Button
            type="button"
            onClick={startSimulado}
            className="h-12 w-full gap-2 bg-neon-green text-sm font-bold text-slate-950 hover:bg-neon-green/90 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
          >
            <Play className="size-4" fill="currentColor" />
            Iniciar Simulado
          </Button>
        </div>

        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 px-4 py-3 text-center text-[11px] text-slate-500">
          Banco: {TOTAL_SIMULADO_QUESTIONS} questões · embaralhadas a cada
          simulado · feedback + explicação profunda após responder
        </div>
      </motion.div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────
  if (phase === "result") {
    return (
      <SimuladoResult
        scorePct={scorePct}
        correctCount={correctCount}
        wrongCount={wrongCount}
        answeredCount={answers.length}
        totalQuestions={total}
        timerExpired={timerExpired}
        elapsedSeconds={elapsedSeconds}
        wrongCountForReview={wrongQuestions.length}
        onReviewErrors={startReview}
        onNewSimulado={handleNewSimulado}
        onBackToStart={handleNewSimulado}
      />
    );
  }

  // ─── REVIEW ERRORS ────────────────────────────────────────
  if (phase === "review") {
    return (
      <SimuladoReview
        items={wrongQuestions}
        reviewIndex={reviewIndex}
        onIndexChange={setReviewIndex}
        onBackToResult={() => setPhase("result")}
      />
    );
  }

  // ─── QUIZ ─────────────────────────────────────────────────
  if (!question) return null;

  const prompt = getQuestionPrompt(question);
  const timerUrgent = timerEnabled && secondsLeft <= 60;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 terminal-glow">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-neon-green/30 bg-neon-green/10">
              <ClipboardList className="size-4 text-neon-green" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neon-green">
                Modo Simulado
              </p>
              <p className="text-xs text-slate-500">
                {correctCount > 0 && (
                  <span className="text-neon-green">{correctCount} acertos · </span>
                )}
                Prova traditional
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 rounded-lg border border-neon-cyan/25 bg-neon-cyan/10 px-2.5 py-1.5 shadow-[0_0_12px_rgba(34,211,238,0.12)]">
              <Target className="size-3.5 text-neon-cyan" />
              <span className="font-mono text-sm font-bold tabular-nums text-neon-cyan">
                {currentIndex + 1}
                <span className="text-slate-500">/{total}</span>
              </span>
            </div>
            {timerEnabled && (
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] tabular-nums",
                  timerUrgent
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-300"
                    : "border-slate-700 bg-slate-950/80 text-slate-300"
                )}
              >
                <Clock className="size-3" />
                {formatTime(secondsLeft)}
              </div>
            )}
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>Progresso do simulado</span>
          <span className="tabular-nums text-slate-400">
            {Math.round(progressPct)}%
          </span>
        </div>
        <Progress value={progressPct} className="mb-3 h-1.5 bg-slate-800" />

        <h1 className="text-sm font-medium leading-relaxed text-slate-100 sm:text-base">
          <span className="mr-1.5 text-neon-green">#</span>
          {prompt}
        </h1>
      </div>

      {/* Alternatives — no CLI, no deep explanation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-2.5"
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Selecione a resposta
          </p>

          {question.alternativas.map((alt, index) => {
            let state: "idle" | "correct" | "wrong" | "muted" = "idle";
            if (hasAnswered) {
              if (index === question.resposta_correta) state = "correct";
              else if (index === selected) state = "wrong";
              else state = "muted";
            }

            const isSelectedWrong = state === "wrong";
            const isSelectedCorrect =
              state === "correct" && selected === index;
            const isRevealedCorrect =
              state === "correct" && selected !== index;

            return (
              <motion.button
                key={`${question.id}-${index}`}
                type="button"
                disabled={hasAnswered}
                onClick={() => handleSelect(index)}
                whileHover={
                  !hasAnswered ? { scale: 1.01, x: 3 } : undefined
                }
                whileTap={!hasAnswered ? { scale: 0.985 } : undefined}
                initial={{ opacity: 0, y: 10 }}
                animate={
                  isSelectedWrong
                    ? {
                        opacity: 1,
                        y: 0,
                        x: [0, -8, 8, -6, 6, -3, 3, 0],
                        transition: { duration: 0.45, ease: "easeInOut" },
                      }
                    : isSelectedCorrect
                      ? {
                          opacity: 1,
                          y: 0,
                          scale: [1, 1.035, 1],
                          transition: { duration: 0.45 },
                        }
                      : {
                          opacity: state === "muted" ? 0.4 : 1,
                          y: 0,
                          scale: 1,
                          x: 0,
                          transition: { delay: index * 0.04, duration: 0.22 },
                        }
                }
                className={cn(
                  "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-3.5 py-3.5 text-left text-sm sm:px-4 sm:py-4",
                  "disabled:cursor-not-allowed",
                  state === "idle" &&
                    "border-slate-700 bg-slate-900/50 text-slate-200 hover:border-neon-green/40 hover:bg-slate-900 hover:shadow-[0_0_14px_rgba(34,197,94,0.12)]",
                  state === "correct" &&
                    "border-neon-green bg-neon-green/15 text-neon-green shadow-[0_0_22px_rgba(34,197,94,0.28)]",
                  state === "wrong" &&
                    "border-rose-500 bg-rose-500/15 text-rose-300 shadow-[0_0_18px_rgba(239,68,68,0.22)]",
                  state === "muted" &&
                    "border-slate-800 bg-slate-900/30 text-slate-500"
                )}
              >
                {isSelectedCorrect && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-neon-green/10"
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                  />
                )}

                <span
                  className={cn(
                    "relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold",
                    state === "idle" && "border-slate-600 text-slate-400",
                    state === "correct" &&
                      "border-neon-green/50 bg-neon-green/20 text-neon-green",
                    state === "wrong" &&
                      "border-rose-500/50 bg-rose-500/20 text-rose-300",
                    state === "muted" && "border-slate-700 text-slate-600"
                  )}
                >
                  {state === "correct" ? (
                    <CheckCircle2 className="size-3.5" />
                  ) : state === "wrong" ? (
                    <XCircle className="size-3.5" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>

                <span className="relative flex-1 leading-snug">
                  {alt}
                  {isRevealedCorrect && (
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-neon-green/80">
                      ✓ Resposta correta
                    </span>
                  )}
                  {isSelectedWrong && (
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-rose-400/80">
                      ✗ Sua escolha
                    </span>
                  )}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {feedbackPulse === "correct" && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-30 border-2 border-neon-green/40"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-3 overflow-hidden"
          >
            {!isCorrect && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-400"
              >
                Resposta correta:{" "}
                <span className="font-semibold text-neon-green">
                  {String.fromCharCode(65 + question.resposta_correta)}.{" "}
                  {question.alternativas[question.resposta_correta]}
                </span>
              </motion.p>
            )}

            {hasDeepExplanation(question) && (
              <Explicacao
                text={question.explicacao_profunda!}
                isPremium={question.isPremium}
                isCorrect={!!isCorrect}
                onUpgrade={onUpgrade}
              />
            )}

            <Button
              type="button"
              onClick={handleNext}
              className="h-11 w-full gap-2 bg-neon-cyan/90 font-semibold text-slate-950 hover:bg-neon-cyan"
            >
              {currentIndex + 1 >= total ? "Ver resultado" : "Próxima questão"}
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiet note about lives for UX continuity — disabled only shows in trilha */}
      {disabled && lives === 0 && (
        <p className="text-center text-[10px] text-slate-600">
          Vidas esgotadas — o simulado continua; upgrade no TopBar
        </p>
      )}
    </div>
  );
}
