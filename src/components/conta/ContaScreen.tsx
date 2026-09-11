"use client";

import { useEffect, useState } from "react";
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
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProPlans, TrialButton } from "@/components/pro/ProPlans";
import { formatProExpiresAt } from "@/lib/pro";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/types/question";
import { RESET_PASSWORD_SENT_COPY } from "@/lib/auth-flow";
import { launchCopy } from "@/data/copy";
import {
  listSimuladoRuns,
  SIMULADO_RUN_TRACK_LABEL,
  type SimuladoRunRow,
} from "@/lib/simulado-runs";

interface ContaScreenProps {
  onAuthClick: () => void;
  onUpgrade: () => void;
}

export function ContaScreen({ onAuthClick }: ContaScreenProps) {
  const {
    user,
    isProEfetivo,
    proExpiresAt,
    trialAvailable,
    loading,
    signOut,
    resetPassword,
    startTrial,
  } = useAuth();
  const [resetStatus, setResetStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const expiresLabel = formatProExpiresAt(proExpiresAt);

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
    setResetMessage(RESET_PASSWORD_SENT_COPY);
  };

  const handleTrial = async () => {
    setTrialLoading(true);
    setTrialError(null);
    const { error } = await startTrial();
    if (error) setTrialError(error);
    setTrialLoading(false);
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
              Gerencie login, trial e planos PRO no CCNA Forge.
            </p>
          </div>
        </div>
      </section>

      {!user ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm leading-relaxed text-slate-300">
            Entre ou crie uma conta para usar o{" "}
            <span className="text-neon-green">trial de 24h</span> e sincronizar
            o plano <span className="text-amber-300">PRO</span>.
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
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {isProEfetivo ? (
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
                {trialAvailable ? (
                  <span className="rounded-full border border-neon-green/30 bg-neon-green/10 px-2 py-0.5 text-[10px] font-medium text-neon-green">
                    trial disponível
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-500">
                    trial já usado
                  </span>
                )}
              </div>

              {isProEfetivo ? (
                <div className="mt-2 space-y-1">
                  <p className="text-[12px] text-neon-green">
                    Plano PRO ativo — vidas infinitas e explicações liberadas.
                  </p>
                  {expiresLabel && (
                    <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                      <Clock className="size-3.5 text-neon-cyan" />
                      Expira em {expiresLabel}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[12px] text-slate-400">
                  No Free, vidas são limitadas e explicações profundas ficam com
                  blur.
                </p>
              )}
            </div>
          </section>

          {!isProEfetivo && (
            <section className="space-y-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
                desbloquear pro
              </p>
              <p className="text-[12px] leading-relaxed text-slate-400">
                {launchCopy.paragraph}
              </p>
              <ul className="space-y-1.5 font-mono text-[11px] leading-relaxed text-slate-300">
                {launchCopy.proBullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-neon-green">›</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {trialAvailable && (
                <div className="space-y-2">
                  <TrialButton onStart={handleTrial} loading={trialLoading} />
                  {trialError && (
                    <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-300">
                      ! {trialError}
                    </p>
                  )}
                </div>
              )}
              <ProPlans />
            </section>
          )}

          <SimuladoHistorySection userId={user.id} />

          {isProEfetivo && (
            <section className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                renovar / estender
              </p>
              <p className="text-[12px] text-slate-400">
                Compre outro período para estender o PRO (ativação manual após
                pagamento).
              </p>
              <ProPlans />
            </section>
          )}

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

function formatRunDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function SimuladoHistorySection({ userId }: { userId: string }) {
  const [rows, setRows] = useState<SimuladoRunRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listSimuladoRuns(20).then(({ rows: next }) => {
      if (cancelled) return;
      setRows(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center gap-2">
        <History className="size-4 text-neon-cyan" />
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          histórico de simulados
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-2 text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          <span className="font-mono text-[11px]">$ history --tail 20 …</span>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-slate-400">
          Você ainda não terminou um simulado logado.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((run) => (
            <li
              key={run.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200">
                  {SIMULADO_RUN_TRACK_LABEL[run.track] ?? run.track}
                </p>
                <p className="font-mono text-[10px] text-slate-500">
                  {formatRunDate(run.created_at)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm font-bold tabular-nums text-neon-green">
                  {run.percentual}%
                </p>
                <p className="font-mono text-[10px] tabular-nums text-slate-500">
                  {run.acertos}/{run.total}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
