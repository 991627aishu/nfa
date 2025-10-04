@echo off
echo ========================================
echo    NFA Document Generator - Full Stack
echo ========================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found. Cleaning ports 5000 and 3002...
node kill-ports.js

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
