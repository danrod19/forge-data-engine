"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Map,
  ClipboardList,
  BookOpen,
  GraduationCap,
  Crown,
  Heart,
  Zap,
  Mail,
  ChevronRight,
  Terminal,
  Infinity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, CONTACT_MAILTO, type NavTab } from "@/types/question";
import { getTicketsPool } from "@/data/tickets";
import { getSimuladoPoolByTrack } from "@/data/simulado-questions";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProPlans, TrialButton } from "@/components/pro/ProPlans";
import { useTrack } from "@/lib/track-context";
import {
  freeVsProCopy,
  homeHeroCopy,
  homeHowToCopy,
} from "@/data/copy";

interface HomeScreenProps {
  isPro: boolean;
  onNavigate: (tab: NavTab) => void;
  onUpgrade: () => void;
  onAuthClick?: () => void;
}

const HOW_ICONS = [Map, ClipboardList, BookOpen, GraduationCap] as const;
const HOW_ACCENTS = [
  "border-neon-green/30 bg-neon-green/5 text-neon-green",
  "border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan",
  "border-violet-500/30 bg-violet-500/5 text-violet-300",
  "border-amber-500/30 bg-amber-500/5 text-amber-300",
] as const;
const HOW_IDS: NavTab[] = ["trilha", "simulado", "estudo", "sobre"];

export function HomeScreen({
  isPro,
  onNavigate,
  onUpgrade,
  onAuthClick,
}: HomeScreenProps) {
  const { user, trialAvailable, startTrial } = useAuth();
  const { track } = useTrack();
  const ticketCount = getTicketsPool(track).length;
  const simuladoCount = getSimuladoPoolByTrack(track).length;
  const hero = homeHeroCopy(track);
  const howToCards = homeHowToCopy(track, {
    tickets: ticketCount,
    simulado: simuladoCount,
  }).map((card, i) => ({
    ...card,
    id: HOW_IDS[i],
    icon: HOW_ICONS[i],
    accent: HOW_ACCENTS[i],
  }));
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const handleTrial = async () => {
    if (!user) {
      onAuthClick?.();
      return;
    }
    setTrialLoading(true);
    setTrialError(null);
    const { error } = await startTrial();
    if (error) setTrialError(error);
    setTrialLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 pb-2"
    >
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-neon-green/25 bg-slate-900/70 p-5 terminal-glow sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-neon-green/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -left-8 size-28 rounded-full bg-neon-cyan/10 blur-2xl"
        />
        <p className="relative mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">
          {hero.prompt}
        </p>
        <h1 className="relative text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
          {hero.titleLead}{" "}
          <span
            className={
              track === "aws" ? "text-amber-300" : "text-neon-green"
            }
          >
            {hero.titleAccent}
          </span>
        </h1>
        <p className="relative mt-1.5 text-sm font-medium text-slate-300 sm:text-base">
          {hero.subtitle}
        </p>
        <p className="relative mt-3 max-w-md text-[13px] leading-relaxed text-slate-400 sm:text-sm">
          {hero.body}
        </p>

        <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => onNavigate("trilha")}
            className="h-11 flex-1 gap-2 border border-neon-green/40 bg-neon-green/15 font-semibold text-neon-green hover:bg-neon-green/25"
          >
            <Map className="size-4" />
            {hero.ctaPrimary}
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={() => onNavigate("simulado")}
            className="h-11 flex-1 gap-2 border border-neon-cyan/35 bg-neon-cyan/10 font-semibold text-neon-cyan hover:bg-neon-cyan/20"
          >
            <ClipboardList className="size-4" />
            {hero.ctaSecondary}
          </Button>
        </div>
      </section>

      {/* Como usar */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <Terminal className="size-3.5 text-neon-green" />
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Como usar
          </h2>
        </div>
        <div className="grid gap-2.5">
          {howToCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                onClick={() => onNavigate(card.id)}
                className="group flex w-full items-start gap-3 rounded-xl border border-slate-800/90 bg-slate-900/50 p-3.5 text-left transition-colors hover:border-slate-600 hover:bg-slate-900/80"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${card.accent}`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-600">
                      {card.step}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">
                      {card.title}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-slate-400">
                    {card.desc}
                  </span>
                </span>
                <ChevronRight className="mt-2 size-4 shrink-0 text-slate-600 transition-colors group-hover:text-neon-green" />
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Free vs PRO + planos */}
      <section className="grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Heart className="size-4 text-rose-400" fill="currentColor" />
            <h3 className="text-sm font-semibold text-slate-100">
              {freeVsProCopy.freeTitle}
            </h3>
          </div>
          <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-slate-400">
            {freeVsProCopy.freeBullets.map((b) => (
              <li key={b}>› {b}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Crown className="size-4 text-amber-400" fill="currentColor" />
            <h3 className="text-sm font-semibold text-amber-200">
              {freeVsProCopy.proTitle}
            </h3>
            {isPro && (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300">
                ativo
              </span>
            )}
          </div>
          <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-slate-300">
            <li className="flex items-center gap-1.5">
              <Infinity className="size-3 text-amber-400" />{" "}
              {freeVsProCopy.proBullets[0]}
            </li>
            <li className="flex items-center gap-1.5">
              <Zap className="size-3 text-amber-400" />{" "}
              {freeVsProCopy.proBullets[1]}
            </li>
            <li>› {freeVsProCopy.proBullets[2]}</li>
          </ul>
          {!isPro && (
            <Button
              type="button"
              onClick={onUpgrade}
              className="relative mt-3 h-9 w-full overflow-hidden border-0 text-xs font-bold text-slate-950"
            >
              <span className="gold-gradient absolute inset-0" />
              <span className="relative">{freeVsProCopy.proCta}</span>
            </Button>
          )}
        </div>
      </section>

      {!isPro && (
        <section className="space-y-3 rounded-xl border border-amber-500/20 bg-slate-900/50 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
            planos pro
          </p>
          {user && trialAvailable && (
            <div className="space-y-2">
              <TrialButton onStart={handleTrial} loading={trialLoading} />
              {trialError && (
                <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-300">
                  ! {trialError}
                </p>
              )}
            </div>
          )}
          {!user && (
            <p className="text-[12px] text-slate-400">
              Faça login para ativar o trial grátis de 24h (1x por conta).
            </p>
          )}
          <ProPlans />
        </section>
      )}

      {/* Contato */}
      <section className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-neon-cyan/30 bg-neon-cyan/10">
            <Mail className="size-4 text-neon-cyan" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-100">Contato</h3>
            <p className="mt-0.5 text-[12px] text-slate-400">
              Dúvidas, feedback ou suporte — fale com a gente.
            </p>
            <a
              href={CONTACT_MAILTO}
              className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-neon-cyan underline-offset-2 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
