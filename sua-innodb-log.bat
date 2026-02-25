@echo off
chcp 65001 >nul
echo ========================================
echo SUA INNODB LOG MISMATCH
echo ========================================
echo.
echo [WARNING] Script nay se xoa cac file InnoDB log
echo De MySQL tao lai tu dau. Chi su dung neu MySQL
echo khong the khoi dong do log mismatch.
echo.
echo Ban co muon tiep tuc? (Y/N)
set /p confirm=
if /i not "%confirm%"=="Y" (
    echo Da huy.
    pause
    exit /b 0
)

echo.
echo [1/3] Dung MySQL...
taskkill /F /IM mysqld.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    [OK] Da dung MySQL
echo.

echo [2/3] Backup cac file log...
set MYSQL_DATA=D:\xampp\mysql\data
if exist "%MYSQL_DATA%\ib_logfile0" (
    copy "%MYSQL_DATA%\ib_logfile0" "%MYSQL_DATA%\ib_logfile0.backup" >nul 2>&1
    echo    [OK] Da backup ib_logfile0
)
if exist "%MYSQL_DATA%\ib_logfile1" (
    copy "%MYSQL_DATA%\ib_logfile1" "%MYSQL_DATA%\ib_logfile1.backup" >nul 2>&1
    echo    [OK] Da backup ib_logfile1
)
echo.

echo [3/3] Xoa cac file log InnoDB...
del /Q "%MYSQL_DATA%\ib_logfile0" >nul 2>&1
del /Q "%MYSQL_DATA%\ib_logfile1" >nul 2>&1
echo    [OK] Da xoa ib_logfile0 va ib_logfile1
echo    MySQL se tao lai cac file nay khi khoi dong
echo.

echo ========================================
echo HOAN THANH
echo ========================================
echo.
echo BAY GIO:
echo 1. Mo XAMPP Control Panel (voi quyen Administrator)
echo 2. Click "Start" cho MySQL
echo 3. Cho MySQL khoi dong (co the mat 30-60 giay lan dau)
echo 4. Kiem tra log xem co "Ready to accept connections"
echo.
pause




















