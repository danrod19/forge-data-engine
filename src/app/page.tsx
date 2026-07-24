"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TicketDeSuporte } from "@/components/ticket/TicketDeSuporte";
import { PaywallModal } from "@/components/ticket/PaywallModal";
import { SimuladoMode } from "@/components/simulado/SimuladoMode";
import { EstudoMode } from "@/components/estudo/EstudoMode";
import { SobreProva } from "@/components/sobre/SobreProva";
import { INITIAL_LIVES, INITIAL_STREAK } from "@/data/questions";
import {
  createTrilhaSession,
  TOTAL_TICKETS,
} from "@/data/tickets";
import type { NavTab, Question } from "@/types/question";

export default function HomePage() {
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [streak] = useState(INITIAL_STREAK);
  const [activeTab, setActiveTab] = useState<NavTab>("trilha");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState<"lives" | "upgrade">(
    "upgrade"
  );
  const [trilhaSession, setTrilhaSession] = useState<Question[]>(() =>
    createTrilhaSession()
  );
  const [trilhaKey, setTrilhaKey] = useState(0);

  const openUpgrade = useCallback(() => {
    setPaywallReason("upgrade");
    setPaywallOpen(true);
  }, []);

  const handleWrongAnswer = useCallback(() => {
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
  }, []);

  const startNewTrilhaSession = useCallback(() => {
    setTrilhaSession(createTrilhaSession());
    setTrilhaKey((k) => k + 1);
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col tech-grid">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-20 size-72 rounded-full bg-neon-green/5 blur-3xl" />
        <div className="absolute -right-24 bottom-32 size-64 rounded-full bg-neon-cyan/5 blur-3xl" />
      </div>

      <TopBar streak={streak} lives={lives} onUpgradeClick={openUpgrade} />

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-3 pb-24 pt-4 sm:px-4 sm:pt-6">
        <AnimatePresence mode="wait">
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
                onWrongAnswer={handleWrongAnswer}
                onUpgrade={openUpgrade}
                disabled={lives === 0}
                bankSize={TOTAL_TICKETS}
                onNewSession={startNewTrilhaSession}
                onExit={() => setActiveTab("sobre")}
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
                onWrongAnswer={handleWrongAnswer}
                disabled={lives === 0}
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
                disabled={lives === 0}
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
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      <PaywallModal
        open={paywallOpen}
        onOpenChange={setPaywallOpen}
        reason={paywallReason}
      />
    </div>
  );
}
