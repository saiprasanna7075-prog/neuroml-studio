@echo off
title NeuroML Studio Launcher
echo ========================================================
echo         Launching NeuroML Studio Application
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on http://0.0.0.0:8000 ...
start "NeuroML Backend" /min cmd.exe /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend"

echo [2/3] Starting Vite Frontend on http://0.0.0.0:5173 ...
cd frontend
start "NeuroML Frontend" /min cmd.exe /k "npm run dev -- --host 0.0.0.0 --port 5173"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening NeuroML Studio in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo   NeuroML Studio is now running!
echo   Frontend (Local):    http://localhost:5173
echo   Frontend (Network):  http://<Your-IP>:5173 (Accessible via phone/tablet)
echo   Backend (FastAPI):   http://127.0.0.1:8000
echo   API Documentation:   http://127.0.0.1:8000/docs
echo ========================================================
pause
