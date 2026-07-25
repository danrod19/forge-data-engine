"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TicketDeSuporte } from "@/components/ticket/TicketDeSuporte";
import { PaywallModal } from "@/components/ticket/PaywallModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { SimuladoMode } from "@/components/simulado/SimuladoMode";
import { EstudoMode } from "@/components/estudo/EstudoMode";
import { SobreProva } from "@/components/sobre/SobreProva";
import { HomeScreen } from "@/components/home/HomeScreen";
import { ContaScreen } from "@/components/conta/ContaScreen";
import { useAuth } from "@/components/auth/AuthProvider";
import { INITIAL_LIVES, INITIAL_STREAK } from "@/data/questions";
import {
  createTrilhaSession,
  TOTAL_TICKETS,
} from "@/data/tickets";
import type { NavTab, Question } from "@/types/question";

const LIVES_STORAGE_KEY = "ccna-forge-lives";
const STREAK_STORAGE_KEY = "ccna-forge-streak";

function readStoredNumber(key: string, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

export default function HomePage() {
  const { isPro, isProEfetivo } = useAuth();
  // isPro === isProEfetivo (pro_expires_at no futuro)

  /**
   * Hydration-safe:
   * - activeTab starts as "home" (stable SSR/static)
   * - trilhaSession starts empty — Fisher–Yates only after mount
   * - lives/streak: defaults first paint, then localStorage in useEffect
   */
  const [mounted, setMounted] = useState(false);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [streak, setStreak] = useState(INITIAL_STREAK);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<"lives" | "upgrade">(
    "upgrade"
  );
  const [authOpen, setAuthOpen] = useState(false);
  const [trilhaSession, setTrilhaSession] = useState<Question[]>([]);
  const [trilhaKey, setTrilhaKey] = useState(0);

  // Client-only: mount flag + localStorage stats + first trilha shuffle
  useEffect(() => {
    setMounted(true);
    setLives(readStoredNumber(LIVES_STORAGE_KEY, INITIAL_LIVES));
    setStreak(readStoredNumber(STREAK_STORAGE_KEY, INITIAL_STREAK));
  }, []);

  // Shuffle only after mount / when session key changes (never on SSR)
  useEffect(() => {
    if (!mounted) return;
    setTrilhaSession(createTrilhaSession());
  }, [mounted, trilhaKey]);

  // Persist lives (client-only)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(LIVES_STORAGE_KEY, String(lives));
    } catch {
      /* ignore */
    }
  }, [lives, mounted]);

  const openUpgrade = useCallback(() => {
    setPaywallReason("upgrade");
    setPaywallOpen(true);
  }, []);

  const handleWrongAnswer = useCallback(() => {
    if (isPro) return;

    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) {
        queueMicrotask(() => {
          setPaywallReason("lives");
          setPaywallOpen(true);
        });
      }
      return next;
    });
  }, [isPro]);

  const startNewTrilhaSession = useCallback(() => {
    setTrilhaSession([]);
    setTrilhaKey((k) => k + 1);
  }, []);

  const livesBlocked = !isPro && lives === 0;

  return (
    <div className="relative flex min-h-dvh flex-col tech-grid">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 size-72 rounded-full bg-neon-green/5 blur-3xl" />
        <div className="absolute -right-24 bottom-32 size-64 rounded-full bg-neon-cyan/5 blur-3xl" />
      </div>

      <TopBar
        streak={streak}
        lives={lives}
        isPro={isPro}
        statsReady={mounted}
        onUpgradeClick={openUpgrade}
        onAuthClick={() => setAuthOpen(true)}
        onAccountClick={() => setActiveTab("conta")}
        onLogoClick={() => setActiveTab("home")}
      />

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-3 pb-24 pt-4 sm:px-4 sm:pt-6">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <HomeScreen
                isPro={isProEfetivo}
                onNavigate={setActiveTab}
                onUpgrade={openUpgrade}
                onAuthClick={() => setAuthOpen(true)}
              />
            </motion.div>
          )}

          {activeTab === "trilha" && (
            <motion.div
              key={`trilha-${trilhaKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TicketDeSuporte
                questions={trilhaSession}
                lives={lives}
                isPro={isPro}
                onWrongAnswer={handleWrongAnswer}
                onUpgrade={openUpgrade}
                disabled={livesBlocked}
                bankSize={TOTAL_TICKETS}
                onNewSession={startNewTrilhaSession}
                onExit={() => setActiveTab("home")}
                loading={!mounted || trilhaSession.length === 0}
              />
            </motion.div>
          )}

          {activeTab === "simulado" && (
            <motion.div
              key="simulado"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SimuladoMode
                lives={lives}
                isPro={isPro}
                onWrongAnswer={handleWrongAnswer}
                disabled={livesBlocked}
                onUpgrade={openUpgrade}
              />
            </motion.div>
          )}

          {activeTab === "estudo" && (
            <motion.div
              key="estudo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <EstudoMode
                lives={lives}
                onWrongAnswer={handleWrongAnswer}
                disabled={livesBlocked}
              />
            </motion.div>
          )}

          {activeTab === "sobre" && (
            <motion.div
              key="sobre"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SobreProva />
            </motion.div>
          )}

          {activeTab === "conta" && (
            <motion.div
              key="conta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ContaScreen
                onAuthClick={() => setAuthOpen(true)}
                onUpgrade={openUpgrade}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        reason={paywallReason}
        onAuthClick={() => setAuthOpen(true)}
      />

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
