# -*- coding: utf-8 -*-
"""Enrich questions 16-40 → lote_16_40.json"""
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
    16,
    "What is the difference regarding reliability and communication type between TCP and UDP?",
    [
        "TCP is reliable and is a connectionless protocol; UDP is not reliable and is a connection-oriented protocol.",
        "TCP is not reliable and is a connectionless protocol; UDP is reliable and is a connection-oriented protocol.",
        "TCP is not reliable and is a connection-oriented protocol; UDP is reliable and is a connectionless protocol.",
        "TCP is reliable and is a connection-oriented protocol; UDP is not reliable and is a connectionless protocol.",
    ],
    3,
    "TCP establishes a session (three-way handshake), numbers segments, uses acknowledgments, and retransmits lost data — that combination makes it connection-oriented and reliable from the application view.\nUDP does not build a connection, does not retransmit, and does not guarantee delivery; it only provides a lightweight datagram service with optional checksum, so it is connectionless and best-effort.\nOption A swaps the connection models: TCP is not connectionless, and UDP is not connection-oriented.\nOption B reverses reliability and connection properties for both protocols.\nOption C correctly notes TCP as connection-oriented but wrongly claims TCP is unreliable and UDP is reliable.\nThe only fully correct pairing is option D (index 3).",
    None,
))

items.append(T(
    17,
    "Which type of IPv6 address is publicly routable in the same way as IPv4 public addresses?",
    ["multicast", "unique local", "link-local", "global unicast"],
    3,
    "Global unicast addresses (typically 2000::/3) are assigned for Internet-wide uniqueness and are routed on the public IPv6 Internet similarly to public IPv4 addresses.\nUnique local addresses (fc00::/7, commonly fd00::/8) are for site-local use and are not meant to be advertised on the global Internet.\nLink-local addresses (fe80::/10) are valid only on the local link and never leave that segment.\nMulticast addresses (ff00::/8) identify groups of receivers, not a single publicly routable host endpoint like a public unicast.\nTherefore the publicly routable unicast type is global unicast.",
    None,
))

items.append(T(
    18,
    "What is the expected outcome when an EUI-64 address is generated?",
    [
        "The interface ID is configured as a random 64-bit value",
        "The characters FE80 are inserted at the beginning of the MAC address of the interface",
        "The seventh bit of the original MAC address of the interface is inverted",
        "The MAC address of the interface is used as the interface ID without modification",
    ],
    2,
    "EUI-64 builds a 64-bit interface identifier from a 48-bit MAC by inserting FFFE in the middle and flipping the U/L bit (the seventh bit of the first byte).\nThat bit flip is the defining step of the classic EUI-64 algorithm used with SLAAC.\nA random 64-bit value describes privacy extensions or random IIDs, not classic EUI-64.\nFE80 is the link-local prefix, not something inserted into the MAC itself.\nUsing the MAC unchanged without FFFE and without the U/L flip is incorrect for EUI-64.\nHence the expected outcome called out here is inversion of the seventh bit (option C).",
    ticket(
        18,
        "Chamado #1801 — Hosts IPv6 mostram interface ID diferente do MAC do NIC; o time de inventário esperava o MAC “cru” e suspeita de erro de SLAAC. Switch L3 com EUI-64 na SVI.",
        "R1# show ipv6 interface vlan 10\nVlan10 is up, line protocol is up\n  IPv6 is enabled, link-local address is FE80::C800:11FF:FE22:3344\n  Global unicast address(es):\n    2001:DB8:10:1:C800:11FF:FE22:3344, subnet is 2001:DB8:10:1::/64 [EUI]\n\nR1# show interfaces vlan 10\n  Hardware is EtherSVI, address is ca00.1122.3344\n\n! MAC ca00.1122.3344 → IID C800:11FF:FE22:3344 (FFFE + U/L bit flip CA→C8)",
        [
            "O IID EUI-64 inverte o bit U/L e insere FFFE; o MAC não aparece “cru” no endereço IPv6 — comportamento esperado.",
            "FE80 no início do GUA prova que o prefixo global está errado e o SLAAC falhou.",
            "EUI-64 usa o MAC sem qualquer modificação; o show indica bug de IOS.",
            "O bit invertido só ocorre com privacy extensions, nunca com EUI-64.",
        ],
        0,
        "Com EUI-64, o MAC ca00.1122.3344 vira C800:11FF:FE22:3344: FFFE no meio e flip do 7º bit (CA→C8).\nIsso é o comportamento correto, não um erro de inventário.\nFE80 é só o link-local; o GUA usa o prefixo 2001:DB8:10:1::/64 com o mesmo IID.\nPrivacy extensions gerariam IID aleatório, não este padrão EUI.",
    ),
))

