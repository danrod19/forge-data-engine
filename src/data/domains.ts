/**
 * Domínios oficiais do CCNA 200-301 (v1.1 / transição v2.0).
 * Progresso do usuário fica em localStorage (`ccna-forge-estudo-progress`).
 */

export type DomainId =
  | "network-fundamentals"
  | "network-access"
  | "ip-connectivity"
  | "ip-services"
  | "security-fundamentals"
  | "automation-programmability";

export interface DomainTopic {
  id: string;
  name: string;
}

export interface CcnaDomain {
  id: DomainId;
  name: string;
  namePt: string;
  /** Descrição curta em PT */
  description: string;
  /** Peso aproximado no exame (%) */
  weightPct: number;
  /** Cor de destaque (tailwind-friendly token) */
  accent: "green" | "cyan" | "gold" | "violet" | "rose" | "blue";
  topics: DomainTopic[];
  /** Keywords para filtrar questões do banco (quando possível) */
  keywords: string[];
}

export const CCNA_DOMAINS: CcnaDomain[] = [
  {
    id: "network-fundamentals",
    name: "Network Fundamentals",
    namePt: "Fundamentos de Rede",
    description:
      "Modelos OSI/TCP-IP, cabos, IPv4/IPv6, topologias, switching L2 e conceitos de nuvem/virtualização.",
    weightPct: 20,
    accent: "green",
    keywords: [
      "osi",
      "tcp",
      "udp",
      "ipv4",
      "ipv6",
      "ethernet",
      "cable",
      "topology",
      "hypervisor",
      "virtual machine",
      "mac address",
      "arp",
      "frame",
      "packet",
      "subnet",
      "prefix",
      "broadcast",
      "unicast",
      "multicast",
    ],
    topics: [
      { id: "nf-1", name: "Modelos OSI e TCP/IP" },
      { id: "nf-2", name: "Cabos, mídias e conectores" },
      { id: "nf-3", name: "IPv4, IPv6 e subnetting" },
      { id: "nf-4", name: "Ethernet, MAC e switching L2" },
      { id: "nf-5", name: "Virtualização e cloud" },
      { id: "nf-6", name: "Wireless fundamentals" },
    ],
  },
  {
    id: "network-access",
    name: "Network Access",
    namePt: "Acesso à Rede",
    description:
      "VLANs, trunks, EtherChannel, STP, WLAN e configuração de acesso em switches e WLC.",
    weightPct: 20,
    accent: "cyan",
    keywords: [
      "vlan",
      "trunk",
      "802.1q",
      "native vlan",
      "etherchannel",
      "port-channel",
      "spanning-tree",
      "stp",
      "rstp",
      "switchport",
      "access port",
      "wlan",
      "wlc",
      "ssid",
      "dtp",
      "vtp",
    ],
    topics: [
      { id: "na-1", name: "VLANs e trunking 802.1Q" },
      { id: "na-2", name: "Inter-VLAN routing" },
      { id: "na-3", name: "Spanning Tree (STP/RSTP)" },
      { id: "na-4", name: "EtherChannel" },
      { id: "na-5", name: "WLAN e WLC" },
      { id: "na-6", name: "Port security e acesso L2" },
    ],
  },
  {
    id: "ip-connectivity",
    name: "IP Connectivity",
    namePt: "Conectividade IP",
    description:
      "Roteamento estático e dinâmico, OSPFv2, tabela de rotas, default route e IPv6 routing.",
    weightPct: 25,
    accent: "gold",
    keywords: [
      "ospf",
      "routing",
      "static route",
      "default route",
      "gateway of last resort",
      "ip route",
      "adjacency",
      "neighbor",
      "router id",
      "area 0",
      "longest prefix",
      "administrative distance",
      "metric",
      "floating static",
    ],
    topics: [
      { id: "ic-1", name: "Tabela de roteamento IP" },
      { id: "ic-2", name: "Rotas estáticas e floating" },
      { id: "ic-3", name: "OSPFv2 single-area" },
      { id: "ic-4", name: "First-hop redundancy (FHRP)" },
      { id: "ic-5", name: "IPv6 routing basics" },
      { id: "ic-6", name: "Interpretação de show ip route" },
    ],
  },
  {
    id: "ip-services",
    name: "IP Services",
    namePt: "Serviços IP",
    description:
      "NAT, DHCP, DNS, NTP, SNMP, QoS, SSH, Syslog e serviços essenciais de operação.",
    weightPct: 10,
    accent: "blue",
    keywords: [
      "nat",
      "pat",
      "dhcp",
      "dns",
      "ntp",
      "snmp",
      "qos",
      "ssh",
      "telnet",
      "syslog",
      "helper-address",
      "overload",
      "ftp",
      "tftp",
      "cdn",
      "phishing",
    ],
    topics: [
      { id: "is-1", name: "NAT / PAT" },
      { id: "is-2", name: "DHCP e relay (helper)" },
      { id: "is-3", name: "DNS e resolução de nomes" },
      { id: "is-4", name: "NTP, SNMP e Syslog" },
      { id: "is-5", name: "QoS fundamentals" },
      { id: "is-6", name: "SSH e acesso remoto" },
    ],
  },
  {
    id: "security-fundamentals",
    name: "Security Fundamentals",
    namePt: "Fundamentos de Segurança",
    description:
      "Ameaças, ACLs, port security, VPN, autenticação, AAA e hardening de dispositivos.",
    weightPct: 15,
    accent: "rose",
    keywords: [
      "acl",
      "access-list",
      "security",
      "password",
      "vpn",
      "ipsec",
      "port security",
      "dhcp snooping",
      "dynamic arp inspection",
      "aaa",
      "radius",
      "tacacs",
      "threat",
      "malware",
      "firewall",
      "layer 2 security",
    ],
    topics: [
      { id: "sf-1", name: "Ameaças e vetores de ataque" },
      { id: "sf-2", name: "ACLs (standard e extended)" },
      { id: "sf-3", name: "Port security e L2 security" },
      { id: "sf-4", name: "VPN e IPsec basics" },
      { id: "sf-5", name: "AAA, RADIUS e TACACS+" },
      { id: "sf-6", name: "Hardening e senhas" },
    ],
  },
  {
    id: "automation-programmability",
    name: "Automation and Programmability",
    namePt: "Automação e Programabilidade",
    description:
      "APIs REST, JSON, controladores, Cisco DNA/Catalyst Center, Ansible e automação de rede.",
    weightPct: 10,
    accent: "violet",
    keywords: [
      "api",
      "rest",
      "json",
      "xml",
      "yang",
      "netconf",
      "restconf",
      "ansible",
      "puppet",
      "chef",
      "controller",
      "dna center",
      "catalyst center",
      "sdn",
      "python",
      "automation",
      "programmability",
      "cisco DNA",
    ],
    topics: [
      { id: "ap-1", name: "SDN e controladores" },
      { id: "ap-2", name: "REST APIs e JSON" },
      { id: "ap-3", name: "NETCONF / RESTCONF / YANG" },
      { id: "ap-4", name: "Ansible e automação" },
      { id: "ap-5", name: "Cisco DNA / Catalyst Center" },
      { id: "ap-6", name: "Data formats e parsing" },
    ],
  },
];

