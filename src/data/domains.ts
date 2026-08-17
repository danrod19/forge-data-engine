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
      "Módulo 2.0 (~20%): switching L2/MAC, VLANs/trunk, STP/RSTP, EtherChannel e WLAN/WLC.",
    weightPct: 20,
    accent: "cyan",
    keywords: [
      "mac",
      "cam",
      "flood",
      "aging",
      "flapping",
      "unicast",
      "vlan",
      "trunk",
      "native",
      "allowed",
      "802.1q",
      "access vlan",
      "dtp",
      "spanning",
      "stp",
      "rstp",
      "root",
      "portfast",
      "bpduguard",
      "alternate",
      "blocking",
      "etherchannel",
      "lacp",
      "pagp",
      "port-channel",
      "channel-group",
      "wlan",
      "wlc",
      "capwap",
      "ssid",
      "flexconnect",
      "2.4",
      "5 ghz",
      "access point",
    ],
    topics: [
      { id: "na-1", name: "Switching L2 / Tabela MAC" },
      { id: "na-2", name: "VLANs e Trunk 802.1Q" },
      { id: "na-3", name: "STP/RSTP" },
      { id: "na-4", name: "EtherChannel (PAgP/LACP)" },
      { id: "na-5", name: "WLAN / WLC / CAPWAP" },
    ],
  },
  {
    id: "ip-connectivity",
    name: "IP Connectivity",
    namePt: "Conectividade IP",
    description:
      "Módulo 3.0 (~25%): rotas estáticas/floating, inter-VLAN, OSPF single-area, IPv6 e troubleshooting de conectividade.",
    weightPct: 25,
    accent: "gold",
    keywords: [
      "static",
      "floating",
      "administrative distance",
      "default route",
      "show ip route",
      "s*",
      "inter-vlan",
      "svi",
      "roas",
      "encapsulation",
      "ip routing",
      "no switchport",
      "ospf",
      "neighbor",
      "dr",
      "bdr",
      "hello",
      "passive-interface",
      "router-id",
      "area 0",
      "ipv6",
      "slaac",
      "link-local",
      "eui-64",
      "::/0",
      "ra suppress",
      "dual-stack",
      "longest match",
      "traceroute",
      "next-hop",
      "gateway",
      "troubleshooting",
      "gateway of last resort",
      "ip route",
      "adjacency",
      "metric",
    ],
    topics: [
      {
        id: "ip-1",
        name: "Rotas estáticas, default, floating, AD",
      },
      {
        id: "ip-2",
        name: "Inter-VLAN (ROAS, SVI, L3 switch)",
      },
      {
        id: "ip-3",
        name: "OSPF single-area",
      },
      {
        id: "ip-4",
        name: "IPv6 (GUA, SLAAC, ::/0, OSPFv3 leve)",
      },
      {
        id: "ip-5",
        name: "Troubleshooting de conectividade IP",
      },
    ],
  },
  {
    id: "ip-services",
    name: "IP Services",
    namePt: "Serviços IP",
    description:
      "Módulo 4.0 (~10%): NAT/PAT, DHCP/DNS, NTP/Syslog/SNMP, SSH e QoS PHB + TFTP/FTP.",
    weightPct: 10,
    accent: "blue",
    keywords: [
      "nat",
      "pat",
      "overload",
      "inside local",
      "inside global",
      "translations",
      "dhcp",
      "helper-address",
      "dora",
      "pool",
      "default-router",
      "dns",
      "name-server",
      "ntp",
      "stratum",
      "syslog",
      "logging trap",
      "snmp",
      "community",
      "trap",
      "ssh",
      "telnet",
      "crypto key",
      "domain-name",
      "transport input",
      "vty",
      "access-class",
      "qos",
      "dscp",
      "trust",
      "policing",
      "shaping",
      "tftp",
      "ftp",
      "marking",
      "helper-address",
      "cdn",
      "phishing",
    ],
    topics: [
      {
        id: "svc-1",
        name: "NAT (static, dynamic, PAT)",
      },
      {
        id: "svc-2",
        name: "DHCP e DNS",
      },
      {
        id: "svc-3",
        name: "NTP, Syslog, SNMP",
      },
      {
        id: "svc-4",
        name: "SSH e acesso remoto",
      },
      {
        id: "svc-5",
        name: "QoS PHB e TFTP/FTP",
      },
    ],
  },
  {
    id: "security-fundamentals",
    name: "Security Fundamentals",
    namePt: "Fundamentos de Segurança",
    description:
      "Módulo 5.0 (~15%): acesso ao device, ACLs, segurança L2, wireless security, VPN e AAA.",
    weightPct: 15,
    accent: "rose",
    keywords: [
      "threat",
      "vulnerability",
      "exploit",
      "enable secret",
      "password",
      "telnet",
      "vty",
      "access-list",
      "access-group",
      "wildcard",
      "implicit deny",
      "access-class",
      "port-security",
      "sticky",
      "err-disabled",
      "dhcp snooping",
      "dai",
      "arp inspection",
      "wpa",
      "wpa2",
      "wpa3",
      "psk",
      "aes",
      "open",
      "wep",
      "802.1x",
      "vpn",
      "ipsec",
      "site-to-site",
      "remote-access",
      "aaa",
      "radius",
      "tacacs",
      "authentication",
      "authorization",
      "malware",
      "firewall",
      "security",
      "acl",
    ],
    topics: [
      {
        id: "sec-1",
        name: "Conceitos e acesso ao device",
      },
      {
        id: "sec-2",
        name: "ACLs",
      },
      {
        id: "sec-3",
        name: "Segurança L2",
      },
      {
        id: "sec-4",
        name: "Wireless security",
      },
      {
        id: "sec-5",
        name: "VPN e AAA",
      },
    ],
  },
  {
    id: "automation-programmability",
    name: "Automation and Programmability",
    namePt: "Automação e Programabilidade",
    description:
      "Módulo 6.0 (~10%): SDN/controller, REST, JSON, Ansible, DNA Center, NETCONF/RESTCONF/YANG.",
    weightPct: 10,
    accent: "violet",
    keywords: [
      "api",
      "rest",
      "json",
      "ansible",
      "playbook",
      "inventory",
      "dna",
      "controller",
      "sdn",
      "netconf",
      "restconf",
      "yang",
      "northbound",
      "southbound",
      "crud",
      "idempot",
      "assurance",
      "discovery",
      "http",
      "401",
      "404",
      "yaml",
      "module",
      "xml",
      "puppet",
      "chef",
      "dna center",
      "catalyst center",
      "python",
      "automation",
      "programmability",
      "cisco DNA",
    ],
    topics: [
      { id: "ap-1", name: "SDN e redes controller-based (6.1)" },
      { id: "ap-2", name: "APIs REST: verbos e status (6.2)" },
      { id: "ap-3", name: "JSON: estrutura e leitura (6.3)" },
      { id: "ap-4", name: "Config management e Ansible (6.4)" },
      {
        id: "ap-5",
        name: "DNA Center, NETCONF/RESTCONF e síntese (6.5)",
      },
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
