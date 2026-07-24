/**
 * CCNA Forge — Curadoria do banco premium de simulado
 *
 * Lê questions_bulk_corrigido.json, aplica critérios rigorosos de qualidade
 * e grava as melhores 150–200 questões em questions_simulado_premium.json.
 *
 * Uso: node scripts/build-premium-simulado.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "src/data/questions_bulk_corrigido.json");
const OUTPUT = path.join(ROOT, "src/data/questions_simulado_premium.json");
const REPORT = path.join(ROOT, "src/data/questions_simulado_premium.report.json");

const TARGET_MIN = 150;
const TARGET_MAX = 200;

// ─── Keywords relevantes CCNA 200-301 (bônus de score) ───────────────────────
const CCNA_KEYWORDS = [
  "vlan",
  "trunk",
  "stp",
  "spanning-tree",
  "ospf",
  "eigrp",
  "bgp",
  "static route",
  "default route",
  "subnet",
  "ipv4",
  "ipv6",
  "nat",
  "dhcp",
  "dns",
  "acl",
  "access-list",
  "etherchannel",
  "port-channel",
  "wireless",
  "wlan",
  "ssid",
  "tcp",
  "udp",
  "osi",
  "ethernet",
  "mac address",
  "arp",
  "icmp",
  "ssh",
  "snmp",
  "ntp",
  "syslog",
  "qos",
  "vpn",
  "ipsec",
  "aaa",
  "radius",
  "tacacs",
  "port security",
  "switchport",
  "router",
  "switch",
  "gateway",
  "wildcard",
  "administrative distance",
  "metric",
  "hello",
  "adjacency",
  "neighbor",
  "prefix",
  "cidr",
  "broadcast",
  "multicast",
  "unicast",
  "frame",
  "packet",
  "collision",
  "csma",
  "duplex",
  "bandwidth",
  "latency",
  "firewall",
  "threat",
  "api",
  "json",
  "rest",
  "ansible",
  "controller",
  "sdn",
  "hypervisor",
  "virtual",
  "cloud",
  "spine",
  "leaf",
  "fhrp",
  "hsrp",
  "vrrp",
  "glbp",
  "cdp",
  "lldp",
  "dtp",
  "vtp",
  "native vlan",
  "access port",
  "routing table",
  "show ip",
  "interface",
  "encapsulation",
  "802.1q",
  "802.11",
  "three-way handshake",
  "syn",
  "ack",
  "mtu",
  "ttl",
  "dns",
  "ftp",
  "http",
  "https",
  "tls",
  "certificate",
  "password",
  "privilege",
  "console",
  "vty",
  "enable secret",
  "ip helper",
  "pat",
  "overload",
  "inside global",
  "outside",
  "dmz",
  "phishing",
  "malware",
  "social engineering",
  "layer 2",
  "layer 3",
  "data link",
  "network layer",
  "transport layer",
];

// Tokens típicos de OCR residual / texto quebrado
const BROKEN_WORD_RE =
  /\b(congure|conguration|congur|identies|identied|specied|specic|specically|prex|benet|benets|oating|ooding|ecient|eciently|efcient|autocong|trafc|\btrac\b|ofce|oors|\boor\b|dened|denition|dierent|dierence|diicult|exible|exibility|ofcial|ofcially|sucient|sufcient|modied|veried|interace|adress|seperate|deault|packtes|protcol|virtural|physcial|connectivty|recieve|netowrk|implment|implmentation|enviroment|managment|occured|occurence|sucessful|necesary|availible|avaliable|bandwith|throughtput|redudancy|adjaceny|swithport|swich|routre|commmand|nancial|afnity|ofine|classied|modication|verication|signicant|certicate|articial|\bnds\b|minimallatency|highfcs|nexthopdevices|net-\s*hop)\b/i;

/** Palavras coladas comuns em dumps OCR (sem espaço entre tokens legíveis) */
const JAMMED_WORDS_RE =
  /\b(?:minimal|high|low|show|ip|mac|next|source|dest|frame|packet|route|access|trunk|native)(?:latency|bandwidth|address|interface|hop|table|vlan|port|count|error|usage)[a-z]*/i;

