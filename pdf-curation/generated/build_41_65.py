# -*- coding: utf-8 -*-
"""Enrich questions 41-65 → lote_41_65.json"""
import json
from pathlib import Path

def T(sid, enun, alts, rc, exp, ticket=None):
    return {
        "source_id": sid,
        "traditional": {
            "id": sid,
            "question_type": "traditional",
            "isPremium": True,
            "enunciado": enun,
            "alternativas": alts,
            "resposta_correta": rc,
            "explicacao_profunda": exp,
        },
        "ticket": ticket,
    }

def ticket(sid, sintoma, cli, alts, rc, exp):
    return {
        "id": sid,
        "question_type": "ticket",
        "isPremium": True,
        "sintoma": sintoma,
        "cli_output": cli,
        "alternativas": alts,
        "resposta_correta": rc,
        "explicacao_profunda": exp,
    }

items = []

items.append(T(
    41,
    "What is the maximum bandwidth of a T1 point-to-point connection?",
    ["1.544 Mbps", "2.048 Mbps", "34.368 Mbps", "43.7 Mbps"],
    0,
    "A T1 (DS1) circuit provides 1.544 Mbps of bandwidth in North American digital hierarchy.\n2.048 Mbps is E1, not T1.\n34.368 Mbps is in the E3 range, not T1.\n43.7 Mbps is not the T1 rate.\nMaximum T1 bandwidth among the options is 1.544 Mbps.",
    None,
))

items.append(T(
    42,
    "What is a characteristic of cloud-based network topology?",
    [
        "onsite network services are provided with physical Layer 2 and Layer 3 components",
        "wireless connections provide the sole access method to services",
        "physical workstations are configured to share resources",
        "services are provided by a public, private, or hybrid deployment",
    ],
    3,
    "Cloud services are delivered via public, private, or hybrid cloud deployment models rather than solely on-premises physical L2/L3 gear for those services.\nOn-prem physical L2/L3 describes traditional campus/data center, not the defining cloud topology characteristic.\nWireless-only access is not required for cloud.\nWorkstation resource sharing is peer-to-peer/file-share thinking, not cloud topology.\nCorrect: public/private/hybrid service deployment.",
    None,
))

items.append(T(
    43,
    "Which network action occurs within the data plane?",
    [
        "reply to an incoming ICMP echo request",
        "make a configuration change from an incoming NETCONF RPC",
        "run routing protocols (OSPF, EIGRP, RIP, BGP)",
        "compare the destination IP address to the IP routing table",
    ],
    3,
    "Data-plane forwarding looks up the destination (FIB/CEF/routing table information used for forwarding) and switches the packet to the next hop/interface.\nICMP echo replies are often handled by the control/management processing path depending on platform, and are not the best pure data-plane example vs table lookup forwarding.\nNETCONF configuration is management plane.\nRunning routing protocols is control plane.\nThe clearest data-plane action listed is comparing the destination IP to the forwarding/routing information to forward the packet.",
    None,
))

items.append(T(
    44,
    "What are network endpoints?",
    [
        "support inter-VLAN connectivity",
        "a threat to the network if they are compromised",
        "act as routers to connect a user to the service provider network",
        "enforce policies for campus-wide traffic going to the Internet",
    ],
    1,
    "Endpoints (PCs, phones, IoT, servers) are where users and applications live; if compromised they become a major threat vector (malware, lateral movement).\nInter-VLAN connectivity is a router/L3-switch function.\nConnecting users to SP is CPE/edge routing, not the definition of endpoints.\nCampus Internet policy enforcement is typically firewall/edge security devices.\nAmong the options, recognizing endpoints as threats when compromised matches security-focused CCNA wording.",
    None,
))

items.append(T(
    45,
    "Why was the RFC 1918 address space defined?",
    [
        "conserve public IPv4 addressing",
        "support the NAT protocol",
        "preserve public IPv6 address space",
        "reduce instances of overlapping IP addresses",
    ],
    0,
    "RFC 1918 defines private IPv4 ranges so organizations can number internal hosts without consuming unique public IPv4 addresses, conserving the public pool.\nNAT is a related technology often used with private addresses, but RFC 1918’s primary stated purpose is private addressing / conservation, not “to support NAT” as a protocol dependency.\nIt does not address IPv6 public space.\nPrivate space can still overlap between organizations; reducing overlap is not the main design goal versus conservation.\nAnswer: conserve public IPv4 addressing.",
    None,
))

