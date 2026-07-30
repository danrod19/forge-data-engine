"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStripePlans,
  type StripePlan,
} from "@/lib/stripe-plans";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/types/question";
import { cn } from "@/lib/utils";

interface ProPlansProps {
  className?: string;
}

function openPlan(plan: StripePlan) {
  if (!plan.url) {
    window.alert(
      `Link do plano ${plan.durationLabel} ainda não configurado.\n\nPor favor, entre em contato:\n${CONTACT_EMAIL}`
    );
    console.warn(`Stripe link not configured for plan ${plan.id}`);
    return;
  }
  window.open(plan.url, "_blank", "noopener,noreferrer");
}

export function ProPlans({ className }: ProPlansProps) {
  const plans = getStripePlans();

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="grid grid-cols-1 gap-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => openPlan(plan)}
            className={cn(
              "relative flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
              plan.bestValue
                ? "border-amber-400/45 bg-amber-500/10 hover:bg-amber-500/15"
                : "border-slate-700/90 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-900/80"
            )}
          >
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-slate-50">
                  {plan.priceLabel}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  · {plan.durationLabel}
                </span>
                {plan.bestValue && (
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                    <Sparkles className="size-2.5" />
                    Melhor custo
                  </span>
                )}
              </span>
            </span>
            <ExternalLink
              className={cn(
                "size-4 shrink-0",
                plan.bestValue ? "text-amber-300" : "text-slate-500"
              )}
            />
          </button>
        ))}
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        Após o pagamento, a ativação pode levar alguns minutos. Já pagou?
        Escreva para{" "}
        <a
          href={CONTACT_MAILTO}
          className="font-mono text-neon-cyan underline-offset-2 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </div>
  );
}

interface TrialButtonProps {
  onStart: () => Promise<void> | void;
  loading?: boolean;
  className?: string;
}

export function TrialButton({ onStart, loading, className }: TrialButtonProps) {
  return (
    <Button
      type="button"
      disabled={loading}
      onClick={() => void onStart()}
      className={cn(
        "h-11 w-full gap-2 border border-neon-green/45 bg-neon-green/15 font-semibold text-neon-green hover:bg-neon-green/25",
        className
      )}
    >
      {loading ? "Ativando trial…" : "Começar trial grátis (24h)"}
    </Button>
  );
}
