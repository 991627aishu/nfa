@echo off
echo Starting NFA Document Generator...
echo.

echo Starting backend server on port 5000...
start "Backend Server" cmd /k "cd /d %~dp0backend && node server.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend server on port 3002...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3002
echo.
echo Press any key to exit...
pause >nul