// Referência a exhibit / multi-select / drag-drop
const EXHIBIT_RE =
  /\b(refer to the exhibit|based on the exhibit|as shown in the exhibit|from the exhibit|in the exhibit|the exhibit shows|exhibit\.|see the exhibit)\b/i;
const MULTI_RE =
  /\b(choose\s+(two|three|four|one or more)|select\s+(two|three|four)|choose\s+all\s+that\s+apply|\(choose\s|select all that apply)\b/i;
const DRAG_RE =
  /\b(drag\s+and\s+drop|drag each|match the|match each|place the)\b/i;

// Alternativa com letras extras E. F. G. ou múltiplas letras embutidas
const EXTRA_LETTER_RE = /^\s*[E-Z][\.\):]\s|[\s;]\s*[E-Z][\.\)]\s+\S/;
const LETTER_PREFIX_RE = /^\s*[A-D][\.\):]\s+/i;

// Alternativas legítimas curtas (comandos, IPs, protocolos)
const LEGIT_SHORT_ALT_RE =
  /^(ip |ipv6 |show |no |interface |switchport |router |ospf|eigrp|bgp|vlan |access-list |permit |deny |ssh|telnet|http|https|ftp|tftp|snmp|ntp|dns|dhcp|nat|pat|tcp|udp|icmp|arp|cdp|lldp|stp|rstp|mst|hsrp|vrrp|glbp|ospfv[23]|ri[pv]|static|default|none|any|host |gigabit|fastethernet|ethernet|serial|loopback|console|vty|enable|configure|copy |reload|ping|traceroute|traceroute|password|secret|username|radius|tacacs|aaa |dot1x|802\.|\/\d{1,2}|^\d|^\d{1,3}(\.\d{1,3}){3}|^[a-f0-9:]+$)/i;

/**
 * @typedef {{ id: number, question_type?: string, isPremium?: boolean, enunciado?: string, alternativas: string[], resposta_correta: number, explicacao_profunda?: string }} Question
 */

/**
 * Espaços faltando comuns em dumps OCR (só padrões seguros).
 * @param {string} text
 */
function fixMissingSpaces(text) {
  return text
    .replace(/\b(must|can|should|will|to|be|is|are|was|were|when|if|and|or|the|a|an|of|for|with|from|on|in|by)([A-Z][a-z]+)/g, "$1 $2")
    .replace(/\b(must be|can be|should be|will be|to be)([a-z]{3,})\b/gi, "$1 $2")
    .replace(/\b(be|is|are|was|were)(used|configured|enabled|disabled|connected|applied|required|available|assigned)\b/gi, "$1 $2")
    .replace(/\b(must)(be|have|use|configure)\b/gi, "$1 $2")
    .replace(/\b(when)(all|the|a|an|connected|received)\b/gi, "$1 $2")
    .replace(/\b(connectivity)(fails|failed|issues)\b/gi, "$1 $2")
    .replace(/\b(which)(command|configuration|protocol|interface|value|action)\b/gi, "$1 $2")
    .replace(/([a-z])([A-Z][a-z]{2,})/g, "$1 $2"); // camel glue leftover
}

/**
 * Normaliza enunciado antes da avaliação (remove prefixos de dump PDF).
 * @param {string} text
 */
