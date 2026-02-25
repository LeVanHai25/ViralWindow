@echo off
echo ========================================
echo   RESTART BACKEND - CLEAN NODE CACHE
echo ========================================
echo.

echo [1/4] Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo OK - Killed Node processes
) else (
    echo OK - No Node processes running
)
timeout /t 2 >nul

echo.
echo [2/4] Clearing require cache (if any)...
timeout /t 1 >nul

echo.
echo [3/4] Starting backend server...
cd /d "%~dp0"
start "Backend Server" cmd /k "npm start"
timeout /t 3 >nul

echo.
echo [4/4] Verifying server is running...
powershell -Command "Start-Sleep -Seconds 2; Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, StartTime"

echo.
echo ========================================
echo   DONE! Server should be running now
echo ========================================
echo.
echo Next steps:
echo 1. Check terminal window "Backend Server" for logs
echo 2. Look for: "API Server dang chay tai http://localhost:3001"
echo 3. Refresh browser: Ctrl+F5
echo.
pause
