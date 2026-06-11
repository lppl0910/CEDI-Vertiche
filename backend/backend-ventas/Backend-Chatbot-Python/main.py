"""
Punto de entrada de la API del chatbot de análisis de ventas de Vertiche.

Expone un único endpoint de streaming SSE (POST /chat/stream) que orquesta
tres fases en secuencia:
  1. Generación de SQL a partir de la pregunta del usuario (LLM sin streaming).
  2. Ejecución de la consulta SQL contra MySQL (solo lectura).
  3. Narrativa de los resultados con streaming token a token (LLM con streaming).

Al finalizar, extrae preguntas de seguimiento de la narrativa y las devuelve
como evento ``meta`` junto con una muestra de los datos crudos.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import traceback
import json
import decimal
import asyncio

from database import execute_query
from llm import generate_sql, parse_suggestions, stream_llm
from prompts import NARRATIVE_SYSTEM_PROMPT

app = FastAPI(title="Vertiche Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Serializador custom para tipos MySQL ─────────────────────────────
def default_serializer(obj):
    """Serializa tipos de MySQL que json.dumps no maneja de forma nativa.

    Convierte ``decimal.Decimal`` a ``float`` para que los resultados del
    cursor de MySQL sean serializables a JSON.

    Args:
        obj: Objeto que json.dumps no pudo serializar.

    Raises:
        TypeError: Si el tipo no está contemplado en esta función.
    """
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


# ── Modelos Pydantic ─────────────────────────────────────────────────
class Message(BaseModel):
    """Un mensaje individual del historial de conversación."""

    role: str     # "user" o "assistant"
    content: str  # Texto del mensaje


class ChatRequest(BaseModel):
    """Payload de entrada para el endpoint /chat/stream."""

    message: str                  # Pregunta del usuario en el turno actual
    history: list[Message] = []   # Historial de turnos anteriores (opcional)


class ChatResponse(BaseModel):
    """Esquema de respuesta para el endpoint no-streaming (referencia).

    No se usa directamente en /chat/stream porque éste devuelve SSE,
    pero documenta los campos que componen una respuesta completa.
    """

    answer: str
    sql: str | None = None
    results: list[dict] | None = None
    suggestions: list[str] = []
    error: str | None = None
    reasoning: str | None = None


# ── Endpoints ────────────────────────────────────────────────────────
@app.get("/")
def root():
    """Verifica que la API esté en línea."""
    return {"status": "ok", "message": "Vertiche Chatbot API corriendo"}


@app.get("/health")
def health():
    """Health-check mínimo para balanceadores de carga o monitoreo."""
    return {"status": "ok"}


# ── POST /chat/stream ────────────────────────────────────────────────
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    """Responde a la pregunta del usuario con un flujo de eventos SSE.

    Orquesta las tres fases del pipeline (SQL → ejecución → narrativa) y
    emite eventos Server-Sent Events con estos tipos posibles:

    - ``reasoning``: tokens del razonamiento interno del modelo (si disponibles).
    - ``sql``:       consulta SQL generada.
    - ``content``:   tokens de la narrativa en streaming.
    - ``clean_text``: narrativa completa sin el bloque de sugerencias.
    - ``meta``:      sugerencias de seguimiento y muestra de resultados (máx. 5 filas).
    - ``done``:      señal de fin de stream.
    - ``error``:     descripción del error si alguna fase falla.

    Args:
        req: Mensaje actual del usuario más historial de la conversación.

    Returns:
        StreamingResponse con ``Content-Type: text/event-stream``.
    """
    history = [{"role": m.role, "content": m.content} for m in req.history]

    async def event_generator():
        try:
            # ── Fase 1: Generar SQL (sin streaming) ──────────────────
            sql_raw, sql_reasoning = generate_sql(req.message, history)

            # Emitir el reasoning línea por línea con delay
            if sql_reasoning:
                lines = sql_reasoning.split('\n')
                for line in lines:
                    if line.strip():  # ignorar líneas vacías
                        yield f"data: {json.dumps({'type': 'reasoning', 'token': line + chr(10)})}\n\n"
                        await asyncio.sleep(0.08)  # 80ms entre líneas

            if not sql_raw or sql_raw.strip().upper() == "NO_SQL":
                yield f"data: {json.dumps({'type': 'error', 'message': 'No pude generar una consulta para esa pregunta.'})}\n\n"
                return

            sql_clean = sql_raw.replace("```sql", "").replace("```", "").strip()
            yield f"data: {json.dumps({'type': 'sql', 'sql': sql_clean})}\n\n"

            # ── Fase 2: Ejecutar SQL ──────────────────────────────────
            try:
                results = execute_query(sql_clean)
            except Exception as db_err:
                yield f"data: {json.dumps({'type': 'error', 'message': str(db_err)})}\n\n"
                return

            # ── Fase 3: Narrativa con streaming ──────────────────────
            results_str = str(results[:20]) if results else "Sin resultados"
            narrative_prompt = (
                f"Pregunta del usuario: {req.message}\n\n"
                f"Query ejecutada:\n{sql_clean}\n\n"
                f"Resultados obtenidos ({len(results)} filas):\n{results_str}\n\n"
                f"Explica estos resultados de forma clara."
            )

            narrative_tokens = []
            for chunk in stream_llm(NARRATIVE_SYSTEM_PROMPT, narrative_prompt, history, temperature=0.3):
                try:
                    data = json.loads(chunk.replace("data: ", "").strip())
                    if data["type"] == "content":
                        narrative_tokens.append(data["token"])
                        yield chunk
                except Exception:
                    pass

            # ── Limpiar SUGERENCIAS del texto y extraerlas ────────────
            full_narrative = "".join(narrative_tokens)
            clean_narrative, suggestions = parse_suggestions(full_narrative)

            yield f"data: {json.dumps({'type': 'clean_text', 'text': clean_narrative})}\n\n"
            yield f"data: {json.dumps({'type': 'meta', 'suggestions': suggestions, 'results': results[:5]}, default=default_serializer)}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            traceback.print_exc()
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )