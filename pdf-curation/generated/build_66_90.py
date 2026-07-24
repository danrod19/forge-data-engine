# -*- coding: utf-8 -*-
"""Enrich questions 66-90 → lote_66_90.json"""
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
    66,
    "Which PoE mode enables powered-device detection and guarantees power when the device is detected?",
    ["auto", "static", "dynamic", "active"],
    0,
    "On Cisco switches, power inline auto (auto mode) performs PD discovery/classification and supplies power when a valid powered device is detected, up to available budget.\nStatic mode pre-allocates a configured wattage and is less about flexible detection-only behavior.\n“Dynamic” and “active” are not the standard pair of interface PoE modes taught as auto vs static in CCNA-style IOS.\nAnswer: auto.",
    ticket(
        66,
        "Chamado #6601 — AP não liga via PoE. Porta em power inline never; precisa detectar PD e alimentar automaticamente.",
        "SW1# show run interface gi1/0/12\ninterface GigabitEthernet1/0/12\n description AP-FLOOR2\n switchport access vlan 99\n power inline never\n\nSW1# show power inline gi1/0/12\nInterface Admin  Oper       Power   Device\nGi1/0/12  never  off        0.0     n/a",
        [
            "Admin never desliga PoE; configurar power inline auto para detecção e alimentação do AP.",
            "Oper off com never é o estado desejado para APs Cisco.",
            "power inline static é obrigatório e auto não detecta PD.",
            "VLAN 99 impede PoE na porta.",
        ],
        0,
        "power inline never disables PoE. auto enables detection and powering of PDs when budget allows.\nChange to power inline auto and verify show power inline.",
    ),
))

items.append(T(
    67,
    "How is RFC 1918 addressing used in a network?",
    [
        "They are used to access the Internet from the internal network without conversion.",
        "They are used in place of public addresses for increased security.",
        "They are used with NAT to preserve public IPv4 addresses.",
        "They are used by Internet Service Providers to route over the Internet.",
    ],
    2,
    "Private RFC 1918 addresses are commonly combined with NAT so many internal hosts share scarce public IPv4 addresses.\nThey cannot access the global Internet without translation/proxy of some form.\nSecurity is improved operationally by hiding topology, but the primary exam association is address preservation via NAT.\nISPs do not route RFC 1918 as global Internet destinations.\nAnswer: used with NAT to preserve public IPv4 addresses.",
    None,
))

items.append(T(
    68,
    "Which WAN topology has the highest degree of reliability?",
    ["point-to-point", "router-on-a-stick", "full mesh", "hub-and-spoke"],
    2,
    "Full mesh provides multiple alternate paths between sites, yielding the highest redundancy/reliability among common WAN topologies listed.\nPoint-to-point is simple but single path per link pair.\nHub-and-spoke depends on the hub and has limited alternate paths.\nRouter-on-a-stick is a LAN inter-VLAN method, not a WAN reliability topology.\nAnswer: full mesh.",
    None,
))

items.append(T(
    69,
    "What causes a port to be placed in the err-disabled state?",
    [
        "nothing plugged into the port",
        "link flapping",
        "latency",
        "shutdown command issued on the port",
    ],
    1,
    "Link flapping can trigger err-disable (link-flap) when the interface transitions up/down too frequently.\nAn empty port is simply down/notconnect, not err-disabled.\nLatency does not by itself err-disable a port.\nshutdown is administratively down, a different state than err-disabled.\nAnswer: link flapping.",
    ticket(
        69,
        "Chamado #6901 — Porta do usuário em err-disabled após cabo intermitente. Logs de link-flap.",
        "SW1# show interfaces gi1/0/22 status\nPort      Name       Status         Vlan  Duplex  Speed\nGi1/0/22  USER       err-disabled   10    auto    auto\n\nSW1# show logging | include ERR_DISABLE|flap\n%PM-4-ERR_DISABLE: link-flap error detected on Gi1/0/22, putting Gi1/0/22 in err-disable state\n%LINK-3-UPDOWN: Interface GigabitEthernet1/0/22, changed state to up\n%LINK-3-UPDOWN: Interface GigabitEthernet1/0/22, changed state to down",
        [
            "Link flapping disparou err-disable; corrigir cabo/patch e reativar a porta (no shut / recovery).",
            "err-disabled ocorre porque nada está plugado na porta.",
            "shutdown administrativo gera o log link-flap.",
            "Latency alta coloca a porta em err-disabled por padrão.",
        ],
        0,
        "Log link-flap + err-disabled is the classic physical intermittency case.\nFix cabling, then recover the interface.",
    ),
))

