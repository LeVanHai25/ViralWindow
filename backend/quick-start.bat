@echo off
REM Quick start - Kill all node processes and start server
echo Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Starting server...
cd /d %~dp0
node server.js






