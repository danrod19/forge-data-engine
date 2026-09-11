"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Terminal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";

interface RecoveryModalProps {
  onRequestNewLink: (email?: string) => void;
}

export function RecoveryModal({ onRequestNewLink }: RecoveryModalProps) {
  const {
    user,
    loading,
    passwordRecovery,
    updatePassword,
    clearPasswordRecovery,
  } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const invalid = passwordRecovery === "invalid";
  const open =
    !loading &&
    (passwordRecovery === "ready" || passwordRecovery === "invalid");

  const handleOpenChange = (next: boolean) => {
    if (next) return;
    setPassword("");
    setConfirm("");
    setError(null);
    setDone(false);
    clearPasswordRecovery({ clearHint: invalid });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("A senha precisa ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } = await updatePassword(password);
      if (err) {
        setError(err);
        return;
      }
      setDone(true);
      window.setTimeout(() => {
        setPassword("");
        setConfirm("");
        setDone(false);
        clearPasswordRecovery({ clearHint: true });
      }, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewLink = () => {
    const email = user?.email ?? "";
    setPassword("");
    setConfirm("");
    setError(null);
    setDone(false);
    clearPasswordRecovery({ clearHint: true });
    onRequestNewLink(email);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,24rem)] gap-0 overflow-hidden border-slate-700/80 bg-[#0a0f1a] p-0 shadow-2xl shadow-neon-green/5 sm:max-w-md">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/90 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-1 flex flex-1 items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <Terminal className="size-3" />
            passwd.sh — root@ccna-forge
          </span>
        </div>

        <div className="h-0.5 w-full bg-neon-green/40" />

        <div className="relative p-6">
          <DialogHeader className="relative space-y-2 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon-green/70">
              {invalid ? "$ passwd --expired" : "$ passwd --new"}
            </p>
            <DialogTitle className="text-lg font-bold tracking-tight text-slate-50">
              {done
                ? "Senha atualizada"
                : invalid
                  ? "Link inválido ou expirado"
                  : "Nova senha"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              {done
                ? "Entrando no app com a sessão atualizada."
                : invalid
                  ? "Este link de redefinição é inválido ou expirou. Peça um novo link para continuar."
                  : "Defina uma nova senha para sua conta."}
            </DialogDescription>
          </DialogHeader>

          {done ? (
            <p className="relative mt-5 rounded-md border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-2 font-mono text-xs text-neon-cyan">
              › Senha atualizada
            </p>
          ) : invalid ? (
            <div className="relative mt-5 space-y-3">
              <Button
                type="button"
                onClick={handleNewLink}
                className="h-11 w-full gap-2 border border-neon-green/40 bg-neon-green/15 font-semibold text-neon-green hover:bg-neon-green/25"
              >
                <KeyRound className="size-4" />
                Pedir novo link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative mt-5 space-y-3">
              <label className="block space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  nova senha
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 font-mono text-sm text-slate-100 outline-none ring-neon-green/40 placeholder:text-slate-600 focus:border-neon-green/50 focus:ring-2"
                  placeholder="••••••••"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  confirmar
                </span>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 font-mono text-sm text-slate-100 outline-none ring-neon-green/40 placeholder:text-slate-600 focus:border-neon-green/50 focus:ring-2"
                  placeholder="••••••••"
                />
              </label>

              {error && (
                <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-xs text-rose-300">
                  ! {error}
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
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  Salvar senha
                </Button>
              </motion.div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
