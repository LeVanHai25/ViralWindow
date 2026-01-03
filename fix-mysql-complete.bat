@echo off
chcp 65001 >nul
echo ========================================
echo FIX MYSQL - SCRIPT TONG HOP
echo ========================================
echo.

REM ========================================
REM BUOC 1: DUNG TAT CA PROCESS MYSQL
REM ========================================
echo [1/7] Dang dung tat ca process MySQL...
taskkill /F /IM mysqld.exe 2>nul
if %errorlevel% equ 0 (
    echo    [OK] Da dung mysqld.exe
) else (
    echo    [INFO] Khong co mysqld.exe dang chay
)
taskkill /F /IM mysql.exe 2>nul
timeout /t 3 /nobreak >nul

REM ========================================
REM BUOC 2: KIEM TRA PORT 3306
REM ========================================
echo.
echo [2/7] Kiem tra port 3306...
netstat -ano | findstr :3306 >nul
if %errorlevel% equ 0 (
    echo    [WARNING] Port 3306 dang duoc su dung!
    echo    Dang tim process su dung port 3306...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3306') do (
        echo    Process ID: %%a
        taskkill /F /PID %%a 2>nul
        if %errorlevel% equ 0 (
            echo    [OK] Da dung process %%a
        )
    )
    timeout /t 2 /nobreak >nul
) else (
    echo    [OK] Port 3306 khong bi chiem
)

REM ========================================
REM BUOC 3: XOA FILE ARIA_LOG
REM ========================================
echo.
echo [3/7] Xoa cac file aria_log...
if exist "D:\xampp\mysql\data" (
    cd /d "D:\xampp\mysql\data"
    if exist aria_log.* (
        del /Q aria_log.* 2>nul
        echo    [OK] Da xoa cac file aria_log
    ) else (
        echo    [INFO] Khong tim thay file aria_log
    )
) else (
    echo    [ERROR] Khong tim thay thu muc D:\xampp\mysql\data
    echo    Vui long kiem tra duong dan XAMPP cua ban!
    pause
    exit /b 1
)

REM ========================================
REM BUOC 4: XOA FILE IB_LOGFILE
REM ========================================
echo.
echo [4/7] Xoa cac file ib_logfile (neu co)...
cd /d "D:\xampp\mysql\data"
if exist ib_logfile* (
    del /Q ib_logfile* 2>nul
    echo    [OK] Da xoa cac file ib_logfile
) else (
    echo    [INFO] Khong co file ib_logfile
)

REM ========================================
REM BUOC 5: CHAY ARIA_CHK
REM ========================================
echo.
echo [5/7] Chay aria_chk de recover...
if exist "D:\xampp\mysql\bin\aria_chk.exe" (
    cd /d "D:\xampp\mysql\bin"
    if exist "D:\xampp\mysql\data\mysql" (
        echo    Dang chay aria_chk (co the mat vai giay)...
        aria_chk -r -f "D:\xampp\mysql\data\mysql\*.MAI" >nul 2>&1
        echo    [OK] Da chay aria_chk
    ) else (
        echo    [WARNING] Khong tim thay thu muc mysql data
    )
) else (
    echo    [WARNING] Khong tim thay aria_chk.exe
)

REM ========================================
REM BUOC 6: KIEM TRA FILE CONFIG
REM ========================================
echo.
echo [6/7] Kiem tra file my.ini...
if exist "D:\xampp\mysql\bin\my.ini" (
    echo    [OK] Tim thay my.ini
) else (
    echo    [WARNING] Khong tim thay my.ini
)

REM ========================================
REM BUOC 7: XEM LOG MYSQL (NEU CO)
REM ========================================
echo.
echo [7/7] Kiem tra log MySQL...
if exist "D:\xampp\mysql\data\*.err" (
    echo    [INFO] Tim thay file log loi MySQL
    echo    Ban co the xem log trong: D:\xampp\mysql\data\*.err
) else (
    echo    [INFO] Khong co file log loi
)

REM ========================================
REM HOAN THANH
REM ========================================
echo.
echo ========================================
echo HOAN THANH!
echo ========================================
echo.
echo CAC BUOC TIEP THEO:
echo 1. Mo XAMPP Control Panel
echo 2. Click "Start" o MySQL
echo 3. Neu van loi, click "Logs" de xem chi tiet
echo.
echo NEU VAN LOI:
echo - Xem log trong: D:\xampp\mysql\data\*.err
echo - Hoac click nut "Logs" trong XAMPP Control Panel
echo.
pause