items.append(T(
    70,
    "A network engineer must configure an interface with IP address 10.10.10.145 and a subnet mask equivalent to 11111111.11111111.11111111.11111000. Which subnet mask must the engineer use?",
    ["/29", "/30", "/27", "/28"],
    0,
    "Binary mask …11111000 has five zeros in the last octet → 8−5=3 host bits → /29 (255.255.255.248).\n/30 is …11111100 (2 host bits).\n/28 is …11110000 (4 host bits).\n/27 is …11100000 (5 host bits).\nThe given pattern is /29.",
    ticket(
        70,
        "Chamado #7001 — Precisam IP 10.10.10.145 com máscara binária …11111000. Configuraram /28 por engano e o host caiu fora da subnet do gateway.",
        "R1# show run interface gi0/0\ninterface GigabitEthernet0/0\n ip address 10.10.10.145 255.255.255.240\n\nR1# show ip interface gi0/0\n  Internet address is 10.10.10.145/28\n\n! Máscara pedida: 255.255.255.248 (/29)",
        [
            "…11111000 = /29 (255.255.255.248); trocar de /28 para /29.",
            "/28 é idêntico a …11111000.",
            "/30 é a única máscara válida com .145.",
            "Binary 11111000 no último octeto é /27.",
        ],
        0,
        "Count host bits in the last octet: three zeros ⇒ /29.\nRunning-config /28 does not match the specified binary mask.",
    ),
))

items.append(T(
    71,
    "Which property is shared by 10GBASE-SR and 10GBASE-LR interfaces?",
    [
        "Both use the single-mode fiber type.",
        "Both require UTP cable media for transmission.",
        "Both require fiber cable media for transmission.",
        "Both use the multimode fiber type.",
    ],
    2,
    "Both 10GBASE-SR and 10GBASE-LR are optical Ethernet PHYs requiring fiber media.\nSR is multimode; LR is single-mode — they do not share the same fiber type.\nNeither is UTP-based like 10GBASE-T.\nShared property: fiber media.",
    None,
))

items.append(T(
    72,
    "Which device permits or denies network traffic based on a set of rules?",
    ["switch", "firewall", "wireless controller", "access point"],
    1,
    "Firewalls enforce permit/deny policy using rules (ACLs, stateful policies).\nSwitches primarily forward frames (though ACLs may exist, the device role named here is firewall).\nWLC and AP focus on wireless attachment/policy, not the general packet filter definition.\nAnswer: firewall.",
    None,
))

items.append(T(
    73,
    "What is the role of a firewall in an enterprise network?",
    [
        "determines which packets are allowed to cross from unsecured to secured networks",
        "processes unauthorized packets and allows passage to less secure segments of the network",
        "forwards packets based on stateless packet inspection",
        "explicitly denies all packets from entering an administrative domain",
    ],
    0,
    "Firewalls control traffic between trust zones, deciding what may pass from less-trusted to more-trusted networks (and vice versa per policy).\nDeliberately allowing unauthorized packets is the opposite of the role.\nMany enterprise firewalls are stateful, not only stateless.\nThey do not blindly deny all traffic; they apply policy.\nAnswer: determine which packets may cross between unsecured and secured networks.",
    None,
))

