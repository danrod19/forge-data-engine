"use client";

import { Flame, Heart, Crown, LogIn, User, Infinity } from "lucide-react";
import { motion } from "framer-motion";
import { MAX_LIVES } from "@/data/questions";
import { useAuth } from "@/components/auth/AuthProvider";

interface TopBarProps {
  streak: number;
  lives: number;
  isPro: boolean;
  /** Evita mismatch de auth no 1º paint */
  statsReady?: boolean;
  onUpgradeClick: () => void;
  onAuthClick: () => void;
  onAccountClick: () => void;
  onLogoClick?: () => void;
}

export function TopBar({
  streak,
  lives,
  isPro,
  statsReady = true,
  onUpgradeClick,
  onAuthClick,
  onAccountClick,
  onLogoClick,
}: TopBarProps) {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        {/* Logo */}
        <button
          type="button"
          onClick={onLogoClick}
          className="flex min-w-0 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-neon-green/40"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-neon-green/30 bg-neon-green/10">
            <span className="text-xs font-bold text-neon-green">CF</span>
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100">
              CCNA <span className="text-neon-green">Forge</span>
            </p>
            <p className="truncate text-[10px] text-slate-500">200-301 v2.0</p>
          </div>
        </button>

        {/* Stats + actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Streak */}
          <motion.div
            className="flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1"
            whileHover={{ scale: 1.05 }}
          >
            <Flame
              className="size-3.5 text-orange-400 sm:size-4"
              fill="currentColor"
            />
            <span className="text-xs font-semibold tabular-nums text-orange-300 sm:text-sm">
              {statsReady ? streak : "—"}
            </span>
          </motion.div>

          {/* Lives */}
          <motion.div
            className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1"
            whileHover={{ scale: 1.05 }}
            key={isPro ? "pro" : lives}
            initial={false}
            animate={{ scale: 1 }}
          >
            {isPro ? (
              <>
                <Infinity className="size-3.5 text-rose-400 sm:size-4" />
                <span className="text-xs font-semibold text-rose-300 sm:text-sm">
                  ∞
                </span>
              </>
            ) : (
              <>
                <Heart
                  className="size-3.5 text-rose-400 sm:size-4"
                  fill="currentColor"
                />
                <span className="text-xs font-semibold tabular-nums text-rose-300 sm:text-sm">
                  {statsReady ? `${lives}/${MAX_LIVES}` : `—/${MAX_LIVES}`}
                </span>
              </>
            )}
          </motion.div>

          {/* PRO badge or Upgrade */}
          {isPro ? (
            <span className="flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300 sm:gap-1.5 sm:px-2.5 sm:text-xs">
              <Crown className="size-3 sm:size-3.5" fill="currentColor" />
              PRO
            </span>
          ) : (
            <motion.button
              type="button"
              onClick={onUpgradeClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-1 overflow-hidden rounded-full px-2.5 py-1.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 sm:gap-1.5 sm:px-3 sm:text-sm"
            >
              <span className="gold-gradient absolute inset-0" />
              <span className="relative flex items-center gap-1 sm:gap-1.5">
                <Crown className="size-3.5 sm:size-4" fill="currentColor" />
                <span className="hidden sm:inline">Upgrade PRO</span>
                <span className="sm:hidden">PRO</span>
              </span>
            </motion.button>
          )}

          {/* Conta (sempre) + Entrar se deslogado */}
          <motion.button
            type="button"
            onClick={onAccountClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1.5 text-[10px] font-medium text-slate-300 transition-colors hover:border-neon-green/40 hover:text-neon-green sm:gap-1.5 sm:px-2.5 sm:text-xs"
            title="Conta"
            aria-label="Conta"
          >
            <User className="size-3.5" />
            <span className="hidden sm:inline">Conta</span>
          </motion.button>

          {!loading && !user && (
            <motion.button
              type="button"
              onClick={onAuthClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1 rounded-full border border-neon-green/35 bg-neon-green/10 px-2 py-1.5 text-[10px] font-medium text-neon-green transition-colors hover:bg-neon-green/20 sm:gap-1.5 sm:px-2.5 sm:text-xs"
            >
              <LogIn className="size-3.5" />
              <span className="hidden sm:inline">Entrar</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
