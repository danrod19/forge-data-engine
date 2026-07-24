import type { ReactNode } from "react";

const CISCO_COMMANDS =
  /\b(show|configure|interface|ip|vlan|spanning-tree|switchport|access-list|router|ospf|nat|no|enable|exit|write|copy|ping|traceroute|debug|undebug|clear|reload|hostname|username|password|line|banner|service|clock|ntp|snmp|aaa|crypto|tunnel|vrf|bfd|eigrp|bgp|rip|static|default-gateway|helper-address|route|address|mask|mode|trunk|access|native|encapsulation|description|shutdown|speed|duplex|channel-group|port-channel|lacp|vtp|dtp|cdp|lldp|mac|address-table|arp|icmp|tcp|udp|permit|deny|eq|any|host|log|established|range|priority|cost|network|area|passive-interface|redistribute|default-information|originate|version|authentication|key|bandwidth|delay|timers|hello|dead|adjacency|neighbor|summary|brief|detail|running-config|startup-config|interfaces|vlans|route-map|prefix-list|community|as-path|metric|next-hop|load-balance|portfast|bpduguard|root|guard|mst|pvst|rapid-pvst|mst|instance)\b/gi;

const STATUS_UP = /\b(up|trunking|active|connected|FWD|forwarding|DR|BDR|FULL|2WAY|established|permit)\b/gi;
const STATUS_DOWN =
  /\b(down|disabled|err-disabled|blocking|BLK|LIS|LRN|down\/down|administratively|unsup|deny|not set)\b/gi;
const INTERFACES =
  /\b(GigabitEthernet\d+(?:\/\d+)*|Gi\d+(?:\/\d+)*|Fa\d+(?:\/\d+)*|FastEthernet\d+(?:\/\d+)*|Ethernet\d+(?:\/\d+)*|Eth\d+(?:\/\d+)*|Serial\d+(?:\/\d+)*|Se\d+(?:\/\d+)*|Loopback\d+|Lo\d+|Vlan\d+|Vl\d+|Port-channel\d+|Po\d+|Te\d+(?:\/\d+)*)\b/g;
const IP_ADDR =
  /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)(?:\/\d{1,2})?\b/g;
const NUMBERS = /\b\d+\b/g;

type TokenKind =
  | "text"
  | "cmd"
  | "up"
  | "down"
  | "iface"
  | "ip"
  | "num"
  | "comment";

interface Token {
  kind: TokenKind;
  value: string;
}

function tokenizeGeneric(line: string): Token[] {
  // Build a combined regex that captures interesting tokens
  const pattern = new RegExp(
    [
      CISCO_COMMANDS.source,
      INTERFACES.source,
      IP_ADDR.source,
      STATUS_UP.source,
      STATUS_DOWN.source,
      NUMBERS.source,
    ].join("|"),
    "gi"
  );

  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > last) {
      tokens.push({ kind: "text", value: line.slice(last, match.index) });
    }
    const value = match[0];
    let kind: TokenKind = "text";

    if (new RegExp(`^${INTERFACES.source}$`, "i").test(value)) kind = "iface";
    else if (new RegExp(`^${IP_ADDR.source}$`).test(value)) kind = "ip";
    else if (/^(up|trunking|active|connected|FWD|forwarding|DR|BDR|FULL|2WAY|established|permit)$/i.test(value))
      kind = "up";
    else if (
      /^(down|disabled|err-disabled|blocking|BLK|LIS|LRN|administratively|unsup|deny|not set)$/i.test(
        value
      ) ||
      value.toLowerCase() === "down"
    )
      kind = "down";
    else if (
      /^(show|configure|interface|ip|vlan|spanning-tree|switchport|access-list|router|ospf|nat|no|enable|exit|write|copy|ping|traceroute|debug|clear|reload|hostname|mode|trunk|access|native|encapsulation|permit|deny|eq|any|host|brief|detail|running-config|startup-config|interfaces|network|area|helper-address|route|address|cost|priority|portfast|root|neighbor|summary)$/i.test(
        value
      )
    )
      kind = "cmd";
    else if (/^\d+$/.test(value)) kind = "num";
    else kind = "text";

    tokens.push({ kind, value });
    last = match.index + value.length;
  }

  if (last < line.length) {
    tokens.push({ kind: "text", value: line.slice(last) });
  }

  return tokens.length ? tokens : [{ kind: "text", value: line }];
}

