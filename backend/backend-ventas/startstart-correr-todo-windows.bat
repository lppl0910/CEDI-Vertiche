@echo off
:: Script de arranque unificado para Windows.
:: Lanza todos los servicios del proyecto Vertiche, cada uno en una ventana
:: de cmd separada que permanece abierta para ver logs individuales.
:: Ejecutar desde la carpeta backend-ventas\ con doble clic o desde cmd.

echo Iniciando servidores Vertiche...

:: ── Backend TypeScript (ventas / API principal) ──────────────────────────────
:: Puerto: 8080 | cmd /k mantiene la ventana abierta tras finalizar
cd Backend-Ventas-TSC
start "Backend TS" cmd /k "npm run build:start"
echo Backend TS corriendo en http://localhost:8080

:: ── Backend Python (chatbot con LLM vía LM Studio) ──────────────────────────
:: Puerto: 8090 | activa el virtualenv antes de lanzar uvicorn
cd ..\Backend-Chatbot-Python
start "Chatbot Python" cmd /k "venv\Scripts\activate && uvicorn main:app --port 8090"
echo Chatbot corriendo en http://localhost:8090

:: ── Backend Monitoreo (seguimiento de prepacks en el CEDI) ──────────────────
:: Puerto: 3002 | sube dos niveles: Backend-Chatbot-Python → backend-ventas → backend
cd ..\..\backend-monitoreo
start "Backend Monitoreo" cmd /k "npm install && npm run dev"
echo Backend Monitoreo corriendo en http://localhost:3002

:: ── Backend RFID (lectura de tags y gestión de cajas) ───────────────────────
:: Puerto: 3001 | npm run all levanta servidor + simulador en paralelo
cd ..\backend-rfid
start "Backend RFID" cmd /k "npm run all"
echo Backend RFID corriendo en http://localhost:3001

:: ── Frontend (dashboard React/Vite) ─────────────────────────────────────────
:: Puerto: 5173 | sube tres niveles hasta la raíz del repositorio
cd ..\..\..\vertiche-dashboard
start "Frontend" cmd /k "npm run dev"
echo Frontend corriendo en http://localhost:5173

echo.
echo Todos los servidores iniciados en ventanas separadas.
pause