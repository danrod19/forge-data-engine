"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Terminal, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = "signin" | "signup";

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetFeedback = () => {
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const { error: err } = await signIn(email.trim(), password);
        if (err) {
          setError(err);
          return;
        }
        onOpenChange(false);
        setEmail("");
        setPassword("");
      } else {
        const { error: err } = await signUp(email.trim(), password);
        if (err) {
          setError(err);
          return;
        }
        setInfo(
          "Conta criada. Se o e-mail de confirmação estiver ativo no Supabase, confira sua caixa de entrada — ou faça login se a sessão já foi aberta."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    resetFeedback();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,24rem)] gap-0 overflow-hidden border-slate-700/80 bg-[#0a0f1a] p-0 shadow-2xl shadow-neon-green/5 sm:max-w-md">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/90 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-1 flex flex-1 items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <Terminal className="size-3" />
            auth.sh — root@ccna-forge
          </span>
        </div>

        <div className="h-0.5 w-full bg-neon-green/40" />

        <div className="relative p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          <DialogHeader className="relative space-y-2 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-green/70">
              {mode === "signin" ? "$ login --session" : "$ useradd --create"}
            </p>
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-50">
              {mode === "signin" ? "Entrar" : "Criar conta"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              {mode === "signin"
                ? "Acesse sua conta para sincronizar o status PRO."
                : "Crie uma conta com e-mail e senha (mín. 6 caracteres)."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="relative mt-5 space-y-3">
            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                email
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 font-mono text-sm text-slate-100 outline-none ring-neon-green/40 placeholder:text-slate-600 focus:border-neon-green/50 focus:ring-2"
                placeholder="voce@email.com"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                password
              </span>
              <input
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 font-mono text-sm text-slate-100 outline-none ring-neon-green/40 placeholder:text-slate-600 focus:border-neon-green/50 focus:ring-2"
                placeholder="••••••••"
              />
            </label>

            {error && (
              <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-300">
                ! {error}
              </p>
            )}
            {info && (
              <p className="rounded-md border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-2 font-mono text-xs text-neon-cyan">
                › {info}
              </p>
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full gap-2 border border-neon-green/40 bg-neon-green/15 font-semibold text-neon-green hover:bg-neon-green/25"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === "signin" ? (
                  <LogIn className="size-4" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {mode === "signin" ? "Entrar" : "Criar conta"}
              </Button>
            </motion.div>
          </form>

          <div className="relative mt-4 text-center">
            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-mono text-xs text-slate-500 transition-colors hover:text-neon-cyan"
              >
                {">"} ainda não tem conta? criar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="font-mono text-xs text-slate-500 transition-colors hover:text-neon-cyan"
              >
                {">"} já tem conta? entrar
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
