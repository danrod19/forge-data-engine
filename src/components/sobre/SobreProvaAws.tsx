"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Clock,
  ListChecks,
  Layers,
  Terminal,
  BookOpen,
  ClipboardList,
  Ticket,
  Target,
  Zap,
  AlertTriangle,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { awsDomains, awsDomainAccentClasses } from "@/data/domains-aws";
import {
  TOTAL_AWS_TRADITIONAL,
  TOTAL_AWS_TICKETS,
} from "@/data/aws-banks";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/types/question";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

/** Domínios oficiais SAA-C03 (resumo de pesos do blueprint) */
const SAA_OFFICIAL_DOMAINS = [
  {
    name: "Design Resilient Architectures",
    weight: 30,
    hint: "Multi-AZ, decoupling, backup, HA",
  },
  {
    name: "Design High-Performing Architectures",
    weight: 28,
    hint: "Compute, storage, networking, DB performance",
  },
  {
    name: "Design Secure Applications and Architectures",
    weight: 24,
    hint: "IAM, encryption, network security",
  },
  {
    name: "Design Cost-Optimized Architectures",
    weight: 18,
    hint: "Right-sizing, storage tiers, reserved/spot",
  },
] as const;

export function SobreProvaAws() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-2"
    >
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-slate-900/70 p-5 terminal-glow">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/10 blur-2xl"
        />
        <div className="relative flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            <Cloud className="size-6 text-amber-300" />
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
              $ cat exam_brief_saa.md
            </p>
            <h1 className="text-lg font-bold text-slate-50 sm:text-xl">
              Sobre a Prova{" "}
              <span className="text-amber-300">AWS SAA-C03</span>
            </h1>
            <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">
              Solutions Architect Associate — desenhar arquiteturas na AWS com
              resiliência, segurança, performance e custo.
            </p>
          </div>
        </div>
      </div>

      {/* O que é */}
      <Section
        delay={0.05}
        icon={Terminal}
        title="O que é o SAA-C03?"
        accent="amber"
      >
        <p>
          O{" "}
          <strong className="text-slate-200">
            AWS Certified Solutions Architect – Associate (SAA-C03)
          </strong>{" "}
          valida se você consegue projetar soluções na AWS alinhadas a boas
          práticas do Well-Architected Framework — não é um exame de “clicar no
          console”, e sim de{" "}
          <strong className="text-amber-200">decisão de arquitetura</strong> sob
          requisitos de negócio.
        </p>
        <p className="mt-2">
          O código do exame é{" "}
          <code className="rounded bg-slate-800 px-1 text-neon-cyan">
            SAA-C03
          </code>
          . Serviços e features aparecem em inglês; o Forge explica em PT-BR.
        </p>
      </Section>

      {/* Formato */}
      <Section
        delay={0.08}
        icon={Clock}
        title="Formato da prova"
        accent="cyan"
      >
        <div className="mb-3 grid grid-cols-2 gap-2">
          <StatCard label="Duração" value="~130 min" sub="relógio da prova" />
          <StatCard label="Código" value="SAA-C03" sub="exam ID" />
        </div>
        <p className="mb-3 text-[12px] text-slate-400">
          Aplicado via Pearson VUE (presencial ou online proctored). O número de
          itens varia; o tom dominante é{" "}
          <strong className="text-slate-300">scenario-based</strong> — cenário +
          restrições + “qual a melhor opção”.
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
            icon={Target}
            title="Cenários (scenario-based)"
            desc="Requisitos de HA, segurança, custo ou performance; escolha o design."
          />
        </ul>
      </Section>

      {/* Domínios oficiais */}
      <Section
        delay={0.1}
        icon={GraduationCap}
        title="Domínios e pesos (blueprint SAA)"
        accent="amber"
      >
        <p className="mb-3 text-[12px] text-slate-400">
          Resumo dos quatro domínios oficiais do SAA-C03 (valores aproximados;
          confira o outline oficial da AWS):
        </p>
        <ul className="space-y-2">
          {SAA_OFFICIAL_DOMAINS.map((d) => (
            <li
              key={d.name}
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2.5"
            >
              <div className="w-10 shrink-0 text-right">
                <span className="text-sm font-bold tabular-nums text-amber-300">
                  {d.weight}%
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {d.name}
                </p>
                <p className="text-[10px] text-slate-500">{d.hint}</p>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${d.weight * 2.8}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-slate-500">
          Por baixo dos domínios há knowledge de serviços core: IAM, VPC, S3,
          EC2, ALB/ASG, RDS/DynamoDB, Route&nbsp;53/CloudFront, SQS/SNS, Lambda,
          KMS, CloudWatch, etc.
        </p>
      </Section>

      {/* Escopo piloto */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.12 }}
        className="rounded-2xl border border-amber-500/35 bg-amber-500/5 p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10">
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-300">
              Escopo do piloto Forge
            </h2>
            <p className="text-[10px] text-amber-500/80">
              Foundations 1.1–1.12 · não é o blueprint 100%
            </p>
          </div>
        </div>
        <p className="text-[12px] leading-relaxed text-slate-300">
          O track AWS no Forge cobre um núcleo de foundations (12 parts) —
          identidade, rede, storage, compute/HA, databases, decoupling,
          serverless e observability.{" "}
          <strong className="text-amber-200">
            Não afirmamos cobertura total do blueprint SAA-C03
          </strong>
          . Use o material oficial AWS + labs além do app.
        </p>
        <ul className="mt-3 space-y-1.5">
          {awsDomains.map((d) => {
            const accent = awsDomainAccentClasses(d.accent);
            return (
              <li
                key={d.id}
                className="flex gap-2 rounded-lg border border-slate-800/80 bg-slate-950/40 px-2.5 py-2 text-[11px] text-slate-300"
              >
                <span
                  className={cn(
                    "shrink-0 font-mono font-bold",
                    accent.text
                  )}
                >
                  {d.partIds.join("+")}
                </span>
                <span>{d.name}</span>
              </li>
            );
          })}
        </ul>
      </motion.div>

      {/* Como o Forge ajuda */}
      <Section
        delay={0.14}
        icon={Zap}
        title="Como o Forge ajuda no SAA"
        accent="cyan"
      >
        <p className="mb-3 text-[12px] text-slate-400">
          Três frentes no track AWS — mesmo visual hacker/terminal do CCNA.
        </p>
        <div className="space-y-2.5">
          <HowCard
            icon={ClipboardList}
            title={`Simulado · ${TOTAL_AWS_TRADITIONAL} questões`}
            color="text-neon-cyan"
            border="border-neon-cyan/25"
            bg="bg-neon-cyan/10"
            desc="Banco traditional scenario-based (parts 1.1–1.12). Timer opcional; treino de ritmo de prova."
          />
          <HowCard
            icon={Ticket}
            title={`Trilha · ${TOTAL_AWS_TICKETS} tickets`}
            color="text-neon-green"
            border="border-neon-green/25"
            bg="bg-neon-green/10"
            desc="Tickets estilo TShoot AWS: sintoma + CLI/policy/logs — diagnóstico operacional."
          />
          <HowCard
            icon={BookOpen}
            title="Estudo por domínio"
            color="text-amber-300"
            border="border-amber-400/25"
            bg="bg-amber-400/10"
            desc="Oito domínios de estudo (Identity → Observability). Até 15 questões por sessão; progresso em chave :aws."
          />
        </div>
        <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-950/60 p-3 font-mono text-[11px] leading-relaxed text-slate-400">
          <span className="text-amber-300">forge@saa</span>
          <span className="text-slate-600">:</span>
          <span className="text-neon-cyan">~</span>
          <span className="text-slate-600">$ </span>
          <span className="text-slate-300">
            suggest plan --daily tickets --weekly simulado --estudo domains
          </span>
          <p className="mt-2 text-slate-500">
            → Tickets diários, um simulado por semana e Estudo nos domínios com
            menor progresso. Consistência &gt; maratona.
          </p>
        </div>
      </Section>

      {/* Contato */}
      <section className="rounded-xl border border-slate-800/90 bg-slate-900/50 p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          contato
        </p>
        <a
          href={CONTACT_MAILTO}
          className="mt-1.5 inline-block font-mono text-sm text-neon-cyan underline-offset-2 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </section>

      <p className="pb-2 text-center text-[10px] text-slate-600">
        Conteúdo educacional · confira sempre o exam guide oficial da AWS
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
  accent: "green" | "cyan" | "amber";
  delay?: number;
}) {
  const iconCls =
    accent === "green"
      ? "border-neon-green/30 bg-neon-green/10 text-neon-green"
      : accent === "amber"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
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
