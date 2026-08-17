import type { NextConfig } from "next";

/**
 * Static export (SPA) — compatível com Vercel Hobby e Cloudflare Pages.
 * - Gera `out/` em `npm run build`
 * - Sem Route Handlers / SSR dinâmico no App Router
 * - Imagens sem otimizador de servidor (obrigatório com `output: "export"`)
 * - Fonts: next/font/google (JetBrains Mono) embute no build
 *
 * Se no futuro precisarmos de API routes / Stripe webhook no mesmo deploy,
 * remover `output: "export"` e usar runtime Node padrão da Vercel.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
