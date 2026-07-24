# Forge Data Engine

Ferramenta local que transforma **PDFs de simulados CCNA antigos** em um banco de questões estruturado (`questions.json`) para o frontend gamificado **CCNA Forge**.

```
PDF (simulado antigo)
        │
        ▼
   pdfplumber  ──►  chunks de páginas
        │
        ▼
  Ollama local  ──►  JSON (format=json)
  (Llama 3.1 / Mistral)
        │
        ▼
  validação + filtro de conteúdo obsoleto
        │
        ▼
  data/questions.json
```

## Estrutura

```
forge-data-engine/
├── forge_data_engine.py   # script principal
├── requirements.txt
├── pdfs/                  # coloque os PDFs aqui
├── data/
│   └── questions.json     # gerado pelo script
└── README.md
```

## Pré-requisitos

1. **Python 3.10+**
2. **Ollama** instalado e rodando  
   - Download: https://ollama.com  
   - Modelo recomendado:

```bash
ollama pull llama3.1
# ou
ollama pull mistral
```

3. Confirme que a API responde:

```bash
ollama list
curl http://localhost:11434/api/tags
```

## Instalação

No diretório `forge-data-engine/`:

```bash
# (opcional) ambiente virtual
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Dependências:

| Pacote       | Uso                          |
|-------------|------------------------------|
| `pdfplumber` | Extração de texto dos PDFs  |
| `requests`   | Chamadas HTTP ao Ollama     |

## Uso

1. Copie os PDFs de simulados para a pasta `pdfs/`.
2. Ajuste a config no topo de `forge_data_engine.py` se quiser (modelo, páginas por chunk, etc.).
3. Rode:

```bash
python forge_data_engine.py
```

### Opções úteis

```bash
# Modelo diferente
python forge_data_engine.py --model mistral

# Chunks menores (PDFs densos / modelos menores)
python forge_data_engine.py --pages-per-chunk 2

# Continuar em cima de um questions.json já existente
python forge_data_engine.py --append

# Saída customizada
python forge_data_engine.py --output ../src/data/questions.generated.json

# Logs detalhados
python forge_data_engine.py -v
```

| Flag | Default | Descrição |
|------|---------|-----------|
| `--pdf-dir` | `./pdfs` | Pasta dos PDFs |
| `--output` | `./data/questions.json` | Arquivo gerado |
| `--model` | `llama3.1` | Nome do modelo Ollama |
| `--url` | `http://localhost:11434/api/generate` | Endpoint generate |
| `--pages-per-chunk` | `3` | Páginas por request |
| `--min-chars` | `200` | Ignora chunks curtos |
| `--temperature` | `0.4` | Criatividade do modelo |
| `--top-p` | `0.9` | Nucleus sampling (top_p) |
| `--num-ctx` | `8192` | Janela de contexto do modelo |
| `--timeout` | `180` | Timeout por chunk (s) |
| `--retries` | `3` | Tentativas máximas (rede / JSON / schema) |
| `--start-id` | `1` | Primeiro `id` |
| `--append` | off | Mantém questões já salvas |
| `-v` | off | Debug |

## Formato de saída

Cada item em `questions.json` segue o contrato do **CCNA Forge**:

```json
{
  "id": 1,
  "isPremium": true,
  "sintoma": "Vazamento de tráfego na VLAN Nativa...",
  "cli_output": "SwitchA# show interfaces trunk\n...",
  "alternativas": ["A", "B", "C", "D"],
  "resposta_correta": 1,
  "explicacao_profunda": "..."
}
```

- `resposta_correta`: índice **0-based** (0–3)
- `alternativas`: sempre **4** itens
- `cli_output`: estilo Cisco IOS real

## Filtro de conteúdo obsoleto

O script ignora (ou rejeita) material típico de exames antigos, por exemplo:

- Frame Relay, DLCI, LMI  
- ISL  
- IPX / Novell / AppleTalk  
- VTP (foco principal)  
- Token Ring, FDDI, ISDN, X.25  

O prompt do Ollama também instrui o modelo a **não gerar** questões nesses tópicos e a focar no **CCNA 200-301 v2.0** (VLANs, 802.1Q, STP, OSPF, ACL, NAT, etc.).

## Integração com o Next.js (CCNA Forge)

Opção A — copiar o JSON gerado para o app:

```bash
# a partir de forge-data-engine/
python forge_data_engine.py --output ../src/data/questions.generated.json
```

Depois importe no frontend (ex.: `src/data/questions.ts`) ou carregue o JSON em runtime.

Opção B — manter `data/questions.json` aqui e copiar manualmente quando estiver satisfeito com a qualidade.

## Comportamento e robustez

- **Progresso no terminal**: `[3/12] Processando exam.pdf p.7-9`
- **Checkpoint incremental**: salva o JSON após cada chunk (Ctrl+C não perde tudo)
- **JSON inválido**: tenta recuperar objeto `{...}` e faz retries
- **`format: "json"`**: força o Ollama a responder em JSON
- **Chunks vazios** (capas/imagens): skip automático

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `Ollama inacessível` | Rode `ollama serve` e confira a porta 11434 |
| Modelo não listado | `ollama pull llama3.1` |
| JSON sempre inválido | Use modelo maior (`llama3.1:8b` / `mistral`) e baixe `--temperature` |
| Poucas questões | PDFs escaneados (imagem) não extraem texto — use OCR antes ou PDFs textuais |
| Muito lento | Reduza `--pages-per-chunk`, use GPU no Ollama, ou modelo menor |
| Questões ruins | Melhore o PDF de origem; rode de novo só em trechos bons |

## Licença / aviso

Use apenas PDFs que você tenha direito de processar. O conteúdo gerado por LLM deve ser **revisado** antes de ir para produção no app educacional.
