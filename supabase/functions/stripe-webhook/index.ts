import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function daysFromAmount(amountTotal: number | null): number | null {
  // Stripe BRL em centavos
  if (amountTotal === 690) return 7;
  if (amountTotal === 2090) return 30;
  if (amountTotal === 5790) return 120;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    console.error("Missing env secrets", {
      stripeKey: Boolean(stripeKey),
      webhookSecret: Boolean(webhookSecret),
      supabaseUrl: Boolean(supabaseUrl),
      serviceKey: Boolean(serviceKey),
    });
    return new Response("Server misconfigured", {
      status: 500,
      headers: cors,
    });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-11-20.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("No signature", { status: 400, headers: cors });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error("Signature error", err);
    return new Response("Invalid signature", { status: 400, headers: cors });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(
      JSON.stringify({ received: true, ignored: event.type }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const email = (
    session.customer_details?.email ||
    session.customer_email ||
    ""
  )
    .trim()
    .toLowerCase();

  const days = daysFromAmount(session.amount_total);
  console.log({
    email,
    amount_total: session.amount_total,
    days,
    status: session.payment_status,
  });

  if (!email || !days || session.payment_status === "unpaid") {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: profiles, error: findErr } = await supabase
    .from("profiles")
    .select("id, email, pro_expires_at")
    .ilike("email", email)
    .limit(1);

  if (findErr) {
    console.error("find error", findErr);
    return new Response("DB error", { status: 500, headers: cors });
  }

  if (!profiles?.length) {
    console.warn("No profile for email", email);
    // 200 evita retry infinito do Stripe
    return new Response(JSON.stringify({ received: true, no_profile: true }), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const profile = profiles[0];
  const now = new Date();
  const current = profile.pro_expires_at
    ? new Date(profile.pro_expires_at)
    : now;
  const base = current > now ? current : now;
  const expires = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

  const { error: updErr } = await supabase
    .from("profiles")
    .update({
      is_pro: true,
      pro_expires_at: expires.toISOString(),
    })
    .eq("id", profile.id);

  if (updErr) {
    console.error("update error", updErr);
    return new Response("Update failed", { status: 500, headers: cors });
  }

  console.log("PRO activated", { email, days, expires: expires.toISOString() });

  return new Response(JSON.stringify({ received: true, ok: true, days }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
