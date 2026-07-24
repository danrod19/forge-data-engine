/**
 * CCNA Forge — enrich questions 166–265
 * JSON-only. No models, no PDF.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "questions_bulk_completo (1).json");
const OUT = path.join(__dirname, "lote_166_265_enriched.json");
const PARTIALS = [
  [166, 200, "partial_166_200.json"],
  [201, 235, "partial_201_235.json"],
  [236, 265, "partial_236_265.json"],
];

const answerFixes = [];
const chooseTwo = [];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  let t = s;
  const pairs = [
    [/autoconguration/gi, "autoconfiguration"],
    [/autocong/gi, "autoconfig"],
    [/conguration/gi, "configuration"],
    [/congurations/gi, "configurations"],
    [/congured/gi, "configured"],
    [/congures/gi, "configures"],
    [/conguring/gi, "configuring"],
    [/congure/gi, "configure"],
    [/cong-if/gi, "config-if"],
    [/cong-line/gi, "config-line"],
    [/cong-vlan/gi, "config-vlan"],
    [/cong t/gi, "config t"],
    [/cong#/gi, "config#"],
    [/\(cong\)/gi, "(config)"],
    [/\(cong-/gi, "(config-"],
    [/#congure terminal/gi, "#configure terminal"],
    [/recong/gi, "reconfig"],
    [/identication/gi, "identification"],
    [/identies/gi, "identifies"],
    [/identier/gi, "identifier"],
    [/specic/gi, "specific"],
    [/specied/gi, "specified"],
    [/prex-length/gi, "prefix-length"],
    [/prexes/gi, "prefixes"],
    [/prex/gi, "prefix"],
    [/benet/gi, "benefit"],
    [/ooding/gi, "flooding"],
    [/\boods\b/gi, "floods"],
    [/\bood\b/gi, "flood"],
    [/ecient/gi, "efficient"],
    [/sucient/gi, "sufficient"],
    [/eciency/gi, "efficiency"],
    [/trac/gi, "traffic"],
    [/rewall/gi, "firewall"],
    [/rewalls/gi, "firewalls"],
    [/\bber\b/gi, "fiber"],
    [/conicts/gi, "conflicts"],
    [/conict/gi, "conflict"],
    [/payloa\b/gi, "payload"],
    [/\brst hop\b/gi, "first hop"],
    [/\brst-hop\b/gi, "first-hop"],
    [/\brst\b/gi, "first"],
    [/\bxed\b/gi, "fixed"],
    [/lled/gi, "filled"],
    [/\blters\b/gi, "filters"],
    [/veries/gi, "verifies"],
    [/dened/gi, "defined"],
    [/rmware/gi, "firmware"],
    [/\ble\b/gi, "file"],
    [/les\b/gi, "files"],
    [/ow-sampler/gi, "flow-sampler"],
    [/Unied/gi, "Unified"],
    [/\boce\b/gi, "office"],
    [/branch oce/gi, "branch office"],
    [/apping/gi, "flapping"],
    [/net- hop/gi, "next-hop"],
    [/DR'BDR/g, "DR/BDR"],
    [/fulll/gi, "fulfill"],
    [/Choosetwo/gi, "Choose two"],
    [/Choosethree/gi, "Choose three"],
    [/commonEthernet/g, "common Ethernet"],
    [/what isthe /gi, "what is the "],
    [/engineer toperform/gi, "engineer to perform"],
    [/congured lo support/gi, "configured to support"],
    [/server192/g, "server 192"],
    [/UDO port/g, "UDP port"],
    [/ToS eld/g, "ToS field"],
    [/for AA$/g, "for AAA"],
    [/for AA\b/g, "for AAA"],
    [/QOS/g, "QoS"],
  ];
  for (const [re, rep] of pairs) t = t.replace(re, rep);
  t = t
    .replace(/\(cong\)/g, "(config)")
    .replace(/\(cong-/g, "(config-")
    .replace(/R1\(config\)#/g, "R1(config)#")
    .replace(/SW1\(config\)#/g, "SW1(config)#")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+\n/g, "\n")
    .trim();
  return t;
}

function stripLetterPrefix(x) {
  return x.replace(/^[A-F]\.\s*/i, "").trim();
}

