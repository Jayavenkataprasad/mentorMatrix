@echo off
echo Starting Mentor Matrix Application Servers...
echo.

echo Step 1: Starting Backend Server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "node server.js"

echo Step 2: Starting Frontend Server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause
