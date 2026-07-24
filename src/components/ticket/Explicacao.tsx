"use client";

import { Lock, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ExplicacaoProps {
  text: string;
  isPremium: boolean;
  isCorrect: boolean;
  onUpgrade: () => void;
}

export function Explicacao({
  text,
  isPremium,
  isCorrect,
  onUpgrade,
}: ExplicacaoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className={`relative rounded-xl border p-4 ${
          isCorrect
            ? "border-neon-green/30 bg-neon-green/5"
            : "border-rose-500/30 bg-rose-500/5"
        }`}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          {isCorrect ? "✓ Diagnóstico" : "✗ Análise do erro"}
        </p>

        {isPremium ? (
          <div className="relative min-h-[130px]">
            <p className="select-none text-sm leading-relaxed text-slate-300 blur-[7px]">
              {text}
            </p>

            {/* Premium lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-slate-950/75 via-slate-950/85 to-slate-950/90 backdrop-blur-[3px]">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(251,191,36,0.0)",
                    "0 0 24px 4px rgba(251,191,36,0.35)",
                    "0 0 0 0 rgba(251,191,36,0.0)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="flex size-14 items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/15"
              >
                <Lock className="size-6 text-amber-400" />
              </motion.div>

              <div className="max-w-xs space-y-1 px-4 text-center">
                <p className="text-sm font-semibold text-slate-100">
                  Conteúdo <span className="text-amber-400">PRO</span>
                </p>
                <p className="text-xs leading-relaxed text-slate-400">
                  Assine o PRO para ver explicações completas e diagnósticos
                  detalhados de engenharia de rede
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <Button
                  type="button"
                  onClick={onUpgrade}
                  className="relative h-10 overflow-hidden border-0 px-5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/30"
                >
                  <span className="gold-gradient absolute inset-0" />
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/25 to-transparent"
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                  />
                  <span className="relative flex items-center gap-1.5">
                    <Crown className="size-4" fill="currentColor" />
                    Desbloquear PRO
                    <Sparkles className="size-3.5" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm leading-relaxed text-slate-200"
          >
            {text}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
