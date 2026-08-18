# Tickets V1 Trilha review report

## Cadeia UI

```
getTicketsPool("ccna-v1")
  → curatedModuleTickets (tickets.ts)
    → module1Tickets  ← src/data/parts/part-1.1…1.6-tickets.json
    → module2Tickets  ← src/data/tickets_module2.json
    → module3Tickets  ← src/data/tickets_module3.json
    → module4Tickets  ← src/data/tickets_module4.json
    → module5Tickets  ← src/data/tickets_module5.json
    → module6Tickets  ← src/data/tickets_module6.json
```

**Não revisado:** `tickets_all_merged.json`, `tickets_unique.json`, `tickets_from_bulk.json` (fora do pool da Trilha V1).

| Métrica | Valor |
|---------|-------|
| Total no pool Trilha V1 | 155 |
| Sintomas reescritos/polidos | 155 |
| Explicações reescritas | 155 |
| CLI alterado | 0 |
| IDs só limpeza leve / inalterados | — |
| bad gabarito | 0 |

## Amostras — sintomas (antes → depois)

### ID 1 (`src/data/parts/part-1.1-tickets.json`)
**Antes:** Chamado #7101 — Usuário não abre o portal HTTPS do servidor 10.10.10.50. Diz que “a rede está fora”. O analista júnior já confirmou cabo e link no notebook.

**Depois:** Chamado #7101 — usuário não abre o portal HTTPS em 10.10.10.50 e jura que “a rede está fora”. Cabo e link no notebook já foram conferidos pelo júnior.

### ID 2 (`src/data/parts/part-1.1-tickets.json`)
**Antes:** Chamado #7102 — Time de VoIP reclama de atraso e “eco robótico” após um “ajuste de segurança” que forçou todo tráfego de mídia a usar o mesmo perfil do portal web (retransmissão e sessão confiável).

**Depois:** Chamado #7102 — time de VoIP reclama de atraso e “eco robótico” depois de um “ajuste de segurança” que forçou a mídia a usar o mesmo perfil confiável do portal web (retransmissão inclusa).

### ID 3 (`src/data/parts/part-1.1-tickets.json`)
**Antes:** Chamado #7103 — Firewall liberou “SSH para o jump-host”, mas o script de automação ainda falha. O operador insiste que “a porta 22 está aberta na rede”.

**Depois:** Chamado #7103 — o firewall liberou “SSH para o jump-host”, mas o script de automação ainda falha. O operador insiste que “a porta 22 está aberta na rede”.

## Amostras — explicações (antes → depois)

### ID 1 (`src/data/parts/part-1.1-tickets.json`)
**Antes:** Ping com resposta prova conectividade L3 até 10.10.10.50; logo cabo/link (L1) e rota básica não são a causa principal. No cliente, conexões ficam em SYN_SENT para 443, ou seja, o TCP tenta abrir e não recebe SYN-ACK. No servidor, netstat mostra LISTENING em 80 e 8080, não em 443 — o processo HTTPS não escuta a porta de destino. MAC inalcançável contradiz o ping; HTTPS usa TCP 443, não UDP.

**Depois:** O sintoma aponta para falha na camada de serviço, não na rede básica: ping responde, então L3 até 10.10.10.50 está ok. No CLI, o cliente fica em SYN_SENT na 443 e o servidor só escuta 80/8080 — nada em LISTENING na 443. Insight de troubleshooting: SYN_SENT + ping OK quase sempre manda olhar se a porta/serviço certo está de pé no destino. Cabo/CRC (L1) não explica ping saudável; “MAC do cliente não aprendido” contradiz o alcance IP; HTTPS usa TCP 443, não UDP.

### ID 2 (`src/data/parts/part-1.1-tickets.json`)
**Antes:** RTP/VoIP prefere UDP por baixa latência e ausência de retransmissão. A política forçou TCP e a captura mostra ACK e retransmissões com RTT/jitter piores — causa alinhada a TCP vs UDP, não a cabo. Portas altas (dinâmicas/efêmeras) são normais em mídia; restringir voz a well-known 0–1023 está incorreto. Retransmissão TCP não implica automaticamente falha física.

**Depois:** O sintoma aponta para transporte inadequado na mídia: RTP/VoIP prefere UDP best-effort, sem retransmitir atraso. No CLI, a captura começa em RTP/UDP e, após a política, vira TCP com ACK e retransmissões — RTT e jitter sobem exatamente aí. Insight: voz tolera perda pontual melhor do que fila de retransmissão. VoIP não “exige” TCP; a captura UDP inicial estava correta. Retransmissão TCP não prova cabo rompido. Portas altas (40000/16384) são normais em mídia; restringir a well-known 0–1023 é mito.

### ID 3 (`src/data/parts/part-1.1-tickets.json`)
**Antes:** O cliente tenta 10.0.5.10:22 e fica em SYN_SENT. No jump-host, LISTENING externo é 2222; a 22 está só em 127.0.0.1 (loopback), inacessível remotamente. A porta de origem 53112 é efêmera normal do cliente, não o serviço. SSH usa TCP, não UDP. SYN_SENT com serviço na porta/interface errada é problema L4 de escuta, não de trailer Ethernet.

**Depois:** O sintoma aponta para mismatch de porta de escuta: o cliente tenta 10.0.5.10:22 e fica em SYN_SENT. No CLI, o jump escuta 2222 em 0.0.0.0 e a 22 só em 127.0.0.1 — inacessível de fora. Insight: “porta aberta no firewall” não basta se o sshd não escuta na interface/porta que o cliente usa. A origem 53112 é efêmera normal, não o serviço. SSH é TCP, não UDP. Falta de trailer Ethernet não é o diagnóstico de SYN_SENT eterno com bind errado.

## Invariantes

- `resposta_correta` e texto das `alternativas` preservados em 100% dos itens.
- Backup: `scripts/output/tickets_v1_trilha_before_review.json`
