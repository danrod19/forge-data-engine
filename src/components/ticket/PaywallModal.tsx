"use client";

import { Crown, Heart, Infinity, Clock, Zap, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: "lives" | "upgrade";
}

const features = [
  { icon: Infinity, label: "Vidas infinitas — sem cooldown de 4h" },
  { icon: Zap, label: "Explicações profundas e labs premium" },
  { icon: Clock, label: "Diagnósticos CLI ilimitados" },
];

export function PaywallModal({ open, onOpenChange, reason }: PaywallModalProps) {
  const isLives = reason === "lives";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,24rem)] gap-0 overflow-hidden border-slate-700/80 bg-[#0a0f1a] p-0 shadow-2xl shadow-neon-green/5 sm:max-w-md">
        {/* Terminal-style top chrome */}
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

        <div className="relative p-6">
          {/* Grid bg */}
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
                ? "Assine o PRO para vidas infinitas ou aguarde 4 horas para recuperar."
                : "Acesse explicações profundas, diagnósticos detalhados e vidas infinitas."}
            </DialogDescription>
          </DialogHeader>

          <ul className="relative mt-5 space-y-2">
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

          <div className="relative mt-6 flex flex-col gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                className="relative h-11 w-full overflow-hidden border-0 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25"
                onClick={() => onOpenChange(false)}
              >
                <span className="gold-gradient absolute inset-0" />
                <span className="relative flex items-center justify-center gap-2">
                  <Crown className="size-4" fill="currentColor" />
                  Assinar PRO — R$ 29,90/mês
                </span>
              </Button>
            </motion.div>
            <Button
              type="button"
              variant="ghost"
              className="h-9 font-mono text-xs text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
              onClick={() => onOpenChange(false)}
            >
              {isLives ? "> wait --hours 4" : "> continue --free"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
