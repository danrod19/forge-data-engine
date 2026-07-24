/**
 * CCNA Forge — enrich questions 266–415 (150 items)
 * JSON-only. No models, no PDF.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "questions_bulk_completo (1).json");
const OUT = path.join(__dirname, "lote_266_415_enriched.json");
const PARTIALS = [
  [266, 315, "partial_266_315.json"],
  [316, 365, "partial_316_365.json"],
  [366, 415, "partial_366_415.json"],
];

const answerFixes = [];
const chooseTwo = [];

function fixOcr(s) {
  if (typeof s !== "string") return s;
  let t = s;
  const pairs = [
    [/conguration/gi, "configuration"],
    [/congurations/gi, "configurations"],
    [/congured/gi, "configured"],
    [/congures/gi, "configures"],
    [/conguring/gi, "configuring"],
    [/congure/gi, "configure"],
    [/cong\s+network/gi, "config network"],
    [/cong\s+serial/gi, "config serial"],
    [/cong\s+sessions/gi, "config sessions"],
    [/cong\s+certicate/gi, "config certificate"],
    [/cong\s+t/gi, "config t"],
    [/\(cong\)/gi, "(config)"],
    [/\(cong-/gi, "(config-"],
    [/certicate/gi, "certificate"],
    [/certicates/gi, "certificates"],
    [/identies/gi, "identifies"],
    [/identier/gi, "identifier"],
    [/identication/gi, "identification"],
    [/specic/gi, "specific"],
    [/specied/gi, "specified"],
    [/predened/gi, "predefined"],
    [/prexes/gi, "prefixes"],
    [/prex/gi, "prefix"],
    [/benet/gi, "benefit"],
    [/ooding/gi, "flooding"],
    [/\boods\b/gi, "floods"],
    [/\bood\b/gi, "flood"],
    [/ecient/gi, "efficient"],
    [/sucient/gi, "sufficient"],
    [/trac/gi, "traffic"],
    [/rewall/gi, "firewall"],
    [/rewalls/gi, "firewalls"],
    [/\bber optic\b/gi, "fiber optic"],
    [/\bber\b/gi, "fiber"],
    [/conicts/gi, "conflicts"],
    [/conict/gi, "conflict"],
    [/\brst-hop\b/gi, "first-hop"],
    [/\brst hop\b/gi, "first hop"],
    [/\brst\b/gi, "first"],
    [/veries/gi, "verifies"],
    [/dened/gi, "defined"],
    [/denition/gi, "definition"],
    [/rmware/gi, "firmware"],
    [/\ble\b/gi, "file"],
    [/les\b/gi, "files"],
    [/ltering/gi, "filtering"],
    [/\blters\b/gi, "filters"],
    [/prole/gi, "profile"],
    [/managoment/gi, "management"],
    [/exibility/gi, "flexibility"],
    [/oces/gi, "offices"],
    [/\boce\b/gi, "office"],
    [/branch oce/gi, "branch office"],
    [/deate/gi, "deflate"],
    [/detault/gi, "default"],
    [/ׁreates/g, "creates"],
    [/reates /g, "creates "],
    [/VLANS/g, "VLANs"],
    [/Choosetwo/gi, "Choose two"],
    [/outputdoes/g, "output does"],
    [/solution isimplemented/g, "solution is implemented"],
    [/end applications/g, "and applications"],
    [/802.11b\/gin/g, "802.11b/g/n"],
    [/Reboot the WL\b/g, "Reboot the WLC"],
    [/from the WL\b/g, "from the WLC"],
    [/are use$/g, "are used"],
    [/must be use$/g, "must be used"],
    [/are adde$/g, "are added"],
    [/is connecte$/g, "is connected"],
    [/ow control/gi, "flow control"],
    [/software-dened/gi, "software-defined"],
    [/Software Dened/gi, "Software Defined"],
  ];
  for (const [re, rep] of pairs) t = t.replace(re, rep);
  t = t
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/^[A-F]\.\s*/gm, "")
    .trim();
  return t;
}

function stripLetter(x) {
  return String(x).replace(/^[A-F]\.\s*/i, "").trim();
}