items.append(T(
    74,
    "Which action is taken by a switch port enabled for PoE power classification override?",
    [
        "As power usage on a PoE switch port is checked, data flow to the connected device is temporarily paused",
        "When a powered device begins drawing power from a PoE switch port, a syslog message is generated",
        "If a switch determines that a device is using less than the minimum configured power, it assumes the device has failed and disconnects it",
        "Should a monitored port exceed the maximum administrative value for power, the port is shut down and err-disabled",
    ],
    3,
    "With PoE policing/classification override behaviors on Cisco platforms, exceeding the configured maximum power can err-disable/shut the port to protect the budget and device.\nPausing all data while checking power is not the described override action.\nSyslog on power-draw start is not the defining override action.\nDisconnecting for drawing less than minimum is not the standard description.\nAnswer: exceed max administrative power → shut/err-disabled.",
    ticket(
        74,
        "Chamado #7401 — Porta PoE com power inline police foi para err-disabled após AP high-power. Logs de power deny.",
        "SW1# show power inline gi1/0/15\nInterface Admin  Oper       Power(Watts)  Device\nGi1/0/15  auto   errdisable 15.4          Ieee PD\n\nSW1# show logging | include POWER|ERR\n%ILPOWER-3-CONTROLLER_PORT_ERR: Controller port error, Interface Gi1/0/15: Power given, but Power Controller does not report Power Good\n%PM-4-ERR_DISABLE: pwr-err on Gi1/0/15",
        [
            "Porta excedeu/errou orçamento de potência PoE e foi err-disabled; ajustar max power/police ou PD, depois recuperar a interface.",
            "errdisable PoE ocorre só se a porta estiver sem cabo.",
            "Ieee PD no show prova que a porta nunca recebeu power.",
            "Oper errdisable é o estado normal de APs em produção.",
        ],
        0,
        "PoE police/max power violations lead to err-disable on the port.\nFix power budget/PD class, then recover the port.",
    ),
))

items.append(T(
    75,
    "What is a function of spine-and-leaf architecture?",
    [
        "Offers predictable latency of the traffic path between end devices.",
        "Exclusively sends multicast traffic between servers that are directly connected to the spine.",
        "Mitigates oversubscription by adding a layer of leaf switches.",
        "Limits payload size of traffic within the leaf layer.",
    ],
    0,
    "Equal hop counts leaf–spine–leaf provide predictable latency/bandwidth characteristics for east-west traffic.\nMulticast is not exclusively server-to-spine only by definition of the architecture.\nAdding leaves addresses scale-out of endpoints; the predictability of path length is the key function listed correctly in A.\nPayload size limiting is not a spine-leaf function.\nAnswer: predictable latency path between end devices.",
    None,
))

items.append(T(
    76,
    "Which action is taken by the data plane within a network device?",
    [
        "Constructs a routing table based on a routing protocol.",
        "Forwards traffic to the next hop.",
        "Looks up an egress interface in the forwarding information base.",
        "Provides CLI access to the network device.",
    ],
    1,
    "Data plane forwards user traffic toward the next hop/egress based on forwarding tables.\nBuilding routing tables is control plane.\nFIB lookup is part of forwarding; many keys accept “forwards to next hop” as the data-plane action. Source index is 1.\nCLI access is management plane.\nKeep source answer: forwards traffic to the next hop (index 1). Note option C is also data-plane-related; exam key prioritizes B.",
    None,
))

items.append(T(
    77,
    "What is the function of the control plane?",
    [
        "It exchanges routing table information.",
        "It provides CLI access to the network device.",
        "It looks up an egress interface in the forwarding information base.",
        "It forwards traffic to the next hop.",
    ],
    0,
    "Control plane runs protocols that build and exchange routing/forwarding information (e.g., OSPF/EIGRP/BGP).\nCLI is management plane.\nFIB lookup and forwarding are data plane.\nAnswer: exchanges routing table information.",
    None,
))

items.append(T(
    78,
    "Which cable/media choices support higher multi-gigabit rates (about 2.5–5 Gbps) commonly needed when connecting an access point to a switch/WLC path? (Cleaned from broken Choose-two OCR)",
    [
        "Cat 5e (multi-gigabit capable on supporting switch ports)",
        "1000BASE-LX/LH fiber only (max 1 Gbps optical Ethernet standard as named)",
        "Cat 3 cabling",
        "Cat 5 (non-e) as the preferred modern AP uplink",
    ],
    0,
    "Multi-gigabit (2.5G/5G) AP uplinks on copper typically require at least Cat 5e (often Cat 6) and mGig switch ports; 10GBASE-T also needs quality copper.\nOCR source mixed Choose-two options (10GBASE-T, Cat 5e, etc.). Cleaned to four coherent choices.\n1000BASE-LX/LH is a 1G optical standard name, not the multi-gig copper answer.\nCat 3 cannot sustain multi-gig AP uplinks.\nCat 5 (non-e) is below modern multi-gig recommendations versus Cat 5e/6.\nBest cleaned answer: Cat 5e multi-gig capable path (index 0). Original source_rc=0 mapped to first listed tech after cleanup.",
    None,
))