function tokenClass(kind: TokenKind): string {
  switch (kind) {
    case "cmd":
      return "text-sky-400";
    case "up":
      return "text-neon-green font-medium";
    case "down":
      return "text-rose-400 font-medium";
    case "iface":
      return "text-violet-300";
    case "ip":
      return "text-cyan-300";
    case "num":
      return "text-amber-300";
    case "comment":
      return "text-slate-500";
    default:
      return "text-slate-300";
  }
}

function renderTokens(tokens: Token[], keyPrefix: string): ReactNode {
  return tokens.map((t, i) => (
    <span key={`${keyPrefix}-${i}`} className={tokenClass(t.kind)}>
      {t.value}
    </span>
  ));
}

/** Highlight a single CLI line for the terminal renderer */
export function highlightCliLine(line: string, index: number): ReactNode {
  // Empty line
  if (!line.trim()) {
    return <div key={index} className="h-3" aria-hidden />;
  }

  // Prompt: SwitchA# show interfaces trunk  OR  R1>
  const promptMatch = line.match(
    /^([A-Za-z][A-Za-z0-9_-]*)([#>])\s?(.*)$/
  );
  if (promptMatch) {
    const [, host, prompt, rest] = promptMatch;
    return (
      <div key={index} className="flex flex-wrap whitespace-pre-wrap break-all">
        <span className="text-neon-green font-semibold">{host}</span>
        <span className="text-neon-cyan font-bold">{prompt}</span>
        {rest ? (
          <span className="ml-1">{renderTokens(tokenizeGeneric(rest), `p${index}`)}</span>
        ) : null}
      </div>
    );
  }

  // Config mode prompts: Router(config)# or Switch(config-if)#
  const configPrompt = line.match(
    /^([A-Za-z][A-Za-z0-9_-]*)\(([^)]+)\)([#>])\s?(.*)$/
  );
  if (configPrompt) {
    const [, host, mode, prompt, rest] = configPrompt;
    return (
      <div key={index} className="flex flex-wrap whitespace-pre-wrap break-all">
        <span className="text-neon-green font-semibold">{host}</span>
        <span className="text-slate-500">(</span>
        <span className="text-fuchsia-400">{mode}</span>
        <span className="text-slate-500">)</span>
        <span className="text-neon-cyan font-bold">{prompt}</span>
        {rest ? (
          <span className="ml-1">{renderTokens(tokenizeGeneric(rest), `c${index}`)}</span>
        ) : null}
      </div>
    );
  }

  // Building / Codes comments
  if (
    line.startsWith("Codes:") ||
    line.startsWith("Building configuration") ||
    line.startsWith("Current configuration") ||
    line.trim() === "!"
  ) {
    return (
      <div key={index} className="text-slate-500 whitespace-pre-wrap break-all">
        {line}
      </div>
    );
  }

  // Table headers (all caps-ish or known headers)
  if (
    /^(Port|Interface|VLAN Name|VLAN\s+Name|Name:|Switchport:|Administrative|Operational|Negotiation|Access Mode|Trunking|Root ID|Bridge ID|Gateway of last resort|Interface\s+Role|Extended IP access list)/i.test(
      line.trim()
    ) ||
    /^-{5,}/.test(line.trim())
  ) {
    return (
      <div key={index} className="text-neon-cyan/70 whitespace-pre-wrap break-all">
        {line}
      </div>
    );
  }

  // Full-line deny / permit emphasis for ACLs
  if (/^\s*\d+\s+deny\b/i.test(line) || /^\s*deny\b/i.test(line)) {
    return (
      <div key={index} className="whitespace-pre-wrap break-all">
        {renderTokens(tokenizeGeneric(line), `d${index}`)}
      </div>
    );
  }

  return (
    <div key={index} className="whitespace-pre-wrap break-all">
      {renderTokens(tokenizeGeneric(line), `g${index}`)}
    </div>
  );
}

/** Extract primary device hostname from CLI dump for the title bar */
export function extractDeviceName(output: string): string {
  const match = output.match(
    /^([A-Za-z][A-Za-z0-9_-]*)(?:\([^)]*\))?[#>]/m
  );
  return match?.[1] ?? "cisco-cli";
}