items.append(T(
    19,
    "A corporate office uses four floors in a building.\n• Floor 1 has 24 users.\n• Floor 2 has 29 users.\n• Floor 3 has 28 users.\n• Floor 4 has 22 users.\nWhich subnet summarizes and gives the most efficient distribution of IP addresses for the router configuration?",
    [
        "192.168.0.0/24 as summary and 192.168.0.0/28 for each floor",
        "192.168.0.0/23 as summary and 192.168.0.0/25 for each floor",
        "192.168.0.0/25 as summary and 192.168.0.0/27 for each floor",
        "192.168.0.0/26 as summary and 192.168.0.0/29 for each floor",
    ],
    2,
    "The largest floor needs 29 host addresses. A /27 provides 32 addresses (30 usable hosts), which fits 29 users with room for gateway and spare capacity.\nFour contiguous /27 subnets total a /25 summary (128 addresses), which is an efficient block: 192.168.0.0/25 covering four /27s.\nA /28 (14 usable) is too small for 29 users.\nA /25 per floor wastes space (126 usable each) and a /23 summary is larger than needed.\nA /29 (6 usable) is far too small for any floor.\nThus 192.168.0.0/25 summary with 192.168.0.0/27 per floor is the best fit.",
    None,
))

items.append(T(
    20,
    "What is a characteristic of spine-and-leaf architecture?",
    [
        "Each link between leaf switches allows for higher bandwidth.",
        "It provides greater predictability on STP blocked ports.",
        "It provides variable latency.",
        "Each device is separated by the same number of hops.",
    ],
    3,
    "In a spine-and-leaf fabric, every leaf connects to every spine, so any two endpoints are typically separated by a fixed hop count (leaf–spine–leaf), giving consistent latency and path length.\nLeaf switches do not form a full mesh of leaf-to-leaf links as the primary design; east-west traffic goes leaf–spine–leaf.\nSTP blocked-port behavior is not the design goal of modern spine-leaf (often Layer 3 ECMP instead of large L2 domains).\nVariable latency is the opposite of the intended equal-cost, predictable fabric.\nTherefore “same number of hops” is the characteristic that matches spine-and-leaf.",
    None,
))

items.append(T(
    21,
    "Using direct sequence spread spectrum, which three 2.4-GHz channels are used to limit collisions?",
    ["5, 6, 7", "1, 2, 3", "1, 6, 11", "1, 5, 10"],
    2,
    "In the 2.4 GHz ISM band (DSSS/OFDM as used by 802.11b/g/n), channels 1, 6, and 11 are the classic nonoverlapping set in the United States and many regions.\nUsing adjacent channels such as 5–6–7 or 1–2–3 causes heavy spectral overlap and co-channel/adjacent interference.\nChannels 1, 5, and 10 are not the standard nonoverlapping triple taught for 2.4 GHz WLAN design.\nLimiting collisions/interference among neighboring APs depends on spacing nonoverlapping channels — 1, 6, and 11.",
    None,
))

items.append(T(
    22,
    "How do TCP and UDP differ in the way they guarantee packet delivery?",
    [
        "TCP uses retransmissions, acknowledgment, and parity checks, and UDP uses cyclic redundancy checks only",
        "TCP uses two-dimensional parity checks, checksums, and cyclic redundancy checks, and UDP uses retransmissions only",
        "TCP uses checksum, acknowledgements, and retransmissions, and UDP uses checksums only",
        "TCP uses checksum, parity checks, and retransmissions, and UDP uses acknowledgements only",
    ],
    2,
    "TCP detects errors with a checksum and recovers with acknowledgments and retransmissions of lost segments.\nUDP may use a checksum for error detection but provides no recovery (no ACK/retransmit) at the transport layer.\nParity-check wording is not the standard model of TCP/UDP delivery guarantees in CCNA-level descriptions.\nUDP does not use retransmissions or acknowledgments as its delivery model.\nOption C correctly contrasts TCP recovery mechanisms with UDP’s checksum-only approach.",
    None,
))

