# Tickets V2 review report

**Fonte UI Trilha ccna-v2:** `src/data/tickets_v2.json` ← `v2-banks.ts` (`v2Tickets`) ← `tickets.ts` `getTicketsPool("ccna-v2")` → `v2ModuleTickets`.

| Métrica | Valor |
|---------|-------|
| Total tickets | 85 |
| Sintomas reescritos/polidos | 84 |
| Explicações reescritas | 85 |
| CLI alterado (limpeza) | 0 |
| IDs só limpeza leve / sintoma inalterado | 76 (sintoma igual; explicação reescrita) |

## Amostras — sintomas (antes → depois)

### ID 1
**Antes:** NOC-1101: servidor de arquivos lento e timeouts. Após hardcode de duplex no switch, o problema piorou. Avalie o link de acesso.

**Depois:** NOC-1101: o servidor de arquivos está lento e com timeouts. Depois que um técnico forçou duplex no switch, a situação piorou. Avalie o link de acesso.

### ID 2
**Antes:** NOC-1102: perda intermitente no uplink do building. Time de roteamento quer clear ip ospf process. Contadores do uplink:

**Depois:** NOC-1102: perda intermitente no uplink do prédio. O time de roteamento já quer dar clear ip ospf process — olhe os contadores do uplink antes de tocar no IGP.

### ID 18
**Antes:** NOC-1703: primeiros 50 PCs ok; a partir de hoje novos notebooks não obtêm IP. Server local na VLAN.

**Depois:** NOC-1703: Os primeiros cinquenta PCs da área ainda navegam normalmente, mas desde hoje de manhã todo notebook novo fica sem IP. O servidor DHCP está na mesma VLAN dos usuários.

## Amostras — explicações (antes → depois)

### ID 1
**Antes:** Late collisions altos com half no switch e full no servidor são o clássico mismatch de duplex. A config mostra duplex half hardcoded. Alinhar (preferir auto/auto ou full/full) e observar se os contadores param. OSPF e troca de chassis não corrigem L1 do acesso.

**Depois:** O sintoma aponta para mismatch de duplex: o switch está com duplex half hardcoded e o servidor em full. No CLI, late collisions altos com reliability degradada batem exatamente com esse cenário clássico de L1. Alinhe (auto/auto ou full/full nos dois lados) e confira se os contadores param de subir. Default route no core não explica colisão na porta de acesso; clear OSPF no ABR mexe em L3 sem tocar no link; trocar chassis do core sem olhar a porta só aumenta o blast radius.

### ID 2
**Antes:** OSPF FULL com CRC/input errors altos indica problema de mídia no link, não de adjacência lógica. clear ip ospf process é escopo errado. Trocar/limpar patch, validar SFP e fibra é o Diagnose 1.1 correto.

**Depois:** No CLI, OSPF já está FULL/BDR — a adjacência lógica está ok. O que chama atenção são CRC/input errors altos e reliability baixa no uplink óptico, com flaps no log: isso é mídia (SFP, fibra, patch), não protocolo. Insight de troubleshooting: se o vizinho está FULL e o link erra, trate L1 antes de mexer no IGP. clear ip ospf process só reinicia o processo sem limpar CRC; remover default route estática não explica erros de frame; desligar STP globalmente é escopo errado e perigoso.

### ID 18
**Antes:** show ip dhcp pool com 254 leased e free efetivo zero explica por que só novos clientes falham. Hosts antigos mantêm lease. Não é helper (server local, bindings cheios). Expanda o pool ou recupere endereços.

**Depois:** O sintoma aponta para esgotamento de escopo porque só os clientes novos falham: quem já tinha lease continua com IP. No CLI, show ip dhcp pool mostra 254 leased em 254 utilizáveis (free efetivo zero) e o binding count bate com isso; o NEW-PC cai em APIPA. Helper ausente não faz sentido com server local e bindings cheios — os antigos provariam falta de relay. Cabo de Internet e DNS option sozinhos não explicam Discover sem Offer por falta de endereço. Amplie o pool, recupere leases ociosos ou redesenhe o range.

## Invariantes

- `resposta_correta` e texto das `alternativas` preservados em 100% dos 85 itens (validação automatizada `bad=0`).
- Nenhum ticket novo inventado.
- `cli_output` mantido (sem OCR a limpar neste banco).
- Backup pré-review: `scripts/output/tickets_v2_before_review.json`
