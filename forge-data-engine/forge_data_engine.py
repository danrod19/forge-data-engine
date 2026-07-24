#!/usr/bin/env python3
"""
Forge Data Engine
=================
Transforma PDFs de simulados CCNA em questões estruturadas
para o frontend gamificado **CCNA Forge** (Next.js).

Estratégia (fidelidade ao PDF + Ollama só onde agrega valor):
  1. Lê PDFs e extrai texto (pdfplumber)
  2. Faz parsing local do enunciado, alternativas e resposta correta
  3. Formato principal: ``traditional`` (conteúdo fiel ao PDF)
  4. Ollama gera **apenas** a ``explicacao_profunda``
  5. Formato ``ticket`` é seletivo (só se a questão parecer troubleshooting)
  6. Valida schema e grava questions.json (checkpoint incremental)

Uso:
  python forge_data_engine.py
  python forge_data_engine.py --max-pages 5 --pages-per-chunk 1 --model llama3.1
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterator, Literal, Optional

import pdfplumber
import requests

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURAÇÃO — ajuste estes valores antes de rodar
# ─────────────────────────────────────────────────────────────────────────────

PDF_DIR = Path(__file__).resolve().parent / "pdfs"
OUTPUT_FILE = Path(__file__).resolve().parent / "data" / "questions.json"

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.1"  # ex: llama3.1, llama3.1:8b, mistral

# Chunking
PAGES_PER_CHUNK = 3
MIN_CHUNK_CHARS = 200

# Ollama generation params
OLLAMA_TIMEOUT_SEC = 180
OLLAMA_TEMPERATURE = 0.4
OLLAMA_TOP_P = 0.9
OLLAMA_NUM_CTX = 8192
OLLAMA_NUM_PREDICT = 2048
MAX_RETRIES = 3  # tentativas máximas por questão (request / JSON / schema)

# IDs
START_ID = 1

LOG_LEVEL = logging.INFO

QuestionType = Literal["ticket", "traditional"]

# Indícios de troubleshooting → candidato a ticket
TROUBLESHOOTING_HINTS: tuple[str, ...] = (
    "show ",
    "show\n",
    "debug ",
    "debug\n",
    "interface",
    "trunk",
    "ospf",
    "eigrp",
    "vlan",
    "spanning-tree",
    "spanning tree",
    "error",
    " down",
    "administratively",
    "unreachable",
    "timeout",
    "ping ",
    "traceroute",
    "no connectivity",
    "cannot reach",
    "can't reach",
    "not working",
    "packet loss",
    "duplex",
    "crc",
    "collision",
    "access-list",
    "acl",
    "nat ",
    "routing table",
    "neighbor",
    "adjacency",
    "troubleshoot",
    "diagnostic",
    "syslog",
    "console",
    "ios response",
    "following output",
    "following lines",
    "exhibit",
)

# ─────────────────────────────────────────────────────────────────────────────
# Schema / modelos
# ─────────────────────────────────────────────────────────────────────────────


@dataclass
class ExtractedQuestion:
    """Questão extraída fielmente do PDF (antes do Ollama)."""

    source_pdf: str
    source_label: str  # ex: "exam.pdf p.1-3"
    number: Optional[int]
    enunciado: str
    alternativas: list[str]  # exatamente 4
    resposta_correta: int  # 0..3
    raw_answer: str = ""
    pdf_explanation: str = ""  # texto pós-Ans no PDF, se houver

    def fingerprint(self) -> str:
        """Chave simples para deduplicar questões entre chunks."""
        stem = re.sub(r"\s+", " ", self.enunciado.lower())[:160]
        return f"{stem}|{self.resposta_correta}|{'|'.join(self.alternativas)}"


@dataclass
class Question:
    """Questão no formato esperado pelo CCNA Forge (ticket ou traditional)."""

    id: int
    question_type: QuestionType
    isPremium: bool
    alternativas: list[str]
    resposta_correta: int
    explicacao_profunda: str
    # ticket
    sintoma: Optional[str] = None
    cli_output: Optional[str] = None
    # traditional
    enunciado: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        base: dict[str, Any] = {
            "id": self.id,
            "question_type": self.question_type,
            "isPremium": self.isPremium,
            "alternativas": self.alternativas,
            "resposta_correta": self.resposta_correta,
            "explicacao_profunda": self.explicacao_profunda,
        }
        if self.question_type == "ticket":
            base["sintoma"] = self.sintoma
            base["cli_output"] = self.cli_output
        else:
            base["enunciado"] = self.enunciado
        return base


@dataclass
class Chunk:
    """Um pedaço de texto extraído de um PDF."""

    source_pdf: str
    page_start: int  # 1-based
    page_end: int
    text: str

    @property
    def label(self) -> str:
        return f"{self.source_pdf} p.{self.page_start}-{self.page_end}"


@dataclass
class OllamaRuntime:
    """Configuração ativa do Ollama (preenchida em run())."""

    url: str = OLLAMA_URL
    model: str = OLLAMA_MODEL
    temperature: float = OLLAMA_TEMPERATURE
    top_p: float = OLLAMA_TOP_P
    num_ctx: int = OLLAMA_NUM_CTX
    num_predict: int = OLLAMA_NUM_PREDICT
    timeout: int = OLLAMA_TIMEOUT_SEC
    max_retries: int = MAX_RETRIES


@dataclass
class EngineStats:
    pdfs: int = 0
    chunks_total: int = 0
    chunks_skipped_empty: int = 0
    questions_extracted: int = 0
    questions_skipped_parse: int = 0
    questions_processed: int = 0
    ollama_errors: int = 0
    questions_valid: int = 0
    questions_rejected: int = 0
    retries_used: int = 0
    format_ticket: int = 0
    format_traditional: int = 0
    ticket_candidates: int = 0


# Runtime global usado pelas chamadas Ollama — definido em run()
_runtime: OllamaRuntime = OllamaRuntime()

# ─────────────────────────────────────────────────────────────────────────────
# Logging
# ─────────────────────────────────────────────────────────────────────────────


def setup_logging(level: int = LOG_LEVEL) -> logging.Logger:
    logging.basicConfig(
        level=level,
        format="%(asctime)s │ %(levelname)-7s │ %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
        force=True,
    )
    return logging.getLogger("forge-data-engine")


log = setup_logging()


# ─────────────────────────────────────────────────────────────────────────────
# Prompts Ollama (explicação / ticket seletivo)
# ─────────────────────────────────────────────────────────────────────────────

PROMPT_EXPLANATION = """Você é um engenheiro de redes sênior (CCNA/CCNP) criando material de estudo de alta qualidade.

