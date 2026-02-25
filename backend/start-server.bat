@echo off
echo ========================================
echo   VIRALWINDOW API SERVER
echo ========================================
echo.

REM Kill any process using port 3001
echo [1/3] Checking port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Found process using port 3001: %%a
    echo Killing process %%a...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Process already stopped or requires admin rights
    ) else (
        echo Process killed successfully
    )
)

REM Wait a moment for port to be released
timeout /t 2 /nobreak >nul

REM Change to backend directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [2/3] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start server
echo [3/3] Starting server on port 3001...
echo.
node server.js

pause
