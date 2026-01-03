@echo off
echo ========================================
echo   RESTART SERVER - ViralWindow API
echo ========================================
echo.

echo [1/3] Dang tim process Node.js...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [2/3] Dang dong cac process Node.js...
    taskkill /F /IM node.exe >NUL 2>&1
    timeout /t 2 >NUL
) else (
    echo [2/3] Khong co process Node.js nao dang chay
)

echo [3/3] Khoi dong lai server...
echo.
cd /d %~dp0
node server.js

pause













