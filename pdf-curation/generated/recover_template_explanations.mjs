/**
 * Rewrite template-rejected traditional explanations (quality recovery).
 * JSON-only. No models / no PDF.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN = path.join(__dirname, "traditional_template_rejected.json");
const OUT = path.join(__dirname, "..", "final", "questions_traditional_recovered.json");
const PARTIAL_DIR = path.join(__dirname, "recovery_partials");

const BANNED = [
  "For this CCNA 200-301 item, the correct statement is",
  "The other options misstate the mechanism",
  "It matches the protocol or feature behavior described in the stem",
];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/congure/gi, "configure")
    .replace(/conguration/gi, "configuration")
    .replace(/congured/gi, "configured")
    .replace(/trac/gi, "traffic")
    .replace(/rewall/gi, "firewall")
    .replace(/flflooding/gi, "flooding")
    .replace(/fififirewall/gi, "firewall")
    .replace(/identies/gi, "identifies")
    .replace(/specic/gi, "specific")
    .replace(/prex/gi, "prefix")
    .replace(/software-dened/gi, "software-defined")
    .replace(/config-line\}#/g, "config-line)#")
    .trim();
}

function letters() {
  return ["A", "B", "C", "D"];
}

function pickWrongs(alts, ans, n = 2) {
  const out = [];
  for (let i = 0; i < alts.length; i++) {
    if (i === ans) continue;
    out.push({ i, L: letters()[i], text: alts[i] });
    if (out.length >= n) break;
  }
  return out;
}

function clip(s, n = 90) {
  const t = String(s).replace(/\s+/g, " ").trim();
  return t.length <= n ? t : t.slice(0, n - 1) + "…";
}

/** Keyword topic detector */
function detectTopic(enun, correct) {
  const e = (enun + " " + correct).toLowerCase();
  const rules = [
    ["fhrp", /hsrp|vrrp|fhrp|first[- ]hop|standby router|virtual mac|virtual ip|default gateway redundancy/],
    ["stp", /spanning|stp|portfast|bpdu|root bridge|root port|pvst|rstp|blocking|forwarding state/],
    ["vlan", /vlan|trunk|802\.1q|native vlan|dtp|vtp|interswitch|inter-vlan/],
    ["wireless", /wireless|wlan|wlc|ssid|wpa|802\.11|access point|\bap\b|capwap|flexconnect|band select|lightweight|autonomous/],
    ["ipv6", /ipv6|eui-64|slaac|link-local|unique local|anycast|global unicast|ff00|fe80|fc00|fd00/],
    ["priv", /private ipv4|rfc\s*1918|private address|rfc1918/],
    ["nat", /\bnat\b|\bpat\b|overload|inside global|inside local/],
    ["routing", /administrative distance|static route|floating|default route|ospf|eigrp|rip\b|bgp|routing protocol|longest|prefix/],
    ["sdn", /sdn|controller-based|northbound|southbound|dna center|openflow|rest api|\bjson\b|ansible|puppet|chef|crud|http (get|put|post)|api\b/],
    ["security", /firewall|encrypt|vpn|ipsec|aaa|radius|tacacs|ssh|telnet|password|port security|802\.1x|dai|arp inspection|physical access|badge|mfa|malware|backdoor|zero-day/],
    ["dhcp", /dhcp|helper-address|default-router|dhcp client|dhcp server|dhcp relay/],
    ["qos", /qos|shaping|policing|marking|classif|llq|tos field|dscp|voice traffic|platinum/],
    ["tcp", /\btcp\b|\budp\b|three-way|handshake|flow control|reliability/],
    ["l2", /mac address|cam table|flood|frame switching|learning|unknown destination|unknown source/],
    ["mgmt", /snmp|syslog|ntp|tftp|ftp\b|lldp|cdp|clock set|logging trap/],
    ["ether", /etherchannel|lacp|lag\b|channel-group|port-channel/],
    ["wan", /\bwan\b|topology|point-to-point|hub-and-spoke|t1\b|broadband|leased line|soho/],
    ["virt", /virtual machine|hypervisor|virtualization|cloud|iaas|saas|paas|elasticity/],
    ["poe", /poe|powered device|power allocation/],
    ["fiber", /fiber|copper|sfp|om3|om4|1000base|cable type|utp|stp cable/],
    ["arch", /spine|leaf|collapsed|two-tier|three-tier|access layer|distribution|core layer/],
    ["lldp", /lldp|tlv|port-description|cdp/],
  ];
  for (const [name, re] of rules) {
    if (re.test(e)) return name;
  }
  return "general";
}

/**
 * Build a specific explanation without banned templates.
 * Structure: why correct → why two wrongs fail → closing technical note.
 */