export function getDomainById(id: DomainId | string): CcnaDomain | undefined {
  return CCNA_DOMAINS.find((d) => d.id === id);
}

export function domainAccentClasses(accent: CcnaDomain["accent"]): {
  border: string;
  bg: string;
  text: string;
  bar: string;
  glow: string;
} {
  switch (accent) {
    case "green":
      return {
        border: "border-neon-green/30",
        bg: "bg-neon-green/10",
        text: "text-neon-green",
        bar: "bg-neon-green",
        glow: "shadow-[0_0_18px_rgba(34,197,94,0.12)]",
      };
    case "cyan":
      return {
        border: "border-neon-cyan/30",
        bg: "bg-neon-cyan/10",
        text: "text-neon-cyan",
        bar: "bg-neon-cyan",
        glow: "shadow-[0_0_18px_rgba(34,211,238,0.12)]",
      };
    case "gold":
      return {
        border: "border-neon-gold/30",
        bg: "bg-neon-gold/10",
        text: "text-neon-gold",
        bar: "bg-neon-gold",
        glow: "shadow-[0_0_18px_rgba(251,191,36,0.12)]",
      };
    case "blue":
      return {
        border: "border-sky-400/30",
        bg: "bg-sky-400/10",
        text: "text-sky-400",
        bar: "bg-sky-400",
        glow: "shadow-[0_0_18px_rgba(56,189,248,0.12)]",
      };
    case "rose":
      return {
        border: "border-rose-400/30",
        bg: "bg-rose-400/10",
        text: "text-rose-400",
        bar: "bg-rose-400",
        glow: "shadow-[0_0_18px_rgba(251,113,133,0.12)]",
      };
    case "violet":
      return {
        border: "border-violet-400/30",
        bg: "bg-violet-400/10",
        text: "text-violet-400",
        bar: "bg-violet-400",
        glow: "shadow-[0_0_18px_rgba(167,139,250,0.12)]",
      };
  }
}
