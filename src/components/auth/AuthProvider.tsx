"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import {
  addHoursIso,
  computeIsProEfetivo,
  isTrialAvailable,
} from "@/lib/pro";

export interface AuthContextValue {
  user: User | null;
  /**
   * PRO efetivo (pro_expires_at no futuro).
   * Alias legado de isProEfetivo — use em vidas/blur.
   */
  isPro: boolean;
  isProEfetivo: boolean;
  proExpiresAt: string | null;
  trialUsedAt: string | null;
  trialAvailable: boolean;
  loading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  startTrial: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ProfileRow {
  is_pro: boolean | null;
  pro_expires_at: string | null;
  trial_used_at: string | null;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_pro, pro_expires_at, trial_used_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[auth] profiles select failed:", error.message);
    return null;
  }

  if (!data) return null;

  return {
    is_pro: data.is_pro ?? null,
    pro_expires_at: data.pro_expires_at ?? null,
    trial_used_at: data.trial_used_at ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [proExpiresAt, setProExpiresAt] = useState<string | null>(null);
  const [trialUsedAt, setTrialUsedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** Tick para reavaliar expiração sem recarregar o profile */
  const [nowMs, setNowMs] = useState(() => Date.now());

  const isProEfetivo = useMemo(() => {
    if (!proExpiresAt) return false;
    const expires = new Date(proExpiresAt).getTime();
    if (Number.isNaN(expires)) return false;
    return expires > nowMs;
  }, [proExpiresAt, nowMs]);

  const trialAvailable = isTrialAvailable(trialUsedAt);

  const applyProfile = useCallback((row: ProfileRow | null) => {
    if (!row) {
      setProExpiresAt(null);
      setTrialUsedAt(null);
      return;
    }
    setProExpiresAt(row.pro_expires_at);
    setTrialUsedAt(row.trial_used_at);
  }, []);

  const loadProfile = useCallback(
    async (nextUser: User | null) => {
      if (!nextUser) {
        applyProfile(null);
        return;
      }
      const row = await fetchProfile(nextUser.id);
      applyProfile(row);
    },
    [applyProfile]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      applyProfile(null);
      return;
    }
    await loadProfile(user);
  }, [user, loadProfile, applyProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      loadProfile(sessionUser).finally(() => {
        if (mounted) setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      void loadProfile(sessionUser);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Reavalia expiração a cada minuto (trial/planos acabam no client)
  useEffect(() => {
    if (!proExpiresAt) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, [proExpiresAt]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase não configurado (.env.local)." };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase não configurado (.env.local)." };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    applyProfile(null);
    setUser(null);
    await supabase.auth.signOut();
  }, [applyProfile]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase não configurado (.env.local)." };
    }
    const redirectTo =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return { error: error?.message ?? null };
  }, []);

  const startTrial = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      return { error: "Supabase não configurado (.env.local)." };
    }
    if (!user) {
      return { error: "Faça login para começar o trial." };
    }
    if (!isTrialAvailable(trialUsedAt)) {
      return { error: "Trial já utilizado nesta conta." };
    }
    if (computeIsProEfetivo(proExpiresAt)) {
      return { error: "Você já está com PRO ativo." };
    }

    const now = new Date();
    const trialUsed = now.toISOString();
    const expires = addHoursIso(now, 24);

    const { error } = await supabase
      .from("profiles")
      .update({
        trial_used_at: trialUsed,
        pro_expires_at: expires,
        is_pro: true,
      })
      .eq("id", user.id);

    if (error) {
      return { error: error.message };
    }

    setTrialUsedAt(trialUsed);
    setProExpiresAt(expires);
    return { error: null };
  }, [user, trialUsedAt, proExpiresAt]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isPro: isProEfetivo,
      isProEfetivo,
      proExpiresAt,
      trialUsedAt,
      trialAvailable,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      startTrial,
      refreshProfile,
    }),
    [
      user,
      isProEfetivo,
      proExpiresAt,
      trialUsedAt,
      trialAvailable,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      startTrial,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