items.append(T(
    23,
    "A wireless administrator has configured a WLAN; however, the clients need access to a less congested 5-GHz network for their voice quality. Which action must be taken to meet the requirement?",
    ["enable Band Select", "enable DTIM", "enable RX-SOP", "enable AAA override"],
    0,
    "Cisco Band Select (Client Band Select) steers dual-band clients toward the 5 GHz band when appropriate, reducing load on congested 2.4 GHz and improving experience for voice-capable clients.\nDTIM relates to power-save delivery timing for multicast/broadcast, not band preference.\nRX-SOP adjusts receive start of packet sensitivity for cell sizing, not primarily “prefer 5 GHz for voice.”\nAAA override applies dynamic policy from RADIUS (VLAN/ACL/QoS), not band steering.\nTo move clients to less congested 5 GHz for voice quality, enable Band Select.",
    ticket(
        23,
        "Chamado #2301 — Voz wireless ruim no 2.4 GHz (utilização alta). Clientes dual-band não sobem para 5 GHz. WLC com Band Select desabilitado no SSID CORP-VOICE.",
        "WLC> show wlan 12\nWLAN Identifier.................................. 12\nProfile Name..................................... CORP-VOICE\nNetwork Name (SSID).............................. CORP-VOICE\nStatus........................................... Enabled\n...\nBand Select...................................... Disabled\n\nWLC> show advanced 802.11b summary\nAP Name  Channel  Utilization\nAP-FL2   6        82%\n\nWLC> show advanced 802.11a summary\nAP Name  Channel  Utilization\nAP-FL2   36       18%",
        [
            "Band Select está Disabled; habilitar Client Band Select no WLAN para preferir 5 GHz menos congestionado.",
            "DTIM alto no 5 GHz impede qualquer associação em 802.11a/n/ac.",
            "Utilization 82% no 2.4 GHz é ideal para voice e não requer ação.",
            "AAA override é a única feature que move clientes de banda no CCNA.",
        ],
        0,
        "O show wlan confirma Band Select Disabled enquanto o 2.4 GHz está congestionado e o 5 GHz livre.\nBand Select é a feature de steering para dual-band clients.\nHabilite Band Select no WLAN CORP-VOICE (e valide radio policy inclui 5 GHz).",
    ),
))

items.append(T(
    24,
    "What is the destination MAC address of a broadcast frame?",
    [
        "00:00:0c:07:ac:01",
        "ff:ff:ff:ff:ff:ff",
        "43:2e:08:00:00:0c",
        "00:00:0c:43:2e:08",
    ],
    1,
    "An Ethernet Layer-2 broadcast uses the all-ones destination MAC address ff:ff:ff:ff:ff:ff so every station on the LAN segment processes the frame.\n00:00:0c:07:ac:01 is a well-known HSRP virtual MAC pattern (example), not a broadcast.\nOther unicast-looking addresses identify specific NICs or vendor OUIs, not “everyone.”\nSwitches flood broadcasts out all ports in the VLAN (except the ingress), but the destination address field itself is ff:ff:ff:ff:ff:ff.",
    None,
))

items.append(T(
    25,
    "For what two purposes does the Ethernet protocol use physical addresses? (Choose two concept — cleaned to one best combined answer set)",
    [
        "to uniquely identify devices at Layer 2 and allow communication between devices on the same network",
        "to allow communication with devices on a different network without a router",
        "to differentiate a Layer 2 frame from a Layer 3 packet by rewriting the EtherType to IP",
        "to establish a priority system that decides which device transmits first using MAC values",
    ],
    0,
    "Ethernet MAC (physical) addresses uniquely identify interfaces at Layer 2 so frames can be delivered between devices on the same LAN/broadcast domain.\nThey do not replace IP routing: reaching a different network requires a Layer-3 hop (router/gateway).\nMACs are not a general priority scheduler for media access in the sense of “highest MAC wins always” as the design purpose of addressing.\nEtherType identifies the payload type; MACs do not exist to “turn a frame into a packet.”\nThe cleaned correct idea combines unique L2 identity with same-network delivery (option A).",
    None,
))

