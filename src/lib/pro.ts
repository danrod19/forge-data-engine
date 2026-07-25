/** Lógica de PRO por data de expiração (trial / planos). */

export interface ProProfileFields {
  is_pro?: boolean | null;
  pro_expires_at?: string | null;
  trial_used_at?: string | null;
}

/**
 * PRO efetivo: pro_expires_at no futuro.
 * Não depende só do boolean is_pro (que pode ficar desatualizado).
 */
export function computeIsProEfetivo(
  proExpiresAt: string | null | undefined
): boolean {
  if (!proExpiresAt) return false;
  const expires = new Date(proExpiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() > Date.now();
}

export function isTrialAvailable(
  trialUsedAt: string | null | undefined
): boolean {
  return trialUsedAt == null || trialUsedAt === "";
}

/** Ex.: 25/07/2026, 14:30 */
export function formatProExpiresAt(
  proExpiresAt: string | null | undefined
): string | null {
  if (!proExpiresAt) return null;
  const d = new Date(proExpiresAt);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function addHoursIso(from: Date, hours: number): string {
  return new Date(from.getTime() + hours * 60 * 60 * 1000).toISOString();
}
