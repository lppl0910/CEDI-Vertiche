#!/bin/bash
# Script de arranque unificado para macOS/Linux.
# Lanza todos los servicios del proyecto Vertiche en procesos de fondo (background)
# y los mata todos juntos al presionar Ctrl+C.

echo "🚀 Iniciando servidores Vertiche..."

# Resuelve la ruta absoluta a la carpeta backend/ sin importar desde dónde se ejecute el script
BASE_DIR=$(cd "$(dirname "$0")/.." && pwd)

# ── Backend TypeScript (ventas / API principal) ──────────────────────────────
# Puerto: 8080
cd "$BASE_DIR/backend-ventas/Backend-Ventas-TSC"
npm run build:start &   # compila y arranca en un solo comando
TS_PID=$!               # guarda el PID para matarlo al salir
echo "✅ Backend TS corriendo (PID $TS_PID)"

# ── Backend Python (chatbot con LLM vía LM Studio) ──────────────────────────
# Puerto: 8090
cd "$BASE_DIR/backend-ventas/Backend-Chatbot-Python"
source venv/bin/activate          # activa el virtualenv local
uvicorn main:app --port 8090 &    # servidor ASGI FastAPI
PY_PID=$!
echo "✅ Backend Python corriendo (PID $PY_PID)"

# ── Backend Monitoreo (seguimiento de prepacks en el CEDI) ──────────────────
# Puerto: 3002
cd "$BASE_DIR/backend-monitoreo"
npm install       # asegura dependencias actualizadas antes de arrancar
npm run dev &
MONI_PID=$!
echo "✅ Backend Monitoreo corriendo (PID $MONI_PID)"

# ── Backend RFID (lectura de tags y gestión de cajas) ───────────────────────
# Puerto: ver configuración en backend-rfid
cd "$BASE_DIR/backend-rfid"
npm run all &     # arranca servidor + simulador RFID
RFID_PID=$!
echo "✅ Backend RFID corriendo (PID $RFID_PID)"

# ── Frontend (dashboard React/Vite) ─────────────────────────────────────────
# Puerto: 5173
cd "$BASE_DIR/../vertiche-dashboard"
npm run dev &
FRONT_PID=$!
echo "✅ Frontend corriendo (PID $FRONT_PID)"

echo ""
echo "Servidores corriendo:"
echo "  Backend TS:      http://localhost:8080"
echo "  Backend Monitoreo: http://localhost:3002"
echo "  Chatbot:         http://localhost:8090"
echo "  Backend RFID:    revisar puerto en backend-rfid"
echo "  Frontend:        http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener todo"

# Al recibir SIGINT (Ctrl+C), termina todos los procesos hijos y sale limpiamente
trap "kill $TS_PID $PY_PID $MONI_PID $RFID_PID $FRONT_PID; exit" INT
wait
