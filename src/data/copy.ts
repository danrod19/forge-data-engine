/**
 * Copy centralizada da UI — português natural, por track.
 * Contagens: preferir helpers dinâmicos; números aqui são fallback alinhados aos bancos.
 */

import type { TrackId } from "@/lib/track-context";
import {
  TOTAL_SIMULADO_V2,
  TOTAL_SIMULADO_AWS,
  TOTAL_SIMULADO_CURATED,
  V2_SIMULADO_TICKET_RATIO,
} from "@/data/simulado-questions";
import { TOTAL_V2_TICKETS } from "@/data/v2-banks";
import { TOTAL_AWS_TICKETS } from "@/data/aws-banks";

export const BRAND_NAME = "CCNA Forge";
export const CONTACT_LABEL = "Fale conosco";

export type HomeHeroCopy = {
  prompt: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

export function homeHeroCopy(track: TrackId): HomeHeroCopy {
  if (track === "aws") {
    return {
      prompt: "$ ./forge --track aws",
      titleLead: "AWS",
      titleAccent: "Forge",
      subtitle: "preparação prática para SAA-C03 (Foundations)",
      body: "Treine decisões de arquitetura: IAM, VPC, S3, compute, dados e serverless. Estudo por domínio, Simulado e Trilha de cenários (sem terminal) — no seu ritmo.",
      ctaPrimary: "Abrir Estudo",
      ctaSecondary: "Fazer Simulado",
    };
  }
  if (track === "ccna-v2") {
    return {
      prompt: "$ ./forge --track ccna-v2",
      titleLead: "CCNA",
      titleAccent: "Forge",
      subtitle: "200-301 v2.0 — foco em diagnóstico e troubleshooting",
      body: "A Trilha é 100% tickets (sintoma + CLI). No Simulado, cerca de 30% das questões vêm desse espírito de troubleshooting — para treinar o olhar que a prova v2.0 cobra.",
      ctaPrimary: "Abrir Trilha",
      ctaSecondary: "Simulado com mix",
    };
  }
  return {
    prompt: "$ ./forge --track ccna-v1",
    titleLead: "CCNA",
    titleAccent: "Forge",
    subtitle: "preparação prática para o 200-301",
    body: "Estude por partes, faça tickets com CLI e rode simulados no estilo da prova. Feedback na hora, vidas, streak — sem enrolação.",
    ctaPrimary: "Começar Trilha",
    ctaSecondary: "Fazer Simulado",
  };
}

export function homeHowToCopy(
  track: TrackId,
  counts: { tickets: number; simulado: number }
): { step: string; title: string; desc: string }[] {
  const ticketPct = Math.round(V2_SIMULADO_TICKET_RATIO * 100);
  return [
    {
      step: "01",
      title: "Trilha",
      desc:
        track === "aws"
          ? `Cenários de arquitetura — ${counts.tickets} no banco SAA (sem terminal).`
          : track === "ccna-v2"
            ? `Só tickets de troubleshooting — ${counts.tickets} no banco v2.0.`
            : `Tickets com sintoma + CLI — ${counts.tickets} no banco.`,
    },
    {
      step: "02",
      title: "Simulado",
      desc:
        track === "ccna-v2"
          ? `${counts.simulado} traditional + mix ~${ticketPct}% troubleshooting · modos PT e EN.`
          : track === "aws"
            ? `${counts.simulado} questões · modos Conhecimento (PT) e Prova (EN).`
            : `${counts.simulado} no banco · revise em PT e treine em EN.`,
    },
    {
      step: "03",
      title: "Estudo",
      desc:
        track === "aws"
          ? "Leia o domínio, marque como lido e pratique até 30 questões (preferência PT)."
          : track === "ccna-v2"
            ? "Leia a part, pratique o tópico. Progresso separado do V1."
            : "Leia a apostila, marque como lido e pratique o tópico.",
    },
    {
      step: "04",
      title: "Sobre a Prova",
      desc:
        track === "aws"
          ? "O que é o SAA-C03, formato e o que este piloto cobre (1.1–1.12)."
          : track === "ccna-v2"
            ? "Posture v2.0: ~28% diagnóstico — e como o Forge treina isso."
            : "Formato do 200-301, pesos e como usar Trilha + Simulado + Estudo.",
    },
  ];
}

/** Ordem recomendada de estudo (bloco Home). */
export function studyJourneyCopy(track: TrackId): {
  title: string;
  intro: string;
  steps: { n: string; title: string; desc: string }[];
} {
  if (track === "aws") {
    return {
      title: "Como estudar",
      intro: "Ordem sugerida para o piloto SAA Foundations:",
      steps: [
        {
          n: "1",
          title: "Estudo",
          desc: "Leia o domínio e pratique ali — confira se entendeu.",
        },
        {
          n: "2",
          title: "Simulado",
          desc: "Conhecimento (PT) e Prova (EN) — ritmo de exame.",
        },
        {
          n: "3",
          title: "Trilha · Cenários",
          desc: "Arquitetura em sessões curtas (enunciado + 4 opções, sem terminal).",
        },
        {
          n: "4",
          title: "Sobre a Prova",
          desc: "SAA-C03: o que o piloto cobre (1.1–1.12) e o que fica de fora.",
        },
      ],
    };
  }
  if (track === "ccna-v2") {
    return {
      title: "Como estudar",
      intro: "Ordem que funciona bem com a posture de troubleshooting do v2.0:",
      steps: [
        {
          n: "1",
          title: "Estudo",
          desc: "Leia a part e pratique o tópico (teste se entendeu).",
        },
        {
          n: "2",
          title: "Trilha",
          desc: "Tickets com sintoma + CLI — o coração do treino v2.",
        },
        {
          n: "3",
          title: "Simulado Conhecimento (PT)",
          desc: "Revise em português (com mix de diagnóstico na sessão).",
        },
        {
          n: "4",
          title: "Simulado Prova (EN)",
          desc: "Treine no formato/idioma mais próximo da prova.",
        },
      ],
    };
  }
  return {
    title: "Como estudar",
    intro: "Sugestão de jornada no Forge:",
    steps: [
      {
        n: "1",
        title: "Estudo",
        desc: "Leia o tópico e pratique ali — teste se entendeu.",
      },
      {
        n: "2",
        title: "Trilha",
        desc: "Tickets com CLI depois que já estudou o tema.",
      },
      {
        n: "3",
        title: "Simulado Conhecimento (PT)",
        desc: "Revise o conteúdo em português.",
      },
      {
        n: "4",
        title: "Simulado Prova (EN)",
        desc: "Treine no formato e no idioma do exame.",
      },
    ],
  };
}

export const simuladoLangModeCopy = {
  sectionLabel: "Modo do simulado",
  conhecimento: {
    id: "pt" as const,
    title: "Conhecimento (PT)",
    desc: "Revisar em português — bom depois do Estudo.",
  },
  prova: {
    id: "en" as const,
    title: "Prova (EN)",
    desc: "Treinar no idioma do exame.",
  },
  mixedNote:
    "Itens classificados como mixed entram nos dois modos (PT e EN).",
};

export const freeVsProCopy = {
  freeTitle: "Free",
  freeBullets: [
    "Trilha, Simulado e Estudo",
    "Vidas limitadas",
    "Explicações profundas com blur",
  ],
  proTitle: "PRO",
  proBullets: [
    "Vidas infinitas",
    "Explicações sem blur",
    "Trial 24h (1× por conta)",
  ],
  proCta: "Ver planos PRO",
};

export function topBarBrandSubtitle(track: TrackId, examCode: string): string {
  if (track === "aws") return examCode || "SAA-C03";
  if (track === "ccna-v2") return examCode || "200-301 v2.0";
  return examCode || "200-301";
}

export const topBarCopy = {
  upgrade: "PRO",
  login: "Entrar",
};

export function estudoHeaderCopy(track: TrackId): {
  titleAccent: string;
  subtitle: string;
  hint: string;
} {
  if (track === "aws") {
    return {
      titleAccent: "AWS SAA",
      subtitle: `Foundations · 8 domínios · ${TOTAL_SIMULADO_AWS} questões no banco`,
      hint: "Fluxo: ler o conteúdo → marcar como lido → praticar até 30 questões. Progresso só neste track.",
    };
  }
  if (track === "ccna-v2") {
    return {
      titleAccent: "CCNA v2.0",
      subtitle: `Parts consolidadas · ${TOTAL_SIMULADO_V2} questões · ${TOTAL_V2_TICKETS} tickets`,
      hint: "Leia a part, marque como lido e pratique. Progresso não mistura com V1.",
    };
  }
  return {
    titleAccent: "CCNA",
    subtitle: `Módulos 1–6 · ${TOTAL_SIMULADO_CURATED} questões no banco curado`,
    hint: "Leia a apostila da parte, marque como lido e pratique o tópico.",
  };
}

export const estudoUiCopy = {
  tabContent: "Conteúdo",
  tabPractice: "Praticar",
  markRead: "Marcar como lido",
  alreadyRead: "Conteúdo lido",
  emptyContent:
    "Ainda não há apostila para este tópico neste piloto. Você pode praticar as questões disponíveis.",
  practiceCta: "Praticar",
  practiceCtaLocked: "Leia o conteúdo (ou marque como lido) para praticar com foco",
  practiceHint:
    "Aqui você testa o tópico enquanto estuda — até 30 questões (preferência em português).",
  practiceEnFallback:
    "Neste tópico o drill está em inglês (poucas ou nenhuma questão PT no pool).",
  backToList: "Todos os tópicos",
  topicsHeading: "Tópicos",
  mustKnowHeading: "Precisa saber",
  commandsHeading: "Comandos / referências",
  examTip: "Dica de prova",
  journeyLine: "Aqui você testa o tópico enquanto estuda.",
};

export function simuladoConfigCopy(track: TrackId): {
  title: string;
  subtitle: string;
  mixLine?: string;
  footer: string;
} {
  if (track === "aws") {
    return {
      title: "Simulado",
      subtitle: `AWS SAA · ${TOTAL_SIMULADO_AWS} questões · SAA-C03 Foundations`,
      footer: `Banco: ${TOTAL_SIMULADO_AWS} questões · embaralhadas a cada sessão`,
    };
  }
  if (track === "ccna-v2") {
    const pct = Math.round(V2_SIMULADO_TICKET_RATIO * 100);
    return {
      title: "Simulado",
      subtitle: `CCNA V2 · ${TOTAL_SIMULADO_V2} traditional · 200-301 v2.0`,
      mixLine: `Mix na sessão: ~${pct}% troubleshooting (tickets com CLI)`,
      footer: `Cada sessão mistura traditional e tickets (~${pct}% diagnóstico). Embaralha de novo ao reiniciar.`,
    };
  }
  return {
    title: "Simulado",
    subtitle: `CCNA V1 · escolha a fonte · 200-301`,
    footer:
      "Banco embaralhado a cada simulado. Drill de subnetting fica só no Estudo (parte 1.4).",
  };
}

export const paywallCopy = {
  livesTitle: "Sem vidas no momento",
  livesBody:
    "Você zerou as vidas deste track. Espere o cooldown ou desbloqueie o PRO para continuar sem limite.",
  upgradeTitle: "Desbloquear PRO",
  upgradeBody:
    "Vidas infinitas e explicações completas sem blur — no track que você estiver estudando.",
  features: [
    "Vidas infinitas — sem ficar parado",
    "Explicações profundas sem blur",
    "Mesmo app, ritmo de estudo contínuo",
  ],
};

export const bankCountsHint = {
  v2Traditional: TOTAL_SIMULADO_V2,
  v2Tickets: TOTAL_V2_TICKETS,
  awsTraditional: TOTAL_SIMULADO_AWS,
  awsTickets: TOTAL_AWS_TICKETS,
  v1Curated: TOTAL_SIMULADO_CURATED,
};

/** Limite de questões por sessão de Estudo (por tópico). */
export const ESTUDO_PRACTICE_LIMIT = 30;
