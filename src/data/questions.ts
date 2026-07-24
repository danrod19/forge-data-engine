import type { Question } from "@/types/question";

export const MAX_LIVES = 5;
export const INITIAL_LIVES = 3;
export const INITIAL_STREAK = 7;

export const questions: Question[] = [
  {
    id: 1,
    isPremium: true,
    sintoma:
      "Vazamento de tráfego na VLAN Nativa. Identifique a causa na saída do terminal.",
    cli_output: `SwitchA# show interfaces trunk
Port      Mode         Encapsulation  Status        Native vlan
Gi0/1     on           802.1q         trunking      99

SwitchB# show interfaces trunk
Port      Mode         Encapsulation  Status        Native vlan
Gi0/1     on           802.1q         trunking      1`,
    alternativas: [
      "Incompatibilidade de protocolo ISL",
      "Native VLAN Mismatch",
      "Portas em modo Access",
      "Loop de Spanning Tree",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "A saída revela um Native VLAN Mismatch (99 vs 1). Isso causa fusão de domínios de broadcast entre as VLANs e aciona o mecanismo de proteção do Spanning Tree (PVID Inconsistent), bloqueando portas.",
  },
  {
    id: 2,
    isPremium: false,
    sintoma:
      "Host na VLAN 10 não consegue pingar o gateway. Analise a configuração da interface.",
    cli_output: `Switch# show running-config interface Gi0/5
Building configuration...

interface GigabitEthernet0/5
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
!`,
    alternativas: [
      "Porta em modo trunk incorreto",
      "VLAN de acesso incorreta (20 em vez de 10)",
      "PortFast desabilitado",
      "Falta de encapsulamento 802.1Q",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "A interface Gi0/5 está configurada com access VLAN 20, mas o host deveria estar na VLAN 10. Tráfego do host é colocado na VLAN errada e não alcança o gateway da VLAN 10.",
  },
  {
    id: 3,
    isPremium: true,
    sintoma:
      "Roteador não encaminha pacotes entre sub-redes. Verifique a tabela de rotas.",
    cli_output: `Router# show ip route
Codes: L - local, C - connected, S - static, R - RIP, B - BGP
       D - EIGRP, O - OSPF, IA - OSPF inter area

Gateway of last resort is not set

      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/0
L        192.168.1.1/32 is directly connected, GigabitEthernet0/0`,
    alternativas: [
      "OSPF não está configurado nas interfaces",
      "Falta rota estática ou default route",
      "Interface Gi0/0 está administrativamente down",
      "Máscara de sub-rede incorreta",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "A tabela só mostra redes connected (C/L) na Gi0/0. Não há rota default nem rotas aprendidas/estáticas para outras redes. Sem 'Gateway of last resort', o roteador descarta pacotes para destinos desconhecidos.",
  },
  {
    id: 4,
    isPremium: false,
    sintoma:
      "Hosts em VLANs diferentes não se comunicam. Analise a saída do show vlan.",
    cli_output: `Switch# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/1, Gi0/2, Gi0/3, Gi0/4
10   SALES                            active
20   ENGINEERING                      active
1002 fddi-default                     act/unsup
1003 token-ring-default               act/unsup`,
    alternativas: [
      "VLANs 10 e 20 não existem no switch",
      "Nenhuma porta atribuída às VLANs 10 e 20",
      "VLAN 1 está desabilitada",
      "Protocolo VTP em modo client",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "As VLANs 10 (SALES) e 20 (ENGINEERING) existem, mas a coluna Ports está vazia. Todas as portas físicas estão na VLAN 1 (default). Sem portas nas VLANs de usuário, hosts não entram nos domínios corretos.",
  },
  {
    id: 5,
    isPremium: true,
    sintoma:
      "Link trunk entre switches não sobe. Identifique o problema na configuração.",
    cli_output: `SwitchA# show interfaces Gi0/1 switchport
Name: Gi0/1
Switchport: Enabled
Administrative Mode: static access
Operational Mode: static access
Administrative Trunking Encapsulation: dot1q
Operational Trunking Encapsulation: native
Negotiation of Trunking: Off
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)`,
    alternativas: [
      "Encapsulamento ISL vs 802.1Q",
      "Porta em modo access, não trunk",
      "Native VLAN mismatch",
      "DTP desabilitado incorretamente",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "Administrative Mode e Operational Mode estão como 'static access'. A porta precisa de 'switchport mode trunk' (ou dynamic desirable com peer compatível). Com access, frames tagged de múltiplas VLANs não passam.",
  },
  {
    id: 6,
    isPremium: false,
    sintoma:
      "Dois switches formam um loop. Analise o status do Spanning Tree.",
    cli_output: `Switch# show spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769
             Address     0011.2233.4455
             This bridge is the root
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

  Bridge ID  Priority    32769  (priority 32768 sys-id-ext 1)
             Address     0011.2233.4455
             Hello Time   2 sec  Max Age 20 sec  Forward Delay 15 sec

Interface           Role Sts Cost      Prio.Nbr Type
------------------- ---- --- --------- -------- --------------------------------
Gi0/1               Desg FWD 4         128.1    P2p
Gi0/2               Desg FWD 4         128.2    P2p`,
    alternativas: [
      "STP está desabilitado na VLAN 1",
      "Ambas as portas em Forwarding — possível loop se peer também for root",
      "Root Bridge com prioridade muito alta",
      "Hello Time configurado incorretamente",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "Este switch é root e ambas as portas estão Designated/FWD. Se o peer também se considera root (ou STP está off em um lado), nenhuma porta bloqueia e há loop de Layer 2. Verifique prioridade, BPDU filter e consistência de STP nos dois lados.",
  },
  {
    id: 7,
    isPremium: true,
    sintoma:
      "PC obtém IP errado via DHCP. Verifique a configuração do helper-address.",
    cli_output: `Router# show running-config interface Vlan10
Building configuration...

interface Vlan10
 ip address 10.10.10.1 255.255.255.0
 ip helper-address 10.20.30.50
 no ip redirects
!`,
    alternativas: [
      "Helper-address aponta para rede inexistente",
      "Falta 'ip dhcp pool' na interface",
      "Máscara /24 incompatível com helper",
      "Configuração parece correta — problema pode ser no servidor DHCP",
    ],
    resposta_correta: 3,
    explicacao_profunda:
      "O ip helper-address 10.20.30.50 está configurado na SVI da VLAN 10 e fará relay de broadcasts DHCP (UDP 67/68) para esse servidor. Se o PC recebe IP errado, verifique pools no servidor DHCP, opções de scope e se 10.20.30.50 é realmente o servidor pretendido — não um bug na linha de helper em si.",
  },
  {
    id: 8,
    isPremium: false,
    sintoma:
      "ACL bloqueia tráfego legítimo. Analise a lista de acesso.",
    cli_output: `Router# show access-lists 100
Extended IP access list 100
    10 deny ip any any
    20 permit tcp any any eq 80
    30 permit tcp any any eq 443
    40 permit icmp any any`,
    alternativas: [
      "Falta wildcard mask nas linhas permit",
      "Regra deny any any está antes dos permits (ordem de ACL)",
      "ACL extended não suporta ICMP",
      "Números de sequência incorretos",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "ACLs são processadas top-down; a primeira match vence. A linha 10 'deny ip any any' casa com todo tráfego IP antes das linhas 20–40. HTTP, HTTPS e ICMP nunca são avaliados. Reordene: permits específicos primeiro, deny implícito/explícito no final.",
  },
  {
    id: 9,
    isPremium: true,
    sintoma:
      "OSPF adjacência não forma. Verifique o status das interfaces.",
    cli_output: `R1# show ip ospf interface brief
Interface    PID   Area            IP Address/Mask    Cost  State Nbrs F/C
Gi0/0        1     0               10.0.0.1/30        1     DR    0/0
Gi0/1        1     0               10.0.1.1/24        1     DR    0/0

R1# show ip ospf neighbor

R1#`,
    alternativas: [
      "Interfaces OSPF com custo zero",
      "Nenhum vizinho — verifique network statements, timers ou hello/dead mismatch no peer",
      "Área 0 não pode ter duas interfaces",
      "Estado DR impede formação de adjacência",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "show ip ospf neighbor vazio com Nbrs F/C 0/0 indica que nenhum hello foi trocado com sucesso. Causas comuns: peer sem OSPF, subnet diferente, hello/dead mismatch, ACL bloqueando 224.0.0.5, ou network/area incorretos. DR sozinho sem vizinhos é esperado até o peer responder.",
  },
  {
    id: 10,
    isPremium: false,
    sintoma:
      "NAT overload não traduz. Analise a configuração NAT.",
    cli_output: `Router# show running-config | section nat
ip nat inside source list 1 interface GigabitEthernet0/0 overload
access-list 1 permit 192.168.10.0 0.0.0.255

Router# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0     203.0.113.1     YES NVRAM  up                    up
GigabitEthernet0/1     192.168.10.1    YES NVRAM  up                    up
Vlan1                  unassigned      YES NVRAM  administratively down down`,
    alternativas: [
      "Access-list 1 com wildcard incorreta",
      "Falta 'ip nat inside/outside' nas interfaces",
      "Overload não funciona com interface IP",
      "Gi0/0 está down",
    ],
    resposta_correta: 1,
    explicacao_profunda:
      "A regra de tradução existe, mas sem 'ip nat inside' na interface LAN (Gi0/1) e 'ip nat outside' na WAN (Gi0/0) o IOS não processa pacotes para NAT. Configure as flags de direção nas interfaces corretas.",
  },
];