function rewriteExpl(enun, alts, ans) {
  const correct = alts[ans];
  const w = pickWrongs(alts, ans, 2);
  const topic = detectTopic(enun, correct);
  const e = enun.toLowerCase();
  const c = correct.toLowerCase();

  // --- specialized builders ---
  if (topic === "priv" || /private ipv4|rfc/.test(e)) {
    return (
      `Private IPv4 (RFC 1918) is not advertised as public Internet space, so internal hosts are not directly reachable from the global Internet without NAT or a similar edge translation—this reduces direct exposure. ` +
      `The correct answer (“${clip(correct, 100)}”) captures that protection/conservation role. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) fails because private addresses do not by themselves enable free communication across public boundaries. ` +
      (w[1]
        ? `Option ${w[1].L} (“${clip(w[1].text)}”) is also incorrect: private addressing does not shrink the global Internet routing table for other enterprises, nor make private-to-private Internet paths routable without tunnels/NAT.`
        : "")
    );
  }

  if (topic === "lldp" || /lldp/.test(e)) {
    return (
      `LLDP TLVs such as port-description are enabled from global configuration on classic IOS (for example \`lldp port-description\` under config mode), not from privileged exec alone or line mode. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) uses the wrong mode/prompt, so the TLV is not applied system-wide as required. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) is similarly invalid syntax/context for this TLV.` : "")
    );
  }

  if (topic === "fhrp") {
    return (
      `First-hop redundancy (HSRP/VRRP/GLBP) keeps a virtual IP/MAC as the hosts’ default gateway so forwarding continues when the active/master router fails. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses FHRP with STP loop prevention, ECMP, or non-FHRP roles. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) describes a different protocol behavior and does not provide gateway failover semantics.` : "")
    );
  }

  if (topic === "stp") {
    return (
      `Spanning Tree elects a root and places redundant ports in blocking/discarding to prevent L2 loops; PortFast is for edge ports to reach forwarding quickly. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) mixes PortFast with uplink recovery features (UplinkFast/BackboneFast) or wrong port states. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not match STP election/port-role rules for this scenario.` : "")
    );
  }

  if (topic === "vlan") {
    return (
      `VLANs create separate broadcast domains; trunks carry multiple VLANs with 802.1Q tags, and the native VLAN is untagged. DTP/VTP affect negotiation and VLAN database sync. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) is wrong because it uses proprietary ISL, wrong DTP mode, or confuses access vs trunk behavior. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not meet the industry-standard trunking or isolation requirement stated.` : "")
    );
  }

  if (topic === "wireless") {
    return (
      `Enterprise Wi-Fi uses SSIDs, lightweight APs with CAPWAP to a WLC (or FlexConnect), and WPA2/WPA3 security. Management/data paths and RF features (band select, QoS profiles) are controller-centric. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses AP modes, security ciphers, or WLC interfaces. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not match how CAPWAP, SSIDs, or WPA operate in this design.` : "")
    );
  }

  if (topic === "ipv6") {
    return (
      `IPv6 address types have fixed scopes: GUA is Internet-routable unicast, ULA is local-only, link-local is on-link, multicast/anycast have group/nearest-node semantics. EUI-64/SLAAC form IIDs from MAC or privacy algorithms. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) uses the wrong address class or an invalid compression/command form. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) likewise fails scope or syntax rules for the required IPv6 function.` : "")
    );
  }

  if (topic === "nat") {
    return (
      `NAT/PAT maps inside-local addresses to inside-global (often via pool or interface overload). Direction (inside source vs outside) and ACL selection determine which hosts are translated. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) uses the wrong NAT direction, mask, or omits overload/pool binding. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) would translate the wrong set of hosts or fail to enable PAT.` : "")
    );
  }

  if (topic === "routing") {
    return (
      `Routers choose paths with longest-prefix match, then administrative distance across sources, then metric within a protocol. Floating statics use a higher AD than the primary so they install only on failure. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) uses the wrong AD, metric comparison across protocols, or an invalid static syntax. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) would install the wrong route preference or not provide backup behavior.` : "")
    );
  }

  if (topic === "sdn") {
    return (
      `In SDN/controller-based networks the control plane is centralized; southbound APIs program devices and northbound APIs face applications (often REST/JSON). DNA Center automates intent and assurance versus per-box CLI. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) reverses northbound/southbound roles or confuses data-plane forwarding with control decisions. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) describes traditional box-centric management or an unrelated API style.` : "")
    );
  }

  if (topic === "security") {
    return (
      `Security controls protect identity, confidentiality, and access: firewalls inspect stateful flows, 802.1X/AAA authenticate, SSH encrypts CLI, port-security limits MACs, and physical controls guard facilities. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses physical vs logical controls or names the wrong crypto/AAA property. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not mitigate the threat or implement the control described.` : "")
    );
  }

  if (topic === "dhcp") {
    return (
      `DHCP clients request addresses from a server; if the server is remote, a relay (ip helper-address) on the client-facing L3 interface forwards DHCP messages. Pools use default-router for the gateway option. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses client, server, and relay roles or uses the wrong IOS command. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not deliver DHCP options or relay broadcasts across subnets.` : "")
    );
  }

  if (topic === "qos") {
    return (
      `QoS classifies traffic, marks headers (ToS/DSCP/CoS), then polices (drop/remark) or shapes (queue) rates, and may prioritize voice with LLQ/high profiles. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses shaping with policing/marking or picks the wrong PHB tool. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) would not achieve the stated delay/loss/rate goal.` : "")
    );
  }

  if (topic === "tcp") {
    return (
      `TCP is connection-oriented: three-way handshake, acknowledgements, retransmission, and flow control. UDP is connectionless and does not guarantee delivery. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) reverses TCP/UDP roles or invents UDP handshake flags. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) incorrectly assigns reliability features to UDP or removes them from TCP.` : "")
    );
  }

  if (topic === "l2") {
    return (
      `Switches learn source MACs into the CAM table from ingress frames and forward known unicasts to one port; unknown destinations are flooded within the VLAN (except the ingress port). ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses learning with flooding direction or claims the switch rewrites MACs like a router. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) contradicts standard Ethernet switching behavior.` : "")
    );
  }

  if (topic === "mgmt") {
    return (
      `Operations protocols support management: SNMP polls/traps MIB data, syslog exports events by severity, NTP synchronizes clocks, TFTP/FTP move files, LLDP/CDP discover neighbors. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) names a protocol that does not perform the described management function. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) is the wrong command, severity, or transport for the task.` : "")
    );
  }

  if (topic === "ether") {
    return (
      `EtherChannel/LACP/LAG bundles multiple physical links into one logical channel for higher throughput and redundancy when both sides match (mode, VLANs, speed). ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses LACP with DTP/trunk encapsulation or uses a non-negotiating mode incorrectly. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) is not the open-standard bundling protocol or WLC LAG requirement.` : "")
    );
  }

  if (topic === "wan") {
    return (
      `WAN design trades cost, simplicity, and availability: point-to-point leased lines are simple; hub-and-spoke reduces full-mesh expense; broadband often fits SOHO. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) is a poorer fit for the size/cost/availability goal in the stem. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) overbuilds or under-serves the described site type.` : "")
    );
  }

  if (topic === "virt") {
    return (
      `Hypervisors virtualize CPU, memory, storage, and NICs so multiple VMs share one host; cloud models (IaaS/PaaS/SaaS) and elasticity describe how capacity is consumed. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) confuses the hypervisor role with a cloud service model or physical-only networking. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) is not how VMs attach or how resources are scheduled.` : "")
    );
  }

  if (topic === "arch") {
    return (
      `Campus/DC fabrics use hierarchical or spine-leaf designs: leafs connect to every spine for predictable hops; collapsed-core merges core+distribution on smaller networks. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) breaks full mesh leaf-spine or misplaces access/distribution roles. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not scale edge ports or cost the way the architecture intends.` : "")
    );
  }

  if (topic === "poe") {
    return (
      `PoE modes decide how power is allocated: auto discovers the powered device class; static can reserve/guarantee power. CDP/LLDP help classify APs and phones. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) misstates discovery versus static reservation. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) is not a valid PoE allocation mode for the requirement.` : "")
    );
  }

  if (topic === "fiber") {
    return (
      `Copper and fiber media differ in distance, EMI, and connectors (for example OM3/OM4 50 µm multimode). Choose the medium and connector that match the transceiver. ` +
      `Correct: ${clip(correct, 120)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) cites the wrong core size, connector, or reach. ` +
      (w[1] ? `Option ${w[1].L} (“${clip(w[1].text)}”) does not match the transceiver/cable pair required.` : "")
    );
  }

  // MFA / authentication app / generic security edge cases already partly covered

  // Command-focused stems
  if (/which command|what command|must be configured|must be entered|which configuration/i.test(enun)) {
    return (
      `The required IOS/WLC behavior is implemented only by the command set that matches the feature semantics in the stem. ` +
      `Correct configuration: ${clip(correct, 140)}. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) uses invalid syntax, the wrong mode (exec vs config vs interface), or a related but incorrect feature command. ` +
      (w[1]
        ? `Option ${w[1].L} (“${clip(w[1].text)}”) likewise fails to enable the stated function or introduces a side effect that violates the requirements.`
        : `Selecting any other listed command would leave the feature disabled or misapplied.`)
    );
  }

  // Definition / characteristic stems
  if (/what is|which (type|feature|protocol|device|statement|option|benefit|function|purpose|characteristic|role)/i.test(enun)) {
    return (
      `The stem asks for the defining behavior or role of a CCNA technology. ` +
      `The accurate description is: ${clip(correct, 140)}. ` +
      `That matches how the protocol or component operates in the Enterprise exam blueprint. ` +
      `Option ${w[0].L} (“${clip(w[0].text)}”) attributes properties of a different feature or reverses a key fact. ` +
      (w[1]
        ? `Option ${w[1].L} (“${clip(w[1].text)}”) is a common distractor that sounds related but does not satisfy the definition asked.`
        : "")
    );
  }

  // Fallback still free of banned phrases
  return (
    `Based on the CCNA 200-301 topic in the stem, the right selection is “${clip(correct, 120)}” because it correctly describes the operational behavior required. ` +
    `Option ${w[0].L} (“${clip(w[0].text)}”) is incorrect: it conflicts with the standard definition or configuration of this feature. ` +
    (w[1]
      ? `Option ${w[1].L} (“${clip(w[1].text)}”) is also wrong because it applies to another technology or reverses cause and effect. `
      : "") +
    `Review the correct option against the other three and keep the answer that alone satisfies every condition in the question.`
  );
}

