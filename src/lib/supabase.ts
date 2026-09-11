import { createClient } from "@supabase/supabase-js";
import {
  captureAuthRedirectHint,
  markPasswordRecoveryReady,
} from "@/lib/auth-flow";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Hash/query type=recovery some quando detectSessionInUrl roda — capturar antes.
captureAuthRedirectHint();

/** Client browser-only (static export). Env must be set at build time for production. */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      markPasswordRecoveryReady();
    }
  });
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
