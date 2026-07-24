"use client";

import { Flame, Heart, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { MAX_LIVES } from "@/data/questions";

interface TopBarProps {
  streak: number;
  lives: number;
  onUpgradeClick: () => void;
}

export function TopBar({ streak, lives, onUpgradeClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        {/* Logo */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-neon-green/30 bg-neon-green/10">
            <span className="text-xs font-bold text-neon-green">CF</span>
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-semibold tracking-tight text-slate-100">
              CCNA <span className="text-neon-green">Forge</span>
            </p>
            <p className="truncate text-[10px] text-slate-500">200-301 v2.0</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          <motion.div
            className="flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1"
            whileHover={{ scale: 1.05 }}
          >
            <Flame className="size-3.5 text-orange-400 sm:size-4" fill="currentColor" />
            <span className="text-xs font-semibold tabular-nums text-orange-300 sm:text-sm">
              {streak}
            </span>
          </motion.div>

          {/* Lives */}
          <motion.div
            className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1"
            whileHover={{ scale: 1.05 }}
            key={lives}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Heart className="size-3.5 text-rose-400 sm:size-4" fill="currentColor" />
            <span className="text-xs font-semibold tabular-nums text-rose-300 sm:text-sm">
              {lives}/{MAX_LIVES}
            </span>
          </motion.div>

          {/* Upgrade PRO */}
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
              <span className="hidden xs:inline sm:inline">Upgrade PRO</span>
              <span className="sm:hidden">PRO</span>
            </span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
