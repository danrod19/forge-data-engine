"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Clock,
  ListChecks,
  FlaskConical,
  AlertTriangle,
  Layers,
  Terminal,
  BookOpen,
  ClipboardList,
  Ticket,
  Target,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CCNA_DOMAINS, domainAccentClasses } from "@/data/domains";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export function SobreProva() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-2"
    >
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-neon-green/25 bg-slate-900/70 p-5 terminal-glow">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-neon-green/10 blur-2xl"
        />
        <div className="relative flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-neon-green/40 bg-neon-green/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <GraduationCap className="size-6 text-neon-green" />
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
              $ cat exam_brief.md
            </p>
            <h1 className="text-lg font-bold text-slate-50 sm:text-xl">
              Sobre a Prova{" "}
              <span className="text-neon-green">CCNA 200-301</span>
            </h1>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
              Tudo que você precisa saber para atacar a certificação com
              estratégia — sem decorar no escuro.
            </p>
          </div>
        </div>
      </div>

      {/* O que é */}
      <Section
        delay={0.05}
        icon={Terminal}
        title="O que é o CCNA 200-301?"
        accent="green"
      >
        <p>
          O <strong className="text-slate-200">Cisco Certified Network Associate (CCNA)</strong>{" "}
          é a certificação de entrada da Cisco para redes. O exame{" "}
          <code className="rounded bg-slate-800 px-1 text-neon-cyan">200-301</code>{" "}
          valida se você consegue instalar, configurar, operar e{" "}
          <strong className="text-neon-green">diagnosticar</strong> redes
          empresariais modernas — com fio, wireless, segurança e um toque de
          automação.
        </p>
        <p className="mt-2">
          Não é um diploma de memorização: a prova cobra raciocínio sobre
          topologias, saídas de comando e decisões de engenharia do dia a dia.
        </p>
      </Section>

      {/* Duração e formato */}
      <Section
        delay={0.08}
        icon={Clock}
        title="Duração e formato"
        accent="cyan"
      >
        <div className="mb-3 grid grid-cols-2 gap-2">
          <StatCard label="Duração" value="120 min" sub="relógio da prova" />
          <StatCard label="Código" value="200-301" sub="exam ID" />
        </div>
        <p className="mb-3 text-[12px] text-slate-400">
          A prova é aplicada em centros Pearson VUE (presencial ou online
          proctored). O número de questões varia; o importante é administrar o
          tempo e não travar em um único item.
        </p>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Tipos de questões
        </p>
        <ul className="space-y-2">
          <FormatItem
            icon={ListChecks}
            title="Múltipla escolha"
            desc="Uma resposta correta entre as alternativas."
          />
          <FormatItem
            icon={Layers}
            title="Múltiplas respostas"
            desc="Selecione todas as opções válidas — leia o enunciado com atenção."
          />
          <FormatItem
            icon={FlaskConical}
            title="Labs / simulações"
            desc="Configure ou interprete cenários em ambiente simulado de CLI."
          />
        </ul>
      </Section>

      {/* v2.0 alert */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-amber-500/35 bg-amber-500/5 p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10">
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-300">
              Mudança importante: CCNA v2.0
            </h2>
            <p className="text-[10px] text-amber-500/80">
              Transição prevista · fevereiro 2027
            </p>
          </div>
        </div>
        <div className="space-y-2 text-[12px] leading-relaxed text-slate-300">
          <p>
            A versão atual do blueprint já prepara o terreno; a{" "}
            <strong className="text-amber-200">v2.0</strong> reforça ainda mais
            a habilidade de{" "}
            <strong className="text-neon-green">diagnosticar</strong> e{" "}
            <strong className="text-neon-green">solucionar problemas</strong>{" "}
            — cerca de{" "}
            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-bold text-amber-300">
              28% do exame
            </span>
            .
          </p>
          <ul className="mt-2 space-y-1.5 border-l-2 border-amber-500/30 pl-3 text-slate-400">
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 size-3 shrink-0 text-amber-400" />
              <span>
                <strong className="text-slate-300">Menos memorização</strong> de
                listas soltas e mais análise de falhas reais.
              </span>
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 size-3 shrink-0 text-amber-400" />
              <span>
                <strong className="text-slate-300">Mais leitura de saídas</strong>{" "}
                de comandos (<code className="text-neon-cyan">show</code>,{" "}
                logs, tabelas de rota, interfaces).
              </span>
            </li>
            <li className="flex gap-2">
              <ChevronRight className="mt-0.5 size-3 shrink-0 text-amber-400" />
              <span>
                Foque em{" "}
                <strong className="text-slate-300">
                  &quot;o que está quebrado e por quê?&quot;
                </strong>{" "}
                — exatamente o espírito do Ticket de Suporte no Forge.
              </span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Domínios e pesos */}
      <Section
        delay={0.12}
        icon={Target}
        title="Domínios e pesos aproximados"
        accent="green"
      >
        <p className="mb-3 text-[12px] text-slate-400">
          Distribuição típica do blueprint 200-301 (valores aproximados; confira
          sempre o outline oficial da Cisco):
        </p>
        <ul className="space-y-2">
          {CCNA_DOMAINS.map((d) => {
            const accent = domainAccentClasses(d.accent);
            return (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5"
              >
                <div className="w-10 shrink-0 text-right">
                  <span className={cn("text-sm font-bold tabular-nums", accent.text)}>
                    {d.weightPct}%
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-200">
                    {d.name}
                  </p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={cn("h-full rounded-full", accent.bar)}
                      style={{ width: `${d.weightPct * 3.5}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[11px] text-slate-500">
          Dica: IP Connectivity (~25%) e Network Fundamentals / Access (~20%
          cada) costumam carregar boa parte da nota. Não deixe Security e
          Automation de lado — são pontos fáceis de perder.
        </p>
      </Section>

      {/* Como usar o Forge */}
      <Section
        delay={0.14}
        icon={Zap}
        title="Como usar o CCNA Forge"
        accent="cyan"
      >
        <p className="mb-3 text-[12px] text-slate-400">
          Três modos, um objetivo: passar com confiança e raciocínio de
          engenheiro.
        </p>
        <div className="space-y-2.5">
          <HowCard
            icon={Ticket}
            title="Ticket de Suporte (Trilha)"
            color="text-neon-green"
            border="border-neon-green/25"
            bg="bg-neon-green/10"
            desc="Sintoma + saída de CLI. Treine o olhar de troubleshooting que a v2.0 valoriza — lives, streak e feedback imediato."
          />
          <HowCard
            icon={ClipboardList}
            title="Simulado"
            color="text-neon-cyan"
            border="border-neon-cyan/25"
            bg="bg-neon-cyan/10"
            desc="Banco large de questões traditional, timer opcional e revisão dos erros. Simule o ritmo dos 120 minutos."
          />
          <HowCard
            icon={BookOpen}
            title="Estudo por Tópicos"
            color="text-neon-gold"
            border="border-neon-gold/25"
            bg="bg-neon-gold/10"
            desc="Navegue pelos 6 domínios, veja tópicos e pratique só o que está fraco. Feche buracos antes da prova."
          />
        </div>
        <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 font-mono text-[11px] leading-relaxed text-slate-400">
          <span className="text-neon-green">forge@ccna</span>
          <span className="text-slate-600">:</span>
          <span className="text-neon-cyan">~</span>
          <span className="text-slate-600">$ </span>
          <span className="text-slate-300">
            suggest plan --daily tickets=5 --weekly simulado --weak_domains
          </span>
          <p className="mt-2 text-slate-500">
            → Pratique tickets diários, um simulado por semana e use Estudo para
            atacar os domínios com menor progresso. Consistência &gt; maratona
            de última hora.
          </p>
        </div>
      </Section>

      <p className="pb-2 text-center text-[10px] text-slate-600">
        Conteúdo educacional · confira sempre o exam topics oficial da Cisco
      </p>
    </motion.div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  accent,
  delay = 0,
}: {
  icon: typeof Terminal;
  title: string;
  children: ReactNode;
  accent: "green" | "cyan";
  delay?: number;
}) {
  const iconCls =
    accent === "green"
      ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
      : "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan";
  return (
    <motion.section
      {...fadeUp}
      transition={{ delay }}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg border",
            iconCls
          )}
        >
          <Icon className="size-4" />
        </div>
        <h2 className="text-sm font-bold text-slate-100">{title}</h2>
      </div>
      <div className="text-[12px] leading-relaxed text-slate-400">{children}</div>
    </motion.section>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3 text-center">
      <p className="text-[9px] uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-bold text-neon-cyan">{value}</p>
      <p className="text-[10px] text-slate-600">{sub}</p>
    </div>
  );
}

function FormatItem({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof ListChecks;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 px-3 py-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-neon-cyan" />
      <div>
        <p className="text-xs font-semibold text-slate-200">{title}</p>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
    </li>
  );
}

function HowCard({
  icon: Icon,
  title,
  desc,
  color,
  border,
  bg,
}: {
  icon: typeof Ticket;
  title: string;
  desc: string;
  color: string;
  border: string;
  bg: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border bg-slate-950/40 p-3",
        border
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg border",
          border,
          bg
        )}
      >
        <Icon className={cn("size-4", color)} />
      </div>
      <div>
        <p className={cn("text-xs font-bold", color)}>{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
          {desc}
        </p>
      </div>
    </div>
  );
}