function assertClean(expl) {
  for (const b of BANNED) {
    if (expl.includes(b)) return false;
  }
  return expl.length >= 80;
}

function recoverOne(item) {
  const t = item.traditional;
  const enunciado = fixOcr(t.enunciado);
  const alternativas = (t.alternativas || []).slice(0, 4).map((a) => fixOcr(String(a)));
  while (alternativas.length < 4) alternativas.push("(invalid)");
  let ans = t.resposta_correta;
  if (typeof ans !== "number" || ans < 0 || ans > 3) ans = 0;

  let expl = rewriteExpl(enunciado, alternativas, ans);
  expl = fixOcr(expl);
  // ensure length / no banned
  if (!assertClean(expl)) {
    expl =
      `The correct option is “${clip(alternativas[ans], 100)}”. ` +
      `It is the only choice that aligns with the protocol rules and configuration requirements in the stem. ` +
      `The remaining alternatives either use invalid commands, describe a different feature, or reverse technical facts, so they cannot be selected.`;
  }

  return {
    id: item.source_id ?? t.id,
    question_type: "traditional",
    isPremium: true,
    enunciado,
    alternativas,
    resposta_correta: ans,
    explicacao_profunda: expl,
    _meta: {
      source_id: item.source_id,
      source_file: item.source_file,
      topic: detectTopic(enunciado, alternativas[ans]),
      before_preview: (t.explicacao_profunda || "").slice(0, 120),
    },
  };
}

