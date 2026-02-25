@echo off
chcp 65001 >nul
echo ========================================
echo FIX MYSQL PORT BIND ISSUE
echo ========================================
echo.

set XAMPP_PATH=D:\xampp
set MYSQL_DATA=%XAMPP_PATH%\mysql\data
set MYSQL_BIN=%XAMPP_PATH%\mysql\bin
set MY_INI=%XAMPP_PATH%\mysql\bin\my.ini

echo [BUOC 1/8] Dung tat ca process MySQL...
taskkill /F /IM mysqld.exe >nul 2>&1
taskkill /F /IM mysql.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    [OK] Da dung MySQL processes
echo.

echo [BUOC 2/8] Kiem tra port 3306 chi tiet...
echo    Dang kiem tra IPv4 (127.0.0.1:3306)...
netstat -ano | findstr "127.0.0.1:3306" >nul
if %errorlevel% equ 0 (
    echo    [WARNING] Port 3306 IPv4 dang bi chiem!
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr "127.0.0.1:3306"') do (
        echo    Dang kill process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
) else (
    echo    [OK] Port 3306 IPv4 khong bi chiem
)

echo    Dang kiem tra IPv6 ([::]:3306)...
netstat -ano | findstr ":::3306" >nul
if %errorlevel% equ 0 (
    echo    [WARNING] Port 3306 IPv6 dang bi chiem!
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":::3306"') do (
        echo    Dang kill process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
) else (
    echo    [OK] Port 3306 IPv6 khong bi chiem
)
echo.

echo [BUOC 3/8] Kiem tra MySQL Windows Service...
sc query MySQL80 >nul 2>&1
if %errorlevel% equ 0 (
    echo    [INFO] Tim thay MySQL80 service
    net stop MySQL80 >nul 2>&1
    sc config MySQL80 start= disabled >nul 2>&1
    echo    [OK] Da dung va disable MySQL80 service
)
sc query MySQL >nul 2>&1
if %errorlevel% equ 0 (
    echo    [INFO] Tim thay MySQL service
    net stop MySQL >nul 2>&1
    sc config MySQL start= disabled >nul 2>&1
    echo    [OK] Da dung va disable MySQL service
)
echo.

echo [BUOC 4/8] Kiem tra file my.ini...
if not exist "%MY_INI%" (
    echo    [ERROR] Khong tim thay file my.ini tai: %MY_INI%
    echo    Vui long kiem tra duong dan XAMPP
    pause
    exit /b 1
) else (
    echo    [OK] Tim thay file my.ini
    echo    Dang kiem tra bind-address...
    findstr /C:"bind-address" "%MY_INI%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [INFO] Tim thay bind-address trong my.ini
        findstr /C:"bind-address" "%MY_INI%"
    ) else (
        echo    [INFO] Khong tim thay bind-address (se su dung mac dinh)
    )
)
echo.

echo [BUOC 5/8] Xoa file PID neu co...
if exist "%MYSQL_DATA%\*.pid" (
    del /Q "%MYSQL_DATA%\*.pid" >nul 2>&1
    echo    [OK] Da xoa file PID
) else (
    echo    [INFO] Khong co file PID
)
echo.

echo [BUOC 6/8] Kiem tra file ibtmp1...
if exist "%MYSQL_DATA%\ibtmp1" (
    echo    [INFO] Tim thay file ibtmp1
    echo    File tam thoi se duoc tao lai khi MySQL khoi dong
) else (
    echo    [INFO] Khong co file ibtmp1 (se duoc tao khi khoi dong)
)
echo.

echo [BUOC 7/8] Tao backup va sua file my.ini neu can...
if exist "%MY_INI%" (
    echo    Dang tao backup my.ini...
    copy "%MY_INI%" "%MY_INI%.backup.%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%" >nul 2>&1
    echo    [OK] Da tao backup
    
    REM Kiem tra xem co bind-address khong
    findstr /C:"bind-address" "%MY_INI%" >nul 2>&1
    if %errorlevel% neq 0 (
        echo    [INFO] Khong co bind-address, MySQL se bind ca IPv4 va IPv6 (mac dinh)
        echo    Neu van loi, ban co the sua file my.ini va them:
        echo    bind-address = 127.0.0.1
        echo    vao phan [mysqld]
    ) else (
        echo    [INFO] Da co bind-address trong file
    )
)
echo.

echo [BUOC 8/8] Huong dan khoi dong MySQL...
echo.
echo ========================================
echo CAC BUOC TIEP THEO:
echo ========================================
echo.
echo 1. Mo XAMPP Control Panel (chay voi quyen Administrator)
echo.
echo 2. Click nut "Start" cho MySQL
echo.
echo 3. Cho 10-15 giay de MySQL khoi dong hoan toan
echo.
echo 4. Kiem tra log trong XAMPP Control Panel:
echo    - Click nut "Logs" cua MySQL
echo    - Tim dong "Ready to accept connections" hoac "mysqld: ready for connections"
echo    - Neu khong co dong nay, MySQL chua khoi dong thanh cong
echo.
echo 5. Kiem tra port 3306:
echo    - Mo Command Prompt
echo    - Chay: netstat -ano ^| findstr :3306
echo    - Phai thay LISTENING tren ca IPv4 (0.0.0.0:3306) va IPv6 ([::]:3306)
echo.
echo 6. Neu van khong chay, thu cach sau:
echo    a) Xoa file ibtmp1: del "%MYSQL_DATA%\ibtmp1"
echo    b) Khoi dong lai MySQL trong XAMPP
echo.
echo    HOAC:
echo    a) Mo file my.ini: %MY_INI%
echo    b) Tim section [mysqld]
echo    c) Them hoac sua: bind-address = 127.0.0.1
echo    d) Luu file va khoi dong lai MySQL
echo.
echo 7. Sau khi MySQL chay thanh cong, chay script kiem-tra-mysql.bat
echo    de test ket noi
echo.
echo ========================================
echo HOAN THANH
echo ========================================
echo.
pause




















