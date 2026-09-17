import { DEFAULT_FROM, SUPPORT_EMAIL } from "./templates.ts";

export function isDevForceMail(): boolean {
  const v = (Deno.env.get("DEV_FORCE_MAIL") ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export type SendResult =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false }
  | { ok: false; skipped: false; error: string };

/**
 * Envia 1 e-mail via Resend. Sem chave: warn + skipped (não lança).
 * From: RESEND_FROM ou onboarding@resend.dev. Reply-To fixo de suporte.
 */
export async function sendResendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY ausente — e-mail não enviado (webhook/job segue 200)"
    );
    return { ok: true, skipped: true };
  }

  const from = (Deno.env.get("RESEND_FROM") ?? "").trim() || DEFAULT_FROM;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        reply_to: SUPPORT_EMAIL,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error", res.status, body);
      return { ok: false, skipped: false, error: body };
    }

    return { ok: true, skipped: false };
  } catch (err) {
    console.error("[email] Resend fetch failed", err);
    return { ok: false, skipped: false, error: String(err) };
  }
}