function cleanEnunciado(text) {
  return fixMissingSpaces(
    String(text ?? "")
      .replace(/^\s*QUESTION\s+\d+\s*/i, "")
      .replace(/^\s*Q\d+[\.:)\s]+/i, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Detecta texto de configuração/CLI colado sem espaços (lixo de OCR/PDF).
 * Ex.: "interface vlan 2000ipv6 address", "Router(config)#interface"
 */
function hasJammedConfigText(text) {
  if (/\d(?=[a-zA-Z]{3,})/.test(text) && /(?:vlan|interface|address|ipv6|ip|router|switch)/i.test(text)) {
    // digit glued to word: 2000ipv6, 0interface
    if (/\d(?:ipv6|ip\b|interface|address|vlan|router|switch|ospf|eigrp)/i.test(text)) {
      return true;
    }
  }
  // two config keywords glued
  if (/(?:interface|vlan|router|switch|configure|address)[a-z]{2,}/i.test(text) &&
      !/\b(?:interfaces|vlans|routers|switches|addresses|configured|configuration)\b/i.test(text)) {
    // only if looks like glue of two tokens, not normal English
    if (/(?:interface|vlan)\s*\d+[a-z]/i.test(text)) return true;
  }
  return false;
}

/**
 * @param {Question} q
 * @returns {{ keep: boolean, score: number, reasons: string[] }}
 */
function evaluateQuestion(q) {
  /** @type {string[]} */
  const hardReject = [];
  /** @type {string[]} */
  const softPenalties = [];
  let score = 50;

  const enunciado = cleanEnunciado(q.enunciado ?? "");
  const alts = Array.isArray(q.alternativas)
    ? q.alternativas.map((a) => String(a ?? "").trim().replace(/\s+/g, " "))
    : [];
  const allText = [enunciado, ...alts].join(" ");

  // ── Hard rejects ──────────────────────────────────────────
  if (!enunciado) {
    hardReject.push("enunciado_vazio");
  } else if (enunciado.length < 40) {
    hardReject.push("enunciado_curto");
  }

  if (alts.length !== 4) {
    hardReject.push(`alternativas_count_${alts.length}`);
  }

  if (
    !Number.isInteger(q.resposta_correta) ||
    q.resposta_correta < 0 ||
    q.resposta_correta > 3
  ) {
    hardReject.push("resposta_invalida");
  }

  if (EXHIBIT_RE.test(enunciado)) {
    hardReject.push("refer_to_exhibit");
  }

  if (MULTI_RE.test(enunciado)) {
    hardReject.push("choose_two_three");
  }

  if (DRAG_RE.test(enunciado)) {
    hardReject.push("drag_or_match");
  }

  // Alternativas com E. F. etc.
  for (const a of alts) {
    if (EXTRA_LETTER_RE.test(a)) {
      hardReject.push("alt_letra_extra");
      break;
    }
    // Alternativa que parece concatenação de 2 opções (E. no meio)
    if (/\bE\.\s+[A-Z]/.test(a) || /\bF\.\s+[A-Z]/.test(a)) {
      hardReject.push("alt_concatenada");
      break;
    }
    if (hasJammedConfigText(a)) {
      hardReject.push("alt_config_colada");
      break;
    }
  }

  if (hasJammedConfigText(enunciado)) {
    hardReject.push("enunciado_config_colada");
  }

  // Enunciado ainda com artefato de numeração de dump
  if (/^QUESTION\s+\d+/i.test(enunciado) || /\bQUESTION\s+\d{2,}/i.test(enunciado)) {
    hardReject.push("prefixo_question_num");
  }

  // Alternativas vazias ou quase vazias
  for (const a of alts) {
    if (!a || a.length < 2) {
      hardReject.push("alt_vazia");
      break;
    }
  }

  // Alternativas idênticas
  const altNorm = alts.map((a) => a.toLowerCase().replace(/\s+/g, " "));
  if (new Set(altNorm).size < alts.length) {
    hardReject.push("alts_duplicadas");
  }

  // Texto ainda muito quebrado por OCR
  const brokenMatches = allText.match(
    new RegExp(BROKEN_WORD_RE.source, "gi")
  );
  if (brokenMatches && brokenMatches.length >= 1) {
    // No premium: qualquer residual OCR claro é descarte
    hardReject.push("ocr_residual");
  }

  if (JAMMED_WORDS_RE.test(allText)) {
    hardReject.push("palavras_coladas");
  }

  // "trac" solto (traffic sem fi) — comum e polui o premium
  if (/\btrac\b/i.test(allText) && !/\btrace\b/i.test(allText)) {
    hardReject.push("trac_ocr");
  }

  // Caracteres estranhos em excesso
  const weird = (allText.match(/[�□■]|[^\x09\x0A\x0D\x20-\x7E\u00C0-\u024F•–—]/g) ||
    []).length;
  if (weird >= 5) {
    hardReject.push("caracteres_estranhos");
  } else if (weird >= 2) {
    softPenalties.push("caracteres_estranhos_leves");
    score -= 8;
  }

  // Enunciado incompleto / cortado
  if (
    /[…]{1,}|\.\.\.\s*$|_{3,}|\[image\]|\[exhibit\]|\[blank\]/i.test(
      enunciado
    )
  ) {
    hardReject.push("enunciado_incompleto");
  }

  // Listas de requisitos coladas com "*" (dump PDF mal parseado)
  if (/\*[A-Za-z]/.test(enunciado) || (enunciado.match(/\*/g) || []).length >= 2) {
    hardReject.push("lista_asterisco_colada");
  }

  // IP com espaços no lugar de pontos: "209.165 200 225"
  if (/\b\d{1,3}\.\d{1,3}\s+\d{1,3}\s+\d{1,3}\b/.test(allText)) {
    hardReject.push("ip_malformado");
  }

  // Termina abruptamente sem pontuação e parece cortado
  if (
    enunciado.length >= 40 &&
    !/[.?!:;)"'\]]$/.test(enunciado) &&
    /\b(the|a|an|to|of|for|with|and|or|in|on|by|is|are|was|be|which|what|how)\s*$/i.test(
      enunciado
    )
  ) {
    hardReject.push("enunciado_cortado");
  }

  // Alternativa cortada no meio (termina em conector)
  for (const a of alts) {
    if (
      a.length > 12 &&
      /\b(the|a|an|to|of|for|with|and|or|in|on|by|is|are)\s*$/i.test(a) &&
      !LEGIT_SHORT_ALT_RE.test(a)
    ) {
      hardReject.push("alt_cortada");
      break;
    }
  }

  if (hardReject.length > 0) {
    return { keep: false, score: 0, reasons: hardReject };
  }

  // ── Soft scoring ──────────────────────────────────────────

  // Enunciado bem formado
  if (enunciado.length >= 60 && enunciado.length <= 400) score += 12;
  else if (enunciado.length > 400 && enunciado.length <= 700) score += 6;
  else if (enunciado.length > 700) score -= 5;

  if (/[?]$/.test(enunciado) || /^(what|which|how|when|where|why|an? |the )/i.test(enunciado)) {
    score += 6;
  }

  // Alternativas bem formadas
  let shortBad = 0;
  let goodAlts = 0;
  for (const a of alts) {
    // Strip letter prefixes for length checks
    const clean = a.replace(LETTER_PREFIX_RE, "").trim();
    const len = clean.length;

    if (len < 8 && !LEGIT_SHORT_ALT_RE.test(clean) && !/^\d/.test(clean)) {
      shortBad += 1;
    } else if (len >= 12 || LEGIT_SHORT_ALT_RE.test(clean)) {
      goodAlts += 1;
    }

    // Alternativa muito genérica / placeholder
    if (/^(n\/a|none of the above|all of the above|option [a-d])$/i.test(clean)) {
      score -= 6;
      softPenalties.push("alt_generica");
    }

    // Ainda tem prefixo A. B. (não é fatal, mas polui)
    if (LETTER_PREFIX_RE.test(a)) {
      score -= 2;
      softPenalties.push("alt_com_letra_prefixo");
    }
  }

  if (shortBad >= 2) {
    return {
      keep: false,
      score: 0,
      reasons: ["alts_muito_curtas"],
    };
  }
  if (shortBad === 1) {
    score -= 10;
    softPenalties.push("alt_curta");
  }
  if (goodAlts === 4) score += 10;
  else if (goodAlts >= 3) score += 5;

  // Variedade de comprimento entre alts (menos chance de lixo)
  const lengths = alts.map((a) => a.length);
  const avg = lengths.reduce((s, n) => s + n, 0) / lengths.length;
  if (avg >= 25 && avg <= 180) score += 6;
  if (avg < 12) score -= 12;

  // Relevância CCNA
  const lower = allText.toLowerCase();
  let kwHits = 0;
  for (const kw of CCNA_KEYWORDS) {
    if (lower.includes(kw)) kwHits += 1;
  }
  if (kwHits === 0) {
    score -= 20;
    softPenalties.push("sem_keywords_ccna");
  } else if (kwHits === 1) {
    score += 4;
  } else if (kwHits <= 3) {
    score += 10;
  } else {
    score += 16;
  }

  // Enunciado parece CLI / troubleshooting (alto valor educacional)
  if (
    /\b(show |configure|output|interface|router#|switch#|r1#|sw1#|debug |ping |traceroute|adjacency|neighbor|mismatch|cannot|fails|not working|unreachable)\b/i.test(
      allText
    )
  ) {
    score += 8;
    softPenalties.push("bonus_troubleshoot"); // tracked as positive tag
  }

  // Muitos números soltos sem contexto de rede (possível lixo de tabela OCR)
  const digitRatio =
    (allText.replace(/\s/g, "").match(/\d/g) || []).length /
    Math.max(1, allText.replace(/\s/g, "").length);
  if (digitRatio > 0.35) {
    score -= 15;
    softPenalties.push("muitos_digitos");
  }

  // Frases muito repetitivas (cópia mal cortada)
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length > 8) {
    const unique = new Set(words);
    if (unique.size / words.length < 0.45) {
      score -= 12;
      softPenalties.push("texto_repetitivo");
    }
  }

  // Penalidade se enunciado é só comando sem contexto
  if (enunciado.length < 55 && !/[?]/.test(enunciado)) {
    score -= 8;
  }

  // Score floor for keep decision later
  const keep = score >= 52;
  if (!keep) {
    softPenalties.push("score_baixo");
  }

  return {
    keep,
    score,
    reasons: softPenalties.length ? softPenalties : ["ok"],
  };
}

/**
 * Similaridade simples por tokens (Jaccard) para dedupe.
 */
function jaccard(a, b) {
  const ta = new Set(
    a
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const tb = new Set(
    b
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

function main() {
  console.log("Lendo:", INPUT);
  /** @type {Question[]} */
  const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  console.log(`Entrada: ${data.length} questões`);

  /** @type {{ q: Question, score: number, reasons: string[] }[]} */
  const evaluated = [];
  const rejectCounts = new Map();

  for (const q of data) {
    const result = evaluateQuestion(q);
    if (!result.keep) {
      for (const r of result.reasons) {
        rejectCounts.set(r, (rejectCounts.get(r) || 0) + 1);
      }
      continue;
    }
    evaluated.push({ q, score: result.score, reasons: result.reasons });
  }

  // Ordenar por score desc
  evaluated.sort((a, b) => b.score - a.score);

  // Deduplicar por similaridade de enunciado (manter o de maior score)
  /** @type {{ q: Question, score: number, reasons: string[] }[]} */
  const unique = [];
  for (const item of evaluated) {
    const en = (item.q.enunciado || "").trim();
    const isDup = unique.some(
      (u) => jaccard(en, (u.q.enunciado || "").trim()) >= 0.82
    );
    if (isDup) {
      rejectCounts.set("duplicata_similar", (rejectCounts.get("duplicata_similar") || 0) + 1);
      continue;
    }
    unique.push(item);
  }

  // Garantir faixa 150–200: se sobrar mais, cortar no max; se menos, baixar threshold
  let selected = unique.slice(0, TARGET_MAX);

  if (selected.length < TARGET_MIN) {
    // Reavaliar com threshold mais permissivo a partir dos rejeitados soft
    console.warn(
      `Aviso: apenas ${selected.length} passaram no filtro estrito. Expandindo pool...`
    );
    // Re-score all with lower bar: keep any score >= 40 not hard-rejected
    // Already hard-rejected are gone; re-include from evaluated that were filtered by score
    // Actually evaluateQuestion already filters score>=52. Re-run with soft mode:
    for (const q of data) {
      if (selected.some((s) => s.q.id === q.id)) continue;
      const r = evaluateQuestion(q);
      // Only expand with items that failed only on score_baixo / soft
      if (r.score >= 40 && !r.reasons.some((x) =>
        [
          "enunciado_vazio",
          "enunciado_curto",
          "refer_to_exhibit",
          "choose_two_three",
          "drag_or_match",
          "alt_letra_extra",
          "alt_concatenada",
          "alt_vazia",
          "alts_duplicadas",
          "ocr_residual_multiplo",
          "caracteres_estranhos",
          "enunciado_incompleto",
          "enunciado_cortado",
          "alt_cortada",
          "resposta_invalida",
        ].includes(x)
      )) {
        const en = (q.enunciado || "").trim();
        if (en.length < 40) continue;
        if (unique.some((u) => jaccard(en, (u.q.enunciado || "").trim()) >= 0.82))
          continue;
        if (selected.some((s) => jaccard(en, (s.q.enunciado || "").trim()) >= 0.82))
          continue;
        selected.push({ q, score: r.score, reasons: r.reasons });
      }
      if (selected.length >= TARGET_MIN) break;
    }
    selected.sort((a, b) => b.score - a.score);
    selected = selected.slice(0, TARGET_MAX);
  }

  // Prefer sweet spot around 180 if we have enough high quality
  if (selected.length > 180) {
    // Keep top 180 if score drops significantly after that
    const top = selected[0].score;
    const cutoffIdx = selected.findIndex(
      (s, i) => i >= TARGET_MIN && s.score < top * 0.72
    );
    if (cutoffIdx >= TARGET_MIN && cutoffIdx <= TARGET_MAX) {
      selected = selected.slice(0, Math.min(cutoffIdx, 185));
    } else {
      selected = selected.slice(0, 185);
    }
  }

  // Reindex IDs 1..N, normalize structure
  const premium = selected.map((item, idx) => {
    const q = item.q;
    // Clean letter prefixes from alternatives for a cleaner premium UX
    const alternativas = (q.alternativas || []).map((a) =>
      fixMissingSpaces(
        String(a ?? "")
          .trim()
          .replace(LETTER_PREFIX_RE, "")
          .replace(/\s+/g, " ")
          // IPv6 / hex spacing artifacts: "2001: DB8" → "2001:DB8"
          .replace(/([0-9A-Fa-f]):\s+([0-9A-Fa-f])/g, "$1:$2")
          .trim()
      )
    );
    return {
      id: idx + 1,
      question_type: "traditional",
      isPremium: true,
      enunciado: cleanEnunciado(q.enunciado || ""),
      alternativas,
      resposta_correta: q.resposta_correta,
      explicacao_profunda: q.explicacao_profunda ?? "",
    };
  });

  // Final hard validation pass on premium set
  const final = premium.filter((q) => {
    if (!q.enunciado || q.enunciado.length < 40) return false;
    if (q.alternativas.length !== 4) return false;
    if (q.alternativas.some((a) => !a || a.length < 2)) return false;
    if (q.resposta_correta < 0 || q.resposta_correta > 3) return false;
    if (EXHIBIT_RE.test(q.enunciado) || MULTI_RE.test(q.enunciado)) return false;
    return true;
  });

  // Ensure still in range — if final shrank, don't invent questions
  const out = final.slice(0, TARGET_MAX);

  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2) + "\n", "utf8");

  const report = {
    input: data.length,
    output: out.length,
    target: { min: TARGET_MIN, max: TARGET_MAX },
    scoreRange: out.length
      ? {
          min: Math.min(...selected.slice(0, out.length).map((s) => s.score)),
          max: Math.max(...selected.slice(0, out.length).map((s) => s.score)),
          avg: Math.round(
            selected.slice(0, out.length).reduce((s, x) => s + x.score, 0) /
              out.length
          ),
        }
      : null,
    rejectCounts: Object.fromEntries(
      [...rejectCounts.entries()].sort((a, b) => b[1] - a[1])
    ),
    samples: out.slice(0, 5).map((q) => ({
      id: q.id,
      enunciado: q.enunciado.slice(0, 100),
      alts: q.alternativas.map((a) => a.slice(0, 50)),
    })),
  };
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

  console.log("Salvo:", OUTPUT);
  console.log(`Premium: ${out.length} questões (IDs 1–${out.length})`);
  console.log("Score range:", report.scoreRange);
  console.log("Top rejeições:", report.rejectCounts);
  console.log("Relatório:", REPORT);

  if (out.length < TARGET_MIN) {
    console.warn(
      `\n⚠ Apenas ${out.length} questões no banco premium (mínimo alvo ${TARGET_MIN}).`
    );
    process.exitCode = 0; // still useful
  } else {
    console.log(`\n✓ Banco premium na faixa ${TARGET_MIN}–${TARGET_MAX}.`);
  }
}

main();
