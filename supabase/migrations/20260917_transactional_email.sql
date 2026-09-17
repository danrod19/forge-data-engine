-- E-mail transacional mínimo (Resend).
-- Projeto: hfmfzczqfcgswdzdmitp
-- Aplicar no SQL Editor. Não faz deploy de Edge Function e não agenda cron.
--
-- Schema real de PRO: is_pro, pro_expires_at, trial_used_at.
-- Não existe trial_ends_at: o fim do trial 24h é pro_expires_at quando
-- o PRO ainda não foi estendido por Payment Link (ver trial-reminder).
--
-- pg_cron NÃO está no plano Free. Não execute cron.schedule aqui.
-- Ligar o job em: Dashboard → Edge Functions → trial-reminder → Schedules
-- Cron: 0 11 * * *   timezone America/Sao_Paulo

alter table public.profiles
  add column if not exists trial_reminder_sent_at timestamptz null;

alter table public.profiles
  add column if not exists last_mail_session_id text null;

alter table public.profiles
  add column if not exists last_payment_email_at timestamptz null;

comment on column public.profiles.trial_reminder_sent_at is
  'Quando o e-mail de trial < 24h foi enviado. Null = ainda não.';

comment on column public.profiles.last_mail_session_id is
  'Stripe checkout.session.id do último e-mail de pagamento. Idempotência.';

comment on column public.profiles.last_payment_email_at is
  'Timestamp do último e-mail de pagamento confirmado.';