items.append(T(
    26,
    "You are configuring your edge router interface with a public IP address for Internet connectivity. The router needs to obtain the IP address from the service provider dynamically. Which command is needed on interface FastEthernet 0/0 to accomplish this?",
    [
        "ip default-gateway",
        "ip route",
        "ip default-network",
        "ip address dhcp",
    ],
    3,
    "On a Cisco router interface, ip address dhcp makes that interface a DHCP client so the ISP can assign the address dynamically.\nip default-gateway is used on Layer-2 switches (or hosts), not the primary way for a router to get its WAN IP.\nip route and ip default-network deal with routing, not interface address assignment from a DHCP server.\nip address dynamic is not the standard IOS interface command for DHCP client mode.\nTherefore the required interface command is ip address dhcp.",
    ticket(
        26,
        "Chamado #2601 — Edge R-EDGE precisa de IP público dinâmico do ISP na Fa0/0. Interface sem IP; Internet down. Time usou ip default-gateway por engano.",
        "R-EDGE# show run interface fastEthernet 0/0\ninterface FastEthernet0/0\n description WAN-ISP\n ip default-gateway 203.0.113.1\n duplex auto\n speed auto\n\nR-EDGE# show ip interface brief\nInterface                  IP-Address      OK? Method Status                Protocol\nFastEthernet0/0            unassigned      YES unset  up                    up\n\nR-EDGE# show ip route\nGateway of last resort is not set",
        [
            "Falta ip address dhcp na Fa0/0; ip default-gateway não atribui IP de interface em roteador.",
            "ip default-gateway na interface faz o IOS obter DHCP automaticamente.",
            "Status up/up com unassigned é impossível; o cabo está down.",
            "Basta ip route 0.0.0.0 0.0.0.0 Fa0/0 sem endereço IP.",
        ],
        0,
        "Roteadores usam ip address dhcp no interface para cliente DHCP no ISP.\nip default-gateway é comando de host/L2 switch, não preenche IP da Fa0/0.\nCom unassigned, não há WAN IP nem default funcional.",
    ),
))

items.append(T(
    27,
    "Which technique can you use to route IPv6 traffic over an IPv4 infrastructure?",
    ["NAT", "6to4 tunneling", "L2TPv3", "dual-stack"],
    1,
    "6to4 (and related IPv6-over-IPv4 tunneling approaches) encapsulate IPv6 packets so they can traverse an IPv4-only underlay.\nClassic NAT (NAT44) does not by itself provide IPv6 transport across IPv4.\nL2TPv3 is a Layer-2 tunneling technology, not the standard CCNA answer for carrying IPv6 over IPv4 routing infrastructure.\nDual-stack means both protocols run natively end-to-end; it does not alone carry IPv6 across an IPv4-only path without tunnels or translation.\nFor routing IPv6 over IPv4 infrastructure, tunneling such as 6to4 is the matching technique here.",
    None,
))

items.append(T(
    28,
    "Which WAN access technology is preferred for a small office / home office architecture?",
    [
        "broadband cable access",
        "frame-relay packet switching",
        "dedicated point-to-point leased line",
        "Integrated Services Digital Network switching",
    ],
    0,
    "SOHO sites commonly use inexpensive broadband access (cable, DSL, fiber-to-the-home style services) for Internet and VPN backhaul.\nFrame Relay and classic ISDN are legacy WAN technologies rarely preferred for modern SOHO.\nDedicated leased lines are reliable but costly and overkill for many small/home offices.\nAmong the listed options, broadband cable access is the preferred SOHO choice.",
    None,
))

items.append(T(
    29,
    "What is the binary pattern of unique IPv6 unique local address?",
    ["00000000", "11111100", "11111111", "11111101"],
    1,
    "Unique local addresses fall under fc00::/7. The first 7 bits of the prefix are 1111110, and the L bit makes the commonly used fd00::/8 appear as 11111101 for locally assigned ULA — many exam items present the FC00::/7 leading pattern as 11111100.\nCisco CCNA-style items often key “unique local” to the FC00::/7 binary start 1111 110x → 11111100 as the listed pattern among short 8-bit choices.\n00000000 is not a ULA identifier pattern.\n11111111 is associated with multicast ff00::/8 style leading ones, not ULA.\n11111101 corresponds to fd00::/8 specifically; the source answer key selects 11111100 for the ULA /7 pattern.\nKeep answer index 1 as in the source key for FC00::/7.",
    None,
))

items.append(T(
    30,
    "What is the same for both copper and fiber interfaces when using SFP modules?",
    [
        "They support an inline optical attenuator to enhance signal strength",
        "They accommodate single-mode and multi-mode in a single module",
        "They provide minimal interruption to services by being hot-swappable",
        "They offer reliable bandwidth up to 100 Mbps in half duplex mode",
    ],
    2,
    "SFP (and similar pluggables) are hot-swappable on both copper and optical variants, allowing replacement with minimal service disruption when the platform supports OIR.\nOptical attenuators apply to fiber optics, not copper SFPs.\nA single module does not universally speak both SMF and MMF as a general “same for copper and fiber” property.\n100 Mbps half duplex is not the shared modern characteristic of copper vs fiber SFP ports (many are 1G+).\nHot-swappability is the common property.",
    None,
))