items.append(T(
    46,
    "Which type of organization should use a collapsed-core architecture?",
    [
        "small and needs to reduce networking costs",
        "large and must minimize downtime when hardware fails",
        "large and requires a flexible, scalable network design",
        "currently small but is expected to grow dramatically in the near future",
    ],
    0,
    "Collapsed-core (two-tier) reduces device count and cost by combining core and distribution — suitable for smaller networks with limited scale needs.\nLarge networks needing high availability and scale typically keep a three-tier design with clearer failure domains.\nExplosive growth expectations often argue against over-collapsing the core long-term.\nBest fit: small organization reducing networking costs.",
    None,
))

items.append(T(
    47,
    "A network administrator is setting up a new IPv6 network using the 64-bit address 2001:0EB8:00C1:2200:0001:0000:0000:0331/64. To simplify the configuration, the administrator has decided to compress the address. Which IP address must the administrator configure?",
    [
        "ipv6 address 2001:EB8:C1:22:1::331/64",
        "ipv6 address 21:EB8:C1:2200:1::331/64",
        "ipv6 address 2001:EB8:C1:2200:1:0000:331/64",
        "ipv6 address 2001:EB8:C1:2200:1::331/64",
    ],
    3,
    "Start from 2001:0EB8:00C1:2200:0001:0000:0000:0331/64.\nDrop leading zeros: 2001:EB8:C1:2200:1:0:0:331.\nCompress the longest zero run (two hextets) to :: → 2001:EB8:C1:2200:1::331/64.\nOption A wrongly shortens 2200 to 22.\nOption B corrupts 2001 into 21.\nOption C leaves an explicit 0000 and does not use :: correctly for the double-zero field pair.\nCorrect compressed form is option D.",
    None,
))

items.append(T(
    48,
    "What is an appropriate use for private IPv4 addressing?",
    [
        "to allow hosts inside to communicate in both directions with hosts outside the organization",
        "on internal hosts that stream data solely to external resources",
        "on the public-facing interface of a firewall",
        "on hosts that communicate only with other internal hosts",
    ],
    3,
    "Private IPv4 addresses are appropriate on internal-only hosts that do not need unique public addressing.\nBidirectional communication with arbitrary Internet hosts requires public addressing or NAT/proxy designs — private alone is insufficient as “the” use case for that goal.\nPublic-facing firewall interfaces typically use public (or provider) addresses.\nStreaming solely to external resources usually still needs NAT/public path; the clean textbook use is internal-to-internal communication.\nAnswer: hosts that communicate only with other internal hosts.",
    None,
))

items.append(T(
    49,
    "What is a similarity between 1000BASE-LX and 1000BASE-T standards?",
    [
        "Both use the same data-link header and trailer formats.",
        "Both cable types support RJ-45 connectors.",
        "Both support up to 550 meters between nodes.",
        "Both cable types support LR connectors.",
    ],
    0,
    "1000BASE-T (copper) and 1000BASE-LX (fiber) differ in physical media but both carry Ethernet frames with the same IEEE 802.3 data-link framing (header/trailer structure) at 1 Gbps.\nRJ-45 is for copper, not LX fiber.\nDistance and connector types differ between copper and single-mode/multimode LX optics.\nThe shared property is Ethernet data-link framing.",
    None,
))

items.append(T(
    50,
    "Which function forwards frames to ports that have a matching destination MAC address?",
    ["frame flooding", "frame filtering", "frame pushing", "frame switching"],
    3,
    "When the destination MAC is known, a switch performs frame switching/forwarding out the learned port.\nFlooding is used for unknown unicast/broadcast/multicast behaviors (send out other ports), not selective known-unicast delivery.\nFiltering drops frames (e.g., same-segment decisions / security), not the positive act of forwarding to the match port.\n“Frame pushing” is not standard switching terminology here.\nCorrect function name: frame switching.",
    None,
))

items.append(T(
    51,
    "Which type of IPv6 address is similar to a unicast address but is assigned to multiple devices on the same network at the same time?",
    [
        "global unicast address",
        "link-local address",
        "anycast address",
        "multicast address",
    ],
    2,
    "Anycast uses a unicast-form address assigned to multiple interfaces; packets go to the “nearest” node per routing.\nGlobal and link-local unicast identify a single interface (per node) in normal use.\nMulticast delivers to all members of a group, which is a different model than anycast’s one-nearest delivery.\nThe description matches anycast.",
    None,
))

