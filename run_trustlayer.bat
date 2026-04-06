@echo off
title TrustLayer Launcher
echo 🛡️ Starting TrustLayer Full Stack...

:: Start Backend
echo [1/3] Launching SENTINEL Backend (Port 8000)...
start "TrustLayer Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

:: Start Frontend
echo [2/3] Launching TrustLayer UI (Port 5173)...
set "NODE_PATH=C:\Program Files\nodejs"
set "PATH=%NODE_PATH%;%PATH%"
start "TrustLayer Frontend" cmd /k "cd frontend && npm run dev"

:: Open Browser
echo [3/3] Opening your browser...
timeout /t 5 >nul
start http://localhost:5173/

echo.
echo ✅ TrustLayer is running! 🚀
echo Keep the terminal windows open while testing.
pause
