import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SITE_ORIGIN } from "@/types/question";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "CCNA Forge — CCNA 200-301 e AWS SAA",
  description:
    "Estudo gamificado multi-track: CCNA 200-301 (V1/V2) e AWS SAA-C03 Foundations. Trilha com tickets, Simulado e Estudo com conteúdo + prática.",
  keywords: [
    "CCNA",
    "Cisco",
    "200-301",
    "AWS",
    "SAA-C03",
    "networking",
    "gamificação",
    "estudos",
  ],
  applicationName: "CCNA Forge",
  alternates: { canonical: SITE_ORIGIN },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_ORIGIN,
    siteName: "CCNA Forge",
    title: "CCNA Forge — CCNA 200-301 e AWS SAA",
    description:
      "Estudo gamificado multi-track: CCNA 200-301 (V1/V2) e AWS SAA-C03 Foundations. Trilha, Simulado e Estudo.",
  },
  twitter: {
    card: "summary",
    title: "CCNA Forge — CCNA 200-301 e AWS SAA",
    description:
      "Estudo gamificado multi-track: CCNA 200-301 (V1/V2) e AWS SAA-C03 Foundations.",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Forge",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
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
        <Providers>
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