items.append(T(
    52,
    "What is a characteristic of private IPv4 addressing?",
    [
        "composed of up to 65,536 available addresses",
        "issued by IANA in conjunction with an autonomous system number",
        "used without tracking or registration",
        "traverse the Internet when an outbound ACL is applied",
    ],
    2,
    "Private addresses (RFC 1918) can be used internally without registration/tracking with a public registry for each host.\nThe private space is far larger than 65,536 addresses across 10/8, 172.16/12, and 192.168/16.\nIANA does not issue private blocks with AS numbers the way public PI/PA space works.\nPrivate addresses do not freely traverse the public Internet merely because an ACL is applied; NAT or similar is required for Internet reachability.\nCharacteristic: used without tracking or registration.",
    None,
))

items.append(T(
    53,
    "What is the function of a controller in controller-based networking?",
    [
        "It serves as the centralized management point of an SDN architecture",
        "It is a pair of core routers that maintain all routing decisions for a campus",
        "It centralizes the data plane for the network",
        "It is the card on a core router that maintains all routing decisions for a campus.",
    ],
    0,
    "In controller-based / SDN architectures, the controller centralizes control/management functions and programs network devices.\nIt does not mean two campus core routers by definition.\nThe data plane remains distributed on the forwarding devices; the controller does not usually “centralize the data plane.”\nIt is not merely a line card on a core router.\nFunction: centralized management/control point of SDN.",
    None,
))

items.append(T(
    54,
    "How do TCP and UDP fit into a query-response model?",
    [
        "TCP avoids using sequencing and UDP avoids using acknowledgments",
        "TCP establishes a connection prior to sending data, and UDP sends immediately",
        "TCP encourages out-of-order packet delivery, and UDP prevents re-ordering",
        "TCP uses error detection for packets, and UDP uses error recovery.",
    ],
    1,
    "In client/server query-response apps, TCP pays the connection-setup cost before data; UDP can send the request/response datagrams immediately without a handshake.\nTCP uses sequencing; it does not avoid it.\nTCP prefers in-order delivery; UDP does not prevent reordering.\nUDP has no transport error recovery; TCP does recovery. Option D reverses the recovery idea.\nBest contrast: connection first (TCP) vs send immediately (UDP).",
    None,
))

items.append(T(
    55,
    "What provides centralized control of authentication and roaming in an enterprise network?",
    [
        "a lightweight access point",
        "a wireless LAN controller",
        "a firewall",
        "a LAN switch",
    ],
    1,
    "A WLC centralizes WLAN configuration, security policy, authentication integration, and mobility/roaming control for lightweight APs.\nLightweight APs depend on the WLC for much of that control plane.\nFirewalls and LAN switches are important but are not the enterprise WLAN central brain for AP authentication/roaming.\nAnswer: wireless LAN controller.",
    None,
))

items.append(T(
    56,
    "Which set of 2.4 GHz nonoverlapping wireless channels is standard in the United States?",
    [
        "channels 1, 6, 11, and 14",
        "channels 2, 7, 9, and 11",
        "channels 2, 7, and 11",
        "channels 1, 6, and 11",
    ],
    3,
    "US 2.4 GHz WLAN design standard nonoverlapping channels are 1, 6, and 11.\nChannel 14 is not used in the US for 802.11.\nOther listed mixes include overlapping channels or nonstandard sets.\nAnswer: 1, 6, and 11.",
    None,
))

