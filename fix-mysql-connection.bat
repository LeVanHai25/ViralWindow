@echo off
chcp 65001 >nul
echo ========================================
echo FIX MYSQL CONNECTION - ETIMEDOUT/ECONNREFUSED
echo ========================================
echo.

echo [1/5] Dang kiem tra MySQL process...
tasklist | findstr mysqld.exe >nul
if %errorlevel% equ 0 (
    echo    [OK] MySQL dang chay
    tasklist | findstr mysqld.exe
) else (
    echo    [LOI] MySQL khong chay
    echo    Vui long mo XAMPP Control Panel va Start MySQL
    echo.
    pause
    exit /b 1
)

echo.
echo [2/5] Dang kiem tra port 3306...
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo    [OK] Port 3306 dang duoc su dung
    netstat -ano | findstr :3306
) else (
    echo    [LOI] Port 3306 khong co process nao su dung
    echo    MySQL co the chua san sang nhan ket noi
    echo.
    pause
    exit /b 1
)

echo.
echo [3/5] Dang cho MySQL san sang (10 giay)...
timeout /t 10 /nobreak >nul
echo    Da cho xong

echo.
echo [4/5] Dang test ket noi MySQL...
cd /d "D:\xampp\mysql\bin"
if exist mysql.exe (
    echo    Dang thu ket noi...
    mysql.exe -u root -e "SELECT VERSION();" 2>nul
    if %errorlevel% equ 0 (
        echo    [OK] Ket noi MySQL thanh cong!
    ) else (
        echo    [LOI] Khong the ket noi MySQL
        echo    Co the MySQL chua khoi dong hoan toan
        echo    Vui long:
        echo    1. Mo XAMPP Control Panel
        echo    2. Stop MySQL
        echo    3. Start lai MySQL
        echo    4. Cho 10-15 giay
        echo    5. Chay lai script nay
        echo.
        pause
        exit /b 1
    )
) else (
    echo    [WARNING] Khong tim thay mysql.exe
    echo    Kiem tra duong dan XAMPP: D:\xampp\mysql\bin
)

echo.
echo [5/5] Dang test ket noi tu Node.js...
cd /d "%~dp0backend"
if exist test-mysql-connection.js (
    echo    Dang chay test script...
    node test-mysql-connection.js
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo [SUCCESS] MySQL da san sang!
        echo ========================================
        echo.
        echo Ban co the khoi dong backend:
        echo   cd backend
        echo   npm start
        echo.
    ) else (
        echo.
        echo ========================================
        echo [ERROR] Van con loi ket noi
        echo ========================================
        echo.
        echo Vui long:
        echo 1. Kiem tra file backend/.env co dung khong
        echo 2. Kiem tra MySQL trong XAMPP Control Panel
        echo 3. Thu restart lai MySQL
        echo.
    )
) else (
    echo    [WARNING] Khong tim thay test-mysql-connection.js
)

echo.
pause




