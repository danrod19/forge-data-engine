"use client";

import { useState } from "react";
import { Crown, Heart, Infinity, Clock, Zap, Terminal, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProPlans, TrialButton } from "@/components/pro/ProPlans";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: "lives" | "upgrade";
  onAuthClick?: () => void;
}

const features = [
  { icon: Infinity, label: "Vidas infinitas — sem cooldown de 4h" },
  { icon: Zap, label: "Explicações profundas e labs premium" },
  { icon: Clock, label: "Diagnósticos CLI ilimitados" },
];

export function PaywallModal({
  open,
  onOpenChange,
  reason,
  onAuthClick,
}: PaywallModalProps) {
  const { user, isProEfetivo, trialAvailable, startTrial } = useAuth();
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);
  const isLives = reason === "lives";

  const handleTrial = async () => {
    setTrialLoading(true);
    setTrialError(null);
    const { error } = await startTrial();
    setTrialLoading(false);
    if (error) {
      setTrialError(error);
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,40rem)] max-w-[min(100vw-2rem,24rem)] gap-0 overflow-y-auto border-slate-700/80 bg-[#0a0f1a] p-0 shadow-2xl shadow-neon-green/5 sm:max-w-md">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/90 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-1 flex flex-1 items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <Terminal className="size-3" />
            paywall.sh — root@ccna-forge
          </span>
        </div>

        <div className="gold-gradient h-0.5 w-full opacity-80" />

        <div className="relative p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          <DialogHeader className="relative space-y-3 text-center sm:text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="mx-auto flex size-14 items-center justify-center rounded-xl border border-amber-400/35 bg-amber-500/10 shadow-[0_0_28px_rgba(251,191,36,0.2)]"
            >
              {isLives ? (
                <Heart className="size-7 text-rose-400" fill="currentColor" />
              ) : (
                <Crown className="size-7 text-amber-400" fill="currentColor" />
              )}
            </motion.div>

            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-green/70">
                {isLives ? "$ life_check --status" : "$ upgrade --tier pro"}
              </p>
              <DialogTitle className="text-lg font-bold tracking-tight text-slate-50 sm:text-xl">
                {isLives ? "Suas vidas acabaram!" : "Desbloqueie o PRO"}
              </DialogTitle>
            </div>

            <DialogDescription className="text-sm leading-relaxed text-slate-400">
              {isLives
                ? "Ative o PRO (trial ou plano) para vidas infinitas, ou aguarde para recuperar."
                : "Trial de 24h ou planos por período — explicações sem blur e vidas infinitas."}
            </DialogDescription>
          </DialogHeader>

          <ul className="relative mt-4 space-y-2">
            {features.map(({ icon: Icon, label }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 * i }}
                className="flex items-center gap-3 rounded-lg border border-slate-800/90 bg-slate-950/70 px-3 py-2.5 font-mono text-xs text-slate-300 sm:text-sm"
              >
                <span className="text-neon-green">›</span>
                <Icon className="size-3.5 shrink-0 text-neon-cyan" />
                {label}
              </motion.li>
            ))}
          </ul>

          <div className="relative mt-5 space-y-3">
            {isProEfetivo ? (
              <p className="rounded-lg border border-neon-green/30 bg-neon-green/10 px-3 py-2 text-center font-mono text-xs text-neon-green">
                PRO já ativo nesta conta.
              </p>
            ) : (
              <>
                {!user && onAuthClick && (
                  <Button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onAuthClick();
                    }}
                    className="h-10 w-full gap-2 border border-neon-cyan/35 bg-neon-cyan/10 font-semibold text-neon-cyan hover:bg-neon-cyan/20"
                  >
                    <LogIn className="size-4" />
                    Entrar para usar trial / PRO
                  </Button>
                )}

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

                <ProPlans />
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full font-mono text-xs text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
              onClick={() => onOpenChange(false)}
            >
              {isLives ? "> wait --recover" : "> continue --free"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
