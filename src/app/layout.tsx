import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CCNA Forge — Estude CCNA 200-301 de forma gamificada",
  description:
    "Plataforma de estudos gamificada para a certificação Cisco CCNA 200-301 v2.0. Modo Ticket de Suporte, lives, streak e labs interativos.",
  keywords: ["CCNA", "Cisco", "200-301", "networking", "gamificação", "estudos"],
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`dark ${jetbrainsMono.variable}`}>
      <body
        className={`${jetbrainsMono.className} min-h-dvh bg-slate-950 font-mono text-slate-100 antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
