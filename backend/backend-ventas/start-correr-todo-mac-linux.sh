#!/bin/bash

echo "🚀 Iniciando servidores Vertiche..."

BASE_DIR=$(cd "$(dirname "$0")/.." && pwd)
# ↑ sube un nivel desde donde está el script → llega a backend/

# Backend TS
cd "$BASE_DIR/backend-ventas/Backend-Ventas-TSC"
npm run build:start &
TS_PID=$!
echo "✅ Backend TS corriendo (PID $TS_PID)"

# Backend Python
cd "$BASE_DIR/backend-ventas/Backend-Chatbot-Python"
source venv/bin/activate
uvicorn main:app --port 8090 &
PY_PID=$!
echo "✅ Backend Python corriendo (PID $PY_PID)"

# Backend Monitoreo
cd "$BASE_DIR/backend-monitoreo"
npm install
npm run dev &
MONI_PID=$!
echo "✅ Backend Monitoreo corriendo (PID $MONI_PID)"

# Backend RFID
cd "$BASE_DIR/backend-rfid"
npm run all &
RFID_PID=$!
echo "✅ Backend RFID corriendo (PID $RFID_PID)"

# Frontend
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

trap "kill $TS_PID $PY_PID $MONI_PID $RFID_PID $FRONT_PID; exit" INT
wait
