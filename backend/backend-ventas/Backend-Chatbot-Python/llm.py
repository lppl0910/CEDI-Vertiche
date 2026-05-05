import requests
import os
from dotenv import load_dotenv

load_dotenv()

LM_STUDIO_URL = os.getenv("LM_STUDIO_URL", "http://localhost:1234")
MODEL_NAME    = os.getenv("LM_MODEL", "qwen3-14b")

def call_llm(system_prompt: str, user_message: str, history: list[dict] = None, temperature: float = 0.1) -> str:
    """Llama al modelo en LM Studio y regresa el texto de respuesta."""
    messages = [{"role": "system", "content": system_prompt}]

    if history:
        for msg in history[-6:]:  # máximo 6 mensajes de historia
            messages.append(msg)

    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 1024,
        "stream": False,
    }

    try:
        response = requests.post(
            f"{LM_STUDIO_URL}/v1/chat/completions",
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except requests.exceptions.Timeout:
        raise RuntimeError("El modelo tardó demasiado en responder.")
    except requests.exceptions.ConnectionError:
        raise RuntimeError("No se pudo conectar a LM Studio. Verifica que esté corriendo.")
    except Exception as e:
        raise RuntimeError(f"Error al llamar al LLM: {str(e)}")


def generate_sql(question: str, history: list[dict] = None) -> str:
    """Genera una query SQL a partir de una pregunta en lenguaje natural."""
    from prompts import SQL_SYSTEM_PROMPT
    return call_llm(SQL_SYSTEM_PROMPT, question, history, temperature=0.1)


def generate_narrative(question: str, sql: str, results: list[dict], history: list[dict] = None) -> str:
    """Genera una explicación narrativa de los resultados."""
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
