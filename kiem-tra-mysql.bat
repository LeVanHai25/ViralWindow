@echo off
chcp 65001 >nul
echo ========================================
echo KIEM TRA MYSQL
echo ========================================
echo.

echo [1/3] Kiem tra process MySQL...
tasklist | findstr mysqld.exe >nul
if %errorlevel% equ 0 (
    echo    [OK] MySQL dang chay
    tasklist | findstr mysqld.exe
) else (
    echo    [LOI] MySQL khong chay
)

echo.
echo [2/3] Kiem tra port 3306...
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo    [OK] Port 3306 dang duoc su dung
    netstat -ano | findstr :3306
) else (
    echo    [LOI] Port 3306 khong co process nao su dung
)

echo.
echo [3/3] Kiem tra ket noi MySQL...
cd /d "D:\xampp\mysql\bin" 2>nul
if exist mysql.exe (
    echo    Dang thu ket noi...
    mysql.exe -u root -e "SELECT VERSION();" 2>nul
    if %errorlevel% equ 0 (
        echo    [OK] Ket noi MySQL thanh cong!
    ) else (
        echo    [LOI] Khong the ket noi MySQL
        echo    Co the MySQL chua khoi dong hoan toan
    )
) else (
    echo    [WARNING] Khong tim thay mysql.exe
)

echo.
echo ========================================
echo HOAN THANH
echo ========================================
echo.
echo Neu MySQL dang chay, ban co the:
echo 1. Mo phpMyAdmin: http://localhost/phpmyadmin
echo 2. Khoi dong Node.js backend
echo.
pause





