"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  RotateCcw,
  Home,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  getPerformanceFeedback,
  type PerformanceTier,
} from "@/components/simulado/simulado-feedback";

export interface SimuladoResultProps {
  scorePct: number;
  correctCount: number;
  wrongCount: number;
  /** Questões respondidas */
  answeredCount: number;
  /** Total do simulado (pool da sessão) */
  totalQuestions: number;
  timerExpired: boolean;
  /** Segundos gastos (apenas se timer estava ativo); null se sem timer */
  elapsedSeconds: number | null;
  wrongCountForReview: number;
  /** Quantos itens ticket/troubleshooting na sessão (ex.: mix V2) */
  troubleshootingCount?: number;
  onReviewErrors: () => void;
  onNewSimulado: () => void;
  onBackToStart: () => void;
}

function TierIcon({
  tier,
  timerExpired,
  className,
}: {
  tier: PerformanceTier;
  timerExpired: boolean;
  className?: string;
}) {
  if (timerExpired) return <Clock className={className} />;
  if (tier === "excellent") return <Trophy className={className} />;
  if (tier === "good") return <Zap className={className} />;
  if (tier === "fair") return <Target className={className} />;
  return <AlertTriangle className={className} />;
}

export function SimuladoResult({
  scorePct,
  correctCount,
  wrongCount,
  answeredCount,
  totalQuestions,
  timerExpired,
  elapsedSeconds,
  wrongCountForReview,
  troubleshootingCount,
  onReviewErrors,
  onNewSimulado,
  onBackToStart,
}: SimuladoResultProps) {
  const feedback = getPerformanceFeedback(scorePct);
  const { colors, tier, label, message, summary } = feedback;
  const circumference = 2 * Math.PI * 46;
  const unanswered = Math.max(0, totalQuestions - answeredCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Hero card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-slate-900/80 p-6 sm:p-8",
          colors.border,
          colors.glow
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-3xl opacity-40",
            colors.bg
          )}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"
        />

        <div className="relative flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className={cn(
              "mb-4 flex size-14 items-center justify-center rounded-2xl border",
              colors.border,
              colors.bg
            )}
          >
            <TierIcon
              tier={tier}
              timerExpired={timerExpired}
              className={cn("size-7", colors.text)}
            />
          </motion.div>

          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            $ simulado --result
          </p>
          <h2 className="text-lg font-bold text-slate-50 sm:text-xl">
            {timerExpired ? "Tempo esgotado" : "Simulado concluído"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {answeredCount} de {totalQuestions} questões respondidas
            {unanswered > 0 && (
              <span className="text-amber-500/80">
                {" "}
                · {unanswered} sem resposta
              </span>
            )}
          </p>
          {typeof troubleshootingCount === "number" &&
            troubleshootingCount > 0 && (
              <p className="mt-2 inline-flex items-center rounded-full border border-neon-green/30 bg-neon-green/10 px-2.5 py-0.5 text-[10px] font-semibold text-neon-green">
                {troubleshootingCount} troubleshooting na sessão
              </p>
            )}

          {/* Score ring */}
          <div className="relative my-6 flex size-36 items-center justify-center sm:size-40">
            <svg
              className="absolute inset-0 size-full -rotate-90"
              viewBox="0 0 100 100"
              aria-hidden
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-800"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className={colors.ring}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset: circumference * (1 - scorePct / 100),
                }}
                transition={{ duration: 1.05, ease: "easeOut", delay: 0.1 }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25, type: "spring", stiffness: 260 }}
                className={cn(
                  "font-mono text-4xl font-bold tabular-nums tracking-tight sm:text-5xl",
                  colors.text
                )}
              >
                {scorePct}
                <span className="text-2xl sm:text-3xl">%</span>
              </motion.span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] font-semibold uppercase tracking-widest",
                  colors.textMuted
                )}
              >
                acerto
              </span>
            </div>
          </div>

          {/* Tier badge */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide",
              colors.border,
              colors.bg,
              colors.text
            )}
          >
            {label}
          </motion.div>
          <p className="mt-2 max-w-sm text-[11px] text-slate-500">{summary}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile
          label="Acertos"
          value={correctCount}
          icon={CheckCircle2}
          className="border-neon-green/20 bg-neon-green/5 text-neon-green"
          delay={0.15}
        />
        <StatTile
          label="Erros"
          value={wrongCount}
          icon={XCircle}
          className="border-rose-500/20 bg-rose-500/5 text-rose-400"
          delay={0.2}
        />
        <StatTile
          label="Total"
          value={totalQuestions}
          icon={Target}
          className="border-slate-700 bg-slate-950/50 text-slate-200"
          delay={0.25}
        />
      </div>

      {/* Performance bar + message */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "rounded-2xl border bg-slate-900/50 p-4",
          colors.border
        )}
      >
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500">
          <span>Desempenho</span>
          <span className={cn("font-semibold tabular-nums", colors.text)}>
            {scorePct}%
          </span>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className={cn("h-full rounded-full", colors.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${scorePct}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          />
        </div>
        <p className="text-[12px] leading-relaxed text-slate-400">{message}</p>

        {elapsedSeconds != null && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2">
            <Clock className="size-3.5 text-neon-cyan" />
            <div className="flex flex-1 items-center justify-between gap-2">
              <span className="text-[10px] uppercase tracking-wide text-slate-500">
                Tempo no simulado
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums text-neon-cyan">
                {formatDuration(elapsedSeconds)}
              </span>
            </div>
          </div>
        )}

        {timerExpired && (
          <p className="mt-2 text-[11px] text-amber-400/90">
            O cronômetro zerou antes de todas as respostas — o score considera
            apenas o que você enviou.
          </p>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-2"
      >
        <Button
          type="button"
          onClick={onReviewErrors}
          disabled={wrongCountForReview === 0}
          className={cn(
            "h-12 w-full gap-2 text-sm font-bold shadow-lg disabled:opacity-40",
            wrongCountForReview > 0
              ? "bg-neon-green text-slate-950 hover:bg-neon-green/90 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
              : "bg-slate-800 text-slate-400"
          )}
        >
          <BookOpen className="size-4" />
          Revisar erros
          {wrongCountForReview > 0 && (
            <span className="rounded-full bg-slate-950/25 px-2 py-0.5 text-[10px] font-bold tabular-nums">
              {wrongCountForReview}
            </span>
          )}
        </Button>

        <Button
          type="button"
          onClick={onNewSimulado}
          variant="outline"
          className="h-11 w-full gap-2 border-slate-700 bg-slate-950/50 text-slate-200 hover:border-neon-cyan/40 hover:bg-slate-900 hover:text-neon-cyan"
        >
          <RotateCcw className="size-4" />
          Novo Simulado
        </Button>

        <Button
          type="button"
          onClick={onBackToStart}
          variant="ghost"
          className="h-10 w-full gap-2 text-slate-500 hover:bg-transparent hover:text-slate-300"
        >
          <Home className="size-3.5" />
          Voltar ao início
        </Button>
      </motion.div>
    </motion.div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  className,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "flex flex-col items-center rounded-xl border px-2 py-3",
        className
      )}
    >
      <span className="mb-1 flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-slate-500">
        <Icon className="size-3 opacity-80" />
        {label}
      </span>
      <span className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
        {value}
      </span>
    </motion.div>
  );
}
