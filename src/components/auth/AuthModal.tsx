"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Terminal, Loader2, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  RESET_PASSWORD_SENT_COPY,
  SIGNUP_DUPLICATE_COPY,
} from "@/lib/auth-flow";

export type AuthModalMode = "signin" | "signup" | "forgot";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: AuthModalMode;
  initialEmail?: string;
}

export function AuthModal({
  open,
  onOpenChange,
  initialMode = "signin",
  initialEmail = "",
}: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetFeedback = () => {
    setError(null);
    setInfo(null);
    setDuplicate(false);
  };

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setEmail(initialEmail);
    setPassword("");
    setSubmitting(false);
    setError(null);
    setInfo(null);
    setDuplicate(false);
  }, [open, initialMode, initialEmail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetFeedback();
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        const { error: err } = await resetPassword(email.trim());
        if (err) {
          setError(err);
          return;
        }
        setInfo(RESET_PASSWORD_SENT_COPY);
        return;
      }

      if (mode === "signin") {
        const { error: err } = await signIn(email.trim(), password);
        if (err) {
          setError(err);
          return;
        }
        onOpenChange(false);
        setEmail("");
        setPassword("");
        return;
      }

      const { error: err, duplicate: isDup } = await signUp(
        email.trim(),
        password
      );
      if (isDup) {
        setDuplicate(true);
        setPassword("");
        return;
      }
      if (err) {
        setError(err);
        return;
      }
      setInfo(
        "Conta criada. Se o e-mail de confirmação estiver ativo no Supabase, confira sua caixa de entrada — ou faça login se a sessão já foi aberta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (next: AuthModalMode) => {
    setMode(next);
    setPassword("");
    resetFeedback();
  };

  const title =
    mode === "signin"
      ? "Entrar"
      : mode === "signup"
        ? "Criar conta"
        : "Redefinir senha";
  const prompt =
    mode === "signin"
      ? "$ login --session"
      : mode === "signup"
        ? "$ useradd --create"
        : "$ passwd --reset";
  const description =
    mode === "signin"
      ? "Acesse sua conta para sincronizar o status PRO."
      : mode === "signup"
        ? "Crie uma conta com e-mail e senha (mín. 6 caracteres)."
        : "Informe o e-mail da conta. Enviaremos um link se ele estiver cadastrado.";

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
              {prompt}
            </p>
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-50">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              {description}
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

            {mode !== "forgot" && !duplicate && (
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
            )}

            {mode === "signin" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="font-mono text-[11px] text-slate-500 transition-colors hover:text-neon-cyan"
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            {duplicate && (
              <div className="space-y-3 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-3">
                <p className="font-mono text-xs text-amber-200">
                  {SIGNUP_DUPLICATE_COPY}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    onClick={() => switchMode("signin")}
                    className="h-10 w-full gap-2 border border-neon-green/40 bg-neon-green/15 font-semibold text-neon-green hover:bg-neon-green/25"
                  >
                    <LogIn className="size-4" />
                    Entrar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => switchMode("forgot")}
                    className="h-10 w-full gap-2 border-slate-700 bg-slate-950/50 font-mono text-xs text-slate-200 hover:bg-slate-800"
                  >
                    <KeyRound className="size-4 text-neon-cyan" />
                    Esqueci a senha
                  </Button>
                </div>
              </div>
            )}

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

            {!duplicate && (
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
                  ) : mode === "signup" ? (
                    <UserPlus className="size-4" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  {mode === "signin"
                    ? "Entrar"
                    : mode === "signup"
                      ? "Criar conta"
                      : "Enviar link"}
                </Button>
              </motion.div>
            )}
          </form>

          {!duplicate && (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
