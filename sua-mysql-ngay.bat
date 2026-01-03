@echo off
chcp 65001 >nul
echo ========================================
echo SUA MYSQL XAMPP - HOAN THANH!
echo ========================================
echo.

echo [1/3] Dung tat ca process MySQL...
taskkill /F /IM mysqld.exe >nul 2>&1
taskkill /F /IM mysql.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    [OK] Da dung MySQL
echo.

echo [2/3] Xoa file lock va temp...
if exist "D:\xampp\mysql\data\*.pid" (
    del /Q "D:\xampp\mysql\data\*.pid" >nul 2>&1
    echo    [OK] Da xoa file PID
)
if exist "D:\xampp\mysql\data\ibtmp1" (
    del /Q "D:\xampp\mysql\data\ibtmp1" >nul 2>&1
    echo    [OK] Da xoa file ibtmp1
)
echo    [OK] Da don dep
echo.

echo [3/3] Kiem tra file my.ini da duoc sua chua...
findstr /C:"innodb_force_recovery" "D:\xampp\mysql\bin\my.ini" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [WARNING] File my.ini van con innodb_force_recovery!
    echo    Can sua file my.ini thu cong:
    echo    1. Mo: D:\xampp\mysql\bin\my.ini
    echo    2. Tim dong: innodb_force_recovery = 1
    echo    3. Xoa hoac comment dong nay (them # phia truoc)
) else (
    echo    [OK] File my.ini da duoc sua (khong con innodb_force_recovery)
)

findstr /C:"bind-address=\"127.0.0.1\"" "D:\xampp\mysql\bin\my.ini" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] File my.ini da co bind-address
) else (
    echo    [WARNING] File my.ini chua co bind-address!
)

findstr /C:"port=3306" "D:\xampp\mysql\bin\my.ini" | findstr /C:"[mysqld]" /A:10 >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] Port MySQL la 3306
) else (
    echo    [WARNING] Kiem tra port MySQL trong my.ini
)
echo.

echo ========================================
echo BAY GIO BAN CAN:
echo ========================================
echo.
echo 1. Mo XAMPP Control Panel (voi quyen Administrator)
echo    - Click phai chuot vao XAMPP Control Panel
echo    - Chon "Run as administrator"
echo.
echo 2. Click nut "Start" cho MySQL
echo.
echo 3. Cho 15-20 giay de MySQL khoi dong
echo.
echo 4. Kiem tra log:
echo    - Click nut "Logs" cua MySQL
echo    - Phai thay dong: "Ready to accept connections"
echo    - Hoac: "mysqld: ready for connections"
echo.
echo 5. Neu van loi, chay: chuan-doan-mysql.bat
echo.
echo ========================================
pause




















