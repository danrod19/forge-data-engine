import Link from "next/link";
import { CONTACT_EMAIL, CONTACT_MAILTO, SITE_HOST } from "@/types/question";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-800/70 bg-slate-950/95 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-1.5 px-3 sm:px-4">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] text-slate-500">
          <Link
            href="/privacidade"
            className="text-slate-400 underline-offset-2 hover:text-neon-cyan hover:underline"
          >
            Privacidade
          </Link>
          <span className="text-slate-700" aria-hidden>
            ·
          </span>
          <Link
            href="/termos"
            className="text-slate-400 underline-offset-2 hover:text-neon-cyan hover:underline"
          >
            Termos
          </Link>
          <span className="text-slate-700" aria-hidden>
            ·
          </span>
          <a
            href={CONTACT_MAILTO}
            className="text-slate-400 underline-offset-2 hover:text-neon-green hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </nav>
        <p className="font-mono text-[10px] tracking-wide text-slate-600">
          © 2026 CCNA Forge · {SITE_HOST}
        </p>
      </div>
    </footer>
  );
}
