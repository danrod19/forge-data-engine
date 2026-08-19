# Questions V2 traditional review report

## Cadeia UI

```
Simulado track ccna-v2
  → getSimuladoPoolByTrack / pickSimuladoV2MixedSession
  → v2TraditionalQuestions (v2-banks.ts)
  → src/data/questions_v2_traditional.json

Estudo track ccna-v2
  → getV2TraditionalByPart / getPartQuestions
  → mesmo questions_v2_traditional.json
```

| Métrica | Valor |
|---------|-------|
| Total no pool | 506 |
| Explicações reescritas | 506 |
| Enunciados só OCR / ajuste leve | 0 |
| Inalteradas (expl+enunciado) | 0 |
| bad gabarito | 0 |

## Amostras — explicação (antes → depois)

### ID 1
**Antes:** Late collisions combinadas com half de um lado e full no outro são o padrão clássico de duplex mismatch. Rota, ACL de gestão e DHCP não elevam late collisions na interface de acesso. O Diagnose L1 compara duplex/speed nos dois lados e corrige auto/hardcode.

**Depois:** Late collisions subindo com um lado em half e o vizinho em a-full a-1000 é o padrão clássico de duplex mismatch: o lado half escuta meio-duplex e interpreta frames do peer full como colisão tardia. Falta de rota default no core é problema de L3 e não movimenta contador de late collision na porta de acesso. ACL de VTY só afeta sessão de gestão (SSH/Telnet), não o tráfego de dados na Gi1/0/12. Pool DHCP esgotado deixa host sem IP, mas o link L1 permanece sem esse perfil de colisões. No CLI, compare duplex/speed nos dois lados (show interfaces status) e alinhe auto/auto ou hardcode idêntico.

### ID 2
**Antes:** CRC e input errors apontam corrupção no recebimento (mídia). OSPF FULL indica adjacência saudável; reiniciar protocolo não corrige cabo ou óptica. Isolar L1 com patch, limpeza, SFP e distância é a ação alinhada ao tópico 1.1.

**Depois:** Milhares de CRC e input errors apontam corrupção no recebimento — cabo, SFP, sujeira ou óptica — ou seja, camada física. OSPF em FULL mostra adjacência saudável: o IGP está ok e clear ip ospf process no ABR só reinicia vizinhança sem limpar mídia. Remover a default route muda encaminhamento L3 e não zera CRC. Desabilitar Spanning Tree no access é mudança de topologia L2 perigosa e irrelevante para erros de frame na WAN. Foque patch, limpeza de conector, troca de SFP e distância antes de tocar em protocolo.

### ID 3
**Antes:** Porta com SFP óptico e estado notconnect com mídia inadequada é problema de tipo de cabo/interface. Não se resolve com AAA ou OSPF. Confirme SFP, patch de fibra correta ou porta cobre correta.

**Depois:** Porta com SFP 1000BaseSX (óptica) em notconnect e cabo de cobre UTP plugado (sem conversão adequada) é incompatibilidade de mídia: SX espera fibra multimodo, não UTP naquele módulo. Duplex half no peer não explica Type óptico com notconnect por cabo errado. Excesso de rotas OSPF é estado da tabela de roteamento e não derruba link L1 dessa forma. Falta de AAA no VTY só impacta login administrativo. Confirme SFP + patch de fibra correta, ou use porta cobre nativa / media converter apropriado.

### ID 4
**Antes:** RX óptico fraco com TX ok aponta caminho de recebimento: sujeira, patch, fibra ou distância. ACL/NAT/storm control não explicam DOM baixo. Limpar/trocar patch e validar tipo MM/SM é o Diagnose correto.

**Depois:** RX em −28 dBm com TX presente e flapping aponta orçamento óptico ruim no caminho de recebimento: patch suja, conector ruim, fibra danificada ou alcance/atenuação excessiva. ACL outbound no SVI filtra tráfego IP, não potência óptica. NAT overload e storm-control não baixam Rx Power no DOM. Limpe/troque o patch, confira MM vs SM e distância antes de culpar L3.

### ID 5
**Antes:** Hardcode em um lado e auto no outro é receita clássica de mismatch: o lado auto muitas vezes assume half. Sintomas incluem late collisions e lentidão. A correção é alinhar auto/auto ou hardcode idêntico.

**Depois:** Quando um lado força speed 100 duplex full e o outro fica em auto, o lado auto frequentemente cai em half — mismatch clássico, com lentidão e late collisions no lado half. IPv6 RA Guard não se ativa sobre esse sintoma de L1. EtherChannel/LACP e ACL de VTY não alinhariam duplex nesse cenário. Alinhe auto/auto ou hardcode idêntico nos dois lados e revalide contadores.

## Invariantes

- `resposta_correta` e texto das `alternativas` preservados em 100% (bad=0).
- Enunciados NÃO traduzidos EN→PT (0 alterações de enunciado neste passe).
- Backup: `scripts/output/questions_v2_traditional_before_review.json`