Abaixo está uma questão de múltipla escolha EXTRAÍDA FIDELMENTE de um simulado.
Sua única tarefa é escrever a EXPLICAÇÃO TÉCNICA da resposta correta.

QUESTÃO ORIGINAL (NÃO ALTERAR):
Enunciado: {enunciado}

Alternativas:
A. {alt_a}
B. {alt_b}
C. {alt_c}
D. {alt_d}

Resposta correta: {letra_correta} (índice {resposta_correta})

{pdf_hint}

INSTRUÇÕES OBRIGATÓRIAS:
1. Explique por que a alternativa correta está certa (raciocínio passo a passo).
2. Explique brevemente por que as outras alternativas estão erradas.
3. Seja técnico, claro e fiel aos conceitos de rede Cisco.
4. NÃO reescreva o enunciado. NÃO invente novas alternativas. NÃO mude a resposta.
5. Retorne APENAS um objeto JSON válido, sem markdown.

Formato obrigatório:
{{
  "explicacao_profunda": "Sua explicação técnica completa aqui"
}}
"""

PROMPT_TICKET = """Você é um engenheiro de redes sênior especializado em troubleshooting Cisco.

Abaixo está uma questão ORIGINAL de exame (não invente a pergunta nem as alternativas).
Transforme-a em um Ticket de Suporte realista, mantendo o mesmo sentido técnico e as MESMAS alternativas.

QUESTÃO ORIGINAL:
Enunciado: {enunciado}

Alternativas (manter o conteúdo original):
A. {alt_a}
B. {alt_b}
C. {alt_c}
D. {alt_d}

Resposta correta: {letra_correta} (índice {resposta_correta})

{pdf_hint}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie um ``sintoma`` curto no estilo ticket de suporte (problema reportado pelo cliente).
2. Crie um ``cli_output`` realista de Cisco IOS (show/debug) que ajude no diagnóstico e se relacione ao enunciado.
3. Escreva ``explicacao_profunda`` técnica (por que a correta e por que as outras erram).
4. Nas alternativas, REUTILIZE o texto original das alternativas A–D (pode apenas limpar espaços).
5. NÃO mude a resposta correta. NÃO invente outras alternativas.
6. Retorne APENAS um objeto JSON válido, sem markdown.

