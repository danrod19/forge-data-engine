import type { ReactNode } from "react";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_HOST } from "@/types/question";

export function LegalDoc({
  title,
  prompt,
  children,
}: {
  title: string;
  prompt: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh bg-slate-950 font-mono text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 top-16 size-64 rounded-full bg-neon-green/5 blur-3xl" />
        <div className="absolute -right-16 bottom-24 size-56 rounded-full bg-neon-cyan/5 blur-3xl" />
      </div>
      <main className="relative z-10 mx-auto w-full max-w-2xl px-3 py-6 sm:px-4 sm:py-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neon-green">
          {prompt}
        </p>
        <h1 className="mb-6 text-lg font-bold tracking-tight text-slate-100 sm:text-xl">
          {title}
        </h1>
        <div className="space-y-5 text-[13px] leading-relaxed text-slate-300">
          {children}
        </div>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-xl border border-neon-green/40 bg-neon-green/10 px-4 text-sm font-semibold text-neon-green hover:bg-neon-green/20"
        >
          Voltar ao app
        </Link>
        <p className="mt-6 text-[10px] text-slate-600">
          {SITE_HOST} · {CONTACT_EMAIL}
        </p>
      </main>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h2 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-neon-cyan">
        {heading}
      </h2>
      <div className="space-y-2 text-slate-300">{children}</div>
    </section>
  );
}