items.append(T(
    31,
    "Which function is performed by the collapsed core layer in a two-tier architecture?",
    [
        "enforcing routing policies",
        "marking interesting traffic for data policies",
        "applying security policies",
        "attaching users to the edge of the network",
    ],
    0,
    "In a two-tier (collapsed core) design, core and distribution roles merge. That collapsed layer still performs distribution/core jobs such as routing between VLANs/buildings and enforcing routing policies toward the rest of the network.\nAttaching end users is the access layer function, not the collapsed core.\nWhile security and QoS can appear in multiple layers, the classic answer for collapsed-core responsibilities emphasizes inter-VLAN/core routing policy functions.\n“Marking interesting traffic for data policies” is vague and not the defining collapsed-core role.\nAmong the options, enforcing routing policies best matches the collapsed core/distribution role.",
    None,
))

items.append(T(
    32,
    "What is a recommended approach to avoid co-channel congestion while installing access points that use the 2.4 GHz frequency?",
    [
        "different nonoverlapping channels",
        "one overlapping channel",
        "one nonoverlapping channel",
        "different overlapping channels",
    ],
    0,
    "Neighboring APs on 2.4 GHz should use different nonoverlapping channels (commonly 1, 6, and 11) to reduce co-channel and adjacent-channel interference.\nUsing one channel everywhere maximizes co-channel contention.\nOverlapping channels (e.g., 1 and 2) cause harmful interference.\n“One nonoverlapping channel” for all APs still creates co-channel congestion across the floor.\nPlan different nonoverlapping channels across adjacent cells.",
    None,
))

items.append(T(
    33,
    "A manager asks a network engineer to advise which cloud service models are used so employees do not have to waste their time installing, managing, and updating software that is only used occasionally. Which cloud service model does the engineer recommend?",
    [
        "infrastructure-as-a-service",
        "platform-as-a-service",
        "business process as service to support different types of service",
        "software-as-a-service",
    ],
    3,
    "SaaS delivers ready-to-use applications managed by the provider; users do not install or patch the application stack themselves — ideal for occasional-use software.\nIaaS provides virtual machines/storage/network where the customer still manages the OS and apps.\nPaaS provides a development/runtime platform, not primarily end-user occasional apps.\n“Business process as a service” is not the standard NIST model highlighted for this CCNA-style question.\nRecommend software-as-a-service (SaaS).",
    None,
))

items.append(T(
    34,
    "An engineer observes high usage on the 2.4 GHz channels and lower usage on the 5 GHz channels. What must be configured to allow clients to preferentially use 5 GHz access points?",
    [
        "Client Band Select",
        "Re-Anchor Roamed Clients",
        "OEAP Split Tunnel",
        "11ac MU-MIMO",
    ],
    0,
    "Client Band Select biases dual-band clients to associate on 5 GHz when the WLAN/AP allows it, balancing load away from crowded 2.4 GHz.\nRe-Anchor Roamed Clients relates to mobility/anchor behavior for guest/roam scenarios.\nOEAP split tunnel is for teleworker AP traffic splitting, not enterprise band preference.\nMU-MIMO improves spatial efficiency on capable radios; it does not by itself force 5 GHz preference.\nConfigure Client Band Select.",
    ticket(
        34,
        "Chamado #3401 — Utilização 2.4 GHz alta e 5 GHz ociosa no mesmo AP. Clientes dual-band permanecem em 2.4. Band Select off.",
        "WLC> show wlan 5\nSSID..................................... CORP\nBand Select.............................. Disabled\nRadio Policy............................. All\n\nWLC> show ap auto-rf 802.11b AP-CORE\nLoad Profile............................. Failed\n\nWLC> show ap auto-rf 802.11a AP-CORE\nLoad Profile............................. Passed",
        [
            "Habilitar Client Band Select para preferir 5 GHz com 2.4 congestionado.",
            "Radio Policy All impede 5 GHz; mudar para 802.11b only.",
            "OEAP Split Tunnel move clientes para 5 GHz automaticamente.",
            "Load Profile Failed no 2.4 GHz indica que Band Select deve permanecer Disabled.",
        ],
        0,
        "Band Select Disabled + 2.4 overloaded e 5 GHz healthy = cenário clássico para Client Band Select.\nRadio Policy All já permite ambas as bandas; falta steering.",
    ),
))