function cleanAlts(alts, id) {
  let a = alts.map((x) => stripLetterPrefix(fixOcr(x)));

  // id-specific repairs for mangled multi-option lines
  if (id === 169) {
    a = ["IS-IS", "EIGRP", "OSPF", "RIP"];
  }
  if (id === 172) {
    a = [
      "The OSPF area is not configured properly.",
      "The priority on R1 should be set higher.",
      "The cost on R1 should be set higher.",
      "The hello and dead timers are not configured properly.",
    ];
  }
  if (id === 173) {
    a = [
      "the IP address of the first Fast Ethernet interface",
      "the IP address of the console management interface",
      "the highest IP address among its active interfaces",
      "the lowest IP address among its active interfaces",
    ];
  }
  if (id === 197) {
    a = [
      "show ip interface brief",
      "show ip dhcp bindings",
      "show ip route",
      "show ip interface",
    ];
  }
  if (id === 199) {
    a = [
      "show ip interface GigabitEthernet 0/0 dhcp",
      "show interface GigabitEthernet 0/0",
      "show ip interface dhcp",
      "show ip interface GigabitEthernet 0/0",
    ];
  }
  if (id === 247) {
    a = [
      "It enables AAA services on the device.",
      "It configures the device to connect to a RADIUS server for AAA.",
      "It associates a RADIUS server to the group.",
      "It configures a local user on the device.",
    ];
  }
  if (id === 249) {
    a = [
      "Configure the ports as trunk ports.",
      "Enable the Cisco Discovery Protocol.",
      "Configure the port type as access and place in VLAN 99.",
      "Administratively shut down the ports.",
    ];
  }
  // NAT / long config options: format readability
  if (id === 207) {
    a = a.map((x) =>
      x
        .replace(/enable configure terminal /gi, "enable\nconfigure terminal\n")
        .replace(/ ip nat /g, "\nip nat ")
        .replace(/ access-list /g, "\naccess-list ")
        .replace(/ interface /g, "\ninterface ")
        .replace(/ route map /g, "\nroute-map ")
    );
  }
  if (id === 220 || id === 225 || id === 235 || id === 259) {
    a = a.map((x) =>
      x
        .replace(/SW1# config t /g, "SW1# config t\n")
        .replace(/SW1\(config\)#/g, "SW1(config)#")
        .replace(/ ntp /g, "\nntp ")
        .replace(/R1#enable /g, "R1#enable\n")
        .replace(/R1#configure terminal /g, "R1#configure terminal\n")
        .replace(/R1\(config\)#/g, "R1(config)#")
        .replace(/ hostname /g, "\nhostname ")
        .replace(/ ip domain/g, "\nip domain")
        .replace(/ crypto /g, "\ncrypto ")
        .replace(/ username /g, "\nusername ")
        .replace(/ ip ssh /g, "\nip ssh ")
        .replace(/ line vty /g, "\nline vty ")
        .replace(/ transport /g, "\ntransport ")
        .replace(/ login local/g, "\nlogin local")
        .replace(/ service password/g, "\nservice password")
        .replace(/ access-list /g, "\naccess-list ")
    );
  }

  while (a.length < 4) a.push("(invalid option)");
  if (a.length > 4) a = a.slice(0, 4);
  return a.map((x) => fixOcr(x).trim());
}

function maybeFixAnswer(id, idx) {
  // 225: ntp stratum is invalid IOS; correct set uses ntp master 2 + source Lo0 + md5 + ACL
  if (id === 225 && idx === 3) {
    answerFixes.push({
      id,
      from: 3,
      to: 2,
      reason: "Valid NTP server set uses ntp master 2 (not ntp stratum); option index 2 matches requirements.",
    });
    return 2;
  }
  // 169: EIGRP as advanced DV is acceptable after cleanup (RIP also DV). Keep 1.
  // 252: dump keys AES-256 for WPA2-PSK; keep source.
  return idx;
}

/** Explanations 166–265 */
const EXPL = {
  166: "HSRP provides first-hop redundancy by electing an active router that owns a virtual IP and virtual MAC shared by the HSRP group. Hosts use the VIP as default gateway; if the active fails, the standby assumes the VIP/vMAC so traffic continues. It does not flood L2 for load balancing, does not ECMP routed packets by itself, and is not equal-cost multipath in the routing table.",
  167: "Higher HSRP priority alone does not reclaim the active role after reload if preemption is disabled. standby preempt allows a recovering higher-priority router to take over as active. Version and priority commands alone do not force re-election after reload without preempt.",
  168: "show standby (or show standby brief) displays HSRP state, priority, preempt, virtual IP/MAC, and active/standby roles. show hsrp is not the classic IOS form. show sessions and show interfaces do not show HSRP priority.",
  169: "EIGRP is an advanced distance-vector protocol (DUAL). OSPF and IS-IS are link-state. RIP is classic distance-vector (also correct in multi-select dumps). This bank stores a single index keyed to EIGRP after cleaning the mangled BGP/RIP option line.",
  170: "show ipv6 eigrp events displays the EIGRP event log used for troubleshooting adjacency and update issues. neighbors/topology/traffic show peer, topology table, and counters—not the event error log.",
  171: "show ip ospf database displays the OSPF LSDB (router, network, summary LSAs, etc.). There is no standard show ip ospf link-state / lsa database as primary. neighbors shows adjacency state only.",
  172: "OSPF adjacency requires matching hello/dead timers (among area, network type, auth, stub flags). Mismatched timers keep neighbors from reaching FULL. Priority/cost affect DR election and metrics, not basic adjacency. Process IDs need not match between routers.",
  173: "Without a router-id command or loopback, OSPF chooses the highest IP among up/up interfaces as Router ID. Not console IP, not lowest IP, not priority.",
  174: "Administrative distance: Internal EIGRP 90, OSPF 110, IS-IS 115, RIP 120. Lowest AD wins for the same prefix, so Internal EIGRP is installed.",
  175: "Serial PPP links default to OSPF network type point-to-point (no DR/BDR). Broadcast is Ethernet default. NBMA types need explicit config.",
  176: "VRRP virtual MAC format is 0000.5E00.01xx where xx is the group ID in hex. 0000.5E00.010a is group 10. 0000.0C07.ACxx is HSRP v1.",
  177: "A DR adjacency reaches Full state with neighbors that fully exchange LSAs. Init/2-way are earlier; 2-way may be enough for non-DR pairs on multi-access, but verifying the DR is operating properly for adjacency completion is Full with its neighbors.",
  178: "In VRRP, the Backup router assumes Master when the current Master fails. HSRP uses Active/Standby terminology; VRRP uses Master/Backup.",
  179: "When routing, the router rewrites L2 headers: source MAC = egress interface MAC, destination MAC = next-hop MAC; L3 addresses stay the same. It does not encapsulate by swapping to neighbor IP as L3 destination for ordinary IP routing, nor use MPLS labels unless MPLS is in use.",
  180: "VRRP group 1 virtual MAC is 0000.5E00.0101 (base 0000.5E00.01 + group 01).",
  181: "FHRP provides a resilient default gateway for hosts on the subnet (virtual IP). Hosts still point to that VIP; FHRP is not STP, not ACL filtering, though hellos are used between routers for election.",
  182: "IPv6 static routes use ipv6 route in global config: ipv6 route <prefix>/<len> <next-hop>. ip route is IPv4. Interface mode is wrong for standard static route commands.",
  183: "ip ospf network point-to-point avoids DR/BDR election on the link. broadcast forces DR election. Cost/hello tweaks do not remove DR election on broadcast.",
  184: "The data (forwarding) plane carries user traffic. Control plane builds tables (OSPF, etc.). Management plane is device admin. Policy plane is an SDN abstraction for intent/policy, not the packet-forwarding plane name here.",
  185: "Longest prefix match: 172.31.0.1 matches /25 more specifically than /24 or /16, so the /25 route is used.",
  186: "OSPF network statement uses wildcard mask: network 10.120.10.0 0.0.0.255 area 0 under router ospf. Using subnet mask 255.255.255.0 in network is wrong. area placement before network is invalid syntax.",
  187: "VRRP virtual MAC 00-00-5E-00-01-0a corresponds to group 10. HSRP uses 00-00-0C-07-ACxx.",
  188: "VRRP is an open standard, suitable in multivendor networks for gateway redundancy. Cisco-only extras are not the multivendor reason. STP is separate. ARP-cache transparency is a general FHRP benefit but the multivendor driver is standards interoperability.",
  189: "Hosts use the HSRP virtual IP as default gateway. Multicast is for hellos; loopback is not the LAN gateway; broadcast is not the VIP.",
  190: "HSRP v1 virtual MAC is 0000.0C07.ACxx with xx = group in hex. Group 14 = 0x0E → 00:00:0c:07:ac:0e.",
  191: "Equal-cost (or equal-AD equal-metric) static routes to the same prefix with different next hops are CEF load-balanced by default. Age/MAC/lowest IP are not the selection rules.",
  192: "FHRP protects against default gateway failure by providing a standby/backup forwarder for the VIP. It does not fix BGP flapping, STP loops, or root bridge loss.",
  193: "UDP jitter IP SLA measurements need synchronized time (NTP) for accurate one-way delay/jitter calculations. LLDP/CDP/EEM are unrelated as the required feature for jitter accuracy.",
  194: "A NAT pool is a configured range of addresses available for dynamic translation. Dynamic/static/one-way describe methods, not the address group term.",
  195: "transport input telnet ssh on the VTY allows both protocols. telnet alone drops SSH; no transport input telnet removes Telnet; privilege level does not enable protocols.",
  196: "Authoritative DNS answers come from the authoritative name servers via the resolution process (recursive/iterative lookup path). Caches (OS/browser/ISP) may return non-authoritative answers.",
  197: "show ip interface displays helper-address (DHCP relay) configured on the interface. brief omits helpers; bindings/pool are server-side; route table is unrelated.",
  198: "DHCP servers maintain address pools of available leases (plus options/bindings). DNS names, domain passwords, and static MAC lists are not the primary DHCP server data described.",
  199: "show ip interface GigabitEthernet 0/0 shows Interface is up, address assignment method including DHCP when configured. The dhcp-specific show forms listed are invalid/not primary.",
  200: "logging trap debug sets severity to 7, so all lower-severity-number messages (0–7) are sent—effectively all standard syslog levels to the server. It does not stop logging nor limit only to warning+.",
  201: "SNMP with Cisco IOS MIBs can read/write configuration objects for bulk backup/automation. ARP/CDP/SMTP do not provide IOS MIB-based global config backup.",
  202: "ip address dhcp under an interface makes that interface a DHCP client. ip helper-address is relay; ip dhcp pool is server; ip dhcp client is not the standard enable form alone.",
  203: "An SNMP agent on the device responds to NMS Get/GetNext/GetBulk and can send traps/informs about MIB objects. It is not a routing protocol, not AAA coordinator, and does not poll remote nodes as its primary role.",
  204: "ntp master makes the device an authoritative NTP server (stratum configurable). ntp server points to an upstream server (client). peer/authenticate are other NTP features.",
  205: "Interface up/down is a typical severity 5 notice-level syslog. Certificate expiry, TCP teardown, ICMP are not the classic notice example keyed here.",
  206: "FHRP (HSRP/VRRP/GLBP) lets multiple routers share a virtual default gateway so hosts keep a stable gateway if one router fails. It is not CDP sharing, not OSPF ECMP, not STP multipath.",
  207: "Dynamic NAT with a pool of three outside addresses: ip nat pool ... prefix-length, ACL matching 10.10.0.0/24 (wildcard 0.0.0.255), ip nat inside source list 1 pool mypool, and correct inside/outside interfaces. Wrong ACL wildcard, outside destination NAT, or route-map misuse are incorrect.",
  208: "In HSRP, the Standby router becomes Active and forwards when the Active fails. VRRP uses Backup; there is no HSRP role named backup/forwarding as the successor name.",
  209: "SNMP can be used with MIBs to retrieve/back up configurations at scale; the item pairs SNMP with global backup via management functions. FTP can copy files but the keyed answer in this bank is SNMP for the global/MIB scenario; TCP/SMTP are not config-backup tools here.",
  210: "overload enables PAT so many inside hosts share one (or few) outside address(es) using ports. pool defines addresses; static is 1:1; source is direction syntax.",
  211: "IP SLA measures delay, jitter, loss to validate whether the path meets application/QoS needs. LLDP/CDP are discovery; EEM is event scripting.",
  212: "Traffic shaping queues excess traffic and meters send rate to a limit (buffers rather than hard-drop by default). Marking classifies/tags; fair queuing schedules; mitigating delay over slow links is incomplete—shaping specifically rate-limits by buffering.",
  213: "TFTP commonly transfers IOS images and configs without authentication over UDP/69—used for firmware upgrades. It does not use username/password like FTP/SCP.",
  214: "ip helper-address is configured on the interface facing DHCP clients (router closest to clients) to relay broadcasts to a remote server.",
  215: "DNS resolves a hostname to an IP so Telnet/SSH can connect by name. SNMP/syslog/NTP do not perform name resolution for the session.",
  216: "On Cisco WLC, Passive Client allows devices that do not ARP normally (some static printers) to work correctly with controller bridging. DHCP assignment contradicts static IP. Exclusion/tunneling are wrong features for this case.",
  217: "A DHCP relay agent (helper-address) forwards client DHCP messages between subnets to the server. DHCPOFFER/DISCOVER are message types, not devices.",
  218: "FTP authenticates with username/password when transferring files. TFTP has no auth. SMTP is mail; DTP is trunk negotiation.",
  219: "The NMS must load the MIB that defines the trap OIDs to interpret and handle the trap meaningfully. Duplicate traps, inform pairing, or co-location on the agent router are not prerequisites.",
  220: "ntp master makes the switch a local NTP server when upstream fails; also pointing ntp server to upstream is valid client+master design. ntp backup is invalid. peer alone is not the master fallback pattern keyed here.",
  221: "DHCP relay agent (ip helper-address) forwards DHCPDISCOVER to a server on another subnet. Binding/snooping/pool are not the relay function.",
  222: "Syslog severity debug (7) includes informational (6) and all higher-priority levels. Setting a higher severity number threshold allows more verbose messages including informational.",
  223: "DHCP commonly provides default gateway (option 3) to Windows hosts. STP/SNMP/DNS do not assign the gateway.",
  224: "snmp-server user configures SNMPv3 users (auth/priv). community is v1/v2c. host/enable traps exist across versions but user implies v3.",
  225: "Requirements: ntp authenticate + md5 key, ntp source Loopback0, ntp master 2 (stratum 2), access-group server-only with ACL permitting the client. sha1 key type, ntp interface (invalid), or ntp stratum (invalid IOS) fail. The correct set is md5 + source Loopback0 + master 2 + ACL permit to the client.",
  226: "crypto key generate rsa requires hostname and ip domain-name (or domain name) already set. The domain-name is the missing prerequisite before key generation. Generating the key is the next step after domain-name, not before.",
  227: "Shaping buffers excess packets and releases them later to conform to a rate. Policing drops/marks excess. WRED drops probabilistically for congestion avoidance. Prioritization is scheduling emphasis.",
  228: "ip helper-address enables DHCP relay on an interface. ip dhcp pool is server; ip address dhcp is client; ip dhcp relay is not the classic IOS command form.",
  229: "clock set in EXEC sets the system date/time. timezone/summer-time configure offsets/DST rules, not the absolute stamp alone.",
  230: "Static inside source NAT: ip nat inside source static <inside-local> <inside-global>. Swapping addresses or using outside source changes the translation direction/meaning.",
  231: "This item keys 802.1Q (trunking/native VLAN issues can black-hole or misdeliver DHCP). In broader practice STP-blocked ports or missing relay also block DHCP; the bank answer remains 802.1Q per source.",
  232: "TFTP allows simple file transfer without user login (anonymous-style). It is UDP-based, not dual TCP connections like FTP, and is not secure.",
  233: "Marking writes CoS/DSCP/IPP values into headers for classification downstream. Classification identifies traffic; policing/shaping enforce rates.",
  234: "ip address dhcp configures the interface as a DHCP client. Relay/helper use helper-address; server uses dhcp pool.",
  235: "SSH v2 needs hostname, ip domain-name, RSA key, user/VTY login local, transport input ssh, and ip ssh version 2. Missing domain-name breaks key gen; transport input all allows Telnet; password-encryption is optional not exclusive requirement.",
  236: "ISPs typically police customer traffic that exceeds the committed rate (drop/remark) at the edge. Shaping is more common on the customer egress. Queuing/marking alone do not enforce the contract the same way.",
  237: "Telnet provides remote CLI without encryption. SSH is secure. Console is local. Bash is a shell, not a Cisco remote access protocol here.",
  238: "A syslog facility is a category identifying the message source/process (e.g., local0, kern). It is not the destination host, password, or merely the severity grouping.",
  239: "Policing drops or remarks packets exceeding a rate. Shaping queues. CBWFQ/LLQ are scheduling methods.",
  240: "Marking changes ToS/DSCP/CoS fields. Classification reads them; policing/shaping rate-control.",
  241: "FTP uses separate control (TCP 21) and data (TCP 20/passive) connections. It is not UDP/69 (TFTP). It typically authenticates users.",
  242: "TFTP uses block numbers/ACKs for reliability over UDP and is simple/unauthenticated. Not secure, not TCP/20, not dual FTP-style connections.",
  243: "QoS for voice prioritizes and protects voice (LLQ, low loss/jitter/latency) by treating it differently from bulk data. Differentiating classes is how optimization is applied; reducing loss is the outcome. The keyed option is differentiating voice and video traffic in this bank.",
  244: "Authenticator apps typically require a device PIN/biometric before showing OTP codes if the phone is lost/stolen. Admin password/reactivation or location-only checks are not the standard primary control described.",
  245: "Firewalls perform stateful inspection of traffic flows. Switches/APs/WLCs are not primarily stateful firewalls.",
  246: "Port-security sticky learns the MAC dynamically and writes it to the running config as a secure sticky address. Static requires manual MAC; 'auto/dynamic learning' alone is not the port-security sticky feature name.",
  247: "aaa new-model enables the AAA model on IOS. It does not by itself define RADIUS servers, groups, or local users.",
  248: "SNMPv3 provides authentication and encryption for monitoring—highest security among the listed management options. Syslog/NetFlow/IP SLA lack comparable mandatory authPriv security.",
  249: "Protect unused default-VLAN ports: shut them down and/or put as access in an unused black-hole VLAN (e.g., 99). Do not trunk them or EtherChannel them unnecessarily. CDP enable does not protect unused ports. Choose-two cleaned to four options; index kept on access VLAN 99.",
  250: "service password-encryption applies weak reversible encryption to plain-text passwords in the config so casual viewing of running-config does not show cleartext. It does not block admins from setting passwords, protect VLAN DB, or encrypt VPN tunnels.",
  251: "WPA3 SAE (Simultaneous Authentication of Equals) improves handshake security vs PSK dictionary attacks and protects better against offline attacks on Wi-Fi. TKIP is legacy. AES is cipher; SAE is the WPA3 enhancement named here.",
  252: "WPA2-PSK commonly uses AES-CCMP. Exam banks often list AES-256 as the keyed option even though CCMP is 128-bit AES; TKIP/RC4 are legacy WPA/WEP-era.",
  253: "service password-encryption obscures plain-text passwords in the configuration file. enable secret uses MD5/modern hashing for the enable password specifically but the item asks about passwords stored as plain text generally—service password-encryption is the direct answer.",
  254: "Private IPv4 (RFC1918) is not routed on the public Internet, reducing direct exposure. It does not shrink FIB globally, nor enable private-to-private Internet communication without NAT/VPN.",
  255: "Dynamic ARP Inspection mitigates ARP spoofing/poisoning used in man-in-the-middle attacks. Not primarily DDoS/malware/worm defenses.",
  256: "Remote access VPN lets individual users securely reach internal resources over the Internet. Site-to-site connects branches. It is not only for on-prem users.",
  257: "Changing the native VLAN from default and disabling unused trunking reduces double-tagging VLAN hopping risk. DAI is ARP; ACLs are not the classic hopping fix; port-security helps MAC attacks more than hopping.",
  258: "DHCP snooping builds a binding database (MAC/IP/VLAN/port/lease). CAM/MAC table is for L2 forwarding, not DHCP bindings.",
  259: "SSH with RSA: ip domain-name then crypto key generate rsa modulus 1024 (or larger). EC key commands shown are incorrect forms for the classic requirement set.",
  260: "WLC WPA2-PSK passphrase is entered in ASCII (or hex in some UIs); ASCII is the supported format keyed here. unicode/base64/decimal are not the standard PSK entry formats.",
  261: "Badge readers on doors are physical access control. RBAC is logical permissions; biometrics may be a method; MFA is multi-factor authentication broadly.",
  262: "DHCP snooping can rate-limit DHCP messages on untrusted ports and build bindings. It does not do VTP, general multicast forwarding, or full DDoS mitigation.",
  263: "SSH encrypts remote CLI. Telnet/HTTP are insecure for CLI; HTTPS is web management, not classic CLI.",
  264: "WPA2 with AES (CCMP) is the strongest combination listed vs WEP, WPA+TKIP, WPA+AES. WPA3 is stronger but not listed.",
  265: "Physical access control regulates entry to facilities and equipment rooms. Logical network/filesystem controls are separate domains.",
};

const TICKETS = {
  167: {
    sintoma:
      "Chamado #9167 — R1 (priority 150) foi recarregado. R2 (priority 100) permanece Active e o tráfego não volta para R1. Ambos no grupo HSRP 10 com VIP 10.10.10.1.",
    cli_output: `R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       10   150   Standby 10.10.10.3     local           10.10.10.1

R1# show running-config | include standby
standby 10 ip 10.10.10.1
standby 10 priority 150
! (sem standby 10 preempt)

R2# show standby brief
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       10   100   Active  local           10.10.10.2     10.10.10.1`,
    alternativas: [
      "Falta standby 10 preempt em R1; sem preempt a prioridade maior não retoma Active após o reload.",
      "Trocar para standby 10 version 2 resolve sozinho a preempção.",
      "Priority 150 é inválida; HSRP só aceita priority 100.",
      "show interfaces confirma que HSRP ignora priority sem version 1.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "HSRP só devolve o papel Active a um router de maior prioridade se preempt estiver habilitado. O output mostra Pri 150 sem flag P e State Standby. Correção: standby 10 preempt. Version não substitui preempt; priority 150 é válida.",
  },
  172: {
    sintoma:
      "Chamado #9172 — R1 e R2 não formam adjacência OSPF no link Ethernet comum. show ip ospf neighbor vazio.",
    cli_output: `R1# show ip ospf interface gi0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 192.168.1.1/24, Area 0
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1
  Timer intervals configured, Hello 10, Dead 40, WaitInterval 5, Retransmit 5

R2# show ip ospf interface gi0/0
GigabitEthernet0/0 is up, line protocol is up
  Internet Address 192.168.1.2/24, Area 0
  Process ID 1, Router ID 2.2.2.2, Network Type BROADCAST, Cost: 1
  Timer intervals configured, Hello 5, Dead 20, WaitInterval 5, Retransmit 5

R1# show ip ospf neighbor
! (empty)`,
    alternativas: [
      "Hello/Dead divergentes (10/40 vs 5/20) impedem adjacência OSPF.",
      "Process ID diferente entre roteadores é obrigatório e está faltando.",
      "É preciso elevar priority em R1 para formar vizinho.",
      "Cost 1 em ambos bloqueia FULL por definição.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Timers Hello/Dead devem coincidir. Aqui 10/40 ≠ 5/20. Process ID pode diferir; priority/cost não explicam neighbor vazio. Alinhar ip ospf hello-interval/dead-interval.",
  },
  183: {
    sintoma:
      "Chamado #9183 — Link /30 entre R1–R2 elege DR/BDR desnecessariamente. Engenharia quer evitar eleição DR/BDR.",
    cli_output: `R1# show ip ospf interface gi0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet Address 192.168.1.1/30, Area 0
  Network Type BROADCAST, Cost: 1
  Transmit Delay is 1 sec, State DR, Priority 1
  Designated Router (ID) 1.1.1.1, Interface address 192.168.1.1
  Backup Designated router (ID) 2.2.2.2, Interface address 192.168.1.2`,
    alternativas: [
      "Configurar ip ospf network point-to-point no link para eliminar DR/BDR.",
      "ip ospf network broadcast é o comando para evitar DR.",
      "ip ospf cost 0 remove a eleição DR.",
      "Hello 15 sozinho desativa BDR.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Network type point-to-point não elege DR/BDR — ideal em /30. Broadcast força DR. Cost/hello não removem eleição.",
  },
  185: {
    sintoma:
      "Chamado #9185 — Pacote a 172.31.0.1 escolhe rota errada segundo a equipe. Três prefixos instalados.",
    cli_output: `R1# show ip route 172.31.0.1
Routing entry for 172.31.0.0/25
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.0.0.2

R1# show ip route | include 172.31
S        172.31.0.0/16 ...
S        172.31.0.0/24 ...
S        172.31.0.0/25 ...`,
    alternativas: [
      "Longest match usa 172.31.0.0/25 para 172.31.0.1.",
      "Sempre vence o /16 por ser mais “amplo”.",
      "Default 0.0.0.0/0 tem prioridade sobre qualquer match.",
      "O /24 vence o /25 por AD menor implícito.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "IOS aplica longest-prefix match. /25 é mais específico que /24 e /16 para 172.31.0.1. Default só se não houver match.",
  },
  202: {
    sintoma:
      "Chamado #9202 — Interface WAN do roteador de filial precisa obter IP automaticamente do ISP (DHCP client).",
    cli_output: `R1# show running-config interface gi0/0
interface GigabitEthernet0/0
 description WAN-ISP
 ip address 192.0.2.10 255.255.255.0
! estático legado

R1# show ip interface brief
Interface              IP-Address      OK? Method Status
GigabitEthernet0/0     192.0.2.10      YES NVRAM  up`,
    alternativas: [
      "Configurar ip address dhcp na interface para virar cliente DHCP.",
      "ip helper-address na WAN faz o roteador ser cliente DHCP.",
      "ip dhcp pool na WAN obtém endereço do ISP.",
      "ip dhcp client sozinho sem ip address dhcp é o padrão IOS.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Cliente DHCP no IOS: ip address dhcp na interface. helper-address é relay; pool é servidor.",
  },
  207: {
    sintoma:
      "Chamado #9207 — NAT dinâmico deve traduzir 10.10.0.0/24 para o pool 192.168.3.1–3. Traduções não ocorrem.",
    cli_output: `R1# show running-config | section nat|access-list 1
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
      "Trocar para ip nat inside source list 1 pool mypool (inside source, não outside destination).",
      "Manter outside destination; só falta overload.",
      "Wildcard 0.0.0.254 é obrigatório para /24.",
      "Remover ip nat inside/outside das interfaces.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Tradução da sub-rede interna usa inside source list + pool. outside destination inverte o modelo e não atende o requisito. ACL /24 usa 0.0.0.255.",
  },
  208: {
    sintoma:
      "Chamado #9208 — Active HSRP R1 falhou. Quem deve encaminhar o VIP agora?",
    cli_output: `R2# show standby
GigabitEthernet0/0 - Group 1
  State is Active
    1 state change, last state change 00:00:12
  Virtual IP address is 10.1.1.1
  Active router is local
  Standby router is unknown expired
  Priority 90 (configured 90)
  Group name is "hsrp-Gi0/0-1" (default)

! R1 unreachable`,
    alternativas: [
      "O router Standby assume Active e encaminha pacotes do VIP.",
      "O papel Listening vira forwarder permanente sem virar Active.",
      "Backup (termo VRRP) é o nome HSRP do sucessor.",
      "Forwarding é um estado HSRP estável separado de Active.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "HSRP: Standby → Active no failover. Listening é estado transitório/auxiliar. Backup é VRRP. Não há role estável “forwarding” como sucessor nomeado.",
  },
  214: {
    sintoma:
      "Chamado #9214 — Clientes na VLAN 40 não recebem DHCP; servidor está em outro site. Relay ausente.",
    cli_output: `R1# show ip interface gi0/0.40
GigabitEthernet0/0.40 is up, line protocol is up
  Internet address is 10.40.0.1/24
  Helper address is not set

R1# show running-config interface gi0/0.40
interface GigabitEthernet0/0.40
 encapsulation dot1Q 40
 ip address 10.40.0.1 255.255.255.0`,
    alternativas: [
      "Configurar ip helper-address no roteador mais próximo dos clientes (SVI/subif da VLAN 40).",
      "helper-address só no roteador colado ao servidor DHCP.",
      "Precisa em todos os hops do caminho WAN.",
      "No trunk L2 do switch, não no gateway L3 dos clientes.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Relay fica na interface L3 do subnet do cliente para capturar broadcasts DHCP e unicasts ao servidor. Não é necessário em cada hop.",
  },
  226: {
    sintoma:
      "Chamado #9226 — Engenheiro configurou hostname e tenta gerar chave RSA para SSH; comando falha pedindo domain name.",
    cli_output: `R1# show running-config | include hostname|domain
hostname R1
! sem ip domain-name

R1(config)# crypto key generate rsa
% Please define a domain-name first.`,
    alternativas: [
      "Configurar ip domain-name antes de crypto key generate rsa.",
      "password password é pré-requisito da chave RSA.",
      "ip ssh authentication-retries deve vir antes da chave.",
      "Gerar a chave antes do hostname e domain.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "RSA key pair no IOS exige hostname + domain-name. authentication-retries e passwords não substituem esse pré-requisito.",
  },
  230: {
    sintoma:
      "Chamado #9230 — PC 10.1.1.1 precisa de NAT estático para 209.165.200.225. Tradução incorreta configurada.",
    cli_output: `R1# show running-config | include nat
ip nat outside source static 209.165.200.225 10.1.1.1
interface Gi0/0
 ip nat inside
interface Gi0/1
 ip nat outside

R1# show ip nat translations
Pro Inside global      Inside local       Outside local      Outside global
--- ---                ---                10.1.1.1           209.165.200.225`,
    alternativas: [
      "Usar ip nat inside source static 10.1.1.1 209.165.200.225.",
      "Manter outside source static com endereços invertidos.",
      "inside source static 209.165.200.225 10.1.1.1 está correto.",
      "NAT estático não exige inside/outside nas interfaces.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Inside-local 10.1.1.1 ↔ inside-global 209.165.200.225 usa inside source static na ordem local→global. outside source inverte o modelo. Interfaces inside/outside são necessárias.",
  },
  246: {
    sintoma:
      "Chamado #9246 — Port-security na porta da impressora; MAC deve ser aprendido e gravado automaticamente.",
    cli_output: `SW1# show port-security interface gi1/0/10
Port Security              : Enabled
Port Status                : Secure-up
Maximum MAC Addresses      : 1
Total MAC Addresses        : 0
Configured MAC Addresses   : 0
Sticky MAC Addresses       : 0
Security Violation Count   : 0

SW1# show running-config interface gi1/0/10
interface GigabitEthernet1/0/10
 switchport mode access
 switchport port-security
! sem sticky`,
    alternativas: [
      "Habilitar switchport port-security mac-address sticky para aprender e fixar o MAC na config.",
      "Só static MAC manual atende “automaticamente”.",
      "enable dynamic MAC address learning é o comando port-security.",
      "auto MAC address learning existe como feature separada obrigatória.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Sticky port-security aprende o MAC dinâmico e o converte em sticky na running-config. Static é manual. Não há comando genérico “auto MAC” no lugar de sticky.",
  },
  250: {
    sintoma:
      "Chamado #9250 — Auditoria viu senhas em claro no show run. Precisam ofuscar senhas type 7 no arquivo de config.",
    cli_output: `R1# show running-config | include password|secret
enable password Cisco123
line vty 0 4
 password LabPass
! service password-encryption não configurado`,
    alternativas: [
      "Aplicar service password-encryption para ofuscar senhas em claro na configuração.",
      "O comando impede admins de configurar senhas novas.",
      "Ele criptografa túneis VPN IPsec automaticamente.",
      "Protege o VLAN database do switch via VTP.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "service password-encryption aplica cifra reversível (type 7) a passwords em texto claro no config, dificultando leitura casual. Não é VPN crypto nem VTP protection. enable secret é hashing forte separado para enable.",
  },
  257: {
    sintoma:
      "Chamado #9257 — Segurança pede mitigação de VLAN hopping em trunks com native VLAN 1 default.",
    cli_output: `SW1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi1/0/24    on           802.1q         trunking      1

SW1# show vlan brief | include 1 | 999
1    default                          active
999  BLACKHOLE                        active`,
    alternativas: [
      "Alterar native VLAN para VLAN não usada (ex. 999) e alinhar nos dois lados; evitar native 1.",
      "Só DAI mitiga VLAN hopping double-tag.",
      "ACL “prevent changing VLANs” é o controle clássico Cisco para hopping.",
      "Port-security em VLANs de Internet é a mitigação principal de hopping.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Ataques double-tag exploram native VLAN default. Práticas: native VLAN unused, same on both ends, disable unused ports, avoid DTP. DAI/port-security tratam outros vetores.",
  },
  258: {
    sintoma:
      "Chamado #9258 — DHCP snooping habilitado; equipe pergunta onde ficam os bindings IP-MAC-porta.",
    cli_output: `SW1# show ip dhcp snooping binding
MacAddress         IpAddress       Lease(sec) Type           VLAN Interface
------------------ --------------- ---------- -------------  ---- -------------------
00:11:22:33:44:55  10.10.10.50     86400      dhcp-snooping  10   GigabitEthernet1/0/5

SW1# show mac address-table dynamic vlan 10
Vlan    Mac Address       Type        Ports
10      0011.2233.4455    DYNAMIC     Gi1/0/5`,
    alternativas: [
      "Bindings de DHCP snooping ficam no binding database (show ip dhcp snooping binding).",
      "Ficam só na CAM table sem base separada.",
      "Ficam no frame forwarding database de VTP.",
      "Não há banco; só no MAC address table sem IP.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "DHCP snooping mantém binding database (MAC, IP, lease, VLAN, port). A MAC table é L2 learning separado, sem lease DHCP.",
  },
};

function buildTraditional(q) {
  const enunciado = fixOcr(q.enunciado);
  if (/choose two|choose three/i.test(enunciado)) chooseTwo.push(q.id);
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
    explicacao_profunda: EXPL[q.id] || "See CCNA 200-301 for this topic.",
  };
}

function buildTicket(q) {
  const t = TICKETS[q.id];
  if (!t) return null;
  return {
    id: q.id,
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
      ticket: buildTicket(q),
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
  };
  fs.writeFileSync(path.join(__dirname, "lote_166_265_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