function cleanAlts(alts, id) {
  let a = alts.map((x) => stripLetter(fixOcr(x)));

  if (id === 305) {
    a = [
      '{"key": "value"}',
      '["key", "value"]',
      '{"key", "value"}',
      '("key": "value")',
    ];
  }
  if (id === 332) {
    a = [
      "A distributed management plane must be used.",
      "Complexity increases when new device configurations are added.",
      "Custom applications are needed to configure network devices.",
      "Software upgrades are performed from a central controller.",
    ];
  }
  if (id === 346) {
    a = [
      "It identifies the wireless network to which an application must connect.",
      "It identifies the wired network to which a network device is connected.",
      "It identifies the wired network to which a user device is connected.",
      "It identifies a wireless network for a mobile device to connect.",
    ];
  }
  if (id === 375) {
    a = [
      "Reboot the WLC.",
      "Flush all MAC addresses from the WLC.",
      "Re-enable the WLC interfaces.",
      "Re-associate the WLC with the access point.",
    ];
  }
  if (id === 379) {
    a = [
      "Power policing is enabled at the same time.",
      "The default level is used for the access point.",
      "All four pairs of the cable are used.",
      "It detects the device is a powered device.",
    ];
  }
  if (id === 400) {
    a = [
      "Gateway of last resort is 172.16.1.1 to network 0.0.0.0\nO E2 10.0.0.0/8 [110/5] via 192.168.1.1, 00:01:00, Ethernet0\nO E2 10.0.0.0/16 [110/5] via 192.168.2.1, 00:01:00, Ethernet1\nO E2 10.0.0.0/24 [110/5] via 192.168.3.1, 00:01:00, Ethernet2",
      "Gateway of last resort is 172.16.1.1 to network 0.0.0.0\nO E2 10.0.0.0/8 [110/5] via 192.168.1.1, 00:01:00, Ethernet0",
      "Gateway of last resort is 172.16.1.1 to network 0.0.0.0\nO E2 10.0.0.0/24 [110/5] via 192.168.3.1, 00:01:00, Ethernet2",
      "Gateway of last resort is 172.16.1.1 to network 0.0.0.0\nO E2 10.0.0.0/16 [110/5] via 192.168.2.1, 00:01:00, Ethernet1\nO E2 10.0.0.0/24 [110/5] via 192.168.3.1, 00:01:00, Ethernet2",
    ];
  }
  if (id === 270) {
    a = [
      "enable secret priv4t3p4ss\n!\nline con 0\n password p4ssw0rd1\n!\nline vty 0 15\n password s3cr3t2",
      "enable secret priv4t3p4ss\n!\nline con 0\n password p4ssw0rd1\n login\n!\nline vty 0 15\n password s3cr3t2\n login",
      "enable secret priv4t3p4ss\n!\nline con 0\n password login p4ssw0rd1\n!\nline vty 0 15\n password login s3cr3t2\n login",
      "enable secret privilege 15 priv4t3p4ss\n!\nline con 0\n password p4ssw0rd1\n login\n!\nline vty 0 15\n password s3cr3t2\n login",
    ];
  }
  if (id === 412) {
    a = [
      "ip access-list extended deny_outbound\n10 permit ip 192.168.240.0 255.255.240.0 10.0.0.0 255.0.0.0\n20 deny tcp 192.168.240.0 255.255.240.0 10.125.128.32 255.255.255.224 eq 443\n30 permit ip any any",
      "ip access-list extended deny_outbound\n10 deny tcp 192.168.240.0 0.0.15.255 10.125.128.32 0.0.0.31 eq 80\n20 permit ip 192.168.240.0 0.0.15.255 10.0.0.0 0.255.255.255\n30 deny ip any any log",
      "ip access-list extended deny_outbound\n10 deny tcp 10.125.128.32 255.255.255.224 192.168.240.0 255.255.240.0 eq 443\n20 deny tcp 192.168.240.0 255.255.240.0 10.125.128.32 255.255.255.224 eq 443\n30 permit ip 192.168.240.0 255.255.240.0 10.0.0.0 255.0.0.0",
      "ip access-list extended deny_outbound\n10 deny tcp 192.168.240.0 0.0.15.255 any eq 80\n20 deny tcp 192.168.240.0 0.0.15.255 10.125.128.32 0.0.0.31 eq 80\n30 permit ip 192.168.240.0 0.0.15.255 10.0.0.0 0.255.255.255",
    ];
  }
  // format multi-line conf snippets lightly
  if ([368, 377].includes(id)) {
    a = a.map((x) => x.replace(/^config /i, "config "));
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
  if (id === 268) return fix(0, "Physical access control = cameras/facilities; console password is logical access.");
  if (id === 270) return fix(1, "Valid set is enable secret + line passwords with login; 'enable secret privilege 15' is invalid syntax.");
  if (id === 276) return fix(3, "Perfect Forward Secrecy is a WPA3 feature, not WEP.");
  if (id === 327) return fix(1, "Controller↔applications is northbound; REST is appropriate; OpenFlow is southbound.");
  if (id === 342) return fix(0, "L3 switches route between VLANs (inter-VLAN routing).");
  if (id === 345) return fix(3, "Nonoverlapping channels primarily reduce interference.");
  if (id === 346) return fix(3, "SSID identifies a wireless network for clients, not a wired network.");
  if (id === 376) return fix(0, "After dynamic interface + auth server, next basic step is create WLAN and bind the interface.");
  if (id === 384) return fix(2, "WLC console is out-of-band management via asynchronous serial, not IP.");
  if (id === 385) return fix(1, "Lightweight AP in local mode typically uses an access port on the AP management VLAN.");
  if (id === 393) return fix(3, "FHRP protects against default gateway failure, not STP loops.");
  if (id === 404) return fix(2, "QoS marking changes the ToS field (DSCP/IPP); checksum may be recalculated but is not the marking field.");
  return idx;
}

/** Compact explanations: every id 266–415 */
const EXPL = {};
function e(id, text) {
  EXPL[id] = text;
}

// 266–315 security / wireless / SDN / automation
e(266, "Unused switch ports should be placed in a black-hole/unused VLAN (and preferably shut down) so they are not left in the default native/user VLAN where they can be abused. Access mode alone without isolation is incomplete; putting them in native VLAN or leaving defaults is insecure.");
e(267, "GRE over IPsec carries multicast (and other) traffic between sites inside a GRE tunnel while IPsec provides encryption. Plain GRE has no crypto. ISATAP is IPv6 transition, not the standard site multicast+encryption design.");
e(268, "Physical access control protects facilities and equipment via cameras, badges, locks. Console/enable passwords are logical/device access controls, not physical program controls.");
e(269, "RADIUS encrypts only the password (and secrets) in Access-Request; username and much of the packet are not fully encrypted like TACACS+ body encryption.");
e(270, "Factory-default hardening needs enable secret for privileged EXEC, and password + login on console and VTY for user EXEC. Invalid 'enable secret privilege 15' syntax is wrong; missing login leaves lines without authentication.");
e(271, "OWE (Opportunistic Wireless Encryption) encrypts traffic on open SSIDs without a PSK, improving privacy on open networks. It is not primarily an authentication framework like 802.1X, nor WEP.");
e(272, "WPA3 personal mode uses SAE (Simultaneous Authentication of Equals). AES is the cipher suite family; TKIP/PSK refer to older WPA/WPA2 concepts.");
e(273, "Native IPsec (without GRE) typically protects unicast IP flows. Multicast/broadcast and STP are not pure IPsec use cases without additional tunneling.");
e(274, "Authentication verifies identity; authorization determines permitted resources; accounting records activity. Options that swap authN/authZ or describe accounting are incorrect.");
e(275, "After hostname/domain/user setup, generate RSA keys with crypto key generate rsa for SSH. Import/zeroize/pubkey-chain are other key operations, not the next enable step.");
e(276, "WPA3 provides forward secrecy (SAE/PFS properties). WEP/WPA/WPA2 do not rely on PFS the same way WPA3 does.");
e(277, "Authentication’s distinguishing characteristic is identity verification. Billing is accounting-ish commercial; logging is accounting; service limits are authorization.");
e(278, "AMP for NGFW/NGIPS inspects files/file types for malware. It is not primarily user auth, wireless authorization, or simple URL filtering alone.");
e(279, "Original WPA introduced TKIP/MIC to improve on WEP. PSK and 802.1X are authentication modes that exist across generations; TKIP/MIC is the classic WPA feature named here.");
e(280, "WPA3 improves security using SAE instead of the WPA2 PSK 4-way weaknesses. RC4/TKIP are legacy and weaker.");
e(281, "NGIPS correlates users/applications with network events for better threat context. It is not a WLAN controller, pure RADIUS authenticator, or L2 MAC switch.");
e(282, "IPsec tunnel mode protects the original IP header and payload (new outer header). Transport mode encrypts primarily the payload, leaving the original IP header in the clear (with ESP).");
e(283, "Firewalls separate security domains/zones with policy. IPS detects/prevents threats; WLC/AP are wireless infrastructure.");
e(284, "Mitigate VLAN hopping by hard-setting trunks, disabling DTP, and careful native VLAN design. DAI mitigates ARP spoofing; activating all ports in default VLAN worsens risk.");
e(285, "WPA3 adds SAE and forward secrecy in personal mode. TKIP/WEP improvements are older WPA ideas; AES-64 is nonsense.");
e(286, "Site-to-site VPNs use IPsec tunnel mode with ESP to encapsulate and encrypt the entire original IP packet. Transport mode does not encapsulate the original header the same way; AH provides integrity without ESP confidentiality.");
e(287, "In SDN, the controller centralizes control-plane decisions (routing/forwarding policy). Data plane still forwards; filtering discard is data-plane action; remote access is management.");
e(288, "Login with username/password invokes authentication. Authorization follows for privileges; accounting/auditing track sessions.");
e(289, "WPA3 SAE strengthens resistance to offline brute-force/dictionary attacks on personal networks versus WPA2-PSK.");
e(290, "Port-security protect mode silently drops frames from unknown MACs while allowing known ones; no SNMP/syslog increment like restrict, and no err-disable like shutdown.");
e(291, "Guest portals need a publicly trusted certificate on ISE so contractor browsers do not show cert errors. Internal CA fails on unmanaged contractor devices unless the CA is pre-trusted.");
e(292, "WPA3-Personal with PSK commonly uses CCMP-128 (AES-CCMP). GCMP-256 is more aligned with WPA3-Enterprise 192-bit mode options, not the basic personal PSK case in this item.");
e(293, "Avoid placing access ports in the native VLAN used on trunks; keep user access VLANs distinct from native to reduce hopping impact. DAI/port-security address other threats.");
e(294, "IaaS provides virtualized compute/storage/network infrastructure the org manages (OS up). SaaS is apps; PaaS is runtime platforms.");
e(295, "DNA Center deploys consistent configuration/policy across many devices centrally. Traditional management is often device-by-device CLI.");
e(296, "Northbound APIs let applications/orchestration talk to the controller. Southbound talks to network devices.");
e(297, "Controller-based networking enables centralized configuration and monitoring versus per-box traditional management. It separates control from data plane rather than combining them on every box only.");
e(298, "DNA Center offers broad extensibility (REST APIs, integrations) beyond classic campus managers focused only on discovery/assurance HA.");
e(299, "DNA Center collects via SNMP, syslog, NetFlow/telemetry, and device adapters—not a single IPsec call-home-only model.");
e(300, "Controller-based networks explicitly decouple control and data planes; traditional boxes co-locate both. Centralized control is the SDN trait, not traditional-only.");
e(301, "The control plane computes forwarding information used by the data plane. Management is device ops; data plane forwards; policy is higher intent.");
e(302, "Southbound APIs let the controller program network devices dynamically. Northbound faces apps; REST/SOAP are styles that can be used either direction depending on design.");
e(303, "JSON represents structured data including objects and arrays with key/value syntax. It is less verbose than XML and does not use HTML-like angle-bracket markup as its model.");
e(304, "An API is a contract defining how software components interact. REST is one architectural style; URL paths are usage details of HTTP APIs.");
e(305, "A JSON object/dictionary is encoded as {\"key\": \"value\"}. Arrays use []; tuples/parens are not JSON objects.");
e(306, "The hypervisor allocates and schedules physical CPU, memory, storage, and I/O among VMs. IaaS/SaaS are cloud service models, not the hypervisor’s per-VM role.");
e(307, "Servers provide shared applications/services to clients. Switches forward in a LAN; routers route; firewalls zone.");
e(308, "CRUD Update modifies existing resources/tables/views. Create inserts; Read retrieves; Replace is not the standard CRUD verb name here.");
e(309, "In SDN, the data plane remains distributed on devices for traffic forwarding; control is centralized on the controller.");
e(310, "Ansible connects to managed nodes primarily over SSH (TCP 22). Puppet/Chef commonly use agent/TLS ports; Python is a language.");
e(311, "OpenFlow is a classic southbound protocol for an SDN controller to install forwarding entries on switches. REST is often northbound; Java/XML are not the forwarding SB protocol named here.");
e(312, "REST uses HTTP methods/messages to exchange data between clients and application services on hosts. OpenFlow/OpFlex are SDN southbound; OpenStack is a cloud platform.");
e(313, "A JSON object is an unordered set of name/value pairs. Arrays are ordered lists; string/boolean are primitives.");
e(314, "Cisco SD-Access fabric uses VXLAN (with LISP control) to tunnel between edge nodes. GRE/VLAN/PPP are not the SDA fabric data-plane encapsulation.");
e(315, "SDN controllers centralize the control plane. Data plane stays on devices; management/services planes are separate concepts.");
e(316, "Southbound interface sits between control layer (controller) and infrastructure layer (switches/routers). Northbound is control↔application.");
e(317, "Automation reduces configuration drift and makes consistent configs easier to maintain at scale. It is not mainly about splitting management plane alone.");
e(318, "Packet switching/forwarding through a router is data-plane work. Control plane builds tables; management configures the device.");
e(319, "DNA Center abstracts intent/policy from per-device CLI configuration, unlike traditional EMS tools that push device-centric configs.");
e(320, "Southbound APIs interact with edge/infrastructure devices. Northbound faces applications/orchestration.");
e(321, "DNA Center enables centralized device management versus traditional per-device hands-on CLI.");
e(322, "VMs connect via a virtual switch in the hypervisor, which uplinks to the physical network. Not purely wireless AP attachment as the general model.");
e(323, "The SDN controller makes control decisions (routing/policy programming). Forwarding/replication/reassembly are data-plane device functions.");
e(324, "Southbound APIs manage flow/control programming between controller and switches. Northbound is controller↔apps.");
e(325, "Puppet uses manifests and modules. Chef uses recipes/cookbooks; Ansible uses playbooks/roles.");
e(326, "REST standard methods include GET, PUT, POST, DELETE (and PATCH). ERASE/MOD/CHANGE are not standard REST verbs.");
e(327, "Communication between SDN controller and applications is northbound, commonly REST. OpenFlow/NETCONF are device-facing southbound styles.");
e(328, "In controller-based networks, white-box/off-the-shelf switches focus on forwarding packets under controller programming; policy and routing decisions are centralized.");
e(329, "HTTP PUT updates/replaces a resource in REST/DNA Intent APIs. POST typically creates; UPDATE/CHANGE are not standard HTTP methods.");
e(330, "JWT is an encoded (optionally signed/encrypted) JSON token used to securely exchange claims for authN/authZ between parties—not merely a vague encrypted blob description without the exchange purpose.");
e(331, "Southbound API traffic is controller ↔ network devices (switches/routers). Apps use northbound.");
e(332, "Automation outcomes include centralized software upgrades and consistent changes from a controller/orchestrator. Complexity should decrease for routine config; custom apps are not always required.");
e(333, "HTTP 200 OK indicates successful REST requests. 301 redirect, 404 not found, 500 server error are not success.");
e(334, "Accept header tells the server which media types the client expects (e.g., application/json). Content-Type describes the body being sent.");
e(335, "DNA Center securely manages, provisions, and assures network devices with centralized automation. It is not primarily a physical security system or AP-only L3 service box.");
e(336, "Controllers set packet-handling policies/forwarding intent. Actual forwarding is data plane on devices.");
e(337, "Hypervisors virtualize CPU, memory, storage, and NICs for multiple VMs. They are not limited to one VM; efficiency does not require a physically separate switch from the host.");
e(338, "Centralized routing decisions are control-plane functions in SDN. Data plane forwards; management configures; policy is intent layer.");
e(339, "Private IPv4 lets many organizations reuse RFC1918 space without global uniqueness conflicts. It does not provide direct Internet reachability without NAT/proxy.");
e(340, "Virtual machines are the virtualized compute endpoints; the hypervisor/software stack enables connectivity between VMs and physical resources. The VM is the element hosting virtualized services in this framing.");
e(341, "In 2.4 GHz, nonoverlapping channels are 1, 6, and 11 (in most regulatory domains).");
e(342, "Layer 3 switches route IP between VLANs/SVIs (inter-VLAN routing). They do not forward between VLANs using only MAC, nor exist solely to blast broadcasts in L3 mode.");
e(343, "GBIC SX links typically use SC connectors; interconnecting two SC GBICs needs SC-to-SC fiber. LC is SFP-era more often; ST is another form factor.");
e(344, "Point-to-point leased lines are simple to configure (two endpoints, clear L3). They are not low-cost or full-mesh by nature.");
e(345, "Nonoverlapping channels reduce co-channel interference and stabilize RF performance. They do not by themselves invent bandwidth or define bonding.");
e(346, "The SSID identifies a wireless network so clients can discover and connect. It does not identify wired VLANs/networks.");
e(347, "FTP uses separate control and data TCP connections. TFTP uses UDP/69 and block numbers; FTP authenticates users.");
e(348, "STP cable has shielding against EMI; UTP does not. UTP is usually cheaper; STP is not generally faster Ethernet by definition.");
e(349, "Server virtualization runs multiple OSes on one physical host via a hypervisor. VRF/VDC/NPIV are networking virtualization concepts.");
e(350, "Automation reduces operational cost and human error versus box-by-box management. It does not aim to enforce simpler passwords as the primary reason.");
e(351, "Collapsed-core combines core and distribution on the same device (or redundant pair). It is not two separate layers of devices.");
e(352, "Before deploying VMs, plan CPU, memory, storage, and I/O capacity limits. Peripherals/location are secondary to resource sizing.");
e(353, "IPv6 all-nodes link-local multicast is ff02::1. fe80::/10 is link-local unicast; 2000::/3 global unicast examples are not all-nodes multicast.");
e(354, "Private addressing reduces direct Internet exposure of hosts (with perimeter controls/NAT). It is not primarily PCI text or FIB reduction.");
e(355, "Frequency f=1 Hz means one cycle per second = 60 cycles per minute. 60 Hz is 60 cycles per second.");
e(356, "Spine-leaf provides predictable any-to-any latency/bandwidth with ECMP leaf-spine fabric. Adding only leafs without spines is not the oversubscription mitigation story alone.");
e(357, "Endpoints (PCs, phones, printers) are used directly by users to access network services. Intermediate systems forward; firewalls zone.");
e(358, "MAC learning is enabled by default so switches build the CAM table from source MACs on VLANs/ports. It does not inherently increase management VLAN security.");
e(359, "Anycast is typically a unicast global address assigned to multiple hosts; 2001:db8::/32 documentation space /128 is a unicast form suitable as anycast target. ff00::/8 is multicast; fe80:: link-local.");
e(360, "OM3 and OM4 are 50 µm multimode fiber optimized for laser/VCSEL. OM1 is 62.5 µm; OS1/OS2 single-mode ~9 µm.");
e(361, "Firewalls create security zones with distinct policies. IPS detects threats; switches/APs segment differently.");
e(362, "Private address space conserves public IPv4 by allowing internal reuse. Simplification/complexity reduction are secondary benefits.");
e(363, "Collapsed-core runs core+distribution functions together on one layer/pair of devices. Access still connects users.");
e(364, "DNA Center is the software-defined controller for automation, assurance, and policy of enterprise devices.");
e(365, "WLC console provides out-of-band management access. HTTP GUI is in-band web; service port is the dedicated OOB Ethernet in many models.");
e(366, "Rapid PVST+ runs one STP instance per VLAN for fast per-VLAN loop-free topology. MST maps VLANs to fewer instances; multiple active paths would be a loop without special multipath tech.");
e(367, "When the same WLAN profile is reused across branches, NAS-ID (and site identifiers) help AAA distinguish locations. Radio/security may be shared; NAS-ID is the differentiation keyed here.");
e(368, "On AireOS WLC CLI, config network webmode enable allows HTTP access to the GUI. secureweb is HTTPS; telnet is CLI; certificate generate is related but not the enable for HTTP mode.");
e(369, "In classic STP states, blocking (or discarding in RSTP) processes BPDUs but does not forward frames or learn MACs. Learning updates MAC table; listening does not learn on classic STP the same way.");
e(370, "Unknown unicast/broadcast flooding sends a frame out all ports in the VLAN except the ingress. ARP/CDP/multicast are protocols or traffic types, not the switch action name.");
e(371, "VLANs create separate broadcast domains. STP breaks loops; VTP propagates VLAN DB; CSMA/CD is media access.");
e(372, "FlexConnect APs often use access ports when a single management/data VLAN is switched locally; trunk is used when multiple local WLANs/VLANs must be tagged. This bank keys access mode for the FlexConnect interface.");
e(373, "Root port is the port on a non-root switch with lowest path cost to the root bridge. It is not defined by highest priority toward root.");
e(374, "On unknown source MAC, the switch learns/associates the source MAC to the ingress port in the CAM table (and may flood if dest unknown). It does not flood including the ingress, nor bounce the frame to source as the primary action.");
e(375, "After LAG changes on a Cisco WLC, a reboot is required for the port-channel membership to apply cleanly.");
e(376, "Basic WLAN bring-up sequence: management connectivity, dynamic interfaces, AAA, then create WLAN and bind the dynamic interface. HA and Telnet are not the immediate next basic step.");
e(377, "config serial timeout 0 prevents the serial/console CLI session from timing out automatically on the WLC.");
e(378, "Branch APs with WAN-limited controller connectivity use FlexConnect with local switching so user data can bridge locally if CAPWAP is constrained.");
e(379, "PoE auto mode discovers the powered device class via negotiation (CDP/LLDP/802.3af) rather than static watt allocation. Four-pair is not guaranteed by auto alone.");
e(380, "SSIDs are case-sensitive text identifiers. They are not proprietary-only, do not require letter+number, and do not themselves define switch VLANs.");
e(381, "Trunking the WLC distribution ports allows multiple user VLANs in the data path. OOB management is usually service port, not the reason for data trunking.");
e(382, "MAC aging removes inactive dynamic entries so the table can learn new addresses. Move/auto-purge names are not the standard feature title.");
e(383, "Distribution system ports connect the WLC to the switched network for AP and client data paths. Service is OOB; console is serial; redundancy is SSO link.");
e(384, "WLC console port is out-of-band management over asynchronous serial. It is not IP transport.");
e(385, "Local-mode lightweight APs typically attach with an access port in the AP management VLAN; CAPWAP tunnels user VLANs. Trunks are more common in FlexConnect multi-VLAN designs.");
e(386, "After EAP-Success (without session resumption shortcuts), the 4-way handshake derives PTK/GTK for data protection.");
e(387, "LAG increases aggregate throughput and provides link redundancy between WLC and switch. It is not primarily inter-WLC stateful failover or management-frame encryption.");
e(388, "Zero-touch lightweight APs join a WLC via CAPWAP and are centrally managed. Autonomous is self-managed; mesh/cloud are other deployment models.");
e(389, "The service port is the WLC out-of-band management Ethernet interface. Management is in-band; virtual is for mobility/webauth; dynamic maps WLANs.");
e(390, "A single IPv4 loopback host maps cleanly to IPv6 /128. /64 is a subnet, not a single host loopback equivalent.");
e(391, "Two routers on Ethernet with crossover still default to OSPF broadcast (DR election). ip ospf network point-to-point removes DR/BDR on that link.");
e(392, "FHRP increases first-hop availability with virtual gateway redundancy. GLBP can load-balance; classic HSRP benefit stated here is availability.");
e(393, "FHRP is implemented to protect against default gateway failures. Loop prevention is STP; stacking is multichassis; multilink is bundling.");
e(394, "Global unicast and unique local addresses both use the same /64 subnetting practices for interface IDs. ULA is not global Internet routable; different allocation authorities.");
e(395, "Compress IPv6 by removing leading zeros and replacing longest zero run with :: once: 2001:db8::700:3:400F:572B. Options that alter hex digits or double :: incorrectly are wrong.");
e(396, "Private IPv4 conserves public/global unique addresses. Multicast/loopback/public do not serve that conservation role the same way.");
e(397, "In multivendor networks, VRRP (open standard) is the FHRP of choice. HSRP/GLBP are Cisco-oriented.");
e(398, "HSRP is Cisco proprietary first-hop redundancy that fails over the active gateway transparently. VRRP is open; FHRP is the category name.");
e(399, "Floating static default uses a higher AD than the primary (e.g., AD 10 if primary is better). AD 1 or default 1 would compete as primary; 'floating' is not a keyword.");
e(400, "Different prefix lengths are separate routes; show ip route lists all three OSPF E2 prefixes (/8, /16, /24), not only the longest. Longest match is used at forwarding time per packet.");
e(401, "SNMP community strings act like passwords (v1/v2c) controlling access to MIB objects. They are not AD credentials or sequence tags.");
e(402, "Syslog severity 0 Emergency is the most severe (system unusable). Alert/Critical/Error are less severe numbers higher in the scale.");
e(403, "ip helper-address on the client-facing L3 interface relays DHCP to a server on another subnet.");
e(404, "QoS marking modifies the Type of Service byte (DSCP/IPP). The header checksum is recalculated when the header changes but is not the QoS marking field itself.");
e(405, "For a /24 pool, usable .1–.254; next-to-last usable gateway is .253, configured as default-router/default-gateway in the DHCP context of this item. helper-address is relay, not pool gateway.");
e(406, "Classification identifies which traffic belongs to which class for subsequent QoS treatment. Marking writes values; queuing services classes; matching rules implement classification.");
e(407, "Different trap/severity levels per device control how much and which severity of syslog each device emits. Facility identifies process origin; rate-limit is separate.");
e(408, "Traffic shaping limits the offered rate by buffering excess toward a configured bandwidth. It is not primarily PBR or best-effort definition.");
e(409, "logging trap 4 sets severity to warning (4), including errors (3) and more severe. trap 5 is notice (more verbose); 2/3 are critical/error only thresholds differently.");
e(410, "Telnet is cleartext and vulnerable to MITM/credential theft. SSH/HTTPS encrypt; console is local physical.");
e(411, "WPA (WPA1) uses TKIP for data protection. AES-CCMP is WPA2; PEAP/EAP are authentication methods.");
e(412, "Correct ACL order: deny HTTP (tcp/80) from 192.168.240.0/20 to 10.125.128.32/27 with proper wildcards, then permit the rest of 10.0.0.0/8, then deny/log as needed. Wrong order (permit first), wrong mask style, or wrong ports/direction fail the requirement.");
e(413, "A backdoor is malicious code that opens unauthorized access for later control. Other options describe droppers/worms/downloaders more than the backdoor definition.");
e(414, "WPA3 SAE protects better against offline brute-force attacks on personal networks. Backward compatibility and PMF details are secondary to the SAE safeguard named here.");
e(415, "service password-encryption encrypts/obscures plaintext passwords in the running configuration. enable secret hashes the enable password only; enable password-encryption is not a standard global command name.");

function buildTicket(id) {
  const tickets = {
    270: {
      sintoma:
        "Chamado #10270 — Roteador de fábrica precisa: enable secret priv4t3p4ss, console user EXEC p4ssw0rd1, VTY Telnet s3cr3t2. Após config, console não pede senha.",
      cli_output: `R1# show running-config | section line|enable
enable secret 5 $1$....priv
line con 0
 password p4ssw0rd1
line vty 0 15
 password s3cr3t2
! falta "login" nas linhas

R1# show line con 0 | include Password
Password is set, but login not enabled`,
      alternativas: [
        "Adicionar login em line con 0 e line vty 0 15 além de enable secret e passwords.",
        "Usar enable secret privilege 15 priv4t3p4ss como sintaxe correta.",
        "Remover passwords das linhas; só enable secret autentica console.",
        "login local é obrigatório mesmo sem username configurado.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "password sozinho não autentica sem login (ou login local). enable secret privilege 15 é inválido. Com password line, use login.",
    },
    275: {
      sintoma:
        "Chamado #10275 — Hostname, domain e usuário local ok; SSH falha porque não há chave RSA.",
      cli_output: `R1# show ip ssh
SSH Disabled - version 1.99
% Please create RSA keys to enable SSH.

R1# show running-config | include hostname|domain|username
hostname R1
ip domain-name lab.local
username admin privilege 15 secret 5 $1$...`,
      alternativas: [
        "Executar crypto key generate rsa (modulus adequado) para habilitar SSH.",
        "crypto key zeroize rsa cria a chave necessária.",
        "crypto key import é o único método suportado.",
        "Sem RSA, transport input ssh funciona com Telnet keys.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "SSH no IOS exige par de chaves RSA. generate rsa é o passo; zeroize apaga chaves.",
    },
    290: {
      sintoma:
        "Chamado #10290 — Port-security deve descartar MACs inválidos sem err-disable e sem log SNMP. Porta impressora.",
      cli_output: `SW1# show port-security interface gi1/0/8
Port Security              : Enabled
Violation Mode             : Shutdown
Maximum MAC Addresses      : 1
Security Violation Count   : 2
Port Status                : Secure-shutdown

SW1# show running-config interface gi1/0/8
interface GigabitEthernet1/0/8
 switchport port-security
 switchport port-security maximum 1
 switchport port-security violation shutdown`,
      alternativas: [
        "Alterar para switchport port-security violation protect.",
        "violation shutdown é o único modo que não derruba a porta.",
        "restrict nunca conta violações; é igual a protect.",
        "shutdown VLAN é o modo que só descarta frames silenciosamente.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "protect descarta frames de MACs desconhecidos sem syslog/SNMP e sem err-disable. restrict loga; shutdown err-disable.",
    },
    368: {
      sintoma:
        "Chamado #10368 — Precisam acessar a GUI do WLC via HTTP (lab). HTTPS ok; HTTP recusado.",
      cli_output: `WLC) > show network summary
Web Mode.................................... Disable
Secure Web Mode............................. Enable

WLC) > ping 10.0.0.50
!!!!!`,
      alternativas: [
        "Habilitar config network webmode enable para HTTP na GUI.",
        "config network telnet enable libera HTTP.",
        "config network secureweb enable desliga HTTPS e liga HTTP.",
        "Gerar certificado webadmin substitui webmode.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "Web Mode = HTTP GUI. secureweb = HTTPS. Telnet é CLI. Certificado não substitui o enable de webmode.",
    },
    375: {
      sintoma:
        "Chamado #10375 — LAG recém-alterado no WLC; port-channel no switch não agrega como esperado.",
      cli_output: `WLC) > show lag summary
LAG Enabled

SW1# show etherchannel summary
Group  Port-channel  Protocol    Ports
1      Po1(SU)         -         Gi1/0/1(P) Gi1/0/2(D)

! mudança de interfaces LAG no WLC ainda não refletida após config`,
      alternativas: [
        "Reboot do WLC após alteração de LAG para aplicar membership.",
        "Só flush de MAC no WLC aplica LAG.",
        "Re-enable interfaces no switch sem reboot no WLC basta sempre.",
        "Reassociar APs reconfigura LAG do distribution port.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "Mudanças de LAG no AireOS WLC exigem reboot do controller. MAC flush/AP reassoc não aplicam o bundle.",
    },
    391: {
      sintoma:
        "Chamado #10391 — Dois roteadores OSPF ligados por cabo crossover Ethernet elegem DR/BDR; desejam ponto a ponto.",
      cli_output: `R1# show ip ospf interface gi0/0
Network Type BROADCAST, Cost: 1
State DR, Priority 1
Designated Router (ID) 1.1.1.1
Backup Designated router (ID) 2.2.2.2`,
      alternativas: [
        "ip ospf network point-to-point no link elimina eleição DR/BDR.",
        "ip ospf network broadcast remove DR.",
        "priority 0 em ambos impede adjacência total.",
        "dead-interval 40 sozinho muda o network type.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "point-to-point é o network type correto para link /30 sem DR. broadcast força DR/BDR.",
    },
    399: {
      sintoma:
        "Chamado #10399 — Default estática de backup para 10.200.0.2 não “flutua”; compete com a primária.",
      cli_output: `R1# show running-config | include ip route 0.0.0.0
ip route 0.0.0.0 0.0.0.0 10.100.0.2
ip route 0.0.0.0 0.0.0.0 10.200.0.2 1

R1# show ip route 0.0.0.0
Routing entry for 0.0.0.0/0
  Known via "static", distance 1, metric 0
  * 10.100.0.2
  * 10.200.0.2`,
      alternativas: [
        "Usar AD maior no backup, ex. ip route 0.0.0.0 0.0.0.0 10.200.0.2 10.",
        "AD 1 no backup é o padrão de floating static.",
        "Sem AD explícito o backup fica com AD 255 e nunca sobe.",
        "Palavra-chave floating existe na sintaxe IOS.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "Floating static = AD maior que a primária. AD 1 iguala e load-share/compete. Não há keyword floating.",
    },
    403: {
      sintoma:
        "Chamado #10403 — Clientes VLAN 20 sem DHCP; servidor 192.168.10.1 em outra subnet.",
      cli_output: `R1# show ip interface gi0/0.20
Internet address is 10.20.0.1/24
Helper address is not set

R1# show running-config interface gi0/0.20
interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 10.20.0.1 255.255.255.0`,
      alternativas: [
        "Configurar ip helper-address 192.168.10.1 na interface dos clientes.",
        "ip route 192.168.10.1 substitui o relay DHCP.",
        "ip default-gateway no roteador relaya DHCPDISCOVER.",
        "ip dhcp address não existe; use só no servidor.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "DHCP relay = ip helper-address no gateway da subnet cliente. Rotas/default-gateway não relayam broadcasts DHCP.",
    },
    409: {
      sintoma:
        "Chamado #10409 — Syslog remoto deve incluir warning e error, sem inundar com notice/informational.",
      cli_output: `R1# show logging | include Trap
Trap logging: level informational, 1200 message lines logged

R1# show running-config | include logging trap
logging trap informational`,
      alternativas: [
        "logging trap 4 (warnings) inclui severities 0–4 (emergency…warning/error).",
        "logging trap 5 é mais restrito que 4 e exclui warnings.",
        "logging trap 2 envia também informational.",
        "trap 3 exclui errors e só manda critical.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "Trap level N envia mensagens com severity ≤ N. Level 4 warning cobre errors (3) e acima. Level 5 notice é mais verboso.",
    },
    412: {
      sintoma:
        "Chamado #10412 — ACL deve negar HTTP de 192.168.240.0/20 para 10.125.128.32/27 e permitir restante de 10.0.0.0/8.",
      cli_output: `R1# show access-lists deny_outbound
Extended IP access list deny_outbound
    10 permit ip 192.168.240.0 0.0.15.255 10.0.0.0 0.255.255.255
    20 deny tcp 192.168.240.0 0.0.15.255 10.125.128.32 0.0.0.31 eq www
! permit genérico casa primeiro — HTTP nunca é negado

R1# show ip interface gi0/1 | include access
  Outgoing access list is deny_outbound`,
      alternativas: [
        "Colocar deny tcp ... eq 80 antes do permit para 10.0.0.0/8, com wildcards corretos /20 e /27.",
        "Permit any no topo é best practice para esse requisito.",
        "Usar máscara 255.255.240.0 no lugar de wildcard em extended ACL IOS clássica.",
        "Negar eq 443 atende “HTTP” na definição da questão.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "ACLs são top-down: deny HTTP específico deve vir antes do permit amplo para 10/8. Wildcards: /20 → 0.0.15.255, /27 → 0.0.0.31. HTTP = tcp/80.",
    },
    415: {
      sintoma:
        "Chamado #10415 — Auditoria: senhas line em claro no show run.",
      cli_output: `R1# show running-config | include password|secret
enable secret 5 $1$mERr$...
line vty 0 4
 password LabClearText
! service password-encryption ausente`,
      alternativas: [
        "Aplicar service password-encryption para ofuscar senhas plaintext na config.",
        "enable password-encryption é o comando global padrão.",
        "enable secret criptografa todas as senhas de linha automaticamente.",
        "password-encrypt é sinônimo válido no IOS.",
      ],
      resposta_correta: 0,
      explicacao_profunda:
        "service password-encryption aplica type 7 às senhas em claro. enable secret só no enable. Comandos inventados não existem.",
    },
    3990: null,
  };
  const t = tickets[id];
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

// additional tickets
const MORE_TICKETS = {
  284: {
    sintoma:
      "Chamado #10284 — Segurança reporta risco de VLAN hopping; trunks ainda com DTP desirable e native 1.",
    cli_output: `SW1# show interfaces gi1/0/24 switchport
Administrative Mode: dynamic desirable
Operational Mode: trunk
Negotiation of Trunking: On
Trunking Native Mode VLAN: 1 (default)`,
    alternativas: [
      "Fixar switchport mode trunk, switchport nonegotiate (disable DTP) e native VLAN não default.",
      "Somente DAI mitiga VLAN hopping.",
      "Ativar todas as portas na VLAN 1 reduz hopping.",
      "Extended VLANs sozinhos eliminam double-tag.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Mitigações clássicas: trunks manuais, DTP off, native VLAN unused. DAI é ARP; VLAN 1 default aumenta risco.",
  },
  395: {
    sintoma:
      "Chamado #10395 — Precisam comprimir 2001:0db8:0000:0000:0700:0003:400F:572B na Serial0/0.",
    cli_output: `R1(config-if)# ipv6 address 2001:0db8:0000:0000:0700:0003:400F:572B/64
R1# show ipv6 interface serial0/0 | include address
  2001:DB8:0:0:700:3:400F:572B, subnet is 2001:DB8:0:0:700:3:400F:572B/64`,
    alternativas: [
      "Forma comprimida correta: 2001:db8::700:3:400F:572B.",
      "2001:db8:0::700:3:4F:572B preserva todos os hex originais.",
      "Dois :: na mesma linha são válidos se curtos.",
      "0700 pode virar :7: sem perder nibble.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Remover zeros à esquerda e colapsar a maior sequência de zeros com um único ::. Não alterar dígitos hex (4F ≠ 400F).",
  },
  385: {
    sintoma:
      "Chamado #10385 — AP lightweight local mode não sobe CAPWAP; porta do switch está trunk nativo errado.",
    cli_output: `SW1# show running-config interface gi1/0/12
interface GigabitEthernet1/0/12
 description AP-LOCAL
 switchport mode trunk
 switchport trunk native vlan 1
 switchport trunk allowed vlan 1,10,20

AP# show capwap client rcb
! Discovery failing / wrong VLAN`,
    alternativas: [
      "Em local mode, usar access na VLAN de management do AP (CAPWAP), não trunk multi-VLAN desnecessário.",
      "EtherChannel é obrigatório para todo AP local mode.",
      "LAG no AP resolve discovery.",
      "Trunk é sempre mandatório em local mode centralizado.",
    ],
    resposta_correta: 0,
    explicacao_profunda:
      "Local mode: AP em access na VLAN de gerência; user VLANs vão no túnel CAPWAP. Trunk multi-VLAN é típico de FlexConnect local switching.",
  },
};

function getTicket(id) {
  if (MORE_TICKETS[id]) {
    const t = MORE_TICKETS[id];
    return {
      id,
      question_type: "ticket",
      isPremium: true,
      ...t,
    };
  }
  return buildTicket(id);
}

function buildTraditional(q) {
  const enunciado = fixOcr(q.enunciado);
  if (/choose two|choose three/i.test(enunciado)) chooseTwo.push(q.id);
  const alternativas = cleanAlts(q.alternativas, q.id);
  let resposta = maybeFixAnswer(q.id, q.resposta_correta);
  if (resposta < 0 || resposta > 3) resposta = 0;
  const explicacao_profunda =
    EXPL[q.id] ||
    "CCNA 200-301: revise the topic for this item; correct option matches the protocol/feature behavior described.";
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
        ticket: getTicket(q.id),
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
  fs.writeFileSync(path.join(__dirname, "lote_266_415_report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main();