items.append(T(
    35,
    "Which networking function occurs on the data plane?",
    [
        "processing inbound SSH management traffic",
        "sending and receiving OSPF Hello packets",
        "facilitates spanning-tree elections",
        "forwarding remote client/server traffic",
    ],
    3,
    "The data plane (forwarding plane) moves user packets from ingress to egress based on tables built by other planes.\nSSH management is management plane.\nOSPF Hellos and STP elections are control-plane protocol activities.\nForwarding client/server traffic is the classic data-plane function.",
    None,
))

items.append(T(
    36,
    "What is a network appliance that checks the state of a packet to determine whether the packet is legitimate?",
    ["Layer 2 switch", "LAN controller", "load balancer", "firewall"],
    3,
    "Stateful firewalls track connection state (and related tables) to decide if packets belong to legitimate sessions.\nA basic Layer-2 switch forwards based on MAC learning, not full connection state for legitimacy.\nLAN controllers (WLC) manage APs/WLAN policy, not the general definition of stateful packet legitimacy checking.\nLoad balancers distribute flows across servers; state may exist for persistence, but the exam answer for legitimacy checks is firewall.\nAnswer: firewall.",
    None,
))

items.append(T(
    37,
    "What is a role of access points in an enterprise network?",
    [
        "integrate with SNMP in preventing DDoS attacks",
        "serve as a first line of defense in an enterprise network",
        "connect wireless devices to a wired network",
        "support secure user logins to devices on the network",
    ],
    2,
    "Access points bridge 802.11 wireless clients onto the wired campus infrastructure (often via CAPWAP to a WLC in lightweight designs).\nThey are not primarily DDoS prevention appliances via SNMP.\nFirst line of defense is typically firewall/edge security, not the AP’s core role definition.\nUser authentication may involve 802.1X with RADIUS, but the fundamental AP role is wireless-to-wired attachment.\nCorrect: connect wireless devices to a wired network.",
    None,
))

items.append(T(
    38,
    "An implementer is preparing hardware for virtualization to create virtual machines on a host. What is needed to provide communication between hardware and virtual machines?",
    ["router", "hypervisor", "switch", "straight cable"],
    1,
    "The hypervisor (VMM) abstracts physical hardware and presents virtual hardware to VMs, mediating CPU, memory, storage, and I/O between host hardware and guests.\nA physical router or switch may connect the host northbound but is not what enables VM-to-hardware virtualization communication on the host.\nA straight-through cable is irrelevant to the hypervisor role.\nHypervisor is required.",
    None,
))

items.append(T(
    39,
    "In which situation is private IPv4 addressing appropriate for a new subnet on the network of an organization?",
    [
        "The network has multiple endpoint listeners, and it is desired to limit the number of broadcasts.",
        "The ISP requires the new subnet to be advertised to the Internet for web services.",
        "There is limited unique address space, and traffic on the new subnet will stay local within the organization.",
        "Traffic on the subnet must traverse a site-to-site VPN to an outside organization.",
    ],
    2,
    "RFC1918 private addressing is ideal when hosts stay internal (or use NAT/VPN carefully) and public IPv4 space is scarce.\nIf the ISP must advertise the subnet for public web services, public (or provider-assigned) addressing is required, not pure private without NAT strategy.\nBroadcast control is a L2 design issue, not the reason private addressing was created.\nSite-to-site VPN can carry private addresses, but the option as written is not the cleanest “most appropriate” vs internal-only traffic with limited public space.\nBest answer: limited unique space and local traffic stays inside the organization.",
    None,
))

items.append(T(
    40,
    "Which 802.11 frame type is indicated by a probe response after a client sends a probe request?",
    ["data", "management", "control", "action"],
    1,
    "Probe request/response are 802.11 management frames used for network discovery.\nData frames carry MSDU payload for user traffic.\nControl frames (ACK, RTS/CTS, etc.) coordinate medium access.\nAction frames are a management subtype family, but the standard classification for probe response in CCNA is management.\nAnswer: management.",
    None,
))

assert len(items) == 25
Path(__file__).with_name("lote_16_40.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("wrote lote_16_40.json", len(items))