items.append(T(
    57,
    "A network engineer is installing an IPv6-only capable device. The client has requested that the device IP address be reachable only from the internal network. Which type of IPv6 address must the engineer assign?",
    [
        "IPv4-compatible IPv6 address",
        "unique local address",
        "link-local address",
        "aggregatable global address",
    ],
    1,
    "Unique local addresses (ULA, fc00::/7 / fd00::/8) are for internal site addressing and are not globally routable on the Internet — matching “reachable only from the internal network.”\nLink-local is only same-link, not site-wide internal reachability.\nGlobal unicast is Internet-routable by design.\nIPv4-compatible IPv6 addresses are obsolete and not the internal-only solution.\nCORRECTED from source index 2 (link-local) to index 1 (unique local): link-local cannot serve internal multi-hop LAN/site reachability.",
    ticket(
        57,
        "Chamado #5701 — Servidor IPv6-only deve ser alcançável só na rede interna (vários VLANs/site), sem Internet. Configuraram só link-local; outros andares não alcançam.",
        "SRV# show ipv6 interface brief\nGigabitEthernet0/0  [up/up]\n    FE80::A1B2:C3FF:FE45:6789\n    ! (sem GUA/ULA)\n\nR1# ping FE80::A1B2:C3FF:FE45:6789\n% Invalid source / not on same link when sourcing from remote VLAN",
        [
            "Falta ULA (fd00::/8) site-local; link-local não roteia entre VLANs do campus interno.",
            "Link-local FE80 roteia entre todos os andares por padrão OSPFv3.",
            "Global unicast 2001:db8:: é a única forma de manter tráfego só interno.",
            "IPv4-compatible ::ffff:10.0.0.1 é obrigatória em IPv6-only.",
        ],
        0,
        "Link-local não atravessa roteadores. Para reachability interna multi-subnet sem Internet, use unique local (fd00::/8) e roteamento IPv6 interno.\nA chave da fonte apontava link-local; isso conflita com “internal network” multi-hop — ULA é a resposta correta.",
    ),
))

items.append(T(
    58,
    "What is a requirement for nonoverlapping Wi-Fi channels?",
    [
        "different security settings",
        "discontinuous frequency ranges",
        "unique SSIDs",
        "different transmission speeds",
    ],
    1,
    "Nonoverlapping channels occupy frequency ranges that do not significantly overlap in spectrum (e.g., 1/6/11 in 2.4 GHz).\nSecurity settings and SSIDs can be identical across APs; that does not define nonoverlap.\nData rates do not define channel overlap.\nRequirement: discontinuous (nonoverlapping) frequency ranges.",
    None,
))

items.append(T(
    59,
    "A network engineer must implement an IPv6 configuration on the vlan 2000 interface to create a routable locally-unique unicast address that is blocked from being advertised to the internet. Which configuration must the engineer apply?",
    [
        "interface vlan 2000\nipv6 address ff00:0000:aaaa::1234:2343/64",
        "interface vlan 2000\nipv6 address fd00::1234:2343/64",
        "interface vlan 2000\nipv6 address fe80:0000:aaaa::1234:2343/64",
        "interface vlan 2000\nipv6 address fc00:0000:aaaa::a15d:1234:2343:8aca/64",
    ],
    1,
    "Need a unique local unicast (ULA): fc00::/7, with locally assigned addresses using fd00::/8 in practice.\nff00::/8 is multicast, not a host unicast ULA.\nfe80::/10 is link-local, not site-routable ULA across the enterprise the same way.\nfd00::1234:2343/64 is a clear ULA configuration.\nfc00::/8 is reserved in RFC 4193 for future definition; operational ULA is fd00::/8. Source key selected fc00… (index 3); we correct to fd00 (index 1) as the standards-correct ULA assignment.",
    ticket(
        59,
        "Chamado #5901 — SVI Vlan2000 precisa de IPv6 interno site-local (não Internet). Configuraram ff00::/ multicast por engano.",
        "R1# show run interface vlan 2000\ninterface Vlan2000\n ipv6 address ff00:0:aaaa::1234:2343/64\n\nR1# show ipv6 interface vlan 2000\n  IPv6 is enabled\n  Joined group address(es):\n    FF00:0:AAAA::1234:2343\n  ! sem unicast ULA",
        [
            "ff00::/8 é multicast; usar ULA fd00::/8 (ex.: fd00::1234:2343/64) para unicast local de site.",
            "ff00:: é ULA válida e deve ser anunciada na Internet.",
            "fe80:: na SVI impede qualquer ping na mesma VLAN.",
            "Multicast ff00 é o formato exigido para “locally-unique unicast”.",
        ],
        0,
        "Locally-unique site unicast = ULA fd00::/8 (fc00::/7). Multicast prefix está errado no running-config.\nCorrigir para fd00::/64 na Vlan2000.",
    ),
))

