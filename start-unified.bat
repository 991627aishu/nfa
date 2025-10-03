@echo off
echo ========================================
echo    NFA Document Generator - Unified Server
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

echo Node.js found. Starting unified server on port 3002...
echo.
echo The server will serve ALL files on port 3002:
echo   - NFA Document Generator (main page)
echo   - All HTML files
echo   - Static assets
echo.
echo Opening browser automatically...
echo.

REM Start the server
start "Unified Server" cmd /k "node unified-server.js"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Open the browser
start http://localhost:3002/nfa-document-generator.html

echo.
echo Server started! Check the new command window for details.
echo Press any key to exit this window...
pause >nul
