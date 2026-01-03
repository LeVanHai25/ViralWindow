@echo off
chcp 65001 >nul
echo ========================================
echo CHUAN DOAN MYSQL XAMPP - PHAN TICH CHI TIET
echo ========================================
echo.

set XAMPP_PATH=D:\xampp
set MYSQL_DATA=%XAMPP_PATH%\mysql\data
set MYSQL_BIN=%XAMPP_PATH%\mysql\bin
set MY_INI=%XAMPP_PATH%\mysql\bin\my.ini
set MYSQL_ERROR_LOG=%MYSQL_DATA%\mysql_error.log

echo [1/10] Kiem tra process MySQL dang chay...
tasklist | findstr mysqld.exe
if %errorlevel% equ 0 (
    echo    [WARNING] Co process MySQL dang chay!
    echo    Dang dung process...
    taskkill /F /IM mysqld.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo    [OK] Khong co process MySQL dang chay
)
echo.

echo [2/10] Kiem tra port 3306...
echo    Dang kiem tra IPv4...
netstat -ano | findstr ":3306"
if %errorlevel% equ 0 (
    echo    [WARNING] Port 3306 dang duoc su dung!
    echo    Danh sach process su dung port 3306:
    netstat -ano | findstr ":3306"
) else (
    echo    [OK] Port 3306 khong bi chiem
)
echo.

echo [3/10] Kiem tra MySQL Windows Service...
sc query MySQL80 2>nul | findstr "STATE" >nul
if %errorlevel% equ 0 (
    echo    [WARNING] MySQL80 Service dang ton tai!
    sc query MySQL80 | findstr "STATE"
    echo    Dang dung service...
    net stop MySQL80 >nul 2>&1
    sc config MySQL80 start= disabled >nul 2>&1
    echo    [OK] Da dung va disable MySQL80 service
) else (
    echo    [OK] Khong co MySQL80 service
)

sc query MySQL 2>nul | findstr "STATE" >nul
if %errorlevel% equ 0 (
    echo    [WARNING] MySQL Service dang ton tai!
    sc query MySQL | findstr "STATE"
    net stop MySQL >nul 2>&1
    sc config MySQL start= disabled >nul 2>&1
    echo    [OK] Da dung va disable MySQL service
) else (
    echo    [OK] Khong co MySQL service
)
echo.

echo [4/10] Kiem tra file my.ini...
if not exist "%MY_INI%" (
    echo    [ERROR] Khong tim thay file my.ini tai: %MY_INI%
) else (
    echo    [OK] Tim thay file my.ini
    echo    Dang doc cau hinh...
    echo    --- Section [mysqld] ---
    findstr /C:"[mysqld]" /A:0 "%MY_INI%"
    findstr /C:"port" "%MY_INI%" | findstr /V "^#" | findstr /V "^;"
    findstr /C:"bind-address" "%MY_INI%" | findstr /V "^#" | findstr /V "^;"
    findstr /C:"datadir" "%MY_INI%" | findstr /V "^#" | findstr /V "^;"
)
echo.

echo [5/10] Kiem tra thu muc data...
if not exist "%MYSQL_DATA%" (
    echo    [ERROR] Khong tim thay thu muc data: %MYSQL_DATA%
) else (
    echo    [OK] Tim thay thu muc data
    dir "%MYSQL_DATA%\*.pid" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [WARNING] Tim thay file PID:
        dir /B "%MYSQL_DATA%\*.pid"
    ) else (
        echo    [OK] Khong co file PID
    )
)
echo.

