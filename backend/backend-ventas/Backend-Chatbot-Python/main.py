from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import traceback

from database import execute_query
from llm import generate_sql, generate_narrative, parse_suggestions

app = FastAPI(title="Vertiche Chatbot API")

# CORS para que el frontend React pueda conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Modelos Pydantic ─────────────────────────────────────────────────
class Message(BaseModel):
    role: str   # "user" o "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[Message] = []

class ChatResponse(BaseModel):
    answer: str
    sql: str | None = None
    results: list[dict] | None = None
    suggestions: list[str] = []
    error: str | None = None


# ── Endpoints ────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Vertiche Chatbot API corriendo"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in req.history]

    try:
        # 1. Generar SQL
        sql_raw = generate_sql(req.message, history)

        # Caso: el modelo no pudo generar SQL
        if sql_raw.strip().upper() == "NO_SQL" or not sql_raw.strip():
            return ChatResponse(
                answer="Lo siento, no pude generar una consulta para esa pregunta. "
                       "Intenta reformularla en términos de ventas, productos o tiendas.",
                suggestions=[
                    "¿Cuáles son las tiendas con más ventas?",
                    "¿Qué categoría genera más ingresos?",
                    "¿Cómo fueron las ventas en 2025?",
                ],
            )

        # Limpiar posibles backticks del modelo
        sql_clean = sql_raw.replace("```sql", "").replace("```", "").strip()

        # 2. Ejecutar SQL
        try:
            results = execute_query(sql_clean)
        except ValueError as ve:
            return ChatResponse(
                answer=f"La consulta generada no es válida: {str(ve)}",
                sql=sql_clean,
                error=str(ve),
            )
        except Exception as db_err:
            error_msg = str(db_err).lower()
            if "unknown column" in error_msg:
                friendly = "La consulta hace referencia a una columna que no existe. Intenta ser más específico."
            elif "table" in error_msg and "doesn't exist" in error_msg:
                friendly = "La tabla consultada no existe en la base de datos."
            elif "syntax" in error_msg:
                friendly = "La consulta generada tiene un error de sintaxis. Intenta reformular tu pregunta."
            else:
                friendly = "Hubo un error al consultar la base de datos. Intenta reformular tu pregunta."

            return ChatResponse(
                answer=friendly,
                sql=sql_clean,
                error=str(db_err),
            )

        # 3. Generar narrativa
        narrative_raw = generate_narrative(req.message, sql_clean, results, history)
        answer, suggestions = parse_suggestions(narrative_raw)

        return ChatResponse(
            answer=answer,
            sql=sql_clean,
            results=results[:5],  # solo mandamos 5 filas al front
            suggestions=suggestions,
        )

    except RuntimeError as llm_err:
        raise HTTPException(status_code=503, detail=str(llm_err))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")
