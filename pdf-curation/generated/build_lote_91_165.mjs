/**
 * CCNA Forge — enrich questions 91–165 (traditional + optional ticket)
 * JSON-only transformation. No models, no PDF.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "questions_bulk_completo (1).json");
const OUT = path.join(__dirname, "lote_91_165_enriched.json");
const PARTIALS = [
  [91, 115, "partial_91_115.json"],
  [116, 140, "partial_116_140.json"],
  [141, 165, "partial_141_165.json"],
];

const answerFixes = []; // { id, from, to, reason }
const chooseTwo = [];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  let t = s;
  // word-level OCR (order: longer first for some families)
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
    [/recong/gi, "reconfig"],
    [/identication/gi, "identification"],
    [/identies/gi, "identifies"],
    [/identier/gi, "identifier"],
    [/specic/gi, "specific"],
    [/specied/gi, "specified"],
    [/prex/gi, "prefix"],
    [/benet/gi, "benefit"],
    [/ooding/gi, "flooding"],
    [/\boods\b/gi, "floods"],
    [/\bood\b/gi, "flood"],
    [/ecient/gi, "efficient"],
    [/eciency/gi, "efficiency"],
    [/trac/gi, "traffic"],
    [/rewall/gi, "firewall"],
    [/rewalls/gi, "firewalls"],
    [/\bber\b/gi, "fiber"],
    [/conicts/gi, "conflicts"],
    [/conict/gi, "conflict"],
    [/payloa\b/gi, "payload"],
    [/toot bridge/gi, "root bridge"],
    [/\brst\b/gi, "first"],
    [/\bxed\b/gi, "fixed"],
    [/lled/gi, "filled"],
    [/veries/gi, "verifies"],
    [/ow-sampler/gi, "flow-sampler"],
    [/Unied/gi, "Unified"],
    [/\boce\b/gi, "office"],
    [/BPDUlter/gi, "BPDU filter"],
    [/BPDUguard/gi, "BPDU guard"],
    [/Backbonefast/gi, "BackboneFast"],
    [/Whatis /g, "What is "],
    [/differentVLANs/g, "different VLANs"],
    [/thetopology/g, "the topology"],
    [/Choosetwo/gi, "Choose two"],
    [/Choosethree/gi, "Choose three"],
    [/user dat$/gi, "user data"],
    [/user dat\b/gi, "user data"],
    [/if LAG is enable$/gi, "if LAG is enabled"],
    [/if LAG is enable\b/gi, "if LAG is enabled"],
    [/interfacebelong/g, "interface belong"],
    [/differentrouting/g, "different routing"],
    [/VLANbased/g, "VLAN based"],
    [/theVLANs/g, "the VLANs"],
    [/tracseparation/g, "traffic separation"],
    [/transverse/gi, "traverse"],
    [/Aps /g, "APs "],
    [/APsrunning/g, "APs running"],
    [/cloud- based/g, "cloud-based"],
    [/relay on/gi, "rely on"],
    [/Howmust /g, "How must "],
    [/solutionmust/g, "solution must"],
    [/action must be taken\?/g, "action must be taken?"],
    [/with action must/g, "what action must"],
    [/802 1q/g, "802.1q"],
    [/sub interfaces/g, "subinterfaces"],
  ];
  for (const [re, rep] of pairs) t = t.replace(re, rep);
  // fix prompt leftovers like "switch(cong)#" after partial fixes
  t = t.replace(/switch\(config\)#/g, "switch(config)#");
  t = t.replace(/Device\(config\)#/g, "Device(config)#");
  t = t.replace(/R1\(config\)#/g, "R1(config)#");
  t = t.replace(/Switch\(config\)#/g, "Switch(config)#");
  // collapse double spaces
  t = t.replace(/[ \t]{2,}/g, " ").replace(/\s+\n/g, "\n").trim();
  return t;
}

function cleanAlts(alts, id) {
  let a = alts.map((x) => fixOcr(x));
  // split mangled "E." glued options
  if (a.length === 4) {
    const last = a[3];
    if (/mode activeE\./i.test(last) || /activeE\./i.test(last)) {
      // id 98
      a[3] = "interface GigabitEthernet0/0/1\nchannel-group 10 mode active";
      // keep 4 alts; drop second half (port-channel trunk) into note — replace option B or keep L3 set
    }
    if (/cdp runE\./i.test(last) || /runE\./i.test(last)) {
      a[3] = "cdp run";
    }
    // id 112 D. prefix
    a = a.map((x) => x.replace(/^D\.\s*/i, "").replace(/^C\.\s*/i, "").replace(/^B\.\s*/i, ""));
    // id 127 truncated + letter glue
    a = a.map((x) => x.replace(/^C\.\s*/i, ""));
    // id 133
    a = a.map((x) => x.replace(/^B\.\s*/i, ""));
  }
  // ensure exactly 4
  while (a.length < 4) a.push("(invalid option)");
  if (a.length > 4) a = a.slice(0, 4);
  // id-specific alt repairs
  if (id === 98) {
    a = [
      "interface GigabitEthernet0/0/1\nchannel-group 10 mode auto",
      "interface GigabitEthernet0/0/1\nchannel-group 10 mode on",
      "interface port-channel 10\nno switchport\nip address 172.16.0.1 255.255.255.0",
      "interface GigabitEthernet0/0/1\nchannel-group 10 mode active",
    ];
  }
  if (id === 99) {
    a = ["lldp run", "lldp enable", "lldp transmit", "cdp run"];
  }
  if (id === 112) {
    a = [
      "RADIUS logs all commands that are entered by the administrator, but TACACS+ logs only start, stop, and interim commands.",
      "TACACS+ separates authentication and authorization, and RADIUS merges them.",
      "TACACS+ encrypts only password information, and RADIUS encrypts the entire payload.",
      "RADIUS is most appropriate for dial authentication, but TACACS+ can be used for multiple types of authentication.",
    ];
  }
  if (id === 127) {
    a = [
      "The frames entering the interface are marked with the higher priority and then processed faster by a switch.",
      "After the cable is connected, the interface is available faster to send and receive user data.",
      "Real-time voice and video frames entering the interface are processed faster.",
      "After the cable is connected, the interface uses the fastest speed setting available for that cable type.",
    ];
  }
  if (id === 133) {
    a = [
      "The incoming and outgoing ports for traffic flow must be specified if LAG is enabled.",
      "The management interface must be reassigned if LAG is disabled.",
      "The controller must be rebooted after enabling or reconfiguring LAG.",
      "Multiple untagged interfaces on the same port must be supported.",
    ];
  }
  if (id === 92 || id === 93 || id === 100 || id === 110 || id === 141 || id === 148 || id === 160) {
    a = a.map((x) =>
      x
        .replace(/switch\(cong/gi, "switch(config")
        .replace(/Device\(cong/gi, "Device(config")
        .replace(/Switch\(cong/gi, "Switch(config")
        .replace(/R1#cong t/gi, "R1#config t")
        .replace(/R1\(cong\)#/gi, "R1(config)#")
        .replace(/\(cong\)#/gi, "(config)#")
        .replace(/\(cong-if\)#/gi, "(config-if)#")
        .replace(/\(cong-line\)#/gi, "(config-line)#")
    );
  }
  // command prompts remaining cong
  a = a.map((x) =>
    fixOcr(x)
      .replace(/\(cong\)/g, "(config)")
      .replace(/\(cong-/g, "(config-")
      .replace(/#cong t/g, "#config t")
  );
  return a.map((x) => x.trim());
}

/** Curated deep explanations (technical 4–10 lines) */
const EXPL = {
  91: "PortFast is intended for edge ports connected to end hosts. If enabled toward another switch, the port skips listening/learning and goes straight to forwarding. A switching loop can form before STP detects it via BPDUs, raising the risk of broadcast storms. PortFast does not accelerate root-port recalculation like UplinkFast/BackboneFast, does not shut ports on BPDU by itself (that is BPDU Guard), and is unrelated to VTP propagation.",
  92: "The LLDP port-description TLV is controlled with the global command lldp port-description (or via tlv-select depending on platform family). It is not an interface-only proprietary subcommand in the form shown for option A on classic IOS, nor a line-configuration or privileged-exec-only setting. Global configuration mode is required so the TLV is included in LLDP advertisements system-wide.",
  93: "spanning-tree vlan 750 root primary is the recommended macro that sets a low priority (typically 24576, or lower if needed) so the switch becomes root for that VLAN without manually picking an invalid priority value. Priority 0 also forces root but is not the option marked here. Priorities must be multiples of 4096; values like 38418607 or 614440 are invalid/not guaranteed. root primary is the operational best-practice answer in this item.",
  94: "Lightweight mode APs join a WLC via CAPWAP and are centrally managed (SSIDs, RF, security). Autonomous APs are standalone. Bridge mode is for wireless bridging/mesh roles. Mobility Express is a virtual controller on an AP, not the AP operating mode that defines WLC management of classic lightweight APs.",
  95: "lldp reinit sets the delay (in seconds) before LLDP initializes on an interface after a status change. lldp timer sets the transmit interval of LLDP frames. lldp holdtime sets the TTL/hold multiplier advertised to neighbors. lldp tlv-select chooses which TLVs are sent, not initialization delay.",
  96: "DTP: dynamic desirable actively tries to trunk; dynamic auto waits passively. Desirable + Auto results in an operational trunk. Auto+Auto stays access. The link does not error-disable or go down solely from this DTP pair.",
  97: "802.11b (2.4 GHz) has only three nonoverlapping channels (1, 6, 11 in most regions). Best practice is to assign nonoverlapping channels to nearby APs to reduce co-channel interference. Disabling TCP is nonsense for RF design. Capping clients at 5 Mbps or forcing 54 Mbps is not an 802.11b best practice (802.11b max is 11 Mbps).",
  98: "Layer 3 EtherChannel with an open standard uses LACP (channel-group mode active or passive) plus a routed port-channel (no switchport and an IP address). Mode auto is PAgP (Cisco proprietary). Mode on is static EtherChannel without negotiation. The two required pieces in this cleaned set are: port-channel L3 config and member interfaces in mode active (LACP).",
  99: "On Cisco IOS ISR, LLDP is enabled globally with lldp run. There is no global lldp enable as the primary enable command. lldp transmit is interface-level. cdp run enables CDP, a different protocol.",
  100: "lldp reinit <seconds> configures the initialization delay; lldp reinit 5 sets 5 seconds. Values are in seconds, not milliseconds, so 5000 is wrong. lldp timer is the advertisement interval; lldp holdtime is neighbor hold time.",
  101: "STP prevents Layer-2 loops by electing a loop-free active topology and placing redundant ports in Blocking/Discarding so frames are not forwarded in both directions around a loop. TTL is Layer 3. MAC learning alone does not break loops. Collision avoidance is CSMA/CD (legacy half-duplex), not STP.",
  102: "The root port on a non-root bridge is the port that receives the best BPDU (lowest path cost to the root, with tie-breakers). Designated ports send the best BPDU on a segment. Alternate/backup are RSTP roles for discarded redundant paths, not the port that hears the best BPDU toward the root.",
  103: "When multiple ports could become root or designated, STP uses port priority (and port ID) as a tie-breaker. Lower port priority makes an interface preferred. Interface number alone is not a configurable preference knob beyond its contribution to Port ID. VLAN priority is bridge priority. Hello time is a timer, not a forwarding preference.",
  104: "CDP is Cisco-proprietary Layer-2 neighbor discovery. It does not run at the network layer as a routed protocol, and while it can learn about Cisco devices including some security platforms, the defining true statement among the options is that it is Cisco proprietary. It operates over the data link (not physical+network as stated).",
  105: "Inter-VLAN communication requires a Layer-3 device. Router-on-a-stick uses subinterfaces (802.1Q tags) on one physical link to the switch. A single IP on the physical interface only serves one subnet/VLAN. Access links and trunks between switches extend VLANs at Layer 2 but do not route between them.",
  106: "LLDP (IEEE 802.1AB) is open-standard and is enabled/configured in global configuration mode (lldp run). It is not Cisco-proprietary (that is CDP). Timers such as reinit/timer/holdtime are configurable, not fixed. It runs at the data-link layer, not the transport layer.",
  107: "Cisco WSA (Web Security Appliance) provides web proxy, URL filtering, and caching to improve and control web traffic. Firepower/ASA/FireSIGHT are NGFW/IPS/management platforms, not the primary proxy-caching web security product in this list.",
  108: "Root port selection order: (1) lowest root path cost, then (2) lowest neighbor bridge ID, (3) lowest neighbor port ID, (4) lowest local port ID. Therefore the first criterion is lowest path cost to the root bridge.",
  109: "On VTP-aware Catalyst platforms, VLAN creation requires VTP server or transparent mode; client mode cannot create VLANs. Extended VLAN nuances and transparent save behavior are secondary and partially imprecise in the distractors. Dynamic inter-VLAN routing is not defined as VLAN2–4064 in that form.",
  110: "Multivendor neighbor discovery uses LLDP (IEEE 802.1AB). lldp run enables it globally on Cisco devices so third-party gear can be mapped. CDP is Cisco-proprietary and may not be understood by non-Cisco nodes. Interface cdp enable only affects CDP. flow-sampler-map is NetFlow-related, not topology discovery.",
  111: "AAA: Authentication identifies/validates users; Authorization determines access rights; Accounting tracks services/commands/time. The correct pairing is authentication identifies users and accounting tracks user services.",
  112: "TACACS+ separates authentication, authorization, and accounting and can authorize commands granularly. RADIUS typically combines authentication and authorization and is UDP-based. RADIUS encrypts only the password (not the full payload); TACACS+ encrypts the TACACS body. The reverse encryption statement is a common trap.",
  113: "In local (centralized) mode, an AP builds CAPWAP tunnels to the WLC (control and data) so user traffic is often centrally switched. FlexConnect can locally switch traffic at the AP when configured and can still serve clients if WLC connectivity is lost (with caveats). Autonomous behavior is not local mode. Saying FlexConnect always fails without WLC is false for local switching.",
  114: "PortFast moves an edge port immediately to the forwarding state, skipping listening and learning delays of classic STP. It does not place the port in blocking/listening/learning as the steady end state for an edge host port.",
  115: "When administrators access the WLC GUI via HTTPS, the controller presents (and can generate) a local web administration SSL certificate for that secure HTTP session. RADIUS/TACACS+ are AAA backends. Plain HTTP is not the protocol that drives SSL cert generation for secure GUI access.",
  116: "Interoperable VLAN trunking with third-party switches uses IEEE 802.1Q. ISL is Cisco-proprietary and obsolete for multivendor links. DSCP is L3 QoS marking. 802.1p refers to CoS bits within 802.1Q, not the trunk encapsulation choice itself.",
  117: "switchport mode dynamic desirable makes the interface actively send DTP to form a trunk. dynamic auto is passive. mode trunk forces trunk without relying on desirable negotiation behavior as asked. nonegotiate disables DTP.",
  118: "If the neighbor is trunk or desirable, setting this side to dynamic auto still forms a trunk (auto+desirable or auto+trunk operationally yields trunk in classic DTP matrices when the other side initiates/forces). The curated answer per source is dynamic auto. nonegotiate would break DTP; desirable also works but is not the keyed option.",
  119: "PortFast bypasses listening/learning and goes to forwarding on edge ports. BPDU Guard err-disables on BPDU. BPDU Filter stops BPDU send/receive. BackboneFast optimizes indirect link failure recovery.",
  120: "Switches learn source MACs from ingress frames and populate the CAM/MAC table. Until traffic arrives, dynamic entries for those hosts are absent. Switches do not learn by reading another switch’s CAM wholesale. The other options confuse port security limits with ordinary dynamic learning.",
  121: "Priority 0 is the lowest bridge priority and guarantees this switch wins root election for VLAN 200 (assuming unique MAC tie-break). root primary sets a low priority but not absolute 0. Invalid large priorities are rejected or ineffective. For “always the root,” priority 0 is the keyed answer here.",
  122: "VTP: a switch with a higher revision can overwrite the domain VLAN database. Before inserting an old switch, ensure its revision is lower (e.g., change domain temporarily, set transparent, etc.). Higher revision is dangerous. DTP modes do not protect the VLAN database from VTP sync.",
  123: "802.1X provides identity-based network access control and can force authentication/posture before full access. 802.11n is a Wi-Fi PHY. MAB authenticates by MAC without user credentials. IPSG filters IP/MAC bindings but is not the primary identity onboarding framework.",
  124: "Cisco APs and many PoE endpoints use CDP (and/or LLDP) TLVs so the switch can apply the correct PoE power class/allocation. IGMP is multicast. AWPP is outdoor mesh. NDP is IPv6 neighbor discovery.",
  125: "SA Query / Security Association teardown protection mitigates spoofed association floods by requiring SA Query exchanges and applying a timeout/comeback behavior. The distractors misuse MAC filtering, plain 802.1X timers, or PMF comeback without the SA Query protection pairing described.",
  126: "The native VLAN carries untagged frames on an 802.1Q trunk. switchport trunk native vlan 10 sets VLAN 10 as untagged. encapsulation/mode trunk enable tagging capability; allowed vlan only filters VLANs.",
  127: "PortFast shortens STP convergence on access/edge ports so the link forwards user data almost immediately after link-up. It is not a CoS remarking feature, not a voice accelerator by itself, and does not change Ethernet speed negotiation.",
  128: "Unknown unicast flooding occurs when the destination MAC is not in the MAC table; the frame is flooded within the VLAN (except ingress port). Unknown source addresses are learned, not flooded for that reason. Zero or identical MACs are not the standard flood trigger described.",
  129: "Lightweight mode depends on a WLC for configuration, roaming coordination, and SSID push via CAPWAP. Autonomous is self-contained. Bridge/repeater are specialized RF roles.",
  130: "802.1X authenticates users/devices by identity (credentials/certificates) at the access edge. DAI and DHCP snooping mitigate spoofing but are not identity frameworks. Non-default native VLAN is a best practice against VLAN hopping, not identity.",
  131: "In centralized local-mode designs, lightweight APs typically connect via access ports in the AP management VLAN; user VLANs are tunneled in CAPWAP. Trunks are used in some FlexConnect/local-switching designs, but the standard centralized answer is access mode.",
  132: "VLANs segment a switch into separate broadcast domains. STP breaks loops within a broadcast domain. VTP propagates VLAN metadata. CSMA/CD is media access for half-duplex Ethernet.",
  133: "On AireOS WLCs, enabling/changing/removing LAG requires a controller reboot for the port-channel membership to apply cleanly. Distractors about specifying in/out ports or mandatory untagged multiples are incorrect. (If a dump keys management reassignment, still the operational hard requirement is reboot—see answer fix log if applied.)",
  134: "When an autonomous AP maps multiple WLANs to multiple VLANs, the wired uplink must be a trunk carrying those VLAN tags. A single access port carries one VLAN only. LAG/EtherChannel may bundle links but do not replace the need for trunk encapsulation of multiple VLANs.",
  135: "channel-group mode active uses LACP (IEEE 802.3ad), the open standard. LLDP is discovery. vPC is Nexus multi-chassis. 802.1Q is VLAN tagging, not the bundling negotiation protocol.",
  136: "switchport priority extend trust makes the phone trust the CoS of frames received from the PC so the switch processes PC traffic with the priority the phone presents (trusted). Setting a fixed CoS 7 overrides. voice vlan dot1p/untagged change voice tagging behavior, not PC priority trust.",
  137: "TACACS+ separates authentication and authorization (and accounting), enabling distinct policy handling. RADIUS generally combines authN/authZ. 802.1X is a port framework that can use either AAA backend. Kerberos is not the standard AP management AAA split described here. (Answer corrected when source keyed RADIUS incorrectly.)",
  138: "spanning-tree portfast (without trunk keyword) applies to access ports. Trunk edge needs spanning-tree portfast trunk. L3 interfaces are not classic STP access edge ports for this command form.",
  139: "Standard IP phone + PC design: access port in data VLAN 20 with voice VLAN 30 so untagged PC traffic is VLAN 20 and tagged voice is VLAN 30 when CDP detects the phone. Trunking the interface as a full trunk is unnecessary and not the clean requirement set. (Corrected to access+voice when source keyed trunk incorrectly.)",
  140: "The MAC address table is built from source MAC addresses of ingress frames on each port. VTP/DTP do not populate unicast CAM entries. Egress traffic is not the learning direction.",
  141: "spanning-tree vlan <id> forward-time sets the listening and learning duration (forward delay) used by timers in PVST/Rapid PVST compatibility modes. priority elects root. hello-time is BPDU interval. max-age is BPDU aging. Only forward-time matches “listens and learns for a specific time period.”",
  142: "Autonomous APs do not depend on a cloud/controller underlay for basic operation but are harder to maintain at scale. Cloud-managed APs need connectivity to the management service and are usually easier to maintain centrally. The other statements reverse complexity or automation facts.",
  143: "With PortFast, Rapid PVST+ edge ports skip intermediate learning delays and move quickly to forwarding; the learning state is bypassed on that edge path. Forwarding is the desired end state. Discarding/blocking may still apply to non-edge roles, but the classic teaching point is skipping learning/listening.",
  144: "Store-and-forward buffers the entire frame and uses FCS/CRC to drop damaged frames, improving effective error-free delivery at the cost of latency. Cut-through reduces latency by starting forward earlier and does less complete error checking. Forwarding regardless of errors is not store-and-forward.",
  145: "The WLC service port is the out-of-band management interface in Cisco Unified Wireless Network architecture. AP-Manager handles AP CAPWAP. Dynamic interfaces map WLANs/VLANs. Virtual is for mobility/web auth redirection.",
  146: "CAPWAP is used by lightweight APs to communicate with a WLC. Autonomous APs do not use CAPWAP to a controller for primary management. Bridge/route are not the CAPWAP client mode names.",
  147: "PortFast places edge ports into forwarding immediately (with STP still running). BPDU Guard protects PortFast ports. UplinkFast/BackboneFast speed up recovery after failures but do not make every plugged cable forward instantly like PortFast on an edge port.",
  148: "spanning-tree portfast default enables PortFast globally on all access ports so a connected PC reaches forwarding quickly. bpduguard default is protection, not the PortFast enable itself. portfast trunk is for trunk edges. no portfast disables it.",
  149: "WLC LAG bundles are static EtherChannels: switch side must use channel-group mode on (no PAgP/LACP negotiation with classic AireOS LAG). active/passive/desirable are negotiation modes not used for standard WLC LAG.",
  150: "VLAN tagging (802.1Q) inserts a tag so multiple VLANs share a trunk while keeping traffic separated. DSCP is L3. VLAN ID numbering alone does not encapsulate. “Marking” is ambiguous QoS language.",
  151: "The SSID is the network name clients use to discover and maintain association with the WLAN. VLAN ID is wired segmentation. RFID is asset tracking. WLAN ID is a controller object index, not the RF identifier clients scan.",
  152: "With a third-party ISP router, enable LLDP globally (lldp run) for standards-based neighbor discovery. CDP may be disabled toward the ISP as hygiene, but the positive next step to complete multivendor discovery is LLDP. You do not configure the ISP router from the enterprise exam item perspective.",
  153: "If the destination MAC is unknown, the switch floods the frame out all ports in that VLAN except the ingress port. It learns from source MACs, not by writing the unknown destination as a learned entry. It does not alter checksums or shut ports for ordinary unknown unicasts.",
  154: "Default MAC address aging time on Cisco Catalyst switches is 300 seconds. After 300s without frames from that source, the dynamic entry is removed.",
  155: "802.11v features such as Disassociation Imminent help steer/roam clients more intelligently to reduce sticky-client delays as devices move. 802.11k neighbor lists also assist roaming; this item keys 802.11v Disassociation Imminent. 802.11ax BSS config is not the specific association-time minimizer named here.",
  156: "Legitimate APs seen as rogues should be classified as Friendly (or internal) so alarms stop without containment. Manual containment is for actual threats and can disrupt a legitimate AP. Removing from WLC management or Pending state does not correctly clear a rogue alarm for an outside autonomous AP MAC.",
  157: "LAG on a WLC bundles multiple physical distribution ports for higher throughput and link redundancy with load balancing toward the neighboring switch. It is not primarily a management-frame encryption feature nor per-port VLAN failover magic.",
  158: "During join, the AP sends CAPWAP Discovery Request messages toward candidate controllers (including AP-Manager addressing as applicable). Discovery Response comes from the WLC. DHCP Discover/Request obtain an IP address for the AP, not the CAPWAP join message to AP-Manager.",
  159: "Allow AAA Override lets RADIUS/ISE return attributes (Interface/VLAN, ACL, QoS) that override WLAN defaults so users land on credential-specific VLANs. LAG and EDRRM are unrelated. MIC AP auth-list is about AP authorization, not client VLAN assignment.",
  160: "A default route is ip route 0.0.0.0 0.0.0.0 192.168.1.1. ip default-gateway is for non-routing hosts. Invented syntax default-route is invalid. Swapping network/mask/next-hop order is wrong.",
  161: "Longest-match routing: 10.10.1.22 falls in 10.10.1.20/30 ( .20–.23 ) which is more specific than 10.10.1.0/28. 10.10.1.16/30 is .16–.19 (does not include .22). 10.10.1.20/31 is .20–.21 only. Therefore 10.10.1.20/30 wins.",
  162: "When the same prefix is learned via multiple routing sources, Cisco IOS installs the route with the lowest administrative distance. Metrics are compared within the same protocol. Prefix length would mean different prefixes (longest match), not equal /24s. Highest next-hop IP is irrelevant.",
  163: "A floating static route is a backup with a higher administrative distance than the primary route so it is installed only when the primary is withdrawn. Lower AD would make it preferred, not backup. default-information originate is OSPF/BGP redistribution of defaults, not the floating static mechanism.",
  164: "By default, OSPF treats Ethernet/GigabitEthernet as network type broadcast (DR/BDR election). Point-to-point/nonbroadcast/point-to-multipoint require explicit configuration or different media.",
  165: "Between different routing protocols, administrative distance selects which source is trusted for a given prefix. Metrics are protocol-specific and not directly comparable across protocols. Hop count is RIP’s metric. Dual algorithm refers to EIGRP internals, not inter-protocol selection.",
};

/** Optional tickets: only realistic CLI troubleshooting */
const TICKETS = {
  91: {
    sintoma:
      "Chamado #8091 — Porta Gi1/0/24 entre SW-ACCESS e SW-DIST foi configurada com PortFast “para acelerar o link”. Após um recabo, usuários reportam lentidão extrema e loops intermitentes na VLAN 10. Broadcasts disparam CPU no access.",
    cli_output: `SW-ACCESS# show spanning-tree interface gi1/0/24 detail
Port 24 (GigabitEthernet1/0/24) of VLAN0010 is designated forwarding
   Port path cost 4, Port priority 128, Port Identifier 128.24.
   Designated root has priority 32768, address 0011.2233.4455
   The port is in the portfast edge mode
   Link type is point-to-point by default
   BPDU: sent 120, received 340

SW-ACCESS# show running-config interface gi1/0/24
interface GigabitEthernet1/0/24
 description UPLINK-TO-DIST
 switchport mode trunk
 spanning-tree portfast
! (sem bpduguard)

SW-DIST# show spanning-tree vlan 10 | include blocked|BLK|Altn
Gi1/0/1            Altn BLK 4         128.1    P2p`,
    alternativas: [
      "PortFast em uplink para outro switch coloca a porta em forwarding cedo demais; STP atrasa a detecção do loop e aumenta risco de broadcast storm.",
      "PortFast em trunk sempre desliga VTP e por isso a VLAN 10 oscila.",
      "O problema é apenas hello-time alto; PortFast em switch-switch é best practice Cisco.",
      "BPDU received prova que PortFast bloqueia automaticamente qualquer loop sem risco.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "PortFast (edge) assume host final. Em link switch-switch, a porta vai a forwarding antes da convergência completa; se houver caminho alternativo, frames podem loopar até STP reagir. O output mostra portfast edge em uplink com BPDUs recebidos — sinal claro de vizinho STP. Correção: remover PortFast do uplink e usar uplink/trunk normal; se PortFast for mantido por engano, ao menos BPDU Guard err-disable a porta ao ver BPDU. VTP e hello-time não explicam o sintoma principal.",
  },
  93: {
    sintoma:
      "Chamado #8093 — A gerência exige que SW-CORE1 seja sempre root da VLAN 750. Após manutenção, SW-CORE2 (priority default) tornou-se root e o uplink preferencial ficou Alternate/Blocking.",
    cli_output: `SW-CORE1# show spanning-tree vlan 750
VLAN0750
  Spanning tree enabled protocol rstp
  Root ID    Priority    32768
             Address     00aa.bbcc.0002
  Bridge ID  Priority    32768  (priority 32768 sys-id-ext 750)
             Address     00aa.bbcc.0001

SW-CORE2# show spanning-tree vlan 750 bridge
Vlan             Bridge ID
VLAN750       32768 00aa.bbcc.0002

SW-CORE1# show running-config | include spanning-tree vlan 750
! (nenhum comando de root/priority)`,
    alternativas: [
      "Aplicar spanning-tree vlan 750 root primary em SW-CORE1 para forçar prioridade baixa e reassumir o root.",
      "Configurar priority 38418607 em SW-CORE1; qualquer número alto garante root.",
      "Root é eleito só por MAC; comandos de priority são ignorados em RSTP.",
      "Basta PortFast global para eleger root da VLAN 750.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Com priorities iguais (32768), vence o menor MAC — SW-CORE2. root primary ajusta a priority para um valor baixo (tipicamente 24576) garantindo SW-CORE1 como root. Priorities inválidas/altas não ajudam. PortFast não elege root.",
  },
  96: {
    sintoma:
      "Chamado #8096 — Time de campus migrou DTP: SW1 Gi1/0/1 em dynamic auto e SW2 Gi1/0/1 em dynamic desirable. Precisam confirmar se o link vira trunk ou access antes de liberar VLANs 20–40.",
    cli_output: `SW1# show interfaces gi1/0/1 switchport
Name: Gi1/0/1
Administrative Mode: dynamic auto
Operational Mode: trunk
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: dot1q
Negotiation of Trunking: On

SW2# show interfaces gi1/0/1 switchport
Name: Gi1/0/1
Administrative Mode: dynamic desirable
Operational Mode: trunk
Negotiation of Trunking: On

SW1# show interfaces trunk
Port        Mode             Encapsulation  Status        Native vlan
Gi1/0/1     desirable        802.1q         trunking      1`,
    alternativas: [
      "Auto + Desirable forma trunk via DTP; Operational Mode trunk confirma o resultado.",
      "Auto + Desirable sempre resulta em access port.",
      "A combinação coloca ambos em err-disabled.",
      "DTP com desirable derruba o link (down/down).",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Dynamic desirable inicia negociação DTP; dynamic auto aceita. Resultado operacional: trunk. O show switchport confirma Operational Mode: trunk. Não há err-disable nem down por essa matriz DTP.",
  },
  105: {
    sintoma:
      "Chamado #8105 — Hosts na VLAN 10 pingam entre si; hosts na VLAN 20 pingam entre si; não há tráfego inter-VLAN. Existe apenas L2 entre access e um roteador R1 com um único cabo no switch (Gi0/1).",
    cli_output: `SW1# show vlan brief
VLAN Name       Status    Ports
10   USERS      active    Gi1/0/2, Gi1/0/3
20   VOICE      active    Gi1/0/4, Gi1/0/5

SW1# show interfaces gi1/0/1 switchport
Administrative Mode: static access
Access Mode VLAN: 10 (USERS)

R1# show ip interface brief
Interface     IP-Address      Status
Gi0/1         10.10.10.1      up

R1# show vlan
% Ambiguous command / sem subinterfaces 802.1Q`,
    alternativas: [
      "Falta router-on-a-stick: subinterfaces 802.1Q no roteador + trunk no switch para rotear entre VLANs.",
      "Basta outro access link entre dois switches para rotear VLAN 10↔20.",
      "Um único IP no physical do roteador na VLAN 10 já roteia todas as VLANs.",
      "STP bloqueia inter-VLAN por padrão até root primary.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "VLANs são broadcast domains separados; só um dispositivo L3 interliga. Com um cabo, o padrão é trunk no switch + subinterfaces no roteador (encapsulation dot1Q 10/20 e IPs de gateway). Access na VLAN 10 + um IP só atende a VLAN 10. Trunk entre switches não roteia. STP não substitui roteamento inter-VLAN.",
  },
  117: {
    sintoma:
      "Chamado #8117 — Link entre SW-A e SW-B permanece access. SW-B está em dynamic auto. O engenheiro precisa que SW-A tente ativamente formar trunk.",
    cli_output: `SW-A# show interfaces gi1/0/1 switchport
Administrative Mode: dynamic auto
Operational Mode: static access
Negotiation of Trunking: On

SW-B# show interfaces gi1/0/1 switchport
Administrative Mode: dynamic auto
Operational Mode: static access`,
    alternativas: [
      "Configurar switchport mode dynamic desirable em SW-A para iniciar DTP e formar trunk com auto.",
      "Configurar switchport nonegotiate para forçar DTP ativo.",
      "dynamic auto em ambos já forma trunk automaticamente.",
      "Somente lldp run cria trunk 802.1Q.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Auto+Auto não inicia trunk. Desirable envia DTP e combina com auto → trunk. nonegotiate desliga DTP. LLDP não negocia encapsulamento de trunk.",
  },
  126: {
    sintoma:
      "Chamado #8126 — Frames da VLAN 10 precisam cruzar o trunk untagged (nativa). Hosts na VLAN 10 perdem conectividade inter-switch; VLANs tagged 20/30 ok.",
    cli_output: `SW1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi1/0/24    on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi1/0/24    1,10,20,30

SW1# show running-config interface gi1/0/24
interface GigabitEthernet1/0/24
 switchport mode trunk
 switchport trunk allowed vlan 1,10,20,30
! (native default 1)`,
    alternativas: [
      "Configurar switchport trunk native vlan 10 para enviar/receber VLAN 10 untagged no trunk.",
      "switchport trunk allowed vlan 10 remove o tag mas mantém native 1 sem impacto.",
      "switchport mode access é obrigatório para untagged multi-VLAN.",
      "Apenas switchport trunk encapsulation dot1q muda a native para 10.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "No 802.1Q, a native VLAN é untagged. Com native 1, frames da VLAN 10 saem tagged e podem quebrar desenhos que esperam untagged-10. native vlan 10 alinha o comportamento. allowed vlan só filtra; mode access não é trunk; encapsulation não define native sozinha.",
  },
  128: {
    sintoma:
      "Chamado #8128 — Captura na VLAN 40 mostra o mesmo unicast replicado em várias portas. Destino 0050.56de.ad01 não está na CAM.",
    cli_output: `SW1# show mac address-table address 0050.56de.ad01
% Unicast MAC address not found in MAC address table

SW1# show mac address-table dynamic vlan 40
Vlan    Mac Address       Type        Ports
40      0050.56aa.0001    DYNAMIC     Gi1/0/2
40      0050.56aa.0002    DYNAMIC     Gi1/0/3`,
    alternativas: [
      "Destino desconhecido → flooding do frame nas portas da VLAN (exceto origem).",
      "Fonte desconhecida causa flood do frame de dados.",
      "Switch altera FCS para invalidar o frame quando MAC falta.",
      "Flood só ocorre se source=destination MAC.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Unknown unicast: sem entrada CAM para o destino, o switch flooda na VLAN. A aprendizagem é pelo source MAC. Não se corrompe FCS nem se exige source=destination.",
  },
  153: {
    sintoma:
      "Chamado #8153 — Servidor novo na VLAN 50; primeiros pings geram tráfego em todas as portas da VLAN até o MAC ser aprendido.",
    cli_output: `SW-DC# show mac address-table dynamic vlan 50
Vlan    Mac Address       Type        Ports
50      0011.2233.4401    DYNAMIC     Gi1/0/10
! servidor 0011.2233.99aa ainda ausente

SW-DC# show interfaces gi1/0/11 status
Port      Name       Status       Vlan
Gi1/0/11  NEW-SRV    connected    50`,
    alternativas: [
      "Sem MAC de destino na tabela, o switch flooda o frame inalterado nas demais portas da VLAN de ingresso.",
      "O switch grava o destino na CAM antes de encaminhar e nunca flooda.",
      "O switch err-disable a porta quando o destino é desconhecido.",
      "O frame é descartado até existir entrada estática manual.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Comportamento clássico de unknown unicast flooding na VLAN. Depois que o servidor responde, o source MAC é aprendido e o unicast passa a ser filtrado para a porta correta.",
  },
  160: {
    sintoma:
      "Chamado #8160 — R1 não encaminha destinos desconhecidos à Internet edge 192.168.1.1. Rotas específicas ok; tudo mais falha.",
    cli_output: `R1# show ip route
Gateway of last resort is not set
      10.0.0.0/8 is variably subnetted...
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0

R1# show running-config | include ip route|default
ip route 10.2.2.0 255.255.255.0 10.1.1.2
! sem default route`,
    alternativas: [
      "Configurar ip route 0.0.0.0 0.0.0.0 192.168.1.1 para gateway of last resort.",
      "Usar ip default-gateway 192.168.1.1 em roteador com ip routing (substitui default route).",
      "ip route 192.168.1.1 0.0.0.0 0.0.0.0 instala default válida.",
      "ip route default-route 192.168.1.1 é a sintaxe IOS padrão.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Default route = 0.0.0.0/0 via next-hop. Em roteador com routing ativo, ip default-gateway não substitui a tabela de roteamento como em host. Sintaxes invertidas/inventadas não instalam gateway of last resort.",
  },
  161: {
    sintoma:
      "Chamado #8161 — Pacotes a 10.10.1.22 escolhem next-hop inesperado. Várias estáticas overlap existem.",
    cli_output: `R1# show ip route 10.10.1.22
Routing entry for 10.10.1.20/30
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  * 10.10.255.1

R1# show running-config | include ip route 10.10.1
ip route 10.10.1.0 255.255.255.240 10.10.255.1
ip route 10.10.1.20 255.255.255.252 10.10.255.1
ip route 10.10.1.16 255.255.255.252 10.10.255.1
ip route 10.10.1.20 255.255.255.254 10.10.255.1`,
    alternativas: [
      "Longest match: 10.10.1.20/30 cobre .20–.23 e inclui .22; vence /28 e não-cobertura de /30.16 e /31.",
      "Sempre vence a rota com maior máscara decimal listada primeiro no config.",
      "10.10.1.16/30 inclui .22 porque /30 cobre 16 endereços.",
      "10.10.1.20/31 inclui .22 (.20 e .21 only é falso).",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "IOS usa longest-match. .22 ∈ 10.10.1.20/30 (.20–.23). /28 também cobre mas é menos específico. .16/30 = .16–.19. /31 = .20–.21. Logo a estática /30 .20 é a escolhida.",
  },
  163: {
    sintoma:
      "Chamado #8163 — Rota primária OSPF para 172.16.0.0/16 cai, mas o backup estático não entra na tabela.",
    cli_output: `R1# show running-config | include ip route 172.16
ip route 172.16.0.0 255.255.0.0 10.0.0.2 1

R1# show ip route 172.16.0.0
Routing entry for 172.16.0.0/16
  Known via "ospf 1", distance 110, metric 20

! link OSPF down:
R1# show ip route 172.16.0.0
% Network not in table
! estático também some da candidatura efetiva — AD 1 competia como primária, não floating`,
    alternativas: [
      "Floating static precisa de AD maior que a primária (ex. 210 > 110 OSPF) para ficar de backup.",
      "Floating static deve ter AD menor que OSPF para ser backup.",
      "default-information originate é obrigatório para qualquer floating static.",
      "AD maior na rota primária é o mecanismo de floating static.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Com AD 1 o estático é sempre preferido a OSPF (110) quando presente; não é floating. Configure ip route ... 210 (ou similar) para instalar só quando a primária sumir. default-information originate não define floating static.",
  },
};

function maybeFixAnswer(id, idx, enunciado, alts) {
  // Clear enunciado × answer conflicts only
  if (id === 133) {
    // Requirement when enabling/removing LAG: reboot controller
    if (idx !== 2) {
      answerFixes.push({
        id,
        from: idx,
        to: 2,
        reason: "LAG enable/remove on WLC requires controller reboot (not management reassignment as primary requirement).",
      });
      return 2;
    }
  }
  if (id === 137) {
    // separate authN and authZ → TACACS+
    if (idx !== 1) {
      answerFixes.push({
        id,
        from: idx,
        to: 1,
        reason: "Separate authentication and authorization → TACACS+; RADIUS merges them.",
      });
      return 1;
    }
  }
  if (id === 139) {
    // access + voice vlan is correct design
    if (idx !== 1) {
      answerFixes.push({
        id,
        from: idx,
        to: 1,
        reason: "IP phone data+voice: access VLAN 20 + voice VLAN 30, not full trunk as best answer.",
      });
      return 1;
    }
  }
  if (id === 156) {
    // Friendly classification, not containment
    if (idx !== 3) {
      answerFixes.push({
        id,
        from: idx,
        to: 3,
        reason: "Legitimate AP alarms stop by classifying as Friendly; containment is for true rogues.",
      });
      return 3;
    }
  }
  if (id === 158) {
    // CAPWAP Discovery request to controller / AP-manager path
    if (idx !== 3) {
      answerFixes.push({
        id,
        from: idx,
        to: 3,
        reason: "AP join uses CAPWAP Discovery Request; DHCP Discover is for addressing only.",
      });
      return 3;
    }
  }
  // 113: option about two CAPWAP tunnels is accepted in many dumps for local mode
  // 155: keep source
  return idx;
}

function buildTraditional(q) {
  const enunciado = fixOcr(q.enunciado);
  if (/choose two|choose three/i.test(enunciado)) chooseTwo.push(q.id);
  const alternativas = cleanAlts(q.alternativas, q.id);
  let resposta = maybeFixAnswer(q.id, q.resposta_correta, enunciado, alternativas);
  if (resposta < 0 || resposta > 3) resposta = 0;
  const explicacao_profunda = EXPL[q.id] || "See CCNA 200-301 topic for this item.";
  return {
    id: q.id,
    question_type: "traditional",
    isPremium: true,
    enunciado,
    alternativas,
    resposta_correta: resposta,
    explicacao_profunda,
  };
}

function buildTicket(q, respostaTrad) {
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
    const partial = slice.map((q) => {
      const traditional = buildTraditional(q);
      const ticket = buildTicket(q, traditional.resposta_correta);
      return { source_id: q.id, traditional, ticket };
    });
    fs.writeFileSync(path.join(__dirname, fname), JSON.stringify(partial, null, 2));
    console.log("wrote", fname, partial.length);
    merged.push(...partial);
  }
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 2));
  const tickets = merged.filter((x) => x.ticket).length;
  const nulls = merged.filter((x) => x.ticket === null).length;
  const report = {
    file: OUT,
    traditional: merged.length,
    tickets,
    tickets_null: nulls,
    answer_fixes: answerFixes,
    choose_two_ids: chooseTwo,
    ticket_ids: merged.filter((x) => x.ticket).map((x) => x.source_id),
  };
  fs.writeFileSync(path.join(__dirname, "lote_91_165_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