items.append(T(
    60,
    "When a switch receives a frame for a known destination MAC address, how is the frame handled?",
    [
        "flooded to all ports except the one from which it originated",
        "forwarded to the first available port",
        "sent to the port identified for the known MAC address",
        "broadcast to all ports",
    ],
    2,
    "Known unicast: switch consults the MAC address table and forwards out only the port associated with that destination MAC.\nFlooding is for unknown unicast (and similar cases), not known entries.\n“First available port” is not how MAC learning works.\nBroadcast is for broadcast destination MAC, not known unicast.\nAnswer: sent to the learned port.",
    ticket(
        60,
        "Chamado #6001 — Usuário alega que o switch “floda tudo”. Captura mostra unicast conhecido saindo só em uma porta. Validar comportamento.",
        "SW1# show mac address-table address 0050.56ab.cdef\n          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n  10    0050.56ab.cdef    DYNAMIC     Gi1/0/8\n\nSW1# show mac address-table dynamic interface gi1/0/8\n  10    0050.56ab.cdef    DYNAMIC     Gi1/0/8",
        [
            "MAC conhecido → frame unicast é enviado só à porta aprendida (Gi1/0/8), não flooded.",
            "Entrada DYNAMIC força flood em todas as portas da VLAN.",
            "Unicast conhecido é sempre broadcast ff:ff:ff:ff:ff:ff.",
            "Type DYNAMIC significa porta err-disabled.",
        ],
        0,
        "Tabela MAC com porta Gi1/0/8 prova known unicast switching para essa porta.\nFlood é o caso de unknown unicast/broadcast.",
    ),
))

items.append(T(
    61,
    "What is the collapsed layer in collapsed core architectures?",
    [
        "Core and distribution",
        "access and WAN",
        "distribution and access",
        "core and WAN",
    ],
    0,
    "Collapsed-core merges the core and distribution layers into one tier while access remains separate (two-tier campus).\nAccess+WAN or core+WAN are not the standard collapsed pair name.\nDistribution+access collapse would remove the user edge separation differently and is not the usual “collapsed core” term.\nAnswer: core and distribution.",
    None,
))

items.append(T(
    62,
    "What is a characteristic of a SOHO network?",
    [
        "includes at least three tiers of devices to provide load balancing and redundancy",
        "connects each switch to every other switch in the network",
        "enables multiple users to share a single broadband connection",
        "provides high throughput access for 1000 or more users",
    ],
    2,
    "SOHO networks typically share one broadband Internet link among a few users/devices.\nThree-tier redundant designs and 1000+ user campuses are enterprise scale.\nFull mesh of all switches is not a SOHO characteristic.\nAnswer: multiple users share a single broadband connection.",
    None,
))

items.append(T(
    63,
    "What is the role of disaggregation in controller-based networking?",
    [
        "It divides the control-plane and data-plane functions.",
        "It streamlines traffic handling by assigning individual devices to perform either Layer 2 or Layer 3 functions",
        "It summarizes the routes between the core and distribution layers of the network topology",
        "It enables a network topology to quickly adjust from a ring network to a star network",
    ],
    0,
    "Disaggregation in SDN/controller models separates (disaggregates) control-plane decision making from data-plane forwarding elements.\nIt is not primarily about forcing devices to be only L2 or only L3.\nRoute summarization and ring-to-star conversion are unrelated definitions.\nRole: divide control-plane and data-plane functions.",
    None,
))

items.append(T(
    64,
    "What is a function performed by a web server?",
    [
        "send and retrieve email from client devices",
        "securely store files for FTP access",
        "authenticate and authorize a user's identity",
        "provide an application that is transmitted over HTTP",
    ],
    3,
    "Web servers deliver HTTP/HTTPS application content to clients.\nEmail send/retrieve is mail server (SMTP/IMAP/POP) roles.\nFTP storage is an FTP server function.\nAAA may be integrated but is not the defining web server function among these choices.\nAnswer: provide an application transmitted over HTTP.",
    None,
))

items.append(T(
    65,
    "Which protocol uses SSL?",
    ["SSH", "HTTPS", "HTTP", "Telnet"],
    1,
    "HTTPS is HTTP over TLS/SSL for encrypted web transport.\nSSH uses its own binary protocol and algorithms, not classic SSL as the answer.\nHTTP is cleartext.\nTelnet is cleartext remote access.\nAnswer: HTTPS.",
    None,
))

assert len(items) == 25
Path(__file__).with_name("lote_41_65.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("wrote lote_41_65.json", len(items))
