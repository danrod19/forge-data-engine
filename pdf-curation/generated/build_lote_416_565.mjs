/**
 * CCNA Forge — enrich questions 416–565 (150 items)
 * JSON-only. No models, no PDF.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "questions_bulk_completo (1).json");
const OUT = path.join(__dirname, "lote_416_565_enriched.json");
const PARTIALS = [
  [416, 465, "partial_416_465.json"],
  [466, 515, "partial_466_515.json"],
  [516, 565, "partial_516_565.json"],
];

const answerFixes = [];
const chooseTwo = [];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  let t = s;
  // strip dump headers / page markers
  t = t.replace(/^QUESTION\s+\d+\s*/i, "");
  t = t.replace(/---\s*PAGE\s*\d+\s*---/gi, " ");
  t = t.replace(/\bPAGE\s*\d+\b/gi, " ");

  const pairs = [
    [/conguration/gi, "configuration"],
    [/congurations/gi, "configurations"],
    [/congured/gi, "configured"],
    [/congures/gi, "configures"],
    [/conguring/gi, "configuring"],
    [/congure/gi, "configure"],
    [/\(cong\)/gi, "(config)"],
    [/\(cong-/gi, "(config-"],
    [/R1\(cong\)#/gi, "R1(config)#"],
    [/Device\(config\)#\s*/g, "Device(config)#"],
    [/identies/gi, "identifies"],
    [/identier/gi, "identifier"],
    [/specic/gi, "specific"],
    [/predened/gi, "predefined"],
    [/prexes/gi, "prefixes"],
    [/prex/gi, "prefix"],
    [/benet/gi, "benefit"],
    [/ooding/gi, "flooding"],
    [/\boods\b/gi, "floods"],
    [/ecient/gi, "efficient"],
    [/trac/gi, "traffic"],
    [/rewall/gi, "firewall"],
    [/verication/gi, "verification"],
    [/veries/gi, "verifies"],
    [/dened/gi, "defined"],
    [/denes/gi, "defines"],
    [/\ble\b/gi, "file"],
    [/les\b/gi, "files"],
    [/lter/gi, "filter"],
    [/simplies/gi, "simplifies"],
    [/authenticaton/gi, "authentication"],
    [/ooads/gi, "offloads"],
    [/modies/gi, "modifies"],
    [/software-dened/gi, "software-defined"],
    [/Chef conguration/gi, "Chef configuration"],
    [/input erros/gi, "input errors"],
    [/dose no /gi, "does not "],
    [/dose the /gi, "does the "],
    [/ensues that/gi, "ensures that"],
    [/umber of hops/gi, "number of hops"],
    [/ntp sever/gi, "ntp server"],
    [/downstate/gi, "down state"],
    [/error disables/gi, "error-disabled"],
    [/fram that/gi, "frame that"],
    [/dorps /gi, "drops "],
    [/reponse/gi, "response"],
    [/virtual physical/gi, "virtualize physical"],
    [/per AF /gi, "per AP "],
    [/to the WL\b/gi, "to the WLC"],
    [/with the WL\b/gi, "with the WLC"],
    [/non overlapping/gi, "nonoverlapping"],
    [/802 11g/g, "802.11g"],
    [/which command/gi, "Which command"],
    [/what is /gi, "What is "],
    [/what event/gi, "What event"],
    [/what benefit/gi, "What benefit"],
    [/what makes/gi, "What makes"],
    [/building>Floor/g, "building.\nFloor"],
    [/>Floor /g, "\nFloor "],
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

  if (id === 420) {
    a = [
      "R1(config)# username engineer2 privilege 1 password 7 test2021",
      "R1(config)# username engineer2 secret 4 $1$b1Ju$kZbBS1Pyh4QzwXyZ",
      "R1(config)# username engineer2 algorithm-type scrypt secret test2021",
      "R1(config)# username engineer2 secret 5 password $1$b1Ju$kZbBS1Pyh4QzwXyZ",
    ];
  }
  if (id === 445) {
    a = [
      "switchport mode dynamic\nchannel-protocol lacp\nswitchport trunk allowed vlan 1-10",
      "switchport mode trunk\nswitchport trunk allowed vlan 1-10\nswitchport trunk native vlan 11",
      "switchport mode trunk\nswitchport trunk encapsulation dot1q\nswitchport trunk allowed vlan 1-10",
      "switchport mode dynamic desirable\nchannel-group 1 mode desirable\nswitchport trunk encapsulation isl\nswitchport trunk allowed vlan except 11-4094",
    ];
  }
  if (id === 509) {
    a = [
      "R1# config t\nR1(config)# ip routing\nR1(config)# ip route default-route 192.168.1.1",
      "R1# config t\nR1(config)# ip routing\nR1(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.1",
      "R1# config t\nR1(config)# ip routing\nR1(config)# ip route 192.168.1.1 0.0.0.0 0.0.0.0",
      "R1# config t\nR1(config)# ip routing\nR1(config)# ip default-gateway 192.168.1.1",
    ];
  }
  if (id === 511) {
    a = [
      "interface e0/0\n description to HQ-A370:98968\n ip address 10.2.1.3 255.255.255.252",
      "interface e0/0\n description to HQ-A370:98968\n ip address 192.168.1.1 255.255.255.248",
      "interface e0/0\n description to HQ-A370:98968\n ip address 172.16.1.4 255.255.255.248",
      "interface e0/0\n description to HQ-A370:98968\n ip address 209.165.201.2 255.255.255.252",
    ];
  }
  if (id === 522) {
    a = ["input errors", "frame", "giants", "CRC"];
  }
  if (id === 520) {
    a = [
      "FlexConnect AP mode fails to function if the AP loses connectivity with the WLC.",
      "FlexConnect AP mode bridges the traffic from the AP to the WLC when local switching is configured.",
      "Local AP mode creates two CAPWAP tunnels per AP to the WLC.",
      "Local AP mode causes the AP to behave as if it were an autonomous AP.",
    ];
  }
  if (id === 548) {
    a = ["outside global", "outside local", "inside global", "inside local"];
  }
  if (id === 498) {
    a = a.map((x) => x.replace(/---.*$/, "").trim());
  }
  if (id === 532 || id === 544 || id === 550 || id === 524) {
    a = a.map((x) => x.replace(/---.*$/, "").trim());
  }
  if (id === 503) {
    a = a.map((x) => stripLetter(x));
  }

  while (a.length < 4) a.push("(invalid option)");
  if (a.length > 4) a = a.slice(0, 4);
  return a.map((x) => fixOcr(x));
}

function maybeFixAnswer(id, idx) {
  const fix = (to, reason) => {
    if (idx !== to) {
      answerFixes.push({ id, from: idx, to, reason });
      return to;
    }
    return idx;
  };
  if (id === 417) return fix(1, "RSA is asymmetric; identical keys describe symmetric crypto.");
  if (id === 434) return fix(0, "PUT updates/replaces a resource; it is idempotent, not nonidempotent.");
  if (id === 435) return fix(2, "Plane separation simplifies operations/complexity; it does not offload VM creation to data plane.");
  return idx;
}

const EXPL = {};
const e = (id, t) => {
  EXPL[id] = t;
};

// 416-465
e(416, "Using another person’s badge/ID to enter a facility violates physical access control. IDS/network authorization/user awareness are different security program elements.");
e(417, "RSA is a public-key (asymmetric) algorithm with different public/private keys. Preshared identical keys describe symmetric cryptography, not RSA.");
e(418, "WPA3 requires Protected Management Frames, helping defend against deauth/disassociation spoofing, and adds SAE. TKIP is legacy WPA, not a WPA3 enhancement.");
e(419, "Strong passwords should be long and include complexity (special characters, mixed case, numbers). Short passwords, sharing, or storing in contacts weaken security.");
e(420, "algorithm-type scrypt secret uses a strong hashing algorithm for local username secrets. Type 7 password is weak/reversible; type 4 is deprecated/broken; malformed secret 5 syntax is wrong.");
e(421, "RSA is a public-key cryptosystem (asymmetric). It does not use a single shared private key on both sides like symmetric crypto.");
e(422, "Endpoint protection (antivirus/EDR) defends the individual host. WLC/router/DNA Center are infrastructure/management, not host AV.");
e(423, "Anti-replay (sequence checks, typically in IPsec) prevents capture-and-replay MITM-style abuse of packets. AAA authN/authZ/accounting are related but not the anti-replay mechanism named here.");
e(424, "WPA2 data confidentiality uses AES-CCMP. RC4/TKIP are older; SHA is hashing, not the WLAN cipher suite name here.");
e(425, "WPA Personal mode uses a PSK. Enterprise uses 802.1X/EAP. Local/Client are not WPA mode names for PSK.");
e(426, "Badge readers limiting facility entry are physical access control. Awareness/training are people programs; vulnerability verification is assessment.");
e(427, "DNA Center is API-driven and intent-based versus traditional campus managers that are often CLI/SNMP device-centric. That extensibility/automation is the key contrast.");
e(428, "Chef agents (clients) pull/query the Chef Infra Server for cookbooks/recipes and enforce desired state. It is agent-based pull, not purely push-only from server without client participation.");
e(429, "HTTP PUT replaces/updates the target resource representation and is idempotent. It is not read-only (GET) and not primarily for rendering a website.");
e(430, "DNA Center assurance correlates multi-source telemetry for health insights beyond siloed traditional tools. The advantage is integrated assurance analytics.");
e(431, "Southbound APIs connect the controller to network devices for programming. Northbound faces applications/orchestration.");
e(432, "SDN controllers take over control-plane duties such as computing routes and updating forwarding state. Encapsulation, NAT rewrite, and VPN crypto remain data-plane/device functions.");
e(433, "Northbound REST APIs face applications using HTTP methods GET/POST/PUT/DELETE. Southbound faces network elements; SNMP is not the NB REST model.");
e(434, "PUT is used to create/replace/update a resource representation (idempotent update). It is not for read-only display and is not the nonidempotent method (that is typically POST).");
e(435, "Separating control and data planes centralizes decisions and simplifies device operations/complexity for policy and automation. It does not offload VM creation onto the data plane.");
e(436, "Northbound APIs enable orchestration and network automation applications above the controller. Device software restore paths are not the NB definition.");
e(437, "An Ansible inventory is the file (or source) listing target hosts/groups. Playbooks are actions; modules/tasks are units of work; the control node runs Ansible.");
e(438, "Northbound APIs support centralized/global provisioning and automation interfaces for apps. The path controller→devices is southbound.");
e(439, "DNA Center enables zero-touch/automated provisioning at scale for new sites, a major advantage over pure box-by-box traditional rollout.");
e(440, "Rapid elasticity is automatic scale-out/in of cloud capacity with demand. Multitenancy, measured service, and self-service are other NIST cloud characteristics.");
e(441, "Southbound interface is controller↔network device programs/agents. Northbound is controller↔applications.");
e(442, "An API lets a client application send/receive data to a service over the network. NBI/SBI are SDN-specific directions; REST is one API style.");
e(443, "Traffic shaping queues excess traffic and meters the send rate to a limit. Marking/classification set or identify QoS attributes rather than queue for rate conformance.");
e(444, "Private IPv4 helps shield internal hosts from direct external addressing/exposure (with perimeter controls). It is not Internet-routable without NAT.");
e(445, "Industry-standard trunking is 802.1Q (dot1q) with mode trunk and allowed VLANs. ISL is Cisco-proprietary; dynamic-only without encapsulation may be incomplete on some platforms; LACP is EtherChannel not trunk protocol.");
e(446, "Syslog severity level is commonly used to filter messages into different files/destinations. Facility categorizes source; PID/body are less typical primary file-split keys.");
e(447, "WLC management interface is the default in-band admin and CAPWAP-related management path. Service port is OOB; console is serial; virtual is for mobility/webauth.");
e(448, "Cisco recommends source-destination IP load-balancing on neighboring switches for WLC LAG for better distribution of CAPWAP flows.");
e(449, "802.11a (5 GHz) offers many nonoverlapping channels versus crowded 2.4 GHz b/g. It is not cheaper than b, not 2.4 GHz interference prone the same way, and not backward compatible with b/g RF.");
e(450, "In JSON, a quoted string after a colon is a value. Keys are left-hand names; objects/arrays are structures.");
e(451, "A brace-delimited structure spanning multiple lines is a JSON object (set of key/value pairs).");
e(452, "A left-hand property name such as \"IDS\" is a JSON key.");
e(453, "A nested {} structure on a line is a JSON object value.");
e(454, "The property name \"port\" is a key in the object.");
e(455, "LAG/EtherChannel between WLC and switch provides redundancy, more bandwidth, and load sharing. FHRP is gateway redundancy; trunking is VLAN tagging.");
e(456, "Based on the routing/CEF exhibit (not shown in text bank), traffic to the destination uses the interface indicated by the longest-match route—here F0/12 per the keyed answer.");
e(457, "SSID names a WLAN for client discovery/association. It is not primarily a single-AP hardware ID or a security mechanism by itself.");
e(458, "Southbound APIs enable controller communication with network devices to program forwarding. Northbound faces apps; HTTP alone does not define SB.");
e(459, "In a DHCP pool, default-router distributes the default gateway to clients. ip helper-address is relay; dns-server is DNS option; default-gateway is host/router command elsewhere.");
e(460, "When roaming between APs on the same ESS/SSID, the client sends a Reassociation Request. Association is initial; probe discovers; authentication is security exchange.");
e(461, "Control plane exchanges routing/topology information (e.g., OSPF/EIGRP/BGP). Forwarding lookups and next-hop send are data plane; CLI is management.");
e(462, "\"VPN11\" on the right side of a pair is a JSON value.");
e(463, "spanning-tree portfast applies to access ports without the trunk keyword. Trunk edges need portfast trunk; L3 interfaces are not classic STP edge access ports.");
e(464, "\"R29\" appears as data content on the right-hand side of a JSON pair, so it is a value. Keys are the left-hand property names; objects and arrays are the structural containers.");
e(465, "A brace-delimited {} block beginning around line 2 is a JSON object containing nested key/value pairs, not a primitive key, value, or array by itself.");

// 466-515
e(466, "Private IPv4 is used internally without RIR public allocation. It does not provide unlimited space and is not for free Internet transit without NAT.");
e(467, "Interface output showing rising output queue drops/depth indicates queuing under congestion. Not necessarily NIC failure, pure high goodput, or storm without other counters.");
e(468, "Private addressing alleviates public IPv4 shortage by allowing internal reuse. Unlimited ranges and ISP public requirements contradict RFC1918 purpose.");
e(469, "Private hosts typically communicate with internal-only peers (or via NAT). They do not freely communicate across the public Internet without translation.");
e(470, "Private addressing conserves/alleviates IPv4 public scarcity. It is not Internet-routable merely via an ACL.");
e(471, "Counters consistent with output drops/queue buildup indicate queuing. Duplex mismatch often shows collisions/FCS late collisions on half side.");
e(472, "Multiple organizations may reuse the same RFC1918 ranges internally. Private addresses are not placed on Internet-facing firewall outside interfaces as public.");
e(473, "SSIDs are case-sensitive text strings naming the WLAN. They are not passwords or AP serial identifiers by themselves.");
e(474, "Private addressing is for internal-only host communication (or NAT boundary). Complexity/cost reduction are secondary, not the defining characteristic.");
e(475, "Wireless encryption protects confidentiality of frames; integrity checks (MIC) help detect forgery. Encryption is not the SSID beacon function.");
e(476, "Private IPs are used on hosts that talk to internal peers without public assignment. PCI compliance and FIB size are not the core definition.");
e(477, "APs broadcast beacons advertising the SSID (unless hidden). SSIDs need not include letter+number; they do not inherently prompt login IDs.");
e(478, "Encryption prevents eavesdropping on data in transit over the air. It is not primarily a spyware host agent or zero-day IPS substitute.");
e(479, "SSID presence is announced in beacons (unless hidden). Identifying a single AP is BSSID/MAC, not SSID alone.");
e(480, "Private space is used without public tracking/registration (RFC1918). It is not issued as public ASN space and does not freely traverse the Internet.");
e(481, "Switches learn by recording unknown source MACs into the MAC table with the ingress port. Flooding is for unknown destinations; ARP is host protocol.");
e(482, "High packet rates with healthy counters indicate high throughput. Storms/collisions/duplex issues show different error patterns.");
e(483, "SSID beacons announce WLAN presence. Converting RF energy is radio PHY, not SSID logic.");
e(484, "Per routing exhibit, the selected egress toward the destination is G0/20 (keyed). Longest match/CEF determines the interface.");
e(485, "\"fe5/42\" as content is a JSON value (e.g., interface name string).");
e(486, "Frame switching forwards known unicast destinations out the CAM-mapped port. It does not rewrite MACs like a router nor use CDP for data forwarding.");
e(487, "SSID associates a human-readable name to a WLAN. Policies/passwords are separate security features.");
e(488, "The property name \"port\" on the left side of a JSON pair is a key. The associated right-hand content would be its value; braces/brackets would denote object/array structures.");
e(489, "Symptoms such as CRC on one side and collisions on the other often indicate duplex mismatch. Pure queuing lacks those error signatures.");
e(490, "Multivendor discovery uses LLDP (lldp run). CDP is Cisco-proprietary.");
e(491, "CPU ACLs on WLC restrict which hosts may reach the controller management plane. TACACS/RADIUS authenticate users; Flex ACL is client data policy.");
e(492, "IPsec (ESP/AH) protects user data plane in site-to-site VPNs. IKE negotiates SAs; MD5 is a hash, not the data transport.");
e(493, "TCP uses the three-way handshake; UDP is connectionless without delivery guarantees. Options reversing roles or giving UDP TCP flags are wrong.");
e(494, "Controller-based networking enables centralized configuration and monitoring versus per-device traditional management.");
e(495, "A floating static must have higher administrative distance than the primary so it installs only when the primary is removed.");
e(496, "EUI-64 flips the U/L seventh bit of the MAC-derived interface ID when forming the 64-bit IID. FE80 insertion is link-local prefix, not the EUI-64 transform itself.");
e(497, "SNMP agents answer NMS requests about MIB objects and may send traps. They do not route or perform AAA.");
e(498, "service password-encryption obscures plaintext passwords in the configuration. enable secret hashes only the enable password.");
e(499, "Among equal prefixes from different protocols, lowest administrative distance wins installation.");
e(500, "172.28.0.0/16 is inside RFC1918 172.16.0.0/12 private space. 172.9/16 and 209.165.201.0/24 are not private RFC1918 for internal-only.");
e(501, "Different routing protocols are compared by administrative distance, not by incomparable metrics/hop counts across protocols.");
e(502, "ntp master makes the device an NTP server (authoritative clock source). ntp server points to an upstream server as client.");
e(503, "OSPF cost defaults from reference-bandwidth/interface bandwidth (Cisco classic 100 Mbps reference). It is not hop count like RIP.");
e(504, "Spine-leaf keeps a consistent hop count between any endpoints (leaf-spine-leaf), giving predictable latency.");
e(505, "SLAAC forms a GUA from RA prefix plus IID often from MAC/EUI-64. Disabling EUI-64 opposes MAC-derived IIDs; DHCPv6 is another method.");
e(506, "Scale access ports by adding a leaf connected to every spine. A single uplink to one spine breaks the full fabric pattern.");
e(507, "RSA key generation for SSH requires hostname and ip domain-name (DNS domain). Version/VTY/user help SSH use but domain is the key prerequisite listed.");
e(508, "Southbound APIs interact with edge/infrastructure devices. Northbound faces applications.");
e(509, "Default route is ip route 0.0.0.0 0.0.0.0 192.168.1.1. Invented default-route syntax and ip default-gateway on a routing router are wrong.");
e(510, "WLC centralizes AP configuration so you need not configure each lightweight AP individually.");
e(511, "Usable /30 host 209.165.201.2 with mask 255.255.255.252 is valid. 10.2.1.3/30 is network broadcast of .0/30; /29 masks are not /30.");
e(512, "FlexConnect can continue serving clients with local switching if CAPWAP to WLC is lost (with caveats). Local mode depends on WLC for data path.");
e(513, "WPA3 SAE strengthens personal mode against offline attacks and improves privacy versus WPA2-PSK weaknesses. TKIP is legacy.");
e(514, "TACACS+ separates authentication, authorization, and accounting; RADIUS typically combines authN/authZ. Encryption scope statements are often reversed in distractors.");
e(515, "DNA Center provides broad extensibility (REST APIs, integrations) versus traditional campus managers.");

// 516-565
e(516, "802.11b best practice: assign nonoverlapping channels (1/6/11) to nearby APs. 54 Mbps is 802.11g/a rates, not b max; disabling TPC is not the RF plan rule.");
e(517, "DNA Center can deploy consistent network-wide configuration/policy; traditional management is often device-by-device.");
e(518, "MFA requires two different factors (e.g., password + OTP from phone). Two passwords or password + security question same factor type fail MFA intent.");
e(519, "Authentication identifies users; accounting tracks services/commands; authorization controls access rights.");
e(520, "Local mode builds CAPWAP control and data tunnels to the WLC. FlexConnect can local-switch and may still operate if WLC is unreachable.");
e(521, "Private ranges allow many companies to reuse the same addresses internally. They do not provide direct Internet inbound connectivity without NAT/public mapping.");
e(522, "Failed FCS increments CRC and input errors counters. Giants/runts are size-related; frame may increment with alignment issues but classic pair is CRC + input errors.");
e(523, "Interface up/down state changes commonly log at notice severity. Cert expiry/TCP teardown are different messages.");
e(524, "IaaS provides infrastructure (VMs, storage, network) for the customer to manage OS/apps. SaaS is apps; PaaS is platform.");
e(525, "lldp reinit sets delay before LLDP initializes on an interface. timer/holdtime are advertisement/hold parameters; tlv-select chooses TLVs.");
e(526, "Hypervisors virtualize physical CPU, memory, and storage for VMs. They support multiple VMs; efficiency does not require a separate physical switch.");
e(527, "JSON describes structured data including objects and arrays. It is generally less verbose than XML and not HTML-like markup.");
e(528, "Only controller-based networks inherently decouple control and data planes. Traditional devices co-locate both planes.");
e(529, "ip address dhcp configures an interface as DHCP client. helper-address is relay; pool is server.");
e(530, "Unknown destination MAC → flood within VLAN except ingress port. Switches do not drop unknown unicasts by default.");
e(531, "Serial PPP OSPF defaults to network type point-to-point. Broadcast is Ethernet default.");
e(532, "Unique local (fc00::/7) is site-scoped, not Internet-routable, and used across subnets internally. Link-local is single link only; GUA is global.");
e(533, "Association Response is an 802.11 management frame type.");
e(534, "PoE power classification override can power-off/deny a port that exceeds the maximum allocated power. It is about enforcing admin power limits.");
e(535, "Voice over WLAN uses Platinum QoS profile on Cisco WLC for highest priority. Gold/Silver/Bronze are lower tiers.");
e(536, "EIGRP chooses among equal-AD paths using metric (composite). Cost is OSPF; AD would differ by protocol source; AS-path is BGP.");
e(537, "TCP provides reliability and flow control; UDP sends without receiver windowing/acks. Options reversing TCP/UDP are wrong.");
e(538, "Longest match: 10.10.1.22 is in 10.10.1.20/30 (.20–.23), more specific than /28, and not in .16/30 or /31 .20–.21 only.");
e(539, "Security training that lures users to click tests user awareness. The lure itself is social engineering technique, but the program element is awareness training.");
e(540, "With native VLAN mismatch, the trunk often still forms but native VLAN traffic is mismatched/black-holed risk—keyed as trunk forms with mismatched native VLANs issue.");
e(541, "IPv6 multicast is FF00::/8. 2000::/3 GUA; FC00::/7 ULA; FE80::/10 link-local.");
e(542, "DTP dynamic desirable + dynamic auto yields an operational trunk.");
e(543, "Strongest WPA2-PSK cipher is AES (CCMP). TKIP/RC4/WEP are weaker/legacy.");
e(544, "ipv6 address PREFIX/64 eui-64 builds IID from MAC with the specified prefix. autoconfig uses RA; dhcp is DHCPv6.");
e(545, "Four floors ~24–29 users need /27 (32 addresses) per floor and can summarize into /25. Tighter /29 is too small; /28 may be tight with growth; /23 summary oversized vs /25 plan.");
e(546, "Authentication identifies/verifies the user; authorization determines allowed access after identity is known.");
e(547, "OSPF adjacency fails when MTU mismatches (DBD exchange). Area/network/passive issues are other causes; this item keys larger MTU on Gi1/0.");
e(548, "Inside global is the public address representing inside hosts after NAT (the NAT device’s public mapping). Outside global is a real external host address.");
e(549, "DNA Center abstracts intent/policy from per-device CLI configuration, unlike traditional NMS tools.");
e(550, "WPA2-PSK uses AES-CCMP (AES-128). TKIP/RC4 are legacy; AES-256 is not the classic WPA2-PSK answer in many banks.");
e(551, "Internal EIGRP AD 90 beats OSPF 110, IS-IS 115, RIP 120 for the same prefix.");
e(552, "SNMP with IOS MIBs can retrieve/back up configurations at scale. ARP/CDP/SMTP are not config backup protocols.");
e(553, "DR neighbor reaches Full state when LSDB exchange completes. 2-way may be normal for non-DR pairs on multiaccess.");
e(554, "VTP transparent switches forward VTP advertisements but do not apply them to their own VLAN DB (and do not originate as server).");
e(555, "Lightweight mode APs are managed by WLCs via CAPWAP. Autonomous is standalone.");
e(556, "PortFast on a switch-switch link risks temporary loops because the port forwards before STP fully protects—broadcast storm risk.");
e(557, "VRRP virtual MAC is 0000.5E00.01xx (group in last octet). 0000.0C07.ACxx is HSRP.");
e(558, "DNA Center gathers via SNMP, syslog, NetFlow/telemetry and device adapters.");
e(559, "GigabitEthernet in OSPF defaults to network type broadcast (DR/BDR).");
e(560, "TCP is reliable and connection-oriented; UDP is unreliable and connectionless.");
e(561, "Notice-level often includes routing adjacency/protocol flap messages in exam items. Debug is debugging severity; restart may be higher/lower depending on message.");
e(562, "HSRP uses a virtual IP and virtual MAC shared by the group as the hosts’ gateway.");
e(563, "PortFast minimizes STP delay on edge ports by moving quickly toward forwarding, reducing client boot delays. It does not enable listening as the end state.");
e(564, "Multicast IPv6 space is FF00::/8; exam items often list FF00::/12. Unicast blocks are the other options.");
e(565, "Northbound API facilitates communication between the controller and applications/orchestration. Southbound faces physical devices.");

const TICKETS = {
  420: {
    sintoma:
      "Chamado #11420 — Conta local engineer2 deve usar o hash mais forte disponível no IOS moderno. Senha type 7 foi rejeitada pela auditoria.",
    cli_output: `R1# show running-config | include username
username engineer2 privilege 1 password 7 08324D400E1C03161E

R1# show aaa users
! local user present, weak reversible password`,
    alternativas: [
      "Recriar com username engineer2 algorithm-type scrypt secret <senha>.",
      "Manter password 7; é o mais forte no IOS.",
      "secret 4 com hash MD5 legado é recomendado atualmente.",
      "secret 5 password <hash> é a sintaxe documentada preferida.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "algorithm-type scrypt secret aplica hashing forte ao segredo local. Type 7 é reversível. Type 4 está deprecado/inseguro. Sintaxe secret 5 password é inválida/errada.",
  },
  445: {
    sintoma:
      "Chamado #11445 — Trunk 802.1Q entre SW1–SW2 deve permitir só VLANs 1–10; defaults ainda em DTP.",
    cli_output: `SW1# show interfaces gi1/0/1 switchport
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate

SW1# show running-config interface gi1/0/1
interface GigabitEthernet1/0/1
! sem trunk/dot1q/allowed`,
    alternativas: [
      "switchport mode trunk, encapsulation dot1q (se exigido), allowed vlan 1-10.",
      "ISL + desirable atende “industry-standard”.",
      "Somente channel-protocol lacp cria trunk 802.1Q.",
      "dynamic auto sozinho força 802.1Q allowed 1-10.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Padrão da indústria é 802.1Q. mode trunk + encapsulation dot1q + allowed 1-10 cumpre. ISL é proprietário; LACP é EtherChannel.",
  },
  459: {
    sintoma:
      "Chamado #11459 — Pool DHCP ok, clientes sem gateway. Servidor IOS local.",
    cli_output: `R1# show running-config | section dhcp
ip dhcp pool LAN
 network 10.10.10.0 255.255.255.0
 dns-server 8.8.8.8
! sem default-router

R1# show ip dhcp binding
! clientes com IP, sem default gateway no lease options`,
    alternativas: [
      "Adicionar default-router 10.10.10.1 no pool DHCP.",
      "ip helper-address no mesmo pool define o gateway.",
      "dns-server já envia o default gateway.",
      "default-gateway global no roteador preenche a opção DHCP automaticamente.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Opção de gateway no IOS DHCP pool é default-router. helper-address é relay. dns-server só DNS.",
  },
  490: {
    sintoma:
      "Chamado #11490 — Diagrama multivendor; só CDP habilitado; switches de terceiros não aparecem.",
    cli_output: `R1# show cdp neighbors
Capability Codes: R - Router, S - Switch
Device ID        Local Intrfce     Holdtme    Capability  Platform
SW-CISCO         Gig 0/1           150              S     WS-C2960

R1# show lldp neighbors
% LLDP is not enabled`,
    alternativas: [
      "Habilitar lldp run para descoberta IEEE multivendor.",
      "cdp run é suficiente para qualquer fabricante.",
      "cdp enable global substitui LLDP.",
      "flow-sampler-map topology mapeia vizinhos L2.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "LLDP (802.1AB) é o padrão multivendor. CDP é Cisco-only. NetFlow sampler não faz neighbor discovery.",
  },
  495: {
    sintoma:
      "Chamado #11495 — Rota estática de backup não assume quando OSPF cai.",
    cli_output: `R1# show running-config | include ip route 10.0.0.0
ip route 10.0.0.0 255.0.0.0 192.0.2.1 1

R1# show ip route 10.0.0.0
% Network not in table
! primária OSPF down; estático AD 1 deveria estar mas foi removido/ incorreto no design

R1# show run | include ip route
ip route 10.0.0.0 255.0.0.0 192.0.2.1 110
! AD 110 igual OSPF — não “flutua” acima`,
    alternativas: [
      "Floating static precisa de AD maior que a primária (ex. 210 > 110 OSPF).",
      "AD menor no backup é o mecanismo de floating.",
      "default-information originate é obrigatório para floating static.",
      "AD maior na primária transforma o backup em floating.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Backup estático deve ter AD mais alto que a rota primária para instalar só na falha. AD igual/menor compete ou prefere o estático.",
  },
  509: {
    sintoma:
      "Chamado #11509 — R1 sem gateway of last resort; destinos externos falham.",
    cli_output: `R1# show ip route
Gateway of last resort is not set
C    10.1.1.0/24 is directly connected, GigabitEthernet0/0

R1# show run | include ip route|default
! vazio`,
    alternativas: [
      "Configurar ip route 0.0.0.0 0.0.0.0 192.168.1.1.",
      "ip route default-route 192.168.1.1 é sintaxe válida.",
      "ip default-gateway em roteador com ip routing substitui default route.",
      "ip route 192.168.1.1 0.0.0.0 0.0.0.0 instala default correta.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Default = 0.0.0.0/0 via next-hop. Sintaxes inventadas/invertidas não criam gateway of last resort em roteador.",
  },
  529: {
    sintoma:
      "Chamado #11529 — Interface WAN deve obter IP do ISP via DHCP.",
    cli_output: `R1# show running-config interface gi0/0
interface GigabitEthernet0/0
 ip address 203.0.113.10 255.255.255.0
! estático

R1# show ip interface brief | include Gi0/0
Gi0/0   203.0.113.10   YES NVRAM  up  up`,
    alternativas: [
      "ip address dhcp na interface para modo cliente.",
      "ip helper-address transforma a WAN em cliente DHCP.",
      "ip dhcp pool na WAN pede endereço ao ISP.",
      "ip dhcp client sozinho basta sem ip address dhcp.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Cliente DHCP no IOS = ip address dhcp. helper/pool são relay/servidor.",
  },
  538: {
    sintoma:
      "Chamado #11538 — Pacote a 10.10.1.22 escolhe rota inesperada entre estáticas overlap.",
    cli_output: `R1# show ip route 10.10.1.22
Routing entry for 10.10.1.20/30
  Known via "static", distance 1, metric 0
  * 10.10.255.1

R1# show run | include ip route 10.10.1
ip route 10.10.1.0 255.255.255.240 10.10.255.1
ip route 10.10.1.20 255.255.255.252 10.10.255.1
ip route 10.10.1.20 255.255.255.254 10.10.255.1
ip route 10.10.1.16 255.255.255.252 10.10.255.1`,
    alternativas: [
      "Longest match: 10.10.1.20/30 inclui .22 e vence /28; /31 e .16/30 não cobrem .22.",
      "Sempre vence a rota listada primeiro no running-config.",
      "10.10.1.16/30 cobre .22 porque /30 tem 16 hosts.",
      "10.10.1.20/31 inclui .20–.23.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Longest-prefix match: .22 ∈ .20/30 (.20–.23). /28 menos específico; /31 só .20–.21; .16/30 = .16–.19.",
  },
  542: {
    sintoma:
      "Chamado #11542 — SW1 dynamic auto, SW2 dynamic desirable; validar se vira trunk.",
    cli_output: `SW1# show interfaces gi1/0/1 switchport
Administrative Mode: dynamic auto
Operational Mode: trunk
Negotiation of Trunking: On

SW2# show interfaces gi1/0/1 switchport
Administrative Mode: dynamic desirable
Operational Mode: trunk`,
    alternativas: [
      "Auto + Desirable forma trunk via DTP.",
      "Resultado é sempre access port.",
      "Link fica err-disabled.",
      "Link fica down/down por DTP.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Desirable inicia DTP; auto aceita → trunk operacional, como no show.",
  },
  547: {
    sintoma:
      "Chamado #11547 — Vizinho OSPF trava; suspeita de MTU.",
    cli_output: `R1# show ip ospf interface gi1/0
  MTU is 1600

R2# show ip ospf interface gi1/0
  MTU is 1500

R1# show ip ospf neighbor
Neighbor ID     State
2.2.2.2         EXSTART/DROTHER`,
    alternativas: [
      "MTU mismatch (1600 vs 1500) impede completar adjacência (EXSTART/EXCHANGE).",
      "passive-interface default é a única causa possível.",
      "Network command em area errada é provada só pelo MTU output.",
      "Process ID diferente bloqueia sempre em EXSTART.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "OSPF exige MTU compatível (ou ip ospf mtu-ignore). EXSTART crônico com MTU diferente é clássico. Corrigir MTU ou mtu-ignore.",
  },
  556: {
    sintoma:
      "Chamado #11556 — PortFast em uplink para outro switch; loops intermitentes.",
    cli_output: `SW-A# show spanning-tree interface gi1/0/24 detail
Port 24 is designated forwarding
The port is in the portfast mode
BPDU: sent 80, received 200

SW-A# show run interface gi1/0/24
interface GigabitEthernet1/0/24
 switchport mode trunk
 spanning-tree portfast`,
    alternativas: [
      "PortFast em link switch-switch atrasa proteção STP e aumenta risco de loop/broadcast storm.",
      "PortFast em uplink é best practice Cisco.",
      "BPDUs recebidos provam que PortFast bloqueia loops sozinho.",
      "VTP propaga por causa do PortFast.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "PortFast assume edge/host. Em switch-switch, forwarding precoce + BPDUs recebidos = risco de loop. Remover PortFast do uplink.",
  },
  498: {
    sintoma:
      "Chamado #11498 — Senhas line em claro no show run; auditoria pede ofuscação.",
    cli_output: `R1# show run | include password
line vty 0 4
 password ClearTextLab
! service password-encryption não presente`,
    alternativas: [
      "Configurar service password-encryption.",
      "enable secret ofusca todas as senhas de linha automaticamente.",
      "enable password é mais forte que secret e resolve o achado.",
      "username password encrypt é o comando global correto.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "service password-encryption aplica type 7 às senhas plaintext na config. enable secret só no enable password.",
  },
};

function buildTraditional(q) {
  let enunciado = fixOcr(q.enunciado);
  if (/which two|choose two|choose three/i.test(enunciado)) {
    chooseTwo.push(q.id);
  }
  // 522 is choose-two without phrase in cleaned text
  if (q.id === 522) chooseTwo.push(q.id);

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
    explicacao_profunda:
      EXPL[q.id] ||
      "CCNA 200-301: the correct option matches the protocol or feature behavior described in the stem.",
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
  const missing = [];
  for (const [a, b, fname] of PARTIALS) {
    const slice = all.filter((q) => q.id >= a && q.id <= b);
    const partial = slice.map((q) => {
      if (!EXPL[q.id]) missing.push(q.id);
      return {
        source_id: q.id,
        traditional: buildTraditional(q),
        ticket: buildTicket(q.id),
      };
    });
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
    missing_expl: missing,
  };
  fs.writeFileSync(path.join(__dirname, "lote_416_565_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
