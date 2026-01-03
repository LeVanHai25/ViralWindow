@echo off
chcp 65001 >nul
echo ========================================
echo SUA LOI DUONG DAN C:\xampp
echo ========================================
echo.
echo [VAN DE] MySQL dang tim C:\xampp\mysql\data nhung khong ton tai
echo [NGUYEN NHAN] Co the MySQL doc file cau hinh mac dinh hoac co hard-coded path
echo.

set MYSQL_BIN=D:\xampp\mysql\bin
set MY_INI=%MYSQL_BIN%\my.ini

echo [1/3] Kiem tra file my.ini...
if not exist "%MY_INI%" (
    echo    [ERROR] Khong tim thay file my.ini!
    pause
    exit /b 1
)

echo    [OK] Tim thay file my.ini
echo.

echo [2/3] Kiem tra datadir trong my.ini...
findstr /C:"datadir" "%MY_INI%" | findstr /V "^#" | findstr /V "^;"
echo.

echo [3/3] Tao symlink hoac junction tu C:\xampp sang D:\xampp...
echo    [WARNING] Can quyen Administrator!
echo.
echo    Dang kiem tra quyen...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo    [ERROR] Can quyen Administrator!
    echo    Vui long chay file nay voi quyen Administrator
    echo    (Click phai chuot ^> Run as administrator)
    pause
    exit /b 1
)

if not exist "C:\xampp" (
    echo    Dang tao junction C:\xampp ^-> D:\xampp...
    mklink /J "C:\xampp" "D:\xampp" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [OK] Da tao junction thanh cong
        echo    Bay gio MySQL co the truy cap D:\xampp qua C:\xampp
    ) else (
        echo    [ERROR] Khong the tao junction
        echo    Co the C:\xampp da ton tai (nhung khong phai folder)
        echo.
        echo    GIAI PHAP THAY THE:
        echo    Khoi dong MySQL voi datadir cu the:
        echo    cd D:\xampp\mysql\bin
        echo    mysqld.exe --console --datadir="D:\xampp\mysql\data" --basedir="D:\xampp\mysql"
    )
) else (
    echo    [INFO] C:\xampp da ton tai
    dir "C:\xampp" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [WARNING] C:\xampp la mot folder thuong, khong phai junction
        echo    Khong the tao junction. Vui long xoa C:\xampp truoc
        echo    (CHI XOA NEU KHONG CO DU LIEU QUAN TRONG!)
    ) else (
        echo    [INFO] C:\xampp la junction hoac symlink
    )
)
echo.

echo ========================================
echo HOAN THANH
echo ========================================
echo.
echo Bay gio thu khoi dong MySQL:
echo 1. Chay: khoi-dong-mysql-thu-cong.bat
echo 2. Hoac khoi dong MySQL trong XAMPP Control Panel
echo.
pause




