items.append(T(
    79,
    "What is a benefit for external users who consume public cloud resources?",
    [
        "Implemented over a dedicated WAN",
        "All hosted on physical servers",
        "Accessed over the Internet",
        "Located in the same data center as the users",
    ],
    2,
    "Public cloud resources are consumed by external users primarily over the Internet.\nDedicated WAN is more private connectivity (e.g., Direct Connect/MPLS), not the general public-cloud user benefit statement.\nCloud abstracts whether physical servers are visible to the consumer.\nUsers are not necessarily in the same DC as the cloud provider region.\nAnswer: accessed over the Internet.",
    None,
))

items.append(T(
    80,
    "An engineer must update the configuration on two PCs in two different subnets to communicate locally with each other. One PC is configured with IP address 192.168.25.128/25 and the other with 192.168.25.100/25. Which network mask must the engineer configure on both PCs to enable the communication?",
    ["255.255.255.248", "255.255.255.224", "255.255.255.0", "255.255.255.252"],
    2,
    "With /25, 192.168.25.0–127 and 192.168.25.128–255 are different subnets. .100 and .128 fall in different halves, so they are not local to each other.\nUsing 255.255.255.0 (/24) places both addresses in 192.168.25.0/24 so they communicate as on-link peers (same L2 assumed).\n/28,/27,/30 keep them separated or create tiny subnets that still won't cover both.\nAnswer: 255.255.255.0.",
    ticket(
        80,
        "Chamado #8001 — PC-A 192.168.25.100/25 e PC-B 192.168.25.128/25 no mesmo switch/VLAN não se pingam (ARP incompleto entre si). Gateway comum inexistente.",
        "PC-A> ipconfig\n  IPv4 Address. . . . . . . . . . . : 192.168.25.100\n  Subnet Mask . . . . . . . . . . . : 255.255.255.128\nPC-B> ipconfig\n  IPv4 Address. . . . . . . . . . . : 192.168.25.128\n  Subnet Mask . . . . . . . . . . . : 255.255.255.128\n\nPC-A> ping 192.168.25.128\n  Destination host unreachable (on-link calculation fails / wrong subnet)",
        [
            "Com /25, .100 e .128 estão em subnets diferentes; usar máscara 255.255.255.0 (/24) se devem ser on-link na mesma VLAN.",
            "/25 coloca .100 e .128 no mesmo bloco 192.168.25.128/25.",
            "255.255.255.252 faz ambos hosts da mesma /30 automaticamente.",
            "O problema é só Spanning Tree PortFast.",
        ],
        0,
        "/25 splits at .128. Host .100 is in the lower half; .128 is the network address of the upper half / first address issues aside, they are not the same subnet.\nWiden to /24 for local communication on one VLAN without a router.",
    ),
))

items.append(T(
    81,
    "Which key function is provided by the data plane?",
    [
        "Originating packets",
        "Exchanging routing table data",
        "Making routing decisions",
        "Forwarding traffic to the next hop",
    ],
    3,
    "Data plane forwards transit traffic to the next hop/egress interface.\nExchanging routing data and making control decisions are control plane.\n“Originating packets” is ambiguous (could be local process) and not the key data-plane definition.\nAnswer: forwarding traffic to the next hop.",
    None,
))

items.append(T(
    82,
    "When should an engineer implement a collapsed-core architecture?",
    [
        "Only when using VSS technology",
        "For small networks with minimal need for growth",
        "For large networks that are connected to multiple remote sites",
        "The access and distribution layers must be on the same device",
    ],
    1,
    "Collapsed core suits small networks that do not need independent core/distribution scaling.\nVSS is optional technology, not a requirement for collapsed core.\nLarge multi-site networks usually keep hierarchical modularity.\nAccess and distribution on the same device is not the definition (core+distribution collapse).\nAnswer: small networks with minimal growth need.",
    None,
))

