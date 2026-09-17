/**
 * Trial acabando em < 24h — 1 e-mail/dia, nunca no request do usuário.
 *
 * NÃO está agendado neste repo. Ligar no Dashboard:
 *   Edge Functions → trial-reminder → Schedules
 *   Cron: 0 11 * * *
 *   Timezone: America/Sao_Paulo
 *
 * pg_cron do plano Free não existe — não fingir que já agendou.
 *
 * Sem RESEND_API_KEY: no-op 200.
 * DEV_FORCE_MAIL=true + POST { force, kind, email, plan?, amountLabel? } envia teste.
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { isDevForceMail, sendResendEmail } from "../_shared/resend.ts";
import {
  paymentConfirmedEmail,
  trialReminderEmail,
  type PlanId,
} from "../_shared/templates.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function isPlanId(value: unknown): value is PlanId {
  return value === "7d" || value === "30d" || value === "120d";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

  let body: Record<string, unknown> = {};
  if (req.method === "POST") {
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }

  if (isDevForceMail() && body.force === true) {
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return json(400, { ok: false, error: "force requer email" });
    }
    const kind = body.kind === "payment" ? "payment" : "trial";
    const mail =
      kind === "payment"
        ? paymentConfirmedEmail({
            plan: isPlanId(body.plan) ? body.plan : "7d",
            amountLabel:
              typeof body.amountLabel === "string" ? body.amountLabel : "R$ 6,90",
          })
        : trialReminderEmail();
    const result = await sendResendEmail({
      to: email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return json(200, { ok: result.ok, skipped: result.skipped, kind, force: true });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing env secrets");
    return json(500, { ok: false, error: "server_misconfigured" });
  }

  const apiKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY ausente — trial-reminder no-op");
    return json(200, { ok: true, skipped: true, reason: "no_resend_key" });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: rows, error: findErr } = await supabase
    .from("profiles")
    .select("id, email, trial_used_at, pro_expires_at, trial_reminder_sent_at")
    .not("trial_used_at", "is", null)
    .is("trial_reminder_sent_at", null)
    .gt("pro_expires_at", now.toISOString())
    .lte("pro_expires_at", horizon.toISOString());

  if (findErr) {
    console.error("[trial-reminder] find error", findErr);
    return json(200, {
      ok: true,
      skipped: true,
      reason: "query_failed",
      detail: findErr.message,
    });
  }

  let sent = 0;
  let skipped = 0;

  for (const row of rows ?? []) {
    const email = typeof row.email === "string" ? row.email.trim() : "";
    const trialUsed = row.trial_used_at ? new Date(row.trial_used_at) : null;
    const expires = row.pro_expires_at ? new Date(row.pro_expires_at) : null;
    if (!email || !trialUsed || !expires || Number.isNaN(trialUsed.getTime())) {
      skipped += 1;
      continue;
    }
    // PRO por trial: expiração ainda cabe na janela de 24h+folga do trial_used_at.
    // Quem pagou (7d/30d/120d) tem pro_expires_at bem depois e fica de fora.
    const trialWindowMs = 25 * 60 * 60 * 1000;
    if (expires.getTime() > trialUsed.getTime() + trialWindowMs) {
      skipped += 1;
      continue;
    }

    const mail = trialReminderEmail();
    const result = await sendResendEmail({
      to: email.toLowerCase(),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });

    if (!result.ok || result.skipped) {
      skipped += 1;
      continue;
    }

    const { error: updErr } = await supabase
      .from("profiles")
      .update({ trial_reminder_sent_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("trial_reminder_sent_at", null);

    if (updErr) {
      console.error("[trial-reminder] flag update failed", row.id, updErr);
    } else {
      sent += 1;
    }
  }

  return json(200, { ok: true, sent, skipped, scanned: rows?.length ?? 0 });
});
