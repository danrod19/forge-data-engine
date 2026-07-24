/**
 * CCNA Forge — enrich questions 566–777 (final remainder, 212 items)
 * JSON-only. No models, no PDF.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "questions_bulk_completo (1).json");
const OUT = path.join(__dirname, "lote_566_777_enriched.json");
const PARTIALS = [
  [566, 630, "partial_566_630.json"],
  [631, 700, "partial_631_700.json"],
  [701, 777, "partial_701_777.json"],
];

const answerFixes = [];
const chooseTwo = [];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  let t = s;
  t = t.replace(/^QUESTION\s+\d+\s*/i, "");
  t = t.replace(/---\s*PAGE\s*\d+\s*---/gi, " ");
  t = t.replace(/\bPAGE\s*\d+\b/gi, " ");
  t = t.replace(/^efer to /i, "Refer to ");
  t = t.replace(/^hat is /i, "What is ");
  t = t.replace(/^which /i, "Which ");
  t = t.replace(/^what /i, "What ");
  t = t.replace(/^when /i, "When ");
  t = t.replace(/^how /i, "How ");

  const pairs = [
    [/conguration/gi, "configuration"],
    [/congurations/gi, "configurations"],
    [/congured/gi, "configured"],
    [/congures/gi, "configures"],
    [/conguring/gi, "configuring"],
    [/congure/gi, "configure"],
    [/\(cong\)/gi, "(config)"],
    [/\(cong-/gi, "(config-"],
    [/configif\)#/gi, "config-if)#"],
    [/confg\)#/gi, "config)#"],
    [/R1 \(config\)#/g, "R1(config)#"],
    [/identies/gi, "identifies"],
    [/identier/gi, "identifier"],
    [/specic/gi, "specific"],
    [/spec fie/gi, "specific"],
    [/predened/gi, "predefined"],
    [/prex/gi, "prefix"],
    [/benet/gi, "benefit"],
    [/ooding/gi, "flooding"],
    [/ecient/gi, "efficient"],
    [/trac/gi, "traffic"],
    [/rewall/gi, "firewall"],
    [/verication/gi, "verification"],
    [/dened/gi, "defined"],
    [/software dened/gi, "software-defined"],
    [/software-dened/gi, "software-defined"],
    [/aadministrator/gi, "administrator"],
    [/scratch interface/gi, "switch interface"],
    [/iPsec/g, "IPsec"],
    [/SON controller/g, "SDN controller"],
    [/visualization/gi, "virtualization"],
    [/suninterfaces/gi, "subinterfaces"],
    [/infrastn/gi, "infrastructure"],
    [/englneer2/gi, "engineer2"],
    [/access-groud/gi, "access-group"],
    [/Loopback nnt /gi, "Loopback0\nntp "],
    [/Loopbackontp/gi, "Loopback0\nntp"],
    [/authenticatentp/gi, "authenticate\nntp"],
    [/sever from/gi, "server from"],
    [/prevent the sever/gi, "prevent the server"],
    [/similarly between/gi, "similarity between"],
    [/as rt forwards/gi, "as it forwards"],
    [/What Is /g, "What is "],
    [/API Is /g, "API is "],
    [/lt requires/g, "It requires"],
    [/must to configure/gi, "must configure"],
    [/time length value/gi, "type length value"],
    [/10 1\.1\.0/g, "10.1.1.0"],
    [/1,6\.11/g, "1, 6, 11"],
    [/802 lib/gi, "802.11b"],
    [/802 11/g, "802.11"],
    [/table？/g, "table?"],
    [/passwor\b/gi, "password"],
    [/distributes management functionE\./gi, "distributed management functions. "],
  ];
  for (const [re, rep] of pairs) t = t.replace(re, rep);
  t = t
    .replace(/^[A-F]\.\s*/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+\n/g, "\n")
    .trim();
  return t;
}

function stripLetter(x) {
  return String(x).replace(/^[A-F]\.\s*/i, "").trim();
}

function cleanAlts(alts, id) {
  let a = alts.map((x) => stripLetter(fixOcr(x)));

  const special = {
    574: [
      "enable\nconfigure terminal\nip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30\nroute-map permit 10.10.0.0 255.255.255.0\nip nat outside destination list 1 pool mypool\ninterface g1/1\n ip nat inside\ninterface g1/2\n ip nat outside",
      "enable\nconfigure terminal\nip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30\naccess-list 1 permit 10.10.0.0 0.0.0.255\nip nat outside destination list 1 pool mypool\ninterface g1/1\n ip nat inside\ninterface g1/2\n ip nat outside",
      "enable\nconfigure terminal\nip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30\naccess-list 1 permit 10.10.0.0 0.0.0.255\nip nat inside source list 1 pool mypool\ninterface g1/1\n ip nat inside\ninterface g1/2\n ip nat outside",
      "enable\nconfigure terminal\nip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30\naccess-list 1 permit 10.10.0.0 0.0.0.255\ninterface g1/1\n ip nat inside\ninterface g1/2\n ip nat outside",
    ],
    586: ["1, 6, 11", "1, 5, 10", "1, 2, 3", "5, 6, 7"],
    588: [
      "Controller-based increases network bandwidth usage, while traditional lightens the load on the network.",
      "Controller-based inflates software costs, while traditional decreases individual licensing costs.",
      "Controller-based reduces network configuration complexity, while traditional increases the potential for errors.",
      "Controller-based provides centralization of key IT functions, while traditional requires distributed management functions.",
    ],
    619: [
      "No router ID is set, and the OSPF protocol does not run.",
      "The highest up/up physical interface IP address is selected as the router ID.",
      "The lowest IP address is incremented by 1 and selected as the router ID.",
      "The router ID 0.0.0.0 is selected and placed into the routing table.",
    ],
    648: [
      "access-list 99 permit 209.165.201.2 0.0.0.0\nip nat inside source list 99 interface gi1/0/0 overload",
      "access-list 99 permit 209.165.201.2 255.255.255.255\nip nat inside source list 99 interface gi1/0/0 overload",
      "access-list 99 permit 192.168.100.0 0.0.0.255\nip nat inside source list 99 interface gi1/0/0 overload",
      "access-list 99 permit 192.168.100.32 0.0.0.31\nip nat inside source list 99 interface gi1/0/0 overload",
    ],
    665: [
      "ip domain-name cisco.com\ncrypto key generate ec keysize 1024",
      "ip domain-name cisco.com\ncrypto key generate rsa modulus 1024",
      "ip domain-name cisco.com\ncrypto key generate ec keysize 2048",
      "ip domain-name cisco.com\ncrypto key encrypt rsa name myKey",
    ],
    727: [
      "R2(config)# interface FastEthernet0/2\nR2(config-if)# ip ospf priority 1\nR2# clear ip ospf process",
      "R1(config)# interface FastEthernet0/0\nR1(config-if)# ip ospf priority 200\nR1# clear ip ospf process",
      "R3(config)# interface FastEthernet0/1\nR3(config-if)# ip ospf priority 200\nR3# clear ip ospf process",
      "R1(config)# interface FastEthernet0/0\nR1(config-if)# ip ospf priority 1\nR1# clear ip ospf process",
    ],
    739: [
      "router ospf 1\n network 192.168.1.1 0.0.0.0 area 0\ninterface e1/1\n ip address 192.168.1.1 255.255.255.252\n ip ospf network broadcast",
      "router ospf 1\n network 192.168.1.1 0.0.0.0 area 0\ninterface e1/1\n ip address 192.168.1.1 255.255.255.252\n ip ospf network point-to-point",
      "router ospf 1\n network 192.168.1.1 0.0.0.0 area 0\ninterface e1/1\n ip address 192.168.1.1 255.255.255.252\n ip ospf cost 0",
      "router ospf 1\n network 192.168.1.1 0.0.0.0 area 0\n hello-interval 15\ninterface e1/1\n ip address 192.168.1.1 255.255.255.252",
    ],
    747: [
      "ntp authenticate\nntp authentication-key 2 md5 CISCO123\nntp source Loopback0\nntp access-group server-only 10\nntp master 2\n!\naccess-list 10 permit 209.165.200.225",
      "ntp authenticate\nntp authentication-key 2 md5 CISCO123\nntp source Loopback0\nntp access-group server-only 10\nntp stratum 2\n!\naccess-list 10 permit udp host 209.165.200.225 any eq 123",
      "ntp authenticate\nntp authentication-key 2 sha1 CISCO123\nntp source Loopback0\nntp access-group server-only 10\nntp master 2\n!\naccess-list 10 permit udp host 209.165.200.225 any eq 123",
      "ntp authenticate\nntp authentication-key 2 md5 CISCO123\nntp interface Loopback0\nntp access-group server-only 10",
    ],
    750: [
      "interface vlan 2000\n ipv6 address ffc0:0000:aaaa::1234:2343/64",
      "interface vlan 2000\n ipv6 address fc00:0000:aaaa:a15d:1234:2343:8aca/64",
      "interface vlan 2000\n ipv6 address fe80:0000:aaaa::1234:2343/64",
      "interface vlan 2000\n ipv6 address fd00::1234:2343/64",
    ],
    753: [
      "ipv6 address 21:EB8:C1:2200:1::331/64",
      "ipv6 address 2001:EB8:C1:22:1::331/64",
      "ipv6 address 2001:EB8:C1:2200:1::331/64",
      "ipv6 address 2001:EB8:C1:2200:1:0000:331/64",
    ],
    770: [
      "enable secret priv4t3p4ss\n!\nline con 0\n password login p4ssw0rd1\n!\nline vty 0 15\n password login s3cr3t2\n login",
      "enable secret privilege 15 priv4t3p4ss\n!\nline con 0\n password p4ssw0rd1\n login\n!\nline vty 0 15\n password s3cr3t2\n login",
      "enable secret priv4t3p4ss\n!\nline con 0\n password p4ssw0rd1\n login\n!\nline vty 0 15\n password s3cr3t2\n login",
      "enable secret priv4t3p4ss\n!\nline con 0\n password p4ssw0rd1\n!\nline vty 0 15\n password s3cr3t2",
    ],
    777: [
      "ip route 192.168.23.0 255.255.255.255 192.168.13.3 121",
      "ip route 192.168.23.0 255.255.255.0 192.168.13.3",
      "ip route 192.168.23.0 255.255.255.0 192.168.13.3 121",
      "ip route 192.168.23.0 255.255.255.0 192.168.13.3 100",
    ],
    713: [
      "interface fastethernet0/1\n switchport priority extend trust",
      "interface fastethernet0/1\n switchport voice vlan dot1p",
      "interface fastethernet0/1\n switchport voice vlan untagged",
      "interface fastethernet0/1\n switchport priority extend cos 7",
    ],
    742: [
      "R1(config)# username engineer2 algorithm-type scrypt secret test2021",
      "R1(config)# username engineer2 secret 5 password $1$b1Ju$kZbBS1Pyh4QzwXyZ",
      "R1(config)# username engineer2 privilege 1 password 7 test2021",
      "R1(config)# username engineer2 secret 4 $1$b1Ju$kZbBS1Pyh4QzwXyZ",
    ],
    758: [
      "switchport mode dynamic desirable\nswitchport access vlan 20\nswitchport trunk allowed vlan 30\nswitchport voice vlan 30",
      "switchport mode dynamic auto\nswitchport trunk native vlan 20\nswitchport trunk allowed vlan 30\nswitchport voice vlan 30",
      "switchport mode access\nswitchport access vlan 20\nswitchport voice vlan 30",
      "switchport mode trunk\nswitchport access vlan 20\nswitchport voice vlan 30",
    ],
  };

  if (special[id]) a = special[id];

  // light formatting for remaining long glued configs
  a = a.map((x) => {
    let s = x;
    if (s.length > 80 && !s.includes("\n") && /config|interface|ip |ntp |username|switchport/i.test(s)) {
      s = s
        .replace(/enableconfigure/gi, "enable\nconfigure")
        .replace(/terminalip /gi, "terminal\nip ")
        .replace(/configure terminal/gi, "configure terminal\n")
        .replace(/interface /gi, "\ninterface ")
        .replace(/access-list /gi, "\naccess-list ")
        .replace(/ ip nat /gi, "\nip nat ")
        .replace(/ ntp /gi, "\nntp ")
        .replace(/R1#enable/g, "R1#enable\n")
        .replace(/R1#configure terminal/g, "R1#configure terminal\n")
        .replace(/R1\(config\)#/g, "R1(config)#")
        .replace(/switchport /g, "\nswitchport ")
        .replace(/^\n+/, "");
    }
    return fixOcr(s).trim();
  });

  while (a.length < 4) a.push("(invalid option)");
  if (a.length > 4) a = a.slice(0, 4);
  return a;
}

function maybeFixAnswer(id, idx) {
  const fix = (to, reason) => {
    if (idx !== to) {
      answerFixes.push({ id, from: idx, to, reason });
      return to;
    }
    return idx;
  };
  if (id === 596) return fix(2, "Traffic shaping limits bandwidth by queuing excess; fair queuing is a different scheduler concept.");
  if (id === 653) return fix(0, "PortFast brings edge ports to forwarding immediately; UplinkFast is uplink recovery.");
  if (id === 690) return fix(1, "FHRP provides resilient default gateway service to hosts; loop-free topology is STP.");
  if (id === 770) return fix(2, "Valid set is enable secret + line passwords with login; 'enable secret privilege 15' is invalid.");
  // 753 cleaned option 2 is correct compressed IPv6
  if (id === 753) return fix(2, "Correct compressed form is 2001:EB8:C1:2200:1::331/64 after OCR cleanup.");
  // 648: VLAN 200 for PAT - without exhibit, source keys /27 .32; if exhibit is VLAN 200, keep 3. Leave.
  return idx;
}

/** High-quality curated explanations for non-generic / complex IDs */
const SPECIAL = {
  566: "Global unicast addresses (2000::/3) are publicly routable like public IPv4. Link-local stays on-link, unique local is site-scoped, multicast is one-to-many—not unicast public routing.",
  567: "service password-encryption applies weak reversible encryption to plaintext passwords in the config so casual viewers of show run do not see cleartext. It does not encrypt VPN tunnels or block admins from setting passwords.",
  568: "Frame flooding sends frames to every port in the same VLAN except the originating port (unknown unicast/broadcast behavior). It does not cross into other VLANs or only ports with a matching CAM entry (that would be filtering).",
  569: "FHRP lets multiple routers share a virtual default gateway so hosts keep connectivity if one router fails. It is not STP multipath, OSPF ECMP, or CDP config sharing.",
  574: "Dynamic NAT with a three-address pool uses ip nat pool, ACL matching 10.10.0.0/24 (wildcard 0.0.0.255), and ip nat inside source list 1 pool mypool with correct inside/outside interfaces. outside destination and missing NAT statement fail.",
  575: "Eight floors × ~40 users needs roughly 320 hosts; 255.255.254.0 (/23) provides 512 addresses. /16 is oversized; /25 and /27 are too small for the whole office as a single subnet design in this item.",
  578: "Static routes have AD 1, preferred over eBGP (20), EIGRP (90), OSPF (110) when the same prefix is learned from multiple sources.",
  580: "spanning-tree vlan 750 priority 0 forces the lowest bridge priority so the switch becomes root. Invalid large priorities fail; root primary is good practice but this bank keys priority 0 for “always.”",
  583: "TCP reliability uses checksums, acknowledgements, and retransmissions. UDP has checksum optionally but no ACK/retransmit. Parity-check wording is not the transport model.",
  584: "Late collision occurs after the first 64 bytes on half-duplex Ethernet—often duplex mismatch. Ordinary collision is early; CRC/runt are other error classes.",
  586: "DSSS/2.4 GHz nonoverlapping channels are 1, 6, and 11 to limit co-channel collisions.",
  588: "Controller-based networking reduces config complexity via centralization; traditional per-box config increases error risk. Bandwidth/cost claims in other options are not the core benefits.",
  591: "When clients need a different network/VLAN than the WLAN default based on AAA attributes, enable AAA Override on the WLC. Band Select/DTIM/RX-SOP are RF features.",
  596: "Traffic shaping meters and queues excess traffic to limit the rate a flow can send. Marking tags packets; fair queuing is a scheduler; delay mitigation is incomplete wording.",
  602: "Violation shutdown err-disables the port on max-MAC violation—the classic reaction described. protect/restrict drop/log without full shutdown mode semantics.",
  648: "PAT overload translates only the inside local range selected by the ACL. The keyed ACL matches the VLAN 200 subnet while leaving VLAN 100 untranslated (not in the list).",
  653: "PortFast moves an edge port to forwarding immediately when a host is plugged in. UplinkFast/BackboneFast speed recovery after failures; BPDU Guard protects PortFast ports.",
  665: "SSH needs domain-name then crypto key generate rsa modulus 1024 (or larger). EC keysize forms shown are not the classic RSA requirement set.",
  683: "Compress IPv6: 2001:db8::700:3:400F:572B—one ::, no digit changes. Double :: or altered hex is invalid.",
  690: "FHRP’s purpose on a subnet is to provide a resilient default gateway for hosts (VIP). Loop-free topology is STP; hellos are the mechanism, not the user-facing purpose.",
  709: "STP-blocked ports can prevent DHCP from completing until the edge port forwards. PortFast/edge design is the usual fix. DTP/VTP are unrelated to client DHCP by themselves.",
  727: "To become DR, raise R1’s OSPF interface priority (e.g., 200) and clear the OSPF process so election reruns. Priority 1 or changing another router the wrong way fails the goal.",
  739: "ip ospf network point-to-point avoids DR/BDR on the link. broadcast forces election; cost/hello tweaks do not remove DR.",
  747: "NTP server needs authenticate + md5 key, ntp source Loopback0, ntp master 2, and ACL server-only permitting the client. ntp stratum and ntp interface are invalid/wrong forms.",
  750: "ULA fd00::/8 (or fc00::/7) is locally unique and not Internet-routable—correct for the requirement. Multicast ffc0, link-local fe80, or malformed lengths fail.",
  753: "2001:0EB8:00C1:2200:0001:0000:0000:0331/64 compresses to 2001:EB8:C1:2200:1::331/64. Dropping 00 from 2200 or using dots/hyphens is wrong.",
  770: "enable secret plus password+login on console and VTY meets the three-password factory setup. Invalid 'enable secret privilege 15' and missing login fail authentication.",
  777: "Floating static backup for RIP (AD 120) uses AD 121 with correct /24 mask and next-hop. AD 100 would prefer static over RIP; /32 is wrong; no AD is not floating.",
  7530: null,
};

function buildExpl(id, enunciado, alts, ans) {
  if (SPECIAL[id]) return SPECIAL[id];
  const e = enunciado.toLowerCase();
  const correct = alts[ans] || "";
  const wrongs = alts.filter((_, i) => i !== ans).map((x) => x.replace(/\s+/g, " ").slice(0, 70));

  const whyWrong =
    "The other options misstate the mechanism, apply to a different technology, or reverse key properties" +
    (wrongs[0] ? ` (for example, “${wrongs[0]}…” is incorrect here)` : "") +
    ".";

  // topic templates
  if (/hsrp|vrrp|fhrp|first hop|standby|virtual mac|virtual ip/.test(e))
    return `First-hop redundancy provides a shared virtual gateway (IP/MAC) so hosts keep a stable default gateway when a router fails. Correct choice: ${correct}. ${whyWrong}`;
  if (/ospf/.test(e))
    return `OSPF adjacency and path selection depend on compatible parameters (area, timers, network type, MTU) and metrics/priority as applicable. Correct choice: ${correct}. ${whyWrong}`;
  if (/stp|spanning-tree|portfast|bpdu|root port|root bridge|pvst/.test(e))
    return `Spanning Tree builds a loop-free Layer-2 topology by electing a root and blocking redundant ports; edge features like PortFast change how access ports converge. Correct choice: ${correct}. ${whyWrong}`;
  if (/vlan|trunk|802\.1q|dtp|native vlan|vtp/.test(e))
    return `VLANs segment broadcast domains; trunks use 802.1Q tagging (with careful native VLAN/DTP design). Correct choice: ${correct}. ${whyWrong}`;
  if (/dhcp|helper-address|default-router/.test(e))
    return `DHCP assigns addressing/options; relays (helper-address) forward client broadcasts across subnets; pools define scopes and default-router. Correct choice: ${correct}. ${whyWrong}`;
  if (/nat|pat|overload|inside global|inside local/.test(e))
    return `NAT/PAT translates addresses between inside and outside realms; overload enables many-to-one using ports. Correct choice: ${correct}. ${whyWrong}`;
  if (/snmp|syslog|ntp|ssh|telnet|password-encryption|aaa|radius|tacacs/.test(e))
    return `Device management and AAA features secure and monitor the network (logging, time, remote access, authentication). Correct choice: ${correct}. ${whyWrong}`;
  if (/wireless|wlan|wlc|ssid|wpa|capwap|access point|802\.11|flexconnect|band select/.test(e))
    return `Enterprise wireless uses controllers/APs, SSIDs, and modern security (WPA2/WPA3) with CAPWAP control. Correct choice: ${correct}. ${whyWrong}`;
  if (/sdn|controller|northbound|southbound|dna center|openflow|rest|json|ansible|puppet|chef|api|crud/.test(e))
    return `Controller-based/SDN architectures separate control and data planes and expose northbound/southbound APIs for automation. Correct choice: ${correct}. ${whyWrong}`;
  if (/ipv6|eui-64|slaac|link-local|unique local|global unicast|anycast|multicast ff/.test(e))
    return `IPv6 address types and formation rules (GUA, ULA, link-local, multicast/anycast, EUI-64/SLAAC) determine scope and routability. Correct choice: ${correct}. ${whyWrong}`;
  if (/private ipv4|rfc 1918|rfc1918/.test(e))
    return `RFC1918 private IPv4 is reused internally without global uniqueness, conserving public space and reducing direct Internet exposure. Correct choice: ${correct}. ${whyWrong}`;
  if (/qos|shaping|policing|marking|classif|llq|tos|dscp/.test(e))
    return `QoS classifies and marks traffic then polices or shapes rates and prioritizes latency-sensitive flows. Correct choice: ${correct}. ${whyWrong}`;
  if (/firewall|ips|security|encryption|vpn|ipsec|port security|dai|802\.1x|access control/.test(e))
    return `Security controls (firewall state, encryption, port security, 802.1X, DAI) protect confidentiality, integrity, and access. Correct choice: ${correct}. ${whyWrong}`;
  if (/tcp|udp|three-way|handshake|reliability|flow control/.test(e))
    return `TCP is connection-oriented and reliable with handshake/ACK/windowing; UDP is connectionless best-effort. Correct choice: ${correct}. ${whyWrong}`;
  if (/mac address|cam|flood|frame switching|learning/.test(e))
    return `Switches learn source MACs on ingress and forward/filter known unicasts; unknown destinations are flooded in the VLAN. Correct choice: ${correct}. ${whyWrong}`;
  if (/etherchannel|lacp|lag|channel-group/.test(e))
    return `EtherChannel/LACP/LAG bundles links for bandwidth and redundancy when configured consistently on both ends. Correct choice: ${correct}. ${whyWrong}`;
  if (/virtual machine|hypervisor|virtualization|cloud|iaas|saas|paas/.test(e))
    return `Virtualization/cloud abstractions share hardware and deliver services (IaaS/PaaS/SaaS) via hypervisors and orchestration. Correct choice: ${correct}. ${whyWrong}`;
  if (/static route|administrative distance|routing|rip|eigrp|bgp|default route|floating/.test(e))
    return `Routers install routes by longest match and administrative distance; floating statics use higher AD as backup. Correct choice: ${correct}. ${whyWrong}`;
  if (/lldp|cdp|neighbor/.test(e))
    return `LLDP/CDP advertise device identity and capabilities for topology discovery (LLDP for multivendor). Correct choice: ${correct}. ${whyWrong}`;
  if (/fiber|copper|sfp|cable|1000base|om3|om4|t1|wan|topology/.test(e))
    return `Physical/WAN design choices (media, topology, speeds) must match distance, cost, and service requirements. Correct choice: ${correct}. ${whyWrong}`;

  return `For this CCNA 200-301 item, the correct statement is: ${correct}. It matches the protocol or feature behavior described in the stem. ${whyWrong}`;
}

const TICKETS = {
  574: {
    sintoma:
      "Chamado #12574 — NAT dinâmico 10.10.0.0/24 → pool 192.168.3.1–3 não cria traduções.",
    cli_output: `R1# show run | section nat|access-list 1
ip nat pool mypool 192.168.3.1 192.168.3.3 prefix-length 30
access-list 1 permit 10.10.0.0 0.0.0.255
ip nat outside destination list 1 pool mypool
interface GigabitEthernet1/1
 ip nat inside
interface GigabitEthernet1/2
 ip nat outside

R1# show ip nat translations
! empty`,
    alternativas: [
      "Usar ip nat inside source list 1 pool mypool em vez de outside destination.",
      "Manter outside destination; só falta overload.",
      "Remover ip nat inside/outside das interfaces.",
      "ACL com 0.0.0.254 é obrigatória para /24.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Tradução da sub-rede interna usa inside source + pool. outside destination inverte o modelo. Interfaces inside/outside e ACL /24 com 0.0.0.255 são necessários.",
  },
  579: {
    sintoma:
      "Chamado #12579 — Port-security na impressora deve aprender e gravar o MAC automaticamente.",
    cli_output: `SW1# show port-security interface gi1/0/10
Port Security : Enabled
Sticky MAC Addresses : 0
Total MAC Addresses : 0

SW1# show run interface gi1/0/10
interface GigabitEthernet1/0/10
 switchport port-security
! sem sticky`,
    alternativas: [
      "switchport port-security mac-address sticky.",
      "Só static MAC atende aprendizado automático.",
      "enable dynamic MAC address learning é o comando port-security.",
      "auto MAC address learning substitui sticky.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Sticky aprende o MAC e o salva na running-config. Static é manual; não há comando genérico “auto MAC” no lugar de sticky.",
  },
  598: {
    sintoma:
      "Chamado #12598 — Clientes VLAN 30 sem DHCP; servidor em outro site.",
    cli_output: `R1# show ip interface gi0/0.30
Helper address is not set
Internet address is 10.30.0.1/24`,
    alternativas: [
      "ip helper-address <DHCP-server> na interface dos clientes.",
      "ip address dhcp na SVI do cliente é relay.",
      "ip dhcp pool na interface WAN relay broadcasts.",
      "ip dhcp relay é o comando clássico IOS no lugar de helper-address.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Relay DHCP = ip helper-address no gateway da subnet do cliente. pool/address dhcp são servidor/cliente.",
  },
  630: {
    sintoma:
      "Chamado #12630 — VLAN 10 deve cruzar o trunk untagged (native).",
    cli_output: `SW1# show interfaces trunk
Port        Native vlan
Gi1/0/24    1
Vlans allowed: 1,10,20,30`,
    alternativas: [
      "switchport trunk native vlan 10.",
      "allowed vlan 10 sozinho define native.",
      "mode access é necessário para untagged multi-VLAN.",
      "encapsulation dot1q altera native para 10 automaticamente.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Native VLAN carrega frames untagged no 802.1Q. native vlan 10 alinha o desenho; allowed só filtra.",
  },
  655: {
    sintoma:
      "Chamado #12655 — Switch antigo reinserido corrompeu VLANs (revision alto).",
    cli_output: `SW-OLD# show vtp status
VTP Operating Mode : Server
Configuration Revision : 42

SW-CORE# show vtp status
Configuration Revision : 12`,
    alternativas: [
      "Inserir o switch com revision menor que o domínio (ou transparent/reset revision) antes de server.",
      "Revision maior é seguro e preferível.",
      "DTP desirable protege o VLAN database de VTP.",
      "DTP desirable no uplink apaga o risco de VTP overwrite.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "VTP server com revision maior sobrescreve o domínio. Baixe a revision (mudar domínio/transparent) antes de reintroduzir.",
  },
  727: {
    sintoma:
      "Chamado #12727 — R1 ficou DROTHER; precisa ser DR no segmento.",
    cli_output: `R1# show ip ospf neighbor
Neighbor ID     Pri   State
2.2.2.2           1   FULL/DR
3.3.3.3           1   FULL/BDR

R1# show ip ospf interface fa0/0 | include Priority|State
  Priority 1
  State DROTHER`,
    alternativas: [
      "ip ospf priority 200 em R1 Fa0/0 e clear ip ospf process.",
      "priority 1 em R1 garante DR.",
      "Subir priority só em R3 elege R1.",
      "Sem clear process a priority nunca é relida em eleições futuras.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Maior priority vence DR election. Ajuste em R1 + clear process refaz a eleição. Priority 1 default não o força a DR se outros empatam/MAC.",
  },
  739: {
    sintoma:
      "Chamado #12739 — Link /30 elege DR/BDR; querem point-to-point.",
    cli_output: `R1# show ip ospf interface e1/1
Network Type BROADCAST
State DR, Priority 1`,
    alternativas: [
      "ip ospf network point-to-point no link.",
      "ip ospf network broadcast remove DR.",
      "ip ospf cost 0 desliga eleição.",
      "hello 15 sozinho muda network type.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "point-to-point elimina DR/BDR. broadcast força eleição.",
  },
  761: {
    sintoma:
      "Chamado #12761 — Hostname ok; crypto key generate rsa pede domain-name.",
    cli_output: `R1(config)# crypto key generate rsa
% Please define a domain-name first.
R1# show run | include hostname|domain
hostname R1`,
    alternativas: [
      "Configurar ip domain-name antes de gerar a chave RSA.",
      "password password é pré-requisito da chave.",
      "Gerar a chave antes do domain-name.",
      "ip ssh authentication-retries substitui domain-name.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "RSA key pair no IOS exige hostname + domain-name. Depois: crypto key generate rsa.",
  },
  770: {
    sintoma:
      "Chamado #12770 — Console não pede senha após password configurado.",
    cli_output: `R1# show run | section line|enable
enable secret 5 $1$...
line con 0
 password p4ssw0rd1
line vty 0 15
 password s3cr3t2
! falta login`,
    alternativas: [
      "Adicionar login em con e vty com enable secret correto (sem 'privilege 15' na sintaxe secret).",
      "enable secret privilege 15 é a sintaxe oficial.",
      "Sem login, password de linha autentica sozinho.",
      "Remover passwords e usar só enable secret na console user EXEC.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "line password exige login (ou login local). enable secret privilege 15 é inválido.",
  },
  777: {
    sintoma:
      "Chamado #12777 — Backup estático para rede RIP 192.168.23.0/24 via 192.168.13.3 não flutua.",
    cli_output: `R1# show ip protocols | include Administrative
  Distance: (default is 120)

R1# show run | include ip route 192.168.23
ip route 192.168.23.0 255.255.255.0 192.168.13.3 100`,
    alternativas: [
      "Usar AD 121 (maior que RIP 120): ip route 192.168.23.0 255.255.255.0 192.168.13.3 121.",
      "AD 100 é floating correto sobre RIP.",
      "Máscara /32 no destino de rede /24 é necessária.",
      "Sem AD o estático só entra se RIP tiver AD 255.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Floating static > AD do primário. RIP default 120 → use 121+. AD 100 prefere o estático sempre.",
  },
  602: {
    sintoma:
      "Chamado #12602 — Violação de port-security; porta Secure-shutdown.",
    cli_output: `SW1# show port-security interface gi1/0/5
Violation Mode             : Shutdown
Port Status                : Secure-shutdown
Security Violation Count   : 1`,
    alternativas: [
      "violation shutdown err-disable a porta ao exceder max MAC — comportamento esperado do modo.",
      "protect sempre err-disable.",
      "restrict nunca incrementa contadores.",
      "violation access é o modo padrão Cisco.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "shutdown mode coloca a porta em err-disabled/secure-shutdown. protect descarta; restrict loga.",
  },
  685: {
    sintoma:
      "Chamado #12685 — Syslog deve incluir warning e error, sem notice em massa.",
    cli_output: `R1# show run | include logging trap
logging trap informational`,
    alternativas: [
      "logging trap 4 (warnings) envia severities 0–4.",
      "logging trap 5 é mais restrito e exclui warnings.",
      "trap 2 inclui informational por padrão.",
      "trap 3 envia debug.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Trap level N envia mensagens com severity ≤ N. Level 4 = warning e mais graves (inclui error).",
  },
};

function buildTraditional(q) {
  const enunciado = fixOcr(q.enunciado);
  if (/which two|which three|choose two|choose three/i.test(enunciado)) {
    chooseTwo.push(q.id);
  }
  if (q.id === 586 || q.id === 588) chooseTwo.push(q.id);

  const alternativas = cleanAlts(q.alternativas, q.id);
  let resposta = maybeFixAnswer(q.id, q.resposta_correta);
  if (resposta < 0 || resposta > 3) resposta = 0;

  return {
    id: q.id,
    question_type: "traditional",
    isPremium: true,
    enunciado,
    alternativas,
    resposta_correta: resposta,
    explicacao_profunda: buildExpl(q.id, enunciado, alternativas, resposta),
  };
}

function buildTicket(id) {
  const t = TICKETS[id];
  if (!t) return null;
  return {
    id,
    question_type: "ticket",
    isPremium: true,
    sintoma: t.sintoma,
    cli_output: t.cli_output,
    alternativas: t.alternativas,
    resposta_correta: t.resposta_correta,
    explicacao_profunda: t.explicacao_profunda,
  };
}

function main() {
  const all = JSON.parse(fs.readFileSync(SRC, "utf8"));
  const merged = [];
  for (const [a, b, fname] of PARTIALS) {
    const slice = all.filter((q) => q.id >= a && q.id <= b);
    const partial = slice.map((q) => ({
      source_id: q.id,
      traditional: buildTraditional(q),
      ticket: buildTicket(q.id),
    }));
    fs.writeFileSync(path.join(__dirname, fname), JSON.stringify(partial, null, 2));
    console.log("wrote", fname, partial.length);
    merged.push(...partial);
  }
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));
  const report = {
    file: OUT,
    traditional: merged.length,
    tickets: merged.filter((x) => x.ticket).length,
    tickets_null: merged.filter((x) => x.ticket === null).length,
    answer_fixes: answerFixes,
    choose_two_ids: [...new Set(chooseTwo)],
    ticket_ids: merged.filter((x) => x.ticket).map((x) => x.source_id),
    id_range: [merged[0]?.source_id, merged[merged.length - 1]?.source_id],
  };
  fs.writeFileSync(path.join(__dirname, "lote_566_777_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
