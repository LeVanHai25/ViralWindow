@echo off
chcp 65001 >nul
echo ========================================
echo KIEM TRA MYSQL SAU KHI SUA
echo ========================================
echo.

echo [1/5] Kiem tra file my.ini...
echo    Dang kiem tra innodb_force_recovery...
findstr /C:"innodb_force_recovery" "D:\xampp\mysql\bin\my.ini" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [LOI] Van con innodb_force_recovery trong my.ini!
    echo    Can xoa dong nay di
    findstr /C:"innodb_force_recovery" "D:\xampp\mysql\bin\my.ini"
) else (
    echo    [OK] Khong con innodb_force_recovery
)

echo    Dang kiem tra port...
findstr /C:"port=" "D:\xampp\mysql\bin\my.ini" | findstr /V "^#" | findstr /V "^;"
echo.

echo [2/5] Kiem tra bind-address...
findstr /C:"bind-address" "D:\xampp\mysql\bin\my.ini" | findstr /V "^#" | findstr /V "^;"
echo.

echo [3/5] Kiem tra process MySQL...
tasklist | findstr mysqld.exe
if %errorlevel% equ 0 (
    echo    [OK] MySQL dang chay
) else (
    echo    [LOI] MySQL khong chay
)
echo.

echo [4/5] Kiem tra port 3306...
netstat -ano | findstr ":3306"
if %errorlevel% equ 0 (
    echo    [OK] Port 3306 dang duoc su dung (MySQL da bind port)
) else (
    echo    [LOI] Port 3306 khong co process nao su dung (MySQL chua bind port)
)
echo.

echo [5/5] Doc log MySQL cuoi cung...
if exist "D:\xampp\mysql\data\mysql_error.log" (
    echo    --- 10 dong cuoi cua log ---
    powershell -Command "Get-Content 'D:\xampp\mysql\data\mysql_error.log' -Tail 10" 2>nul
) else (
    echo    [INFO] Khong tim thay file error log
)
echo.

echo ========================================
echo TONG KET:
echo ========================================
echo.
echo Neu MySQL dang chay va port 3306 duoc su dung:
echo   [SUCCESS] MySQL da chay thanh cong!
echo   Ban co the test ket noi: kiem-tra-mysql.bat
echo.
echo Neu MySQL khong chay:
echo   [ERROR] Van con van de
echo   1. Xem log chi tiet o buoc 5
echo   2. Chay: chuan-doan-mysql.bat de xem chi tiet hon
echo.
pause




















