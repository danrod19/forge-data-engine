/** Espelho de src/lib/email/templates.ts para as Edge Functions (Deno). */

export const APP_URL = "https://forge-data-engine.vercel.app";
export const SUPPORT_EMAIL = "ccnaforge19@gmail.com";
export const DEFAULT_FROM = "onboarding@resend.dev";

export type PlanId = "7d" | "30d" | "120d";

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function planIdFromDays(days: number | null | undefined): PlanId | null {
  if (days === 7) return "7d";
  if (days === 30) return "30d";
  if (days === 120) return "120d";
  return null;
}

export function planDurationLabel(plan: PlanId | null): string | null {
  if (plan === "7d") return "7 dias";
  if (plan === "30d") return "30 dias";
  if (plan === "120d") return "120 dias";
  return null;
}

export function formatBrlFromCents(
  amountTotal: number | null | undefined
): string | null {
  if (amountTotal == null || !Number.isFinite(amountTotal)) return null;
  return (amountTotal / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function wrapHtml(inner: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#0b0f14;color:#e8eef5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px;line-height:1.5;">
${inner}
    <p style="margin:24px 0 0;">Suporte: <a href="mailto:${SUPPORT_EMAIL}" style="color:#7dd3fc;">${SUPPORT_EMAIL}</a></p>
  </div>
</body>
</html>`;
}

export function paymentConfirmedEmail(opts: {
  plan: PlanId | null;
  amountLabel: string | null;
}): EmailContent {
  const duration = planDurationLabel(opts.plan);
  const planLine = opts.plan
    ? duration
      ? `Recebemos o pagamento do plano ${opts.plan} (${duration}).`
      : `Recebemos o pagamento do plano ${opts.plan}.`
    : "Recebemos o pagamento do plano PRO.";
  const amountLine = opts.amountLabel ? `Valor: ${opts.amountLabel}` : null;

  const textLines = [
    "Olá,",
    "",
    planLine,
    ...(amountLine ? [amountLine] : []),
    "",
    "Seu acesso PRO está ativo.",
    "",
    `Abrir o CCNA Forge: ${APP_URL}`,
    "",
    `Suporte: ${SUPPORT_EMAIL}`,
  ];

  const htmlAmount = amountLine
    ? `    <p style="margin:0 0 12px;">${escapeHtml(amountLine)}</p>\n`
    : "";

  return {
    subject: "CCNA Forge — pagamento confirmado",
    text: textLines.join("\n"),
    html: wrapHtml(`    <p style="margin:0 0 12px;">Olá,</p>
    <p style="margin:0 0 12px;">${escapeHtml(planLine)}</p>
${htmlAmount}    <p style="margin:0 0 12px;">Seu acesso PRO está ativo.</p>
    <p style="margin:0 0 12px;"><a href="${APP_URL}" style="color:#7dd3fc;">${APP_URL}</a></p>`),
  };
}

export function trialReminderEmail(): EmailContent {
  return {
    subject: "CCNA Forge — seu trial PRO acaba em menos de 24h",
    text: [
      "Olá,",
      "",
      "Seu trial PRO acaba em menos de 24h.",
      "",
      `Para continuar, abra ${APP_URL} e escolha um plano (7d, 30d ou 120d).`,
      "",
      `Suporte: ${SUPPORT_EMAIL}`,
    ].join("\n"),
    html: wrapHtml(`    <p style="margin:0 0 12px;">Olá,</p>
    <p style="margin:0 0 12px;">Seu trial PRO acaba em menos de 24h.</p>
    <p style="margin:0 0 12px;">Para continuar, abra <a href="${APP_URL}" style="color:#7dd3fc;">${APP_URL}</a> e escolha um plano (7d, 30d ou 120d).</p>`),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
