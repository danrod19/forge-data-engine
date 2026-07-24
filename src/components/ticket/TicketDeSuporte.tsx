"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Headphones,
  Target,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TerminalCLI } from "@/components/ticket/TerminalCLI";
import { Explicacao } from "@/components/ticket/Explicacao";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";
import {
  getQuestionPrompt,
  hasDeepExplanation,
  isTraditionalQuestion,
} from "@/types/question";

interface TicketDeSuporteProps {
  questions: Question[];
  lives: number;
  onWrongAnswer: () => void;
  onUpgrade: () => void;
  disabled: boolean;
  /** Total do banco (ex.: 359) — só UX; a sessão usa `questions.length` */
  bankSize?: number;
  /** Nova sessão embaralhada (recomendado na Trilha) */
  onNewSession?: () => void;
  /** Voltar para outro modo (ex.: Sobre / home) */
  onExit?: () => void;
}

export function TicketDeSuporte({
  questions,
  lives,
  onWrongAnswer,
  onUpgrade,
  disabled,
  bankSize,
  onNewSession,
  onExit,
}: TicketDeSuporteProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedbackPulse, setFeedbackPulse] = useState<"correct" | "wrong" | null>(
    null
  );

  const total = questions.length;
  const question = questions[currentIndex];
  const progressPct =
    total > 0 ? ((currentIndex + (hasAnswered ? 1 : 0)) / total) * 100 : 0;
  const isCorrect = selected === question?.resposta_correta;
  const isTraditional = question ? isTraditionalQuestion(question) : false;
  const showExplanation =
    hasAnswered && question && hasDeepExplanation(question);
  const prompt = question ? getQuestionPrompt(question) : "";

  const handleSelect = useCallback(
    (index: number) => {
      if (hasAnswered || disabled || !question) return;

      setSelected(index);
      setHasAnswered(true);

      const correct = index === question.resposta_correta;
      if (correct) {
        setScore((s) => s + 1);
        setFeedbackPulse("correct");
        playCorrectSound();
      } else {
        setWrongCount((w) => w + 1);
        setFeedbackPulse("wrong");
        playWrongSound();
        onWrongAnswer();
      }

      // Clear pulse ring after animation
      window.setTimeout(() => setFeedbackPulse(null), 700);
    },
    [hasAnswered, disabled, question, onWrongAnswer]
  );

  const handleNext = () => {
    if (currentIndex + 1 >= total) {
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelected(null);
    setHasAnswered(false);
    setFeedbackPulse(null);
  };

  const handleRestartLocal = () => {
    setCurrentIndex(0);
    setSelected(null);
    setHasAnswered(false);
    setScore(0);
    setWrongCount(0);
    setFinished(false);
    setFeedbackPulse(null);
  };

  const handleNewSession = () => {
    if (onNewSession) {
      onNewSession();
      return;
    }
    handleRestartLocal();
  };

  if (!question || total === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        Nenhum ticket disponível nesta sessão.
      </div>
    );
  }

  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 rounded-2xl border border-neon-green/25 bg-slate-900/80 p-8 text-center terminal-glow"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
          className="flex size-16 items-center justify-center rounded-2xl border border-neon-green/40 bg-neon-green/10 shadow-[0_0_28px_rgba(34,197,94,0.25)]"
        >
          <CheckCircle2 className="size-8 text-neon-green" />
        </motion.div>
        <div>
          <h2 className="text-lg font-bold text-slate-50">Sessão concluída</h2>
          <p className="mt-1 text-sm text-slate-400">
            Tickets de Suporte · Troubleshooting
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-1.5 font-semibold text-neon-green">
              {score} acerto{score === 1 ? "" : "s"}
            </span>
            <span className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 font-semibold text-rose-300">
              {wrongCount} erro{wrongCount === 1 ? "" : "s"}
            </span>
            <span className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 tabular-nums text-slate-300">
              {pct}% · {score}/{total}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Vidas restantes: {lives}
            {typeof bankSize === "number" && bankSize > 0 && (
              <> · Banco: {bankSize} tickets</>
            )}
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button
            type="button"
            onClick={handleNewSession}
            className="w-full gap-2 bg-neon-green text-slate-950 hover:bg-neon-green/90"
          >
            <RotateCcw className="size-4" />
            Continuar (nova sessão)
          </Button>
          {onExit && (
            <Button
              type="button"
              variant="outline"
              onClick={onExit}
              className="w-full border-slate-700 bg-slate-950/50 text-slate-300 hover:bg-slate-900 hover:text-slate-100"
            >
              Voltar
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 terminal-glow">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-neon-cyan/30 bg-neon-cyan/10">
              <Ticket className="size-4 text-neon-cyan" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neon-cyan">
                {isTraditional
                  ? "Modo Traditional"
                  : "Trilha · Tickets de Suporte"}
              </p>
              <p className="text-xs text-slate-500">
                {score > 0 && (
                  <span className="text-neon-green">{score} acerto{score === 1 ? "" : "s"} · </span>
                )}
                {isTraditional
                  ? "Questão de prova"
                  : typeof bankSize === "number" && bankSize > 0
                    ? `Troubleshooting · ${bankSize} tickets no banco`
                    : "Troubleshooting / diagnóstico de rede"}
              </p>
            </div>
          </div>

          {/* Visible question counter */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 rounded-lg border border-neon-green/25 bg-neon-green/10 px-2.5 py-1.5 shadow-[0_0_12px_rgba(34,197,94,0.12)]">
              <Target className="size-3.5 text-neon-green" />
              <span className="font-mono text-sm font-bold tabular-nums text-neon-green">
                {currentIndex + 1}
                <span className="text-slate-500">/{total}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-400">
              <Headphones className="size-3 text-neon-green" />
              {isTraditional ? "Q" : "TKT-"}
              {String(question.id).padStart(4, "0")}
            </div>
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>Progresso da sessão</span>
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

      {/* ── Question body with slide transition ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          {!isTraditional && question.cli_output && (
            <TerminalCLI output={question.cli_output} />
          )}

          {/* ── Alternativas ── */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {isTraditional ? "Selecione a resposta" : "Selecione o diagnóstico"}
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
                  disabled={hasAnswered || disabled}
                  onClick={() => handleSelect(index)}
                  whileHover={
                    !hasAnswered && !disabled
                      ? { scale: 1.01, x: 3 }
                      : undefined
                  }
                  whileTap={
                    !hasAnswered && !disabled ? { scale: 0.985 } : undefined
                  }
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
                  {/* Glow overlay on correct */}
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
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Full-card feedback flash ring */}
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

      {/* ── Explicação + Next ── */}
      <AnimatePresence>
        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-3 overflow-hidden"
          >
            {!isCorrect && question && (
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

            {showExplanation && (
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
              disabled={disabled && !isCorrect}
              className="h-11 w-full gap-2 bg-neon-cyan/90 font-semibold text-slate-950 hover:bg-neon-cyan"
            >
              {currentIndex + 1 >= total
                ? "Ver resultado"
                : isTraditional
                  ? "Próxima questão"
                  : "Próximo ticket"}
              <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