echo [6/10] Kiem tra file lock va temp...
if exist "%MYSQL_DATA%\ibtmp1" (
    echo    [INFO] Tim thay file ibtmp1 (size: 
    dir "%MYSQL_DATA%\ibtmp1" | findstr "ibtmp1"
    echo    File nay se duoc tao lai khi MySQL khoi dong
)
if exist "%MYSQL_DATA%\ib_logfile0" (
    echo    [INFO] Tim thay ib_logfile0
)
if exist "%MYSQL_DATA%\ib_logfile1" (
    echo    [INFO] Tim thay ib_logfile1
)
echo.

echo [7/10] Kiem tra file error log...
if exist "%MYSQL_ERROR_LOG%" (
    echo    [OK] Tim thay file error log
    echo    --- 20 dong cuoi cung cua log ---
    powershell -Command "Get-Content '%MYSQL_ERROR_LOG%' -Tail 20" 2>nul
) else (
    echo    [INFO] Khong tim thay file error log (co the chua co loi)
    
    REM Tim file log khac
    if exist "%MYSQL_DATA%\*.err" (
        echo    [INFO] Tim thay file .err khac:
        dir /B "%MYSQL_DATA%\*.err"
        for %%f in ("%MYSQL_DATA%\*.err") do (
            echo    --- 10 dong cuoi cua %%f ---
            powershell -Command "Get-Content '%%f' -Tail 10" 2>nul
        )
    )
)
echo.

echo [8/10] Kiem tra quyen truy cap thu muc...
echo    Dang kiem tra quyen ghi vao thu muc data...
echo test > "%MYSQL_DATA%\test_write.tmp" 2>nul
if %errorlevel% equ 0 (
    del "%MYSQL_DATA%\test_write.tmp" >nul 2>&1
    echo    [OK] Co quyen ghi vao thu muc data
) else (
    echo    [ERROR] KHONG CO QUYEN GHI vao thu muc data!
    echo    MySQL can quyen ghi de chay!
)
echo.

echo [9/10] Kiem tra file mysqld.exe...
if exist "%MYSQL_BIN%\mysqld.exe" (
    echo    [OK] Tim thay mysqld.exe
    echo    Dang kiem tra file co bi corrupt khong...
    "%MYSQL_BIN%\mysqld.exe" --version 2>nul
    if %errorlevel% equ 0 (
        echo    [OK] File mysqld.exe hop le
    ) else (
        echo    [WARNING] Khong the chay mysqld.exe --version
    )
) else (
    echo    [ERROR] Khong tim thay mysqld.exe tai: %MYSQL_BIN%
)
echo.

echo [10/10] Tong ket va khuyen nghi...
echo.
echo ========================================
echo TONG KET CHUAN DOAN
echo ========================================
echo.
echo CAC BUOC SUA LOI:
echo.
echo 1. NEU CO PORT 3306 BI CHIEM:
echo    - Kill process su dung port 3306 (da hien thi o buoc 2)
echo    - Hoac doi port MySQL trong my.ini
echo.
echo 2. NEU CO MYSQL SERVICE:
echo    - Da dung service o buoc 3
echo    - Khoi dong lai MySQL trong XAMPP
echo.
echo 3. NEU CO FILE PID:
echo    - Xoa file: del "%MYSQL_DATA%\*.pid"
echo.
echo 4. NEU CO LOI TRONG ERROR LOG:
echo    - Doc loi chi tiet trong log (da hien thi o buoc 7)
echo    - Tim kiem loi tren Google
echo.
echo 5. NEU KHONG CO QUYEN GHI:
echo    - Chay XAMPP Control Panel voi quyen Administrator
echo    - Hoac cap quyen Full Control cho thu muc data
echo.
echo 6. THU XOA FILE TEMP:
echo    - Xoa file ibtmp1: del "%MYSQL_DATA%\ibtmp1"
echo    - MySQL se tao lai file nay khi khoi dong
echo.
echo 7. KIEM TRA FILE MY.INI:
echo    - Mo file: %MY_INI%
echo    - Tim section [mysqld]
echo    - Dam bao co: port = 3306
echo    - Dam bao co: bind-address = 127.0.0.1 (hoac 0.0.0.0)
echo    - Dam bao co: datadir = "%MYSQL_DATA:\=/%"
echo.
echo ========================================
echo CHAY SCRIPT SUA LOI:
echo ========================================
echo.
echo Sau khi xem ket qua chuan doan, chay script sau de tu dong sua:
echo   fix-xampp-mysql.bat
echo.
echo Hoac chay script chuyen sau de sua port bind issue:
echo   fix-mysql-port-bind.bat
echo.
pause




















