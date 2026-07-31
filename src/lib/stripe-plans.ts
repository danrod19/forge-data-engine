export type StripePlanId = "7d" | "30d" | "120d";

export interface StripePlan {
  id: StripePlanId;
  days: number;
  priceLabel: string;
  durationLabel: string;
  /** Destaque "Melhor custo" */
  bestValue: boolean;
  /** Payment Link (NEXT_PUBLIC_*) — vazio se não configurado */
  url: string;
}

/** Planos one-shot via Stripe Payment Links (sem subscription). */
export function getStripePlans(): StripePlan[] {
  return [
    {
      id: "7d",
      days: 7,
      priceLabel: "R$ 6,90",
      durationLabel: "7 dias",
      bestValue: false,
      url: (process.env.NEXT_PUBLIC_STRIPE_LINK_7D ?? "").trim(),
    },
    {
      id: "30d",
      days: 30,
      priceLabel: "R$ 20,90",
      durationLabel: "30 dias",
      bestValue: false,
      url: (process.env.NEXT_PUBLIC_STRIPE_LINK_30D ?? "").trim(),
    },
    {
      id: "120d",
      days: 120,
      priceLabel: "R$ 57,90",
      durationLabel: "120 dias",
      bestValue: true,
      url: (process.env.NEXT_PUBLIC_STRIPE_LINK_120D ?? "").trim(),
    },
  ];
}

export const PAYMENT_ACTIVATION_NOTE =
  "Após o pagamento, a ativação pode levar alguns minutos. Já pagou? Escreva para ccnaforge19@gmail.com";
