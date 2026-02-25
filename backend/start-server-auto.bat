@echo off
echo ========================================
echo   VIRALWINDOW API SERVER - AUTO START
echo ========================================
echo.

REM Kill any process using port 3001
echo [1/3] Dang kiem tra port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Tim thay process dang dung port 3001: %%a
    echo Dang tat process...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Khong the tat process %%a
    ) else (
        echo Da tat process %%a thanh cong!
    )
)

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Check if port is free
netstat -ano | findstr :3001 | findstr LISTENING >nul
if errorlevel 1 (
    echo [2/3] Port 3001 da san sang!
) else (
    echo [2/3] Canh bao: Port 3001 van con bi chiem!
)

REM Start server
echo [3/3] Dang khoi dong server...
echo.
cd /d %~dp0
node server.js

pause






