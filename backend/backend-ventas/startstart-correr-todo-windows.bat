@echo off
echo Iniciando servidores Vertiche...

:: Backend TS
cd Backend-Ventas-TSC
start "Backend TS" cmd /k "npm run build:start"
echo Backend TS corriendo en http://localhost:8080

:: Backend Python
cd ..\Backend-Chatbot-Python
start "Chatbot Python" cmd /k "venv\Scripts\activate && uvicorn main:app --port 8090"
echo Chatbot corriendo en http://localhost:8090

:: Backend Monitoreo
cd ..\..\backend-monitoreo
start "Backend Monitoreo" cmd /k "npm install && npm run dev"
echo Backend Monitoreo corriendo en http://localhost:3002

:: Backend RFID
cd ..\backend-rfid
start "Backend RFID" cmd /k "npm run all"
echo Backend RFID corriendo en http://localhost:3001

:: Frontend
cd ..\..\..\vertiche-dashboard
start "Frontend" cmd /k "npm run dev"
echo Frontend corriendo en http://localhost:5173

echo.
echo Todos los servidores iniciados en ventanas separadas.
pause