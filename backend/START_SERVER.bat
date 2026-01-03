@echo off
title ViralWindow API Server
color 0A

echo.
echo ========================================
echo   VIRALWINDOW API SERVER
echo ========================================
echo.

REM Kill processes on port 3001
echo [1/3] Dang kiem tra port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo   Tim thay process: %%a
    taskkill /F /PID %%a >nul 2>&1
    echo   Da tat process %%a
)

REM Kill all node processes (backup method)
echo [2/3] Dang kill tat ca Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait
timeout /t 2 /nobreak >nul

REM Start server
echo [3/3] Dang khoi dong server...
echo.
cd /d %~dp0
node server.js

pause






