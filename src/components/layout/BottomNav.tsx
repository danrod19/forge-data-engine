"use client";

import { Home, Map, ClipboardList, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { NavTab } from "@/types/question";

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

/** Tabs do bottom (Conta e Sobre ficam fora — TopBar / Home). */
const tabs: { id: NavTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "trilha", label: "Trilha", icon: Map },
  { id: "simulado", label: "Simulado", icon: ClipboardList },
  { id: "estudo", label: "Estudo", icon: BookOpen },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  /** Destaca o item da bottom nav mesmo se a tela ativa for sobre/conta */
  const highlight: NavTab =
    active === "sobre" || active === "conta" ? "home" : active;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex h-16 max-w-2xl items-stretch justify-around px-1 sm:px-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = highlight === id && active === id;
          const isSoft =
            (active === "sobre" || active === "conta") && id === "home";
          const lit = isActive || isSoft;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-medium transition-colors sm:text-[10px]",
                lit
                  ? "text-neon-green"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {lit && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-neon-green shadow-[0_0_8px_#22c55e] sm:inset-x-4"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "size-5",
                  lit && "drop-shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                )}
                strokeWidth={lit ? 2.25 : 1.75}
              />
              <span className="max-w-full truncate leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
