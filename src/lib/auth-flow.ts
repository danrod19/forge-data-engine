import type { AuthError, Session, User } from "@supabase/supabase-js";

/** Produção — Redirect URL já cadastrada no Supabase. */
export const AUTH_PROD_ORIGIN = "https://forge-data-engine.vercel.app";

export const RESET_PASSWORD_SENT_COPY =
  "Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.";

export const SIGNUP_DUPLICATE_COPY =
  "Já existe uma conta com este e-mail. Entre ou redefina a senha.";

const RECOVERY_READY_KEY = "ccna-forge-pw-recovery";
const RECOVERY_INVALID_KEY = "ccna-forge-pw-recovery-invalid";
export const PASSWORD_RECOVERY_EVENT = "ccna-forge-password-recovery";

export type PasswordRecoveryStatus = "none" | "ready" | "invalid";

export function getAuthRedirectTo(): string {
  if (typeof window === "undefined") return AUTH_PROD_ORIGIN;
  if (window.location.hostname === "forge-data-engine.vercel.app") {
    return AUTH_PROD_ORIGIN;
  }
  return window.location.origin;
}

function readUrlAuthParams(): URLSearchParams {
  const merged = new URLSearchParams();
  if (typeof window === "undefined") return merged;
  try {
    const query = new URLSearchParams(window.location.search);
    query.forEach((value, key) => merged.set(key, value));
    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    if (rawHash) {
      const hash = new URLSearchParams(rawHash);
      hash.forEach((value, key) => merged.set(key, value));
    }
  } catch {
    /* ignore */
  }
  return merged;
}

function persistHint(status: Exclude<PasswordRecoveryStatus, "none">): void {
  if (typeof window === "undefined") return;
  try {
    if (status === "invalid") {
      sessionStorage.setItem(RECOVERY_INVALID_KEY, "1");
      sessionStorage.removeItem(RECOVERY_READY_KEY);
    } else {
      sessionStorage.setItem(RECOVERY_READY_KEY, "1");
      sessionStorage.removeItem(RECOVERY_INVALID_KEY);
    }
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(PASSWORD_RECOVERY_EVENT, { detail: status })
  );
}

function hasPkceRecoveryVerifier(): boolean {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.endsWith("-code-verifier")) continue;
      const value = window.localStorage.getItem(key) ?? "";
      if (value.includes("/recovery")) return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

/**
 * Deve rodar no client ANTES de createClient (detectSessionInUrl consome o hash).
 */
export function captureAuthRedirectHint(): void {
  if (typeof window === "undefined") return;
  const params = readUrlAuthParams();
  const error =
    params.get("error") ||
    params.get("error_code") ||
    params.get("error_description");
  const type = params.get("type");

  if (error) {
    persistHint("invalid");
    return;
  }
  const isAuthCallback = Boolean(
    params.get("code") || params.get("access_token") || type
  );
  if (type === "recovery" || (isAuthCallback && hasPkceRecoveryVerifier())) {
    persistHint("ready");
  }
}

export function markPasswordRecoveryReady(): void {
  persistHint("ready");
}

export function markPasswordRecoveryInvalid(): void {
  persistHint("invalid");
}

export function peekPasswordRecoveryHint(): PasswordRecoveryStatus {
  if (typeof window === "undefined") return "none";
  try {
    if (sessionStorage.getItem(RECOVERY_INVALID_KEY) === "1") return "invalid";
    if (sessionStorage.getItem(RECOVERY_READY_KEY) === "1") return "ready";
  } catch {
    /* ignore */
  }
  return "none";
}

export function clearPasswordRecoveryHint(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECOVERY_READY_KEY);
    sessionStorage.removeItem(RECOVERY_INVALID_KEY);
  } catch {
    /* ignore */
  }
}

const AUTH_QUERY_KEYS = [
  "code",
  "type",
  "error",
  "error_code",
  "error_description",
  "token",
  "token_hash",
] as const;

export function stripAuthParamsFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of AUTH_QUERY_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (url.hash) {
      url.hash = "";
      changed = true;
    }
    if (changed) {
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, document.title, next);
    }
  } catch {
    /* ignore */
  }
}

function authCode(error: AuthError | null | undefined): string {
  if (!error) return "";
  const extra = error as AuthError & { code?: string };
  return (extra.code ?? "").toLowerCase();
}

/** Erros que não devem revelar se o e-mail existe — tratar como sucesso genérico. */
export function isBenignResetError(error: AuthError): boolean {
  const code = authCode(error);
  const msg = error.message.toLowerCase();
  return (
    code === "user_not_found" ||
    /user not found/.test(msg) ||
    /email not (found|registered)/.test(msg) ||
    /unable to (find|locate) user/.test(msg)
  );
}

export function mapResetPasswordError(
  error: AuthError | { message: string; status?: number } | null
): string | null {
  if (!error) return null;
  const status = "status" in error ? (error.status ?? 0) : 0;
  const msg = error.message.toLowerCase();
  if (status === 429 || /rate.?limit|too many/.test(msg)) {
    return "Muitas tentativas. Aguarde um momento e tente de novo.";
  }
  if (
    status === 0 ||
    /failed to fetch|network|fetch|offline|load failed/.test(msg)
  ) {
    return "Falha de rede. Verifique a conexão e tente de novo.";
  }
  return "Não foi possível enviar o e-mail agora. Tente de novo em instantes.";
}

export function isExpiredRecoveryError(
  error: AuthError | { message: string; status?: number } | null
): boolean {
  if (!error) return false;
  const code = "code" in error ? String((error as AuthError & { code?: string }).code ?? "") : "";
  const msg = error.message.toLowerCase();
  return (
    code === "otp_expired" ||
    /expired|invalid.*(link|token|otp)|session/.test(msg)
  );
}

export function mapUpdatePasswordError(
  error: AuthError | { message: string; status?: number } | null
): string | null {
  if (!error) return null;
  if (isExpiredRecoveryError(error)) {
    return "Este link é inválido ou expirou. Peça um novo link para redefinir a senha.";
  }
  const status = "status" in error ? (error.status ?? 0) : 0;
  const msg = error.message.toLowerCase();
  if (status === 429 || /rate.?limit|too many/.test(msg)) {
    return "Muitas tentativas. Aguarde um momento e tente de novo.";
  }
  if (/failed to fetch|network|fetch|offline/.test(msg)) {
    return "Falha de rede. Verifique a conexão e tente de novo.";
  }
  if (/at least|characters|weak|short/.test(msg)) {
    return "A senha precisa ter no mínimo 6 caracteres.";
  }
  return "Não foi possível atualizar a senha. Tente de novo.";
}

export function isDuplicateSignup(
  error: AuthError | null,
  data: { user: User | null; session: Session | null }
): boolean {
  if (error) {
    const code = authCode(error);
    const msg = error.message.toLowerCase();
    if (
      code === "user_already_exists" ||
      code === "email_exists" ||
      /already\s+(been\s+)?registered/.test(msg) ||
      /user already exists/.test(msg) ||
      /email.*(already|exists)/.test(msg)
    ) {
      return true;
    }
  }
  // Confirm-email ON: signup duplicado devolve user fake sem identities e sem session.
  if (
    data.user &&
    !data.session &&
    Array.isArray(data.user.identities) &&
    data.user.identities.length === 0
  ) {
    return true;
  }
  return false;
}
