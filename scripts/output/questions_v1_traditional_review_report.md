# Questions V1 traditional (UI pool) review report

## Cadeia UI

```
Simulado track ccna-v1
  → getSimuladoPoolByTrack("ccna-v1") → simuladoQuestionsCurated
  → mergeByEnunciado(module1…module6 traditional)

Estudo track ccna-v1
  → getStudyPartsForTrack("ccna-v1") / getPartQuestions(part_id)
  → module1-traditional (parts 1.1–1.6 + drill 1.4)
  → module2…6-traditional JSON
```

**Fora do escopo (UI não usa como pool V1 primário):** `questions_traditional_FINAL.json`, `tickets_*`, V2/AWS.

| Métrica | Valor |
|---------|-------|
| Total no pool UI V1 | 949 |
| Explicações reescritas | 949 |
| Enunciados só OCR | 2 |
| Inalteradas | 0 |
| bad gabarito | 0 |

## Amostras — explicação (antes → depois)

### ID 1 (`src/data/parts/part-1.1-questions.json`)
**Antes:** O OSI organiza a comunicação em sete camadas: Física (1) até Aplicação (7). A opção com 4 camadas descreve o TCP/IP, não o OSI. Cinco ou seis camadas não correspondem ao modelo de referência padrão usado na classificação de dispositivos e no troubleshooting do CCNA.

**Depois:** O modelo OSI padroniza sete camadas numeradas de baixo para cima: Física (1), Enlace (2), Rede (3), Transporte (4), Sessão (5), Apresentação (6) e Aplicação (7). Quatro camadas com Aplicação no topo descrevem a pilha TCP/IP prática, não o OSI. Cinco camadas começando em 0 (Bits) misturam nomenclatura informal com numeração inválida — o OSI não usa camada 0. Seis camadas a partir do Enlace omitem a Física e quebram a contagem oficial. Dica de prova: se pedirem OSI, responda 7 (1 Física → 7 Aplicação); se pedirem TCP/IP, pense em 4.

### ID 2 (`src/data/parts/part-1.1-questions.json`)
**Antes:** Na camada 3 a PDU é o pacote, usado com endereçamento IP e encaminhamento. Segmento (ou datagrama UDP) é de L4; quadro é de L2 (Enlace); bits são de L1 (Física). Usar o termo correto da camada evita confusão em questões de encapsulamento.

**Depois:** Na camada de Rede (L3) a PDU é o pacote: cabeçalho IP + dados, com endereçamento lógico e decisão de encaminhamento/roteamento. Segmento é a PDU típica do TCP em L4 (UDP costuma chamar datagrama). Quadro (frame) pertence ao Enlace (L2), com MAC e FCS. Bits são a PDU da Física (L1) no meio. Tip de prova: memorize PDU por camada — bits → quadro → pacote → segmento/datagrama — para não cair em troca de termos no encapsulamento.

### ID 3 (`src/data/parts/part-1.1-questions.json`)
**Antes:** No envio, cada camada inferior acrescenta seu cabeçalho aos dados; em Ethernet a camada de Enlace também adiciona trailer. Remover cabeçalhos é desencapsulamento no destino. Converter IP em MAC e fragmentar em bits são etapas pontuais, não a definição geral do encapsulamento.

**Depois:** No encapsulamento no host de origem, cada camada inferior recebe a SDU da superior e acrescenta seu próprio cabeçalho; em Ethernet a camada de Enlace ainda coloca trailer (FCS). Remover cabeçalho/trailer é desencapsulamento no destino, não no envio. Converter IP em MAC (ARP) é um serviço pontual de L3→L2 antes de montar o quadro, não a definição geral do encapsulamento. Fragmentar o fluxo em bits sem manter cabeçalhos invertiria o modelo: os cabeçalhos viajam até a camada correspondente no peer. No troubleshooting, pense “quem adiciona o quê” ao subir/descer a pilha.

### ID 4 (`src/data/parts/part-1.1-questions.json`)
**Antes:** O TCP/IP prático usa quatro camadas: Aplicação, Transporte, Internet (ou Rede) e Acesso à rede/meio. As sete camadas listadas são do OSI. Modelos de 2 ou 3 camadas não representam a pilha TCP/IP padrão estudada no CCNA.

**Depois:** A pilha TCP/IP usada no CCNA tem quatro camadas: Aplicação, Transporte, Internet (Rede) e Acesso à rede (meio/enlace). Sete camadas com Apresentação e Sessão separadas são o OSI, não o TCP/IP. Três camadas (Host/Gateway/Meio) é simplificação informal sem padronização de prova. Duas (Lógica/Física) é demais grosso e não posiciona Transporte nem Internet. Dica: mapeie mentalmente Aplicação TCP/IP ↔ OSI 5–7, Transporte ↔ 4, Internet ↔ 3, Acesso ↔ 1–2.

### ID 5 (`src/data/parts/part-1.1-questions.json`)
**Antes:** No TCP/IP, a Aplicação agrupa o que o OSI separa em Aplicação, Apresentação e Sessão (5–7). Não fica restrita só à L7. L1/L2 formam o Acesso à rede no TCP/IP, e L4 permanece como Transporte em ambos os modelos.

**Depois:** No mapeamento clássico, a Aplicação do TCP/IP agrega Sessão, Apresentação e Aplicação do OSI (camadas 5, 6 e 7): o host não separa essas funções em pilhas distintas na prática. Restringir só à L7 ignora compressão/sessão que o TCP/IP embute na mesma faixa. L1 e L2 formam o Acesso à rede do TCP/IP, não a Aplicação. L4 continua sendo Transporte nos dois modelos — HTTP/DNS/SSH não “viram” Transporte. Em questão de mapeamento, fuja da armadilha “Aplicação = só camada 7”.

## Invariantes

- `resposta_correta` e `alternativas` 100% preservados.
- Enunciados não traduzidos EN→PT.
- Backup: `scripts/output/questions_v1_traditional_ui_before_review.json`
