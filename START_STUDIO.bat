@echo off
title NeuroML Studio Launcher
echo ========================================================
echo         Launching NeuroML Studio Application
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "NeuroML Backend" /min cmd.exe /k "python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend"

echo [2/3] Starting Vite Frontend on http://localhost:5173 ...
cd frontend
start "NeuroML Frontend" /min cmd.exe /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening NeuroML Studio in your browser...
start http://localhost:5173

echo.
echo ========================================================
echo   NeuroML Studio is now running!
echo   Frontend:  http://localhost:5173
echo   Backend:   http://127.0.0.1:8000
echo   API Docs:  http://127.0.0.1:8000/docs
echo ========================================================
pause
