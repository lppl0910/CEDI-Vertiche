#!/bin/bash

echo "🚀 Iniciando servidores Vertiche..."

# Backend TS
cd Backend-Ventas-TSC
npm run build:start &
TS_PID=$!
echo "✅ Backend TS corriendo (PID $TS_PID)"

# Backend Python
cd ../Backend-Chatbot-Python
source venv/bin/activate
uvicorn main:app --port 8090 &
PY_PID=$!
echo "✅ Backend Python corriendo (PID $PY_PID)"

# Frontend
cd ../../../vertiche-dashboard
npm run dev &
FRONT_PID=$!
echo "✅ Frontend corriendo (PID $FRONT_PID)"

echo ""
echo "Servidores corriendo:"
echo "  Backend TS:  http://localhost:8080"
echo "  Chatbot:     http://localhost:8090"
echo "  Frontend:    http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener todo"

trap "kill $TS_PID $PY_PID $FRONT_PID; exit" INT
wait