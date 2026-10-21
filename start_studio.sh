#!/usr/bin/env bash
# ========================================================
#       NeuroML Studio Launcher for macOS and Linux
# ========================================================

set -e
cd "$(dirname "$0")"

echo "========================================================"
echo "         Launching NeuroML Studio Application"
echo "========================================================"
echo ""

# 1. Start Python FastAPI backend in the background
echo "[1/3] Starting FastAPI Backend on http://0.0.0.0:8000 ..."
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend &
BACKEND_PID=$!

cleanup() {
  echo ""
  echo "Shutting down NeuroML Studio..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 2. Start Vite frontend dev server
echo "[2/3] Starting Vite Frontend on http://0.0.0.0:5173 ..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
cd ..

# 3. Wait for initialization and open browser
echo "[3/3] Waiting for servers to initialize..."
sleep 3

echo ""
echo "========================================================"
echo "  NeuroML Studio is now running!"
echo "  Frontend (Local):   http://localhost:5173"
echo "  Frontend (Network): http://0.0.0.0:5173"
echo "  Backend (FastAPI):  http://127.0.0.1:8000"
echo "  API Documentation:  http://127.0.0.1:8000/docs"
echo "========================================================"
echo "Press Ctrl+C to stop both servers."
echo ""

if command -v xdg-open > /dev/null; then
  xdg-open "http://localhost:5173" 2>/dev/null || true
elif command -v open > /dev/null; then
  open "http://localhost:5173" 2>/dev/null || true
fi

wait
