@echo off
echo ========================================================
echo   Starting Surplus Food Redistribution Platform
echo ========================================================

echo Starting Backend Server on port 5000...
start "Surplus Food Server (Port 5000)" cmd /k "cd /d %~dp0server && npm start"

echo Starting Frontend Vite Client on port 5173...
start "Surplus Food Client (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Opening browser at http://localhost:5173 in 4 seconds...
timeout /t 4 >nul
start http://localhost:5173

echo ========================================================
echo   Both servers are now running!
echo ========================================================
pause
