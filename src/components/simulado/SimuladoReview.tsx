"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/question";
import { getQuestionPrompt, isTraditionalQuestion } from "@/types/question";
import { letterIndex } from "@/components/simulado/simulado-feedback";
import { TerminalCLI } from "@/components/ticket/TerminalCLI";

export interface ReviewItem {
  question: Question;
  record: {
    questionId: number;
    selected: number;
    correct: boolean;
  };
}

export interface SimuladoReviewProps {
  items: ReviewItem[];
  reviewIndex: number;
  onIndexChange: (index: number) => void;
  onBackToResult: () => void;
}

export function SimuladoReview({
  items,
  reviewIndex,
  onIndexChange,
  onBackToResult,
}: SimuladoReviewProps) {
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center"
      >
        <CheckCircle2 className="mx-auto size-10 text-neon-green" />
        <p className="mt-3 text-sm font-semibold text-slate-200">
          Nenhum erro para revisar
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Você acertou todas as questões respondidas neste simulado.
        </p>
        <Button
          type="button"
          onClick={onBackToResult}
          className="mt-5 gap-2 bg-neon-green font-semibold text-slate-950 hover:bg-neon-green/90"
        >
          Voltar ao resultado
        </Button>
      </motion.div>
    );
  }

  const safeIndex = Math.min(Math.max(0, reviewIndex), items.length - 1);
  const item = items[safeIndex];
  const { question: rq, record } = item;
  const prompt = getQuestionPrompt(rq);
  const userAnswer = rq.alternativas[record.selected] ?? "—";
  const correctAnswer = rq.alternativas[rq.resposta_correta] ?? "—";
  const progressPct = ((safeIndex + 1) / items.length) * 100;
  const isLast = safeIndex + 1 >= items.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="rounded-2xl border border-rose-500/25 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-rose-500/35 bg-rose-500/10">
              <AlertTriangle className="size-3.5 text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-400">
                Revisão de erros
              </p>
              <p className="text-[11px] text-slate-500">
                Compare sua resposta com a correta
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1 font-mono text-xs tabular-nums text-slate-300">
            {safeIndex + 1}
            <span className="text-slate-600">/{items.length}</span>
          </span>
        </div>
        <Progress value={progressPct} className="h-1.5 bg-slate-800" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={rq.id + "-" + safeIndex}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {/* Enunciado / sintoma */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {rq.question_type === "ticket" || !isTraditionalQuestion(rq)
                ? "Troubleshooting"
                : "Questão"}
            </p>
            <h2 className="text-sm font-medium leading-relaxed text-slate-100 sm:text-base">
              <span className="mr-1.5 text-neon-green">#</span>
              {prompt}
            </h2>
          </div>

          {(rq.question_type === "ticket" || !isTraditionalQuestion(rq)) &&
            rq.cli_output && <TerminalCLI output={rq.cli_output} />}

          {/* Comparison cards */}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5">
              <div className="mb-2 flex items-center gap-1.5">
                <XCircle className="size-3.5 text-rose-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-rose-400">
                  Sua resposta
                </span>
              </div>
              <p className="text-xs leading-relaxed text-rose-100/90 sm:text-sm">
                <span className="mr-1.5 font-mono font-bold text-rose-300">
                  {letterIndex(record.selected)}.
                </span>
                {userAnswer}
              </p>
            </div>
            <div className="rounded-xl border border-neon-green/30 bg-neon-green/10 p-3.5">
              <div className="mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-neon-green" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-neon-green">
                  Resposta correta
                </span>
              </div>
              <p className="text-xs leading-relaxed text-neon-green/95 sm:text-sm">
                <span className="mr-1.5 font-mono font-bold text-neon-green">
                  {letterIndex(rq.resposta_correta)}.
                </span>
                {correctAnswer}
              </p>
            </div>
          </div>

          {/* Full alternatives */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Todas as alternativas
            </p>
            {rq.alternativas.map((alt, index) => {
              let state: "correct" | "wrong" | "muted" = "muted";
              if (index === rq.resposta_correta) state = "correct";
              else if (index === record.selected) state = "wrong";

              return (
                <div
                  key={`${rq.id}-rev-${index}`}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm",
                    state === "correct" &&
                      "border-neon-green bg-neon-green/15 text-neon-green shadow-[0_0_16px_rgba(34,197,94,0.12)]",
                    state === "wrong" &&
                      "border-rose-500 bg-rose-500/15 text-rose-300 shadow-[0_0_14px_rgba(244,63,94,0.1)]",
                    state === "muted" &&
                      "border-slate-800 bg-slate-900/30 text-slate-500"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-bold",
                      state === "correct" &&
                        "border-neon-green/50 bg-neon-green/20",
                      state === "wrong" &&
                        "border-rose-500/50 bg-rose-500/20",
                      state === "muted" && "border-slate-700"
                    )}
                  >
                    {state === "correct" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : state === "wrong" ? (
                      <XCircle className="size-3.5" />
                    ) : (
                      letterIndex(index)
                    )}
                  </span>
                  <span className="flex-1 leading-snug">
                    {alt}
                    {state === "correct" && (
                      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-neon-green/80">
                        Resposta correta
                      </span>
                    )}
                    {state === "wrong" && (
                      <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-rose-400/80">
                        Sua escolha
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onBackToResult}
          className="h-11 gap-2 border-slate-700 bg-slate-950/50 text-slate-300 hover:text-slate-100 sm:flex-none"
        >
          <ArrowLeft className="size-3.5" />
          Resultado
        </Button>

        <div className="flex flex-1 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={safeIndex <= 0}
            onClick={() => onIndexChange(safeIndex - 1)}
            className="h-11 flex-1 gap-1 border-slate-700 bg-slate-950/50 text-slate-300 disabled:opacity-35"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (isLast) onBackToResult();
              else onIndexChange(safeIndex + 1);
            }}
            className="h-11 flex-1 gap-1 bg-neon-cyan/90 font-semibold text-slate-950 hover:bg-neon-cyan"
          >
            {isLast ? "Concluir revisão" : "Próximo erro"}
            {!isLast && <ChevronRight className="size-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