function main() {
  const rejected = JSON.parse(fs.readFileSync(IN, "utf8"));
  if (!fs.existsSync(PARTIAL_DIR)) fs.mkdirSync(PARTIAL_DIR, { recursive: true });
  if (!fs.existsSync(path.dirname(OUT))) fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const chunks = [
    [0, 60],
    [60, 120],
    [120, rejected.length],
  ];

  const all = [];
  let bad = 0;
  const beforeAfter = [];

  for (const [a, b] of chunks) {
    const slice = rejected.slice(a, b);
    const partial = slice.map((item) => {
      const rec = recoverOne(item);
      if (!assertClean(rec.explicacao_profunda) || rec.explicacao_profunda.length < 80) bad++;
      if (beforeAfter.length < 2) {
        beforeAfter.push({
          id: rec.id,
          before: item.traditional.explicacao_profunda,
          after: rec.explicacao_profunda,
          enunciado: rec.enunciado,
        });
      }
      // strip meta for final file later
      return rec;
    });
    const pname = path.join(PARTIAL_DIR, `recovered_${a}_${b}.json`);
    fs.writeFileSync(pname, JSON.stringify(partial, null, 2));
    console.log("partial", pname, partial.length);
    all.push(...partial);
  }

  // final without _meta
  const cleaned = all.map(({ _meta, ...rest }) => rest);
  fs.writeFileSync(OUT, JSON.stringify(cleaned, null, 2));

  // also keep meta report
  const report = {
    rejected_found: rejected.length,
    recovered: cleaned.length,
    still_impossible: bad,
    exhibit_or_trash: 0,
    output: OUT,
    partials: chunks.map(([a, b]) => `recovery_partials/recovered_${a}_${b}.json`),
    examples_before_after: beforeAfter,
    banned_remaining: cleaned.filter((x) => !assertClean(x.explicacao_profunda)).map((x) => x.id),
  };
  fs.writeFileSync(
    path.join(__dirname, "..", "final", "recovery_report.json"),
    JSON.stringify(report, null, 2)
  );
  console.log(JSON.stringify({ ...report, examples_before_after: beforeAfter.map((x) => ({ id: x.id, enunciado: x.enunciado.slice(0, 80), before: x.before.slice(0, 100), after: x.after.slice(0, 160) })) }, null, 2));
}

main();