Formato obrigatório:
{{
  "question_type": "ticket",
  "isPremium": true,
  "sintoma": "Descrição curta do problema no estilo ticket",
  "cli_output": "Saída realista de comandos Cisco IOS",
  "alternativas": ["texto original A", "texto original B", "texto original C", "texto original D"],
  "resposta_correta": {resposta_correta},
  "explicacao_profunda": "Explicação técnica profunda"
}}
"""


def _format_pdf_hint(pdf_explanation: str) -> str:
    text = (pdf_explanation or "").strip()
    if not text:
        return ""
    return (
        "NOTA DO PDF (pode ajudar, mas não copie cegamente):\n"
        f"{text}\n"
    )


def build_explanation_prompt(eq: ExtractedQuestion) -> str:
    letter = "ABCD"[eq.resposta_correta]
    return PROMPT_EXPLANATION.format(
        enunciado=eq.enunciado,
        alt_a=eq.alternativas[0],
        alt_b=eq.alternativas[1],
        alt_c=eq.alternativas[2],
        alt_d=eq.alternativas[3],
        letra_correta=letter,
        resposta_correta=eq.resposta_correta,
        pdf_hint=_format_pdf_hint(eq.pdf_explanation),
    )


def build_ticket_prompt(eq: ExtractedQuestion) -> str:
    letter = "ABCD"[eq.resposta_correta]
    return PROMPT_TICKET.format(
        enunciado=eq.enunciado,
        alt_a=eq.alternativas[0],
        alt_b=eq.alternativas[1],
        alt_c=eq.alternativas[2],
        alt_d=eq.alternativas[3],
        letra_correta=letter,
        resposta_correta=eq.resposta_correta,
        pdf_hint=_format_pdf_hint(eq.pdf_explanation),
    )


# ─────────────────────────────────────────────────────────────────────────────
# PDF extraction + chunking
# ─────────────────────────────────────────────────────────────────────────────


def list_pdfs(pdf_dir: Path) -> list[Path]:
    if not pdf_dir.is_dir():
        raise FileNotFoundError(
            f"Pasta de PDFs não encontrada: {pdf_dir}\n"
            f"Crie a pasta e coloque os arquivos .pdf nela."
        )
    pdfs = sorted(pdf_dir.glob("*.pdf"))
    if not pdfs:
        raise FileNotFoundError(
            f"Nenhum PDF em {pdf_dir}\n"
            f"Copie os simulados antigos para essa pasta e rode novamente."
        )
    return pdfs


def extract_pages(pdf_path: Path) -> list[str]:
    """Retorna lista de textos por página (índice 0 = página 1)."""
    pages: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            text = clean_pdf_text(text)
            pages.append(text)
    return pages


def clean_pdf_text(text: str) -> str:
    """Normaliza espaços e remove ruído comum de footers."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    # footers / watermarks frequentes em dumps de simulados
    text = re.sub(r"(?im)^\s*CCNA4\.com\s*$", "", text)
    text = re.sub(r"(?im)^\s*www\.[^\s]+\s*$", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_pages(
    pdf_path: Path,
    pages: list[str],
    pages_per_chunk: int,
) -> Iterator[Chunk]:
    """Agrupa páginas em chunks de tamanho fixo."""
    n = len(pages)
    name = pdf_path.name
    for start in range(0, n, pages_per_chunk):
        end = min(start + pages_per_chunk, n)
        block = "\n\n".join(pages[start:end]).strip()
        yield Chunk(
            source_pdf=name,
            page_start=start + 1,
            page_end=end,
            text=block,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Parsing fiel de questões do PDF
# ─────────────────────────────────────────────────────────────────────────────

# Início de questão: número de 1–4 dígitos no começo da linha + texto
_RE_Q_START = re.compile(
    r"(?m)^(?P<num>\d{1,4})\s+(?=[A-Za-z\"'(\[])"
)

# Alternativa A–E no início da linha (com . ) : - ou espaço)
_RE_OPTION = re.compile(
    r"(?m)^(?P<letter>[A-Ea-e])(?:[\.\)\:]|\s)\s*(?P<body>\S.*)$"
)

# Linha de resposta: Ans A | Ans: C | Answer: B | Correct Answer: D
_RE_ANSWER = re.compile(
    r"(?im)^\s*(?:ans(?:wer)?|correct\s*answer)\s*[:\-]?\s*(?P<body>.+?)\s*$"
)

_LETTER_TO_IDX = {"A": 0, "B": 1, "C": 2, "D": 3}


def is_troubleshooting_candidate(eq: ExtractedQuestion) -> bool:
    """True se a questão parece boa para formato ticket (diagnóstico)."""
    blob = " ".join(
        [
            eq.enunciado,
            " ".join(eq.alternativas),
            eq.pdf_explanation,
        ]
    ).lower()
    hits = sum(1 for hint in TROUBLESHOOTING_HINTS if hint in blob)
    # pelo menos 1 indício forte; CLI/show/debug contam como fortes
    strong = any(
        k in blob
        for k in (
            "show ",
            "debug ",
            "troubleshoot",
            "following output",
            "following lines",
            "ios response",
            "spanning-tree",
            "interface",
        )
    )
    return strong or hits >= 2


def _normalize_ws(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def _parse_answer_letters(body: str) -> list[str]:
    """
    Extrai letras de resposta de strings como:
      'A', 'C', 'A & B', 'A,B &E', 'A, C &D'
    """
    # pega letras A-E isoladas (não palavras)
    letters = re.findall(r"(?i)\b([A-E])\b", body)
    return [L.upper() for L in letters]


def _split_question_blocks(text: str) -> list[tuple[Optional[int], str]]:
    """Divide o texto em blocos (número da questão, corpo)."""
    matches = list(_RE_Q_START.finditer(text))
    if not matches:
        return []

    blocks: list[tuple[Optional[int], str]] = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        num = int(m.group("num"))
        body = text[start:end].strip()
        if body:
            blocks.append((num, body))
    return blocks


def _extract_options_and_rest(
    body: str,
) -> tuple[str, dict[str, str], str]:
    """
    Separa enunciado, opções A–E e o resto (Ans + explicação do PDF).

    Returns:
        (enunciado, {A: text, ...}, trailing_after_options)
    """
    option_matches = list(_RE_OPTION.finditer(body))
    if not option_matches:
        return body.strip(), {}, ""

    # Primeira opção deve ser A (senão o enunciado ficou misturado)
    first_letter = option_matches[0].group("letter").upper()
    # aceita se houver pelo menos A e B em algum lugar
    letters_found = {m.group("letter").upper() for m in option_matches}
    if "A" not in letters_found or "B" not in letters_found:
        return body.strip(), {}, ""

    # enunciado = tudo antes da primeira opção A (se A não for a primeira match, usa A)
    first_a = next(
        (m for m in option_matches if m.group("letter").upper() == "A"),
        option_matches[0],
    )
    enunciado = body[: first_a.start()].strip()

    # Coleta A–D na ordem (ignora E+ para formato 4 alternativas)
    options: dict[str, str] = {}
    ordered = [m for m in option_matches if m.group("letter").upper() in "ABCDE"]
    # reordena a partir de A
    start_idx = 0
    for i, m in enumerate(ordered):
        if m.group("letter").upper() == "A":
            start_idx = i
            break
    ordered = ordered[start_idx:]

    for i, m in enumerate(ordered):
        letter = m.group("letter").upper()
        # corpo da opção = do início do body da opção até o início da próxima opção
        body_start = m.start("body")
        body_end = ordered[i + 1].start() if i + 1 < len(ordered) else None

        if body_end is None:
            # pode incluir Ans — corta no Ans se existir
            segment = body[body_start:]
            ans_m = _RE_ANSWER.search(segment)
            if ans_m:
                opt_text = segment[: ans_m.start()].strip()
            else:
                opt_text = segment.strip()
        else:
            opt_text = body[body_start:body_end].strip()

        opt_text = _normalize_ws(opt_text)
        # remove "Ans X" colado no final da opção (comum no PDF).
        # Usa \b para NÃO cortar palavras como "transaction".
        opt_text = re.sub(
            r"(?i)\s+\bans(?:wer)?\s*[:\-]?\s*[A-E]\b.*$",
            "",
            opt_text,
        ).strip()
        opt_text = re.sub(
            r"(?i)\s+\bcorrect\s+answer\s*[:\-]?\s*[A-E]\b.*$",
            "",
            opt_text,
        ).strip()
        if letter in "ABCD" and letter not in options and opt_text:
            options[letter] = opt_text

    # trailing: a partir da linha Ans
    ans_m = _RE_ANSWER.search(body)
    trailing = body[ans_m.start() :].strip() if ans_m else ""

    return _normalize_ws(enunciado), options, trailing


def parse_questions_from_text(
    text: str,
    *,
    source_pdf: str,
    source_label: str,
) -> tuple[list[ExtractedQuestion], int]:
    """
    Extrai questões (enunciado + 4 alternativas + resposta) do texto do PDF.

    Returns:
        (lista de questões válidas, quantidade de blocos descartados)
    """
    text = clean_pdf_text(text)
    blocks = _split_question_blocks(text)
    extracted: list[ExtractedQuestion] = []
    skipped = 0

    for num, body in blocks:
        enunciado, options, trailing = _extract_options_and_rest(body)

        if len(options) < 4 or any(L not in options for L in "ABCD"):
            skipped += 1
            log.debug(
                "  parse skip Q%s: alternativas incompletas (%s)",
                num,
                sorted(options.keys()),
            )
            continue

        if not enunciado or len(enunciado) < 12:
            skipped += 1
            log.debug("  parse skip Q%s: enunciado vazio/curto", num)
            continue

        ans_m = _RE_ANSWER.search(trailing) if trailing else _RE_ANSWER.search(body)
        if not ans_m:
            skipped += 1
            log.debug("  parse skip Q%s: sem linha Ans", num)
            continue

        letters = _parse_answer_letters(ans_m.group("body"))
        # multi-resposta (ex.: A & B) → fora do schema single-choice
        if len(letters) != 1 or letters[0] not in _LETTER_TO_IDX:
            skipped += 1
            log.debug(
                "  parse skip Q%s: resposta multi/inválida %r",
                num,
                ans_m.group("body"),
            )
            continue

        resposta = _LETTER_TO_IDX[letters[0]]
        pdf_expl = trailing[ans_m.end() :].strip() if trailing else ""
        # limpa prefixos residuais
        pdf_expl = re.sub(r"(?i)^ans(?:wer)?\s*[:\-]?\s*[A-E].*?\n?", "", pdf_expl)
        pdf_expl = _normalize_ws(pdf_expl)

        alternativas = [options["A"], options["B"], options["C"], options["D"]]

        extracted.append(
            ExtractedQuestion(
                source_pdf=source_pdf,
                source_label=source_label,
                number=num,
                enunciado=enunciado,
                alternativas=alternativas,
                resposta_correta=resposta,
                raw_answer=letters[0],
                pdf_explanation=pdf_expl,
            )
        )

    return extracted, skipped


# ─────────────────────────────────────────────────────────────────────────────
# Validação de schema
# ─────────────────────────────────────────────────────────────────────────────


class SchemaValidationError(ValueError):
    """Schema da questão incompleto ou inválido."""


def _as_bool(value: Any) -> bool:
    """Converte valor para bool estrito (rejeita strings arbitrárias)."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)) and value in (0, 1):
        return bool(value)
    if isinstance(value, str):
        low = value.strip().lower()
        if low in ("true", "1", "yes"):
            return True
        if low in ("false", "0", "no"):
            return False
    raise SchemaValidationError(
        f"isPremium deve ser boolean (recebido: {type(value).__name__}={value!r})"
    )


def _validate_alternatives(alts: Any) -> list[str]:
    if not isinstance(alts, list):
        raise SchemaValidationError(
            f"alternativas deve ser lista (recebido {type(alts).__name__})"
        )
    if len(alts) != 4:
        raise SchemaValidationError(
            f"alternativas deve ter exatamente 4 itens (recebido {len(alts)})"
        )
    alternativas = [str(a).strip() for a in alts]
    if any(not a for a in alternativas):
        raise SchemaValidationError("uma ou mais alternativas estão vazias")
    return alternativas


def _validate_resposta(value: Any) -> int:
    try:
        resposta = int(value)
    except (TypeError, ValueError) as exc:
        raise SchemaValidationError(
            f"resposta_correta deve ser inteiro (recebido {value!r})"
        ) from exc
    if resposta not in (0, 1, 2, 3):
        raise SchemaValidationError(
            f"resposta_correta deve estar entre 0 e 3 (recebido {resposta})"
        )
    return resposta


def validate_explanation_payload(data: Any) -> str:
    """Valida resposta do Ollama que contém só a explicação (ou envelope)."""
    if not isinstance(data, dict):
        raise SchemaValidationError(
            f"Esperado objeto JSON (dict), recebido {type(data).__name__}"
        )

    # aceita {"explicacao_profunda": "..."} ou objeto completo com o campo
    if "explicacao_profunda" not in data:
        raise SchemaValidationError("Campo ausente: explicacao_profunda")

    explicacao = str(data["explicacao_profunda"]).strip()
    if not explicacao:
        raise SchemaValidationError("explicacao_profunda vazia")
    if len(explicacao) < 40:
        raise SchemaValidationError(
            f"explicacao_profunda muito curta ({len(explicacao)} chars)"
        )
    return explicacao


def validate_ticket_payload(
    data: Any,
    *,
    fallback_alternativas: list[str],
    fallback_resposta: int,
) -> dict[str, Any]:
    """
    Valida payload de ticket gerado pelo Ollama.
    Força alternativas/resposta originais se o modelo alterar demais.
    """
    if not isinstance(data, dict):
        raise SchemaValidationError(
            f"Esperado objeto JSON (dict), recebido {type(data).__name__}"
        )

    sintoma = str(data.get("sintoma", "")).strip()
    if not sintoma:
        raise SchemaValidationError("sintoma vazio")

    cli_output = str(data.get("cli_output", "")).strip()
    if not cli_output:
        raise SchemaValidationError("cli_output vazio")

    explicacao = str(data.get("explicacao_profunda", "")).strip()
    if not explicacao or len(explicacao) < 40:
        raise SchemaValidationError("explicacao_profunda ausente/curta")

    # Preferir alternativas originais (fidelidade)
    if "alternativas" in data:
        try:
            alts = _validate_alternatives(data["alternativas"])
        except SchemaValidationError:
            alts = list(fallback_alternativas)
    else:
        alts = list(fallback_alternativas)

    # Se o modelo distorceu muito as alternativas, volta às originais
    if _alts_too_different(alts, fallback_alternativas):
        alts = list(fallback_alternativas)

    if "resposta_correta" in data:
        try:
            resposta = _validate_resposta(data["resposta_correta"])
        except SchemaValidationError:
            resposta = fallback_resposta
    else:
        resposta = fallback_resposta

    # Nunca permitir que o modelo mude a resposta do PDF
    if resposta != fallback_resposta:
        log.debug(
            "  ticket: modelo alterou resposta %s→%s; forçando original",
            resposta,
            fallback_resposta,
        )
        resposta = fallback_resposta

    is_premium = True
    if "isPremium" in data:
        try:
            is_premium = _as_bool(data["isPremium"])
        except SchemaValidationError:
            is_premium = True

    return {
        "question_type": "ticket",
        "isPremium": is_premium,
        "sintoma": sintoma,
        "cli_output": cli_output,
        "alternativas": alts,
        "resposta_correta": resposta,
        "explicacao_profunda": explicacao,
    }


def _alts_too_different(a: list[str], b: list[str]) -> bool:
    """Heurística: se overlap lexical for baixo, considera distorcido."""
    if len(a) != len(b):
        return True

    def tokens(s: str) -> set[str]:
        return {t for t in re.findall(r"[a-z0-9]+", s.lower()) if len(t) > 2}

    bad = 0
    for x, y in zip(a, b):
        tx, ty = tokens(x), tokens(y)
        if not tx or not ty:
            if x.strip().lower() != y.strip().lower():
                bad += 1
            continue
        overlap = len(tx & ty) / max(1, len(tx | ty))
        if overlap < 0.35:
            bad += 1
    return bad >= 2


def validate_question_schema(data: Any) -> dict[str, Any]:
    """
    Valida objeto completo ticket|traditional (persistência / append).
    """
    if not isinstance(data, dict):
        raise SchemaValidationError(
            f"Esperado objeto JSON (dict), recebido {type(data).__name__}"
        )

    if "questions" in data and "question_type" not in data:
        qs = data.get("questions")
        if not isinstance(qs, list) or not qs:
            raise SchemaValidationError("Lista 'questions' vazia ou inválida")
        data = qs[0]
        if not isinstance(data, dict):
            raise SchemaValidationError("Item de 'questions' não é um objeto")

    qtype_raw = str(data.get("question_type", "")).strip().lower()
    if not qtype_raw:
        if "sintoma" in data and "cli_output" in data:
            qtype_raw = "ticket"
        elif "enunciado" in data:
            qtype_raw = "traditional"
        else:
            raise SchemaValidationError("question_type ausente e não inferível")

    if qtype_raw not in ("ticket", "traditional"):
        raise SchemaValidationError(
            f"question_type deve ser 'ticket' ou 'traditional' (recebido {qtype_raw!r})"
        )

    alternativas = _validate_alternatives(data.get("alternativas"))
    resposta = _validate_resposta(data.get("resposta_correta"))
    explicacao = str(data.get("explicacao_profunda", "")).strip()
    if not explicacao:
        raise SchemaValidationError("explicacao_profunda vazia")

    is_premium = _as_bool(data["isPremium"]) if "isPremium" in data else True

    if qtype_raw == "ticket":
        sintoma = str(data.get("sintoma", "")).strip()
        cli_output = str(data.get("cli_output", "")).strip()
        if not sintoma:
            raise SchemaValidationError("sintoma vazio")
        if not cli_output:
            raise SchemaValidationError("cli_output vazio")
        return {
            "question_type": "ticket",
            "isPremium": is_premium,
            "sintoma": sintoma,
            "cli_output": cli_output,
            "alternativas": alternativas,
            "resposta_correta": resposta,
            "explicacao_profunda": explicacao,
        }

    enunciado = str(data.get("enunciado", "")).strip()
    if not enunciado:
        raise SchemaValidationError("enunciado vazio")
    return {
        "question_type": "traditional",
        "isPremium": is_premium,
        "enunciado": enunciado,
        "alternativas": alternativas,
        "resposta_correta": resposta,
        "explicacao_profunda": explicacao,
    }


def to_question(validated: dict[str, Any], question_id: int) -> Question:
    """Converte dict já validado em Question com id."""
    qtype: QuestionType = validated["question_type"]
    if qtype == "ticket":
        return Question(
            id=question_id,
            question_type="ticket",
            isPremium=validated["isPremium"],
            sintoma=validated["sintoma"],
            cli_output=validated["cli_output"],
            alternativas=validated["alternativas"],
            resposta_correta=validated["resposta_correta"],
            explicacao_profunda=validated["explicacao_profunda"],
        )
    return Question(
        id=question_id,
        question_type="traditional",
        isPremium=validated["isPremium"],
        enunciado=validated["enunciado"],
        alternativas=validated["alternativas"],
        resposta_correta=validated["resposta_correta"],
        explicacao_profunda=validated["explicacao_profunda"],
    )


def question_from_dict(item: dict[str, Any]) -> Optional[Question]:
    """Reconstrói Question a partir de um item já salvo (append / checkpoint)."""
    try:
        validated = validate_question_schema(item)
        return to_question(validated, int(item["id"]))
    except (KeyError, TypeError, ValueError, SchemaValidationError):
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Ollama — integração robusta
# ─────────────────────────────────────────────────────────────────────────────


def check_ollama_available(
    url: str = OLLAMA_URL,
    model: str = OLLAMA_MODEL,
    timeout: int = 10,
) -> None:
    """Falha cedo se o daemon Ollama não estiver no ar."""
    base = url.replace("/api/generate", "").rstrip("/")
    try:
        r = requests.get(f"{base}/api/tags", timeout=timeout)
        r.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(
            f"Ollama inacessível em {base}.\n"
            f"  → Inicie com:  ollama serve\n"
            f"  → Baixe o modelo:  ollama pull {model}\n"
            f"  → Erro: {exc}"
        ) from exc

    tags = r.json()
    names = [m.get("name", "") for m in tags.get("models", [])]
    if names and not any(
        model in n or n.startswith(model.split(":")[0]) for n in names
    ):
        log.warning(
            "Modelo '%s' não aparece em ollama list. Disponíveis: %s",
            model,
            ", ".join(names) or "(nenhum)",
        )


def _try_extract_json_object(text: str) -> Optional[dict[str, Any]]:
    """Recupera o primeiro objeto JSON balanceado de uma string suja."""
    start = text.find("{")
    if start < 0:
        return None
    depth = 0
    in_str = False
    escape = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    obj = json.loads(text[start : i + 1])
                    return obj if isinstance(obj, dict) else None
                except json.JSONDecodeError:
                    return None
    return None


def _parse_ollama_response(raw: str) -> dict[str, Any]:
    """Parseia o campo response do Ollama em dict (com fallback de extração)."""
    if not raw or not str(raw).strip():
        raise ValueError("Ollama retornou response vazio")

    text = str(raw).strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        recovered = _try_extract_json_object(text)
        if recovered is None:
            raise ValueError(f"JSON inválido: {exc}") from exc
        log.debug("JSON recuperado via extração de objeto balanceado")
        data = recovered

    if not isinstance(data, dict):
        raise ValueError(f"Esperado objeto JSON, veio {type(data).__name__}")
    return data


def _request_ollama_once(prompt: str, cfg: OllamaRuntime) -> dict[str, Any]:
    """Uma única chamada HTTP ao Ollama → dict parseado (sem schema)."""
    payload: dict[str, Any] = {
        "model": cfg.model,
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": cfg.temperature,
            "top_p": cfg.top_p,
            "num_ctx": cfg.num_ctx,
            "num_predict": cfg.num_predict,
        },
    }

    log.debug(
        "POST %s model=%s temp=%.2f top_p=%.2f num_ctx=%d",
        cfg.url,
        cfg.model,
        cfg.temperature,
        cfg.top_p,
        cfg.num_ctx,
    )

    try:
        response = requests.post(cfg.url, json=payload, timeout=cfg.timeout)
        response.raise_for_status()
    except requests.Timeout as exc:
        raise ConnectionError(
            f"Timeout após {cfg.timeout}s ao chamar Ollama"
        ) from exc
    except requests.RequestException as exc:
        raise ConnectionError(f"Falha na requisição Ollama: {exc}") from exc

    try:
        body = response.json()
    except json.JSONDecodeError as exc:
        raise ValueError(f"Resposta HTTP do Ollama não é JSON: {exc}") from exc

    raw = body.get("response", "")
    return _parse_ollama_response(raw)


def _call_ollama_with_validator(
    prompt: str,
    validate_fn: Any,
) -> Any | None:
    """
    Chama Ollama com até max_retries tentativas e valida cada resposta.
    ``validate_fn(raw_dict)`` deve retornar o valor normalizado ou levantar
    SchemaValidationError / ValueError.
    """
    cfg = _runtime
    last_error: Optional[BaseException] = None

    for attempt in range(1, cfg.max_retries + 1):
        try:
            log.info(
                "    → Ollama tentativa %d/%d …",
                attempt,
                cfg.max_retries,
            )
            raw_obj = _request_ollama_once(prompt, cfg)
            result = validate_fn(raw_obj)
            log.info("    ✓ Resposta Ollama válida")
            return result

        except (ConnectionError, requests.RequestException) as exc:
            last_error = exc
            log.warning(
                "    ⚠ Tentativa %d/%d — falha de rede/requisição: %s",
                attempt,
                cfg.max_retries,
                exc,
            )
        except (ValueError, json.JSONDecodeError, SchemaValidationError) as exc:
            last_error = exc
            log.warning(
                "    ⚠ Tentativa %d/%d — JSON/schema inválido: %s",
                attempt,
                cfg.max_retries,
                exc,
            )
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            log.warning(
                "    ⚠ Tentativa %d/%d — erro inesperado: %s: %s",
                attempt,
                cfg.max_retries,
                type(exc).__name__,
                exc,
            )

        if attempt < cfg.max_retries:
            backoff = 1.5 * attempt
            log.info("    … aguardando %.1fs antes do retry", backoff)
            time.sleep(backoff)

    log.error(
        "    ✗ Todas as %d tentativas falharam. Último erro: %s",
        cfg.max_retries,
        last_error,
    )
    return None


def generate_explanation(eq: ExtractedQuestion) -> Optional[str]:
    """Pede ao Ollama somente a explicacao_profunda."""
    prompt = build_explanation_prompt(eq)
    return _call_ollama_with_validator(prompt, validate_explanation_payload)


def generate_ticket(eq: ExtractedQuestion) -> Optional[dict[str, Any]]:
    """Pede ao Ollama um ticket a partir da questão original."""
    prompt = build_ticket_prompt(eq)

    def _validate(raw: dict[str, Any]) -> dict[str, Any]:
        return validate_ticket_payload(
            raw,
            fallback_alternativas=eq.alternativas,
            fallback_resposta=eq.resposta_correta,
        )

    return _call_ollama_with_validator(prompt, _validate)


# ─────────────────────────────────────────────────────────────────────────────
# Persistência
# ─────────────────────────────────────────────────────────────────────────────


def load_existing(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
    except (json.JSONDecodeError, OSError) as exc:
        log.warning(
            "Não foi possível ler %s (%s). Iniciando arquivo novo.",
            path,
            exc,
        )
    return []


def save_questions(path: Path, questions: list[Question]) -> None:
    """Checkpoint: grava o array completo de questões em UTF-8."""
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = [q.to_dict() for q in questions]
    path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    log.info("  💾 Checkpoint: %d questão(ões) → %s", len(questions), path)


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline principal
# ─────────────────────────────────────────────────────────────────────────────


def run(
    *,
    pdf_dir: Path,
    output_file: Path,
    ollama_url: str,
    model: str,
    pages_per_chunk: int,
    min_chunk_chars: int,
    temperature: float,
    top_p: float,
    num_ctx: int,
    timeout: int,
    max_retries: int,
    start_id: int,
    append: bool,
    max_pages: Optional[int] = None,
) -> EngineStats:
    global _runtime

    stats = EngineStats()
    _runtime = OllamaRuntime(
        url=ollama_url,
        model=model,
        temperature=temperature,
        top_p=top_p,
        num_ctx=num_ctx,
        timeout=timeout,
        max_retries=max_retries,
    )

    log.info("══════════════════════════════════════════════════")
    log.info("  Forge Data Engine · CCNA Forge")
    log.info("══════════════════════════════════════════════════")
    log.info("  Estratégia    : extração fiel + Ollama (explicação)")
    log.info("  Formato base  : traditional (ticket seletivo)")
    log.info("  PDFs          : %s", pdf_dir)
    log.info("  Modelo        : %s", model)
    log.info("  Ollama        : %s", ollama_url)
    log.info("  temperature   : %.2f", temperature)
    log.info("  top_p         : %.2f", top_p)
    log.info("  num_ctx       : %d", num_ctx)
    log.info("  max_retries   : %d", max_retries)
    log.info("  Chunk (págs)  : %d", pages_per_chunk)
    log.info(
        "  Max páginas   : %s",
        max_pages if max_pages is not None else "todas",
    )
    log.info("  Saída         : %s", output_file)
    log.info("  Append        : %s", append)
    log.info("══════════════════════════════════════════════════")

    check_ollama_available(ollama_url, model)
    log.info("[OK] Ollama online e respondendo")

    pdfs = list_pdfs(pdf_dir)
    stats.pdfs = len(pdfs)
    log.info("[OK] %d PDF(s) encontrado(s)", len(pdfs))

    # ── Extração de texto + parsing local ──────────────────────────────────
    all_chunks: list[Chunk] = []
    for pdf in pdfs:
        log.info("[PDF] Extraindo texto: %s", pdf.name)
        pages = extract_pages(pdf)
        total_pages = len(pages)
        if max_pages is not None and max_pages > 0:
            pages = pages[:max_pages]
            log.info(
                "      %d página(s) no PDF → limitando às primeiras %d",
                total_pages,
                len(pages),
            )
        else:
            log.info("      %d página(s) extraída(s)", total_pages)
        for chunk in chunk_pages(pdf, pages, pages_per_chunk):
            all_chunks.append(chunk)

    stats.chunks_total = len(all_chunks)
    log.info("[OK] %d chunk(s) de páginas — extraindo questões", stats.chunks_total)

    extracted: list[ExtractedQuestion] = []
    seen_fp: set[str] = set()

    for chunk in all_chunks:
        if len(chunk.text) < min_chunk_chars:
            log.info("  ↷ %s vazio/curto — ignorado", chunk.label)
            stats.chunks_skipped_empty += 1
            continue

        qs, skipped = parse_questions_from_text(
            chunk.text,
            source_pdf=chunk.source_pdf,
            source_label=chunk.label,
        )
        stats.questions_skipped_parse += skipped

        for eq in qs:
            fp = eq.fingerprint()
            if fp in seen_fp:
                log.debug("  ↷ Duplicata ignorada: Q%s (%s)", eq.number, chunk.label)
                continue
            seen_fp.add(fp)
            extracted.append(eq)

        log.info(
            "  %s → %d questão(ões) válida(s), %d descartada(s)",
            chunk.label,
            len(qs),
            skipped,
        )

    stats.questions_extracted = len(extracted)
    log.info(
        "[OK] %d questão(ões) extraídas do PDF — iniciando geração Ollama",
        stats.questions_extracted,
    )

    if not extracted:
        log.warning(
            "Nenhuma questão single-choice (A–D + Ans) foi parseada. "
            "Verifique o layout do PDF ou aumente --max-pages / --pages-per-chunk."
        )

    # ── Persistência / append ──────────────────────────────────────────────
    questions: list[Question] = []
    next_id = start_id

    if append:
        existing = load_existing(output_file)
        if existing:
            max_id = max(
                (int(q.get("id", 0)) for q in existing),
                default=start_id - 1,
            )
            next_id = max(start_id, max_id + 1)
            for item in existing:
                q = question_from_dict(item)
                if q is not None:
                    questions.append(q)
            log.info(
                "[APPEND] %d questão(ões) pré-existentes (próximo id=%d)",
                len(questions),
                next_id,
            )

    # ── Ollama: explicação (e ticket seletivo) ─────────────────────────────
    total_q = len(extracted)
    for idx, eq in enumerate(extracted, start=1):
        progress = f"[{idx}/{total_q}]"
        q_label = f"Q{eq.number}" if eq.number is not None else f"item-{idx}"
        preview = eq.enunciado[:70] + ("…" if len(eq.enunciado) > 70 else "")
        log.info(
            "%s %s · %s — %s",
            progress,
            q_label,
            eq.source_label,
            preview,
        )
        log.info(
            "  ✓ Extraído: resposta=%s alternativas=%d",
            "ABCD"[eq.resposta_correta],
            len(eq.alternativas),
        )

        want_ticket = is_troubleshooting_candidate(eq)
        if want_ticket:
            stats.ticket_candidates += 1
            log.info("  ✦ Candidato a ticket (troubleshooting detectado)")
            ticket_data = generate_ticket(eq)
            if ticket_data is not None:
                q = to_question(ticket_data, next_id)
                questions.append(q)
                stats.questions_valid += 1
                stats.questions_processed += 1
                stats.format_ticket += 1
                log.info("  ✓ Q#%d [ticket] — %s", q.id, (q.sintoma or "")[:80])
                next_id += 1
                save_questions(output_file, questions)
                continue
            log.warning(
                "  ⚠ Ticket falhou — caindo para traditional com explicação"
            )

        # Fluxo principal: traditional fiel + explicação via Ollama
        log.info("  ✦ Formato: traditional (fidelidade ao PDF)")
        explanation = generate_explanation(eq)
        if explanation is None:
            log.error("  ✗ Falha ao gerar explicação para %s", q_label)
            stats.ollama_errors += 1
            stats.questions_rejected += 1
            save_questions(output_file, questions)
            continue

        validated = {
            "question_type": "traditional",
            "isPremium": True,
            "enunciado": eq.enunciado,
            "alternativas": list(eq.alternativas),
            "resposta_correta": eq.resposta_correta,
            "explicacao_profunda": explanation,
        }
        # revalida estrutura final
        try:
            validated = validate_question_schema(validated)
        except SchemaValidationError as exc:
            log.error("  ✗ Schema final inválido: %s", exc)
            stats.questions_rejected += 1
            save_questions(output_file, questions)
            continue

        q = to_question(validated, next_id)
        questions.append(q)
        stats.questions_valid += 1
        stats.questions_processed += 1
        stats.format_traditional += 1
        log.info("  ✓ Q#%d [traditional] — %s", q.id, preview)
        next_id += 1
        save_questions(output_file, questions)

    log.info("══════════════════════════════════════════════════")
    log.info("  RESUMO DA EXECUÇÃO")
    log.info("══════════════════════════════════════════════════")
    log.info("  PDFs                     : %d", stats.pdfs)
    log.info("  Chunks de páginas        : %d", stats.chunks_total)
    log.info("  Chunks skip (vazio)      : %d", stats.chunks_skipped_empty)
    log.info("  Questões extraídas       : %d", stats.questions_extracted)
    log.info("  Blocos parse descartados : %d", stats.questions_skipped_parse)
    log.info("  Candidatos a ticket      : %d", stats.ticket_candidates)
    log.info("  Processadas (Ollama ok)  : %d", stats.questions_processed)
    log.info("  Falhas Ollama/schema     : %d", stats.ollama_errors)
    log.info("  Questões válidas (run)   : %d", stats.questions_valid)
    log.info("    · traditional          : %d", stats.format_traditional)
    log.info("    · ticket               : %d", stats.format_ticket)
    log.info("  Total no arquivo         : %d", len(questions))
    log.info("  Arquivo                  : %s", output_file)
    log.info("══════════════════════════════════════════════════")

    return stats


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description=(
            "Forge Data Engine — PDFs de simulados CCNA → questions.json via Ollama "
            "(extração fiel + explicação)"
        ),
    )
    p.add_argument(
        "--pdf-dir",
        type=Path,
        default=PDF_DIR,
        help=f"Pasta com PDFs (default: {PDF_DIR})",
    )
    p.add_argument(
        "--output",
        type=Path,
        default=OUTPUT_FILE,
        help=f"Arquivo JSON de saída (default: {OUTPUT_FILE})",
    )
    p.add_argument(
        "--model",
        default=OLLAMA_MODEL,
        help=f"Modelo Ollama (default: {OLLAMA_MODEL})",
    )
    p.add_argument(
        "--url",
        default=OLLAMA_URL,
        help=f"URL /api/generate (default: {OLLAMA_URL})",
    )
    p.add_argument(
        "--pages-per-chunk",
        type=int,
        default=PAGES_PER_CHUNK,
        help=f"Páginas por chunk de extração (default: {PAGES_PER_CHUNK})",
    )
    p.add_argument(
        "--max-pages",
        type=int,
        default=None,
        metavar="N",
        help=(
            "Processa apenas as primeiras N páginas de cada PDF "
            "(default: todas as páginas)"
        ),
    )
    p.add_argument(
        "--min-chars",
        type=int,
        default=MIN_CHUNK_CHARS,
        help=f"Mínimo de chars por chunk (default: {MIN_CHUNK_CHARS})",
    )
    p.add_argument(
        "--temperature",
        type=float,
        default=OLLAMA_TEMPERATURE,
        help=f"Temperature Ollama (default: {OLLAMA_TEMPERATURE})",
    )
    p.add_argument(
        "--top-p",
        type=float,
        default=OLLAMA_TOP_P,
        help=f"top_p Ollama (default: {OLLAMA_TOP_P})",
    )
    p.add_argument(
        "--num-ctx",
        type=int,
        default=OLLAMA_NUM_CTX,
        help=f"num_ctx (contexto) Ollama (default: {OLLAMA_NUM_CTX})",
    )
    p.add_argument(
        "--timeout",
        type=int,
        default=OLLAMA_TIMEOUT_SEC,
        help=f"Timeout por request em segundos (default: {OLLAMA_TIMEOUT_SEC})",
    )
    p.add_argument(
        "--retries",
        type=int,
        default=MAX_RETRIES,
        help=f"Máximo de tentativas por questão (default: {MAX_RETRIES})",
    )
    p.add_argument(
        "--start-id",
        type=int,
        default=START_ID,
        help=f"Primeiro id de questão (default: {START_ID})",
    )
    p.add_argument(
        "--append",
        action="store_true",
        help="Mantém questões já existentes em --output e continua a numeração",
    )
    p.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Log DEBUG",
    )
    return p.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        log.setLevel(logging.DEBUG)

    try:
        run(
            pdf_dir=args.pdf_dir.resolve(),
            output_file=args.output.resolve(),
            ollama_url=args.url,
            model=args.model,
            pages_per_chunk=args.pages_per_chunk,
            min_chunk_chars=args.min_chars,
            temperature=args.temperature,
            top_p=args.top_p,
            num_ctx=args.num_ctx,
            timeout=args.timeout,
            max_retries=args.retries,
            start_id=args.start_id,
            append=args.append,
            max_pages=args.max_pages,
        )
    except (FileNotFoundError, RuntimeError) as exc:
        log.error("%s", exc)
        return 1
    except KeyboardInterrupt:
        log.warning(
            "Interrompido pelo usuário (Ctrl+C). "
            "Progresso parcial já foi salvo no checkpoint."
        )
        return 130

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
