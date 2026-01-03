@echo off
echo Dang tim process dung port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Tim thay process: %%a
    taskkill /PID %%a /F
    echo Da tat process %%a
)
echo Hoan thanh!
pause






