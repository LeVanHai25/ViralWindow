@echo off
chcp 65001 >nul
echo ========================================
echo FIX XAMPP MYSQL - SUA LOI KHONG CHAY
echo ========================================
echo.

:: Kiểm tra quyền Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Can quyen Administrator de thuc hien mot so lenh
    echo Vui long chay file nay voi quyen Administrator (Click phai chuot ^> Run as administrator)
    echo.
)

echo [BUOC 1/6] Kiem tra process MySQL dang chay...
tasklist | findstr mysqld.exe >nul
if %errorlevel% equ 0 (
    echo    [INFO] Tim thay process MySQL dang chay
    echo    Dang dung process MySQL cu...
    taskkill /F /IM mysqld.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo    [OK] Da dung MySQL
) else (
    echo    [OK] Khong co process MySQL nao dang chay
)
echo.

echo [BUOC 2/6] Kiem tra MySQL Windows Service...
sc query MySQL80 >nul 2>&1
if %errorlevel% equ 0 (
    echo    [INFO] Tim thay MySQL Windows Service
    echo    Dang dung service...
    net stop MySQL80 >nul 2>&1
    echo    [OK] Da dung MySQL Service
) else (
    echo    [OK] Khong co MySQL Windows Service
)
sc query MySQL >nul 2>&1
if %errorlevel% equ 0 (
    echo    [INFO] Tim thay MySQL Windows Service (ten cu)
    net stop MySQL >nul 2>&1
    echo    [OK] Da dung MySQL Service
)
echo.

echo [BUOC 3/6] Kiem tra port 3306 bi chiem...
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo    [WARNING] Port 3306 dang bi chiem boi:
    netstat -ano | findstr :3306
    echo    Dang tim process ID...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3306 ^| findstr LISTENING') do (
        echo    [INFO] Dang kill process %%a...
        taskkill /F /PID %%a >nul 2>&1
        if %errorlevel% equ 0 (
            echo    [OK] Da kill process %%a
        ) else (
            echo    [WARNING] Khong the kill process %%a (co the can quyen Admin)
        )
    )
    timeout /t 2 /nobreak >nul
) else (
    echo    [OK] Port 3306 khong bi chiem
)
echo.

echo [BUOC 4/6] Kiem tra duong dan XAMPP...
set XAMPP_PATH=D:\xampp
if not exist "%XAMPP_PATH%\mysql\bin\mysqld.exe" (
    echo    [ERROR] Khong tim thay XAMPP tai: %XAMPP_PATH%
    echo    Vui long:
    echo    1. Kiem tra XAMPP co cai dat tai D:\xampp khong
    echo    2. Neu khong, sua bien XAMPP_PATH trong script nay
    echo.
    pause
    exit /b 1
) else (
    echo    [OK] Tim thay XAMPP tai: %XAMPP_PATH%
)
echo.

echo [BUOC 5/6] Kiem tra file log MySQL de tim loi...
set MYSQL_ERROR_LOG=%XAMPP_PATH%\mysql\data\*.err
if exist "%XAMPP_PATH%\mysql\data\mysql_error.log" (
    echo    [INFO] File log MySQL:
    echo    Dang doc 10 dong cuoi cua log...
    powershell -Command "Get-Content '%XAMPP_PATH%\mysql\data\mysql_error.log' -Tail 10" 2>nul
    echo.
) else (
    echo    [INFO] Khong tim thay file log MySQL
)
echo.

echo [BUOC 6/6] Huong dan khoi dong lai MySQL...
echo.
echo ========================================
echo CAC BUOC TIEP THEO:
echo ========================================
echo.
echo 1. Mo XAMPP Control Panel (chu y: chay voi quyen Administrator)
echo.
echo 2. Nhan nut "Start" cho MySQL
echo.
echo 3. Neu van khong chay, thu cac cach sau:
echo.
echo    a) Stop Apache truoc, sau do Start MySQL
echo.
echo    b) Click vao nut "Logs" cua MySQL trong XAMPP Control Panel
echo       de xem loi chi tiet
echo.
echo    c) Neu port 3306 bi chiem:
echo       - Mo Command Prompt (Admin)
echo       - Chay: netstat -ano ^| findstr :3306
echo       - Tim PID va kill: taskkill /F /PID [PID]
echo.
echo    d) Neu van loi, thu:
echo       - Stop MySQL
echo       - Xoa file: %XAMPP_PATH%\mysql\data\*.pid
echo       - Start lai MySQL
echo.
echo    e) Neu van khong duoc, backup database va:
echo       - Stop MySQL
echo       - Xoa folder: %XAMPP_PATH%\mysql\data
echo       - Copy lai folder data tu backup hoac cai lai XAMPP
echo.
echo 4. Sau khi MySQL chay thanh cong, chay script kiem-tra-mysql.bat
echo    de test ket noi
echo.
echo ========================================
echo HOAN THANH
echo ========================================
echo.
pause




















