"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TIP_KEY = "ccna-forge-pwa-tip-v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const display = window.matchMedia("(display-mode: standalone)").matches;
  const iosNav = window.navigator as Navigator & { standalone?: boolean };
  return display || iosNav.standalone === true;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iDevice = /iphone|ipad|ipod/i.test(ua);
  const iPadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iDevice || iPadOs;
}

function tipDismissed(): boolean {
  try {
    return localStorage.getItem(TIP_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismiss() {
  try {
    localStorage.setItem(TIP_KEY, "1");
  } catch {
    /* ignore quota / private mode */
  }
}

export function PwaInstall() {
  const [mode, setMode] = useState<"hidden" | "android" | "ios">("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* SW opcional — app segue no browser */
    });
  }, []);

  useEffect(() => {
    if (isStandalone() || tipDismissed()) return;

    const onBip = (event: Event) => {
      event.preventDefault();
      if (isStandalone() || tipDismissed()) return;
      setDeferred(event as BeforeInstallPromptEvent);
      setMode("android");
    };

    const onInstalled = () => {
      persistDismiss();
      setDeferred(null);
      setMode("hidden");
    };

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    const timer = window.setTimeout(() => {
      if (isStandalone() || tipDismissed()) return;
      setMode((current) => {
        if (current === "android") return current;
        return isIOS() ? "ios" : current;
      });
    }, 600);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    persistDismiss();
    setDeferred(null);
    setMode("hidden");
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* user closed native sheet */
    }
    persistDismiss();
    setDeferred(null);
    setMode("hidden");
  };

  if (mode === "hidden") return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-50 px-3"
      style={{
        bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        role="status"
        className={cn(
          "pointer-events-auto mx-auto flex max-w-2xl items-center gap-2.5",
          "rounded-lg border border-neon-green/30 bg-slate-900/95 px-3 py-2",
          "shadow-[0_0_24px_rgba(34,197,94,0.08)] backdrop-blur-md"
        )}
      >
        {mode === "android" ? (
          <Download className="size-4 shrink-0 text-neon-green" aria-hidden />
        ) : (
          <Share className="size-4 shrink-0 text-neon-green" aria-hidden />
        )}
        <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-200 sm:text-xs">
          {mode === "android"
            ? "Instalar app"
            : "Compartilhar → Adicionar à Tela de Início"}
        </p>
        {mode === "android" && (
          <button
            type="button"
            onClick={install}
            className="shrink-0 rounded-md border border-neon-green/40 bg-neon-green/15 px-2.5 py-1 text-[11px] font-semibold text-neon-green hover:bg-neon-green/25"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Fechar"
          className="shrink-0 rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
