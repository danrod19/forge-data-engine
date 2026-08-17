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
  trilhaSessionCopy,
} from "@/data/tickets";
import type { NavTab, Question } from "@/types/question";
import {
  livesStorageKey,
  streakStorageKey,
  useTrack,
} from "@/lib/track-context";

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
  const { track, trackReady } = useTrack();

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
  const [simuladoKey, setSimuladoKey] = useState(0);

  // Client-only mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load lives/streak when track is ready or changes
  useEffect(() => {
    if (!mounted || !trackReady) return;
    setLives(readStoredNumber(livesStorageKey(track), INITIAL_LIVES));
    setStreak(readStoredNumber(streakStorageKey(track), INITIAL_STREAK));
  }, [mounted, trackReady, track]);

  // Trilha session per track
  useEffect(() => {
    if (!mounted || !trackReady) return;
    setTrilhaSession(createTrilhaSession(10, track));
  }, [mounted, trackReady, track, trilhaKey]);

  // Persist lives per track
  useEffect(() => {
    if (!mounted || !trackReady) return;
    try {
      localStorage.setItem(livesStorageKey(track), String(lives));
    } catch {
      /* ignore */
    }
  }, [lives, mounted, track, trackReady]);

  // Persist streak per track
  useEffect(() => {
    if (!mounted || !trackReady) return;
    try {
      localStorage.setItem(streakStorageKey(track), String(streak));
    } catch {
      /* ignore */
    }
  }, [streak, mounted, track, trackReady]);

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

  const handleTrackChange = useCallback(() => {
    // Reset in-flight quiz sessions so tracks never mix mid-session
    setTrilhaSession([]);
    setTrilhaKey((k) => k + 1);
    setSimuladoKey((k) => k + 1);
    setActiveTab("home");
  }, []);

  const livesBlocked = !isPro && lives === 0;
  const trilhaCopy = trilhaSessionCopy(track);

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
        statsReady={mounted && trackReady}
        onUpgradeClick={openUpgrade}
        onAuthClick={() => setAuthOpen(true)}
        onAccountClick={() => setActiveTab("conta")}
        onLogoClick={() => setActiveTab("home")}
        onTrackChange={handleTrackChange}
      />

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-3 pb-24 pt-4 sm:px-4 sm:pt-6">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key={`home-${track}`}
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
              key={`trilha-${track}-${trilhaKey}`}
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
                bankSize={trilhaCopy.bankSize}
                sessionTitle={trilhaCopy.title}
                sessionSubtitle={trilhaCopy.subtitle}
                onNewSession={startNewTrilhaSession}
                onExit={() => setActiveTab("home")}
                loading={
                  !mounted || !trackReady || trilhaSession.length === 0
                }
              />
            </motion.div>
          )}

          {activeTab === "simulado" && (
            <motion.div
              key={`simulado-${track}-${simuladoKey}`}
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
              key={`estudo-${track}`}
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
              key={`sobre-${track}`}
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
