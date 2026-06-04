import requests
import os
import re
import json
from dotenv import load_dotenv

load_dotenv()

LM_STUDIO_URL = os.getenv("LM_STUDIO_URL", "http://localhost:1234")
MODEL_NAME    = os.getenv("LM_MODEL", "qwen3-14b")


def strip_think_tags(text: str) -> str:
    """Elimina bloques <think>...</think> que algunos modelos cuelan en el content."""
    return re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL).strip()


def build_messages(system_prompt: str, user_message: str, history: list[dict] = None) -> list[dict]:
    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for msg in history[-6:]:
            messages.append(msg)
    messages.append({"role": "user", "content": user_message})
    return messages


def call_llm(
    system_prompt: str,
    user_message: str,
    history: list[dict] = None,
    temperature: float = 0.1,
) -> tuple[str, str | None]:
    """
    Llama al modelo en LM Studio (sin streaming).
    Retorna (content, reasoning_content).
    """
    messages = build_messages(system_prompt, user_message, history)

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 8192,
        "stream": False,
    }

    try:
        response = requests.post(
            f"{LM_STUDIO_URL}/v1/chat/completions",
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        data = response.json()

        message   = data["choices"][0]["message"]
        content   = strip_think_tags(message.get("content", "")).strip()
        reasoning = message.get("reasoning_content") or None

        return content, reasoning

    except requests.exceptions.Timeout:
        raise RuntimeError("El modelo tardó demasiado en responder.")
    except requests.exceptions.ConnectionError:
        raise RuntimeError("No se pudo conectar a LM Studio. Verifica que esté corriendo.")
    except Exception as e:
        raise RuntimeError(f"Error al llamar al LLM: {str(e)}")


def stream_llm(
    system_prompt: str,
    user_message: str,
    history: list[dict] = None,
    temperature: float = 0.1,
):
    """
    Llama al modelo con stream=True.
    Es un generador que va yielding líneas SSE con este formato:
      data: {"type": "reasoning", "token": "..."}   <- mientras razona
      data: {"type": "content",   "token": "..."}   <- respuesta final
      data: {"type": "done",      "sql": "...", "suggestions": [...]}
      data: {"type": "error",     "message": "..."}
    """
    messages = build_messages(system_prompt, user_message, history)

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 8192,
        "stream": True,
    }

    try:
        response = requests.post(
            f"{LM_STUDIO_URL}/v1/chat/completions",
            json=payload,
            timeout=120,
            stream=True,
        )
        response.raise_for_status()

        for raw_line in response.iter_lines():
            if not raw_line:
                continue

            line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line

            if not line.startswith("data:"):
                continue

            data_str = line[5:].strip()
            if data_str == "[DONE]":
                break

            try:
                chunk = json.loads(data_str)
            except json.JSONDecodeError:
                continue

            delta = chunk.get("choices", [{}])[0].get("delta", {})

            # Token de razonamiento
            reasoning_token = delta.get("reasoning_content")
            if reasoning_token:
                yield f"data: {json.dumps({'type': 'reasoning', 'token': reasoning_token})}\n\n"

            # Token de respuesta
            content_token = delta.get("content")
            if content_token:
                yield f"data: {json.dumps({'type': 'content', 'token': content_token})}\n\n"

    except requests.exceptions.Timeout:
        yield f"data: {json.dumps({'type': 'error', 'message': 'El modelo tardó demasiado.'})}\n\n"
    except requests.exceptions.ConnectionError:
        yield f"data: {json.dumps({'type': 'error', 'message': 'No se pudo conectar a LM Studio.'})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"


def generate_sql(question: str, history: list[dict] = None) -> tuple[str, str | None]:
    """Genera una query SQL. Retorna (sql, reasoning)."""
    from prompts import SQL_SYSTEM_PROMPT
    return call_llm(SQL_SYSTEM_PROMPT, question, history, temperature=0.1)


def generate_narrative(
    question: str,
    sql: str,
    results: list[dict],
    history: list[dict] = None,
) -> tuple[str, str | None]:
    """Genera narrativa de los resultados. Retorna (narrative, reasoning)."""
    from prompts import NARRATIVE_SYSTEM_PROMPT

    results_str = str(results[:20]) if results else "Sin resultados"
    user_msg = f"""Pregunta del usuario: {question}

Query ejecutada:
{sql}

Resultados obtenidos ({len(results)} filas):
{results_str}

Explica estos resultados de forma clara."""

    return call_llm(NARRATIVE_SYSTEM_PROMPT, user_msg, history, temperature=0.3)


def parse_suggestions(narrative: str) -> tuple[str, list[str]]:
    """Separa el texto narrativo de las sugerencias."""
    suggestions = []
    clean_text = narrative

    if "SUGERENCIAS:" in narrative:
        parts = narrative.split("SUGERENCIAS:", 1)
        clean_text = parts[0].strip()
        raw_suggestions = parts[1].strip()
        suggestions = [s.strip() for s in raw_suggestions.split("|") if s.strip()]

    return clean_text, suggestions[:3]