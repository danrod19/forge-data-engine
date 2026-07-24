"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Crown,
  LogIn,
  LogOut,
  KeyRound,
  Mail,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/types/question";

interface ContaScreenProps {
  onAuthClick: () => void;
  onUpgrade: () => void;
}

export function ContaScreen({ onAuthClick, onUpgrade }: ContaScreenProps) {
  const { user, isPro, loading, signOut, resetPassword } = useAuth();
  const [resetStatus, setResetStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetStatus("loading");
    setResetMessage(null);
    const { error } = await resetPassword(user.email);
    if (error) {
      setResetStatus("error");
      setResetMessage(error);
      return;
    }
    setResetStatus("ok");
    setResetMessage(
      "E-mail de redefinição enviado. Confira sua caixa de entrada (e spam)."
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Loader2 className="size-6 animate-spin text-neon-green" />
        <p className="font-mono text-xs text-slate-500">$ auth --status …</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-2"
    >
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-neon-green/35 bg-neon-green/10">
            <User className="size-6 text-neon-green" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
              $ whoami
            </p>
            <h1 className="mt-0.5 text-lg font-bold text-slate-50">Conta</h1>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
              Gerencie login, plano e acesso PRO no CCNA Forge.
            </p>
          </div>
        </div>
      </section>

      {!user ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm leading-relaxed text-slate-300">
            Entre ou crie uma conta para sincronizar o status{" "}
            <span className="text-amber-300">PRO</span> e liberar vidas
            infinitas + explicações completas.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button
              type="button"
              onClick={onAuthClick}
              className="h-11 w-full gap-2 border border-neon-green/40 bg-neon-green/15 font-semibold text-neon-green hover:bg-neon-green/25"
            >
              <LogIn className="size-4" />
              Entrar / Criar conta
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                e-mail
              </p>
              <p className="mt-1 break-all font-mono text-sm text-slate-100">
                {user.email}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                plano
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                {isPro ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-300">
                    <Crown className="size-3.5" fill="currentColor" />
                    PRO
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300">
                    <Shield className="size-3.5" />
                    Free
                  </span>
                )}
              </div>
              {isPro ? (
                <p className="mt-2 text-[12px] text-neon-green">
                  Plano PRO ativo — vidas infinitas e explicações liberadas.
                </p>
              ) : (
                <p className="mt-2 text-[12px] text-slate-400">
                  No Free, vidas são limitadas e explicações profundas ficam com
                  blur.
                </p>
              )}
            </div>

            {!isPro && (
              <Button
                type="button"
                onClick={onUpgrade}
                className="relative h-10 w-full overflow-hidden border-0 text-sm font-bold text-slate-950"
              >
                <span className="gold-gradient absolute inset-0" />
                <span className="relative flex items-center justify-center gap-1.5">
                  <Crown className="size-4" fill="currentColor" />
                  Upgrade PRO
                </span>
              </Button>
            )}
          </section>

          <section className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              ações
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={resetStatus === "loading"}
              onClick={() => void handleResetPassword()}
              className="h-10 w-full justify-start gap-2 border-slate-700 bg-slate-950/50 font-mono text-xs text-slate-200 hover:bg-slate-800"
            >
              {resetStatus === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4 text-neon-cyan" />
              )}
              Enviar e-mail de redefinição de senha
            </Button>
            {resetMessage && (
              <p
                className={`rounded-md border px-3 py-2 font-mono text-[11px] ${
                  resetStatus === "error"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    : "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan"
                }`}
              >
                › {resetMessage}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => void signOut()}
              className="h-10 w-full justify-start gap-2 border-slate-700 bg-slate-950/50 font-mono text-xs text-rose-300 hover:bg-rose-500/10"
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </section>
        </>
      )}

      <section className="rounded-xl border border-slate-800/90 bg-slate-900/40 p-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-neon-cyan" />
          <div>
            <p className="text-sm font-semibold text-slate-100">Contato</p>
            <a
              href={CONTACT_MAILTO}
              className="mt-1 inline-block font-mono text-sm text-neon-cyan underline-offset-2 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
