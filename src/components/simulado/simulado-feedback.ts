/**
 * Feedback de desempenho do Modo Simulado — faixas alinhadas à prática CCNA.
 */

export type PerformanceTier = "excellent" | "good" | "fair" | "poor";

export interface PerformanceFeedback {
  tier: PerformanceTier;
  /** Rótulo curto (ex.: "Excelente") */
  label: string;
  /** Mensagem motivacional técnica */
  message: string;
  /** Resumo de desempenho em uma linha */
  summary: string;
  /** Classes Tailwind por severidade visual */
  colors: {
    text: string;
    textMuted: string;
    border: string;
    bg: string;
    bgSoft: string;
    ring: string;
    glow: string;
    bar: string;
  };
}

export function getPerformanceFeedback(scorePct: number): PerformanceFeedback {
  if (scorePct >= 90) {
    return {
      tier: "excellent",
      label: "Excelente",
      message:
        "Domínio sólido do conteúdo. Você está no ritmo de quem chega confiante no dia da prova — mantenha a revisão pontual e os simulados semanais.",
      summary: "Pronto para o próximo nível de dificuldade",
      colors: {
        text: "text-neon-green",
        textMuted: "text-neon-green/80",
        border: "border-neon-green/30",
        bg: "bg-neon-green/15",
        bgSoft: "bg-neon-green/5",
        ring: "text-neon-green",
        glow: "shadow-[0_0_28px_rgba(34,197,94,0.22)]",
        bar: "bg-neon-green",
      },
    };
  }

  if (scorePct >= 70) {
    return {
      tier: "good",
      label: "Bom desempenho",
      message:
        "Boa base. Feche as lacunas nos tópicos errados e você entra na zona de aprovação com margem. Priorize revisão ativa, não só leitura.",
      summary: "Perto da meta — refine os pontos fracos",
      colors: {
        text: "text-neon-cyan",
        textMuted: "text-neon-cyan/80",
        border: "border-neon-cyan/30",
        bg: "bg-neon-cyan/15",
        bgSoft: "bg-neon-cyan/5",
        ring: "text-neon-cyan",
        glow: "shadow-[0_0_28px_rgba(34,211,238,0.18)]",
        bar: "bg-neon-cyan",
      },
    };
  }

  if (scorePct >= 50) {
    return {
      tier: "fair",
      label: "Regular",
      message:
        "Há fundamento, mas a consistência ainda oscila. Use a revisão de erros como mapa de estudo e pratique por domínio antes do próximo simulado.",
      summary: "Consistência em construção — foque nos erros",
      colors: {
        text: "text-amber-400",
        textMuted: "text-amber-400/80",
        border: "border-amber-500/35",
        bg: "bg-amber-500/15",
        bgSoft: "bg-amber-500/5",
        ring: "text-amber-400",
        glow: "shadow-[0_0_28px_rgba(251,191,36,0.16)]",
        bar: "bg-amber-400",
      },
    };
  }

  return {
    tier: "poor",
    label: "Precisa melhorar",
    message:
      "O resultado mostra lacunas importantes. Não desanime: volte aos fundamentos, treine por tópicos e refaça um simulado menor. Progresso vem de ciclos curtos e focados.",
    summary: "Reconstrua a base com estudo dirigido",
    colors: {
      text: "text-rose-400",
      textMuted: "text-rose-400/80",
      border: "border-rose-500/35",
      bg: "bg-rose-500/15",
      bgSoft: "bg-rose-500/5",
      ring: "text-rose-400",
      glow: "shadow-[0_0_28px_rgba(244,63,94,0.16)]",
      bar: "bg-rose-400",
    },
  };
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  }
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function letterIndex(index: number): string {
  return String.fromCharCode(65 + index);
}