items.append(T(
    83,
    "A client experiences slow throughput from a server that is directly connected to the core switch in a data center. A network engineer finds minimal latency on connections to the server, but data transfers are unreliable, and the output of the show interfaces counters errors command shows a high FCS-Err count on the interface that is connected to the server. What is the cause of the throughput issue?",
    [
        "a physical cable fault",
        "a speed mismatch",
        "high bandwidth usage",
        "a cable that is too long",
    ],
    0,
    "High FCS/CRC errors with unreliable transfers and low latency strongly indicate Layer-1 problems such as bad cable, connectors, or NIC/phy issues.\nSpeed mismatch more often shows duplex/collision patterns or link issues, but FCS with “minimal latency” points to corruption on the wire.\nHigh bandwidth usage causes congestion drops/latency, not typically interface FCS error counters.\nExcessive length can cause errors, but the standard best answer among these for FCS-Err is physical cable fault.\nAnswer: a physical cable fault.",
    ticket(
        83,
        "Chamado #8301 — Throughput ruim ao servidor no core; latência baixa; show interfaces com FCS-Err alto na porta do server.",
        "CORE# show interfaces gi1/0/48\nGigabitEthernet1/0/48 is up, line protocol is up\n  Full-duplex, 1000Mb/s, media type is 10/100/1000BaseTX\n  15231 input errors, 14802 CRC, 14802 frame, 0 overrun\n  0 output errors, 0 collisions\n\nCORE# show interfaces gi1/0/48 counters errors\nPort        Align-Err    FCS-Err   Xmit-Err    Rcv-Err\nGi1/0/48          120      14802         0      15231",
        [
            "FCS/CRC altos indicam falha física (cabo/conector/NIC); substituir cabo e retestar.",
            "FCS-Err alto com full-duplex prova congestionamento de banda apenas.",
            "Latência mínima elimina qualquer problema de Layer 1.",
            "0 collisions com CRC alto indica mismatch de native VLAN.",
        ],
        0,
        "FCS-Err/CRC on the server-facing interface is Layer-1 corruption evidence.\nReplace/test cable and NIC path; not a pure utilization issue.",
    ),
))

items.append(T(
    84,
    "What is the difference between 1000BASE-LX/LH and 1000BASE-ZX interfaces?",
    [
        "1000BASE-LX/LH interoperates with multimode and single-mode fiber, and 1000BASE-ZX needs a conditioning patch cable with multimode.",
        "1000BASE-ZX interoperates with dual-rate 100M/1G 10Km SFP over multimode fiber, and 1000BASE-LX/LH supports only single-rate",
        "1000BASE-ZX is supported on links up to 1000 km, and 1000BASE-LX/LH operates over links up to 70 km",
        "1000BASE-LX/LH is supported on links up to 10 km, and 1000BASE-ZX operates over links up to 70 km",
    ],
    3,
    "1000BASE-LX/LH is commonly specified around up to ~10 km on single-mode (and shorter on multimode with conditions).\n1000BASE-ZX is a long-reach single-mode optic often rated around ~70 km.\n1000 km is unrealistic for ZX in this comparison.\nThe distance contrast in option D matches typical CCNA/vendor comparison items.\nAnswer: LX/LH ~10 km vs ZX ~70 km.",
    None,
))

items.append(T(
    85,
    "Which concern is addressed with the use of private IPv4 addressing?",
    [
        "Lack of routing protocol support for CIDR and VLSM",
        "Lack of security protocols at the network perimeter",
        "Lack of available TCP/UDP ports per IPv4 address",
        "Lack of available publicly routable unique IPv4 addresses",
    ],
    3,
    "Private addressing (with NAT) addresses the scarcity of publicly routable unique IPv4 addresses.\nRouting protocols support CIDR/VLSM independently of RFC 1918.\nSecurity protocols at the perimeter are a different concern.\nTCP/UDP port counts per IP are not why RFC 1918 exists (OCR “IPv5” cleaned to IPv4).\nAnswer: lack of available publicly routable unique IPv4 addresses.",
    None,
))

items.append(T(
    86,
    "What is the path for traffic sent from one user workstation to another workstation on a separate switch in a three-tier architecture model?",
    [
        "access → core → access",
        "access → distribution → distribution → access",
        "access → core → distribution → access",
        "access → distribution → core → distribution → access",
    ],
    3,
    "In classic three-tier campus, user switches are access. Traffic between access switches goes up to distribution, across the core if needed, to the remote distribution, then down to the remote access switch.\nSkipping distribution or core violates the hierarchical model path for inter-switch user traffic across the campus.\nAnswer: access → distribution → core → distribution → access.",
    None,
))

