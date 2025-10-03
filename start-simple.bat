@echo off
echo Starting Simple NFA Document Generator Server...
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found. Starting server on port 3002...
echo.
echo The server will be available at:
echo   http://localhost:3002
echo.
echo Press Ctrl+C to stop the server
echo.

node simple-server.js

pause