items.append(T(
    87,
    "What is the difference between IPv6 unicast and anycast addressing?",
    [
        "An individual IPv6 unicast address is supported on a single interface on one node, but an IPv6 anycast address is assigned to a group of interfaces on multiple nodes.",
        "IPv6 anycast nodes must be explicitly configured to recognize the anycast address, but IPv6 unicast nodes require no special configuration.",
        "IPv6 unicast nodes must be explicitly configured to recognize the unicast address, but IPv6 anycast nodes require no special configuration.",
        "Unlike an IPv6 anycast address, an IPv6 unicast address is assigned to a group of interfaces on multiple nodes.",
    ],
    0,
    "Unicast identifies one interface; anycast reuses a unicast-form address on multiple nodes so routing delivers to the nearest member.\nOption D reverses the definitions.\nOptions B/C oversimplify configuration requirements incorrectly relative to the core definition.\nBest difference: unicast one interface vs anycast many nodes.",
    None,
))

items.append(T(
    88,
    "Which WAN topology provides a combination of simplicity, quality, and availability?",
    ["partial mesh", "full mesh", "point-to-point", "hub-and-spoke"],
    2,
    "Point-to-point leased-style links are simple to understand/configure and can offer predictable quality/availability on that circuit.\nFull mesh maximizes availability but is complex/costly.\nHub-and-spoke is simple but hub-centric availability risk.\nPartial mesh is a compromise, not the option keyed as simplest quality/availability combo here.\nSource answer: point-to-point.",
    None,
))

items.append(T(
    89,
    "How are the switches in a spine-and-leaf topology interconnected?",
    [
        "Each leaf switch is connected to one of the spine switches",
        "Each leaf switch is connected to each spine switch.",
        "Each leaf switch is connected to two spine switches, making a loop.",
        "Each leaf switch is connected to a central leaf switch, then uplinked to a core spine switch.",
    ],
    1,
    "Canonical spine-and-leaf: every leaf connects to every spine (full bipartite connectivity).\nConnecting each leaf to only one spine loses fabric properties.\n“Two spines making a loop” misstates L3 ECMP fabric design as STP loops.\nLeaf-to-leaf hierarchy is not spine-leaf.\nAnswer: each leaf to each spine.",
    None,
))

items.append(T(
    90,
    "What is the primary effect of the spanning-tree portfast command?",
    [
        "It immediately enables the port in the listening state.",
        "It immediately puts the port into the forwarding state when the link comes up.",
        "It enables BPDU messages.",
        "It minimizes spanning-tree convergence time on edge ports.",
    ],
    3,
    "PortFast skips the listening/learning delay on edge ports so hosts get connectivity quickly, minimizing STP transition delay for those ports (faster edge convergence).\nIt should put the port into forwarding quickly, not listening.\nIt does not “enable BPDU messages” as its primary purpose (BPDUs still exist; BPDU Guard is a related edge protection).\nSource index 3 emphasizes minimized STP convergence time on the edge; option B is also directionally true after OCR fix — keep source rc=3 as the keyed primary effect statement.",
    ticket(
        90,
        "Chamado #9001 — Servidor demora ~30s para ter rede no boot; porta access sem PortFast. STP rapid-pvst.",
        "SW-SRV# show spanning-tree interface gi1/0/1\nVlan             Role Sts Cost      Prio.Nbr Type\n---------------- ---- --- --------- -------- --------------------------------\nVLAN0050         Desg LRN 4         128.1    P2p\n\nSW-SRV# show run interface gi1/0/1\ninterface GigabitEthernet1/0/1\n switchport access vlan 50\n switchport mode access\n! (sem spanning-tree portfast)\n\nSW-SRV# show spanning-tree summary\nPortfast Default             is disabled",
        [
            "Sem PortFast a porta edge passa por learning; habilitar spanning-tree portfast para ir a forwarding mais rápido no boot do servidor.",
            "Sts LRN indica loop permanente e a porta nunca fará forwarding.",
            "PortFast Default disabled prova que o switch não roda STP.",
            "VLAN 50 access impede PortFast em qualquer plataforma.",
        ],
        0,
        "PortFast is for edge ports to reduce STP wait before forwarding.\nLearning state on a server access port at boot matches the symptom.\nEnable portfast (and BPDU Guard).",
    ),
))

assert len(items) == 25
Path(__file__).with_name("lote_66_90.json").write_text(
    json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("wrote lote_66_90.json", len(items))
