@echo off
chcp 65001 >nul
echo ========================================
echo SUA MYSQL XAMPP - TU DONG HOA
echo ========================================
echo.

:: Kiem tra quyen Admin
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Can quyen Administrator!
    echo Vui long chay file nay voi quyen Administrator
    echo (Click phai chuot ^> Run as administrator)
    echo.
    pause
    exit /b 1
)

set XAMPP_PATH=D:\xampp
set MYSQL_DATA=%XAMPP_PATH%\mysql\data
set MYSQL_BIN=%XAMPP_PATH%\mysql\bin
set MY_INI=%XAMPP_PATH%\mysql\bin\my.ini

echo [BUOC 1/7] Dung tat ca process MySQL...
taskkill /F /IM mysqld.exe >nul 2>&1
taskkill /F /IM mysql.exe >nul 2>&1
timeout /t 3 /nobreak >nul
echo    [OK] Da dung MySQL processes
echo.

echo [BUOC 2/7] Dung MySQL Windows Service...
net stop MySQL80 >nul 2>&1
net stop MySQL >nul 2>&1
sc config MySQL80 start= disabled >nul 2>&1
sc config MySQL start= disabled >nul 2>&1
echo    [OK] Da dung va disable MySQL services
echo.

echo [BUOC 3/7] Giai phong port 3306...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3306" ^| findstr "LISTENING"') do (
    echo    Dang kill process %%a su dung port 3306...
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo    [OK] Da giai phong port 3306
echo.

echo [BUOC 4/7] Xoa file lock va temp...
if exist "%MYSQL_DATA%\*.pid" (
    del /Q "%MYSQL_DATA%\*.pid" >nul 2>&1
    echo    [OK] Da xoa file PID
)
if exist "%MYSQL_DATA%\ibtmp1" (
    del /Q "%MYSQL_DATA%\ibtmp1" >nul 2>&1
    echo    [OK] Da xoa file ibtmp1 (se duoc tao lai khi khoi dong)
)
echo    [OK] Da don dep file lock
echo.

echo [BUOC 5/7] Kiem tra va sua file my.ini...
if not exist "%MY_INI%" (
    echo    [ERROR] Khong tim thay file my.ini!
    echo    Vui long kiem tra duong dan XAMPP
    pause
    exit /b 1
)

echo    Dang tao backup my.ini...
set BACKUP_FILE=%MY_INI%.backup.%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_FILE=%BACKUP_FILE: =0%
copy "%MY_INI%" "%BACKUP_FILE%" >nul 2>&1
echo    [OK] Da tao backup: %BACKUP_FILE%

REM Kiem tra bind-address
findstr /C:"bind-address" "%MY_INI%" >nul 2>&1
if %errorlevel% neq 0 (
    echo    [INFO] Khong tim thay bind-address, dang them vao...
    REM Tim vi tri section [mysqld]
    REM Sua file de them bind-address vao sau [mysqld]
    powershell -Command "$content = Get-Content '%MY_INI%'; $newContent = @(); $found = $false; foreach ($line in $content) { $newContent += $line; if ($line -match '^\s*\[mysqld\]\s*$' -and -not $found) { $newContent += 'bind-address = 127.0.0.1'; $found = $true } }; $newContent | Set-Content '%MY_INI%' -Encoding UTF8" 2>nul
    if %errorlevel% equ 0 (
        echo    [OK] Da them bind-address = 127.0.0.1
    ) else (
        echo    [WARNING] Khong the tu dong them bind-address
        echo    Vui long sua file my.ini thu cong
    )
) else (
    echo    [OK] Da co bind-address trong file
)
echo.

echo [BUOC 6/7] Kiem tra quyen thu muc data...
echo test > "%MYSQL_DATA%\test_write.tmp" 2>nul
if %errorlevel% neq 0 (
    echo    [WARNING] Khong co quyen ghi vao thu muc data!
    echo    Dang cap quyen...
    icacls "%MYSQL_DATA%" /grant "Users:(OI)(CI)F" >nul 2>&1
    icacls "%MYSQL_DATA%" /grant "Everyone:(OI)(CI)F" >nul 2>&1
    echo    [OK] Da cap quyen (neu co quyen Admin)
) else (
    del "%MYSQL_DATA%\test_write.tmp" >nul 2>&1
    echo    [OK] Co quyen ghi
)
echo.

echo [BUOC 7/7] Hoan thanh! Huong dan khoi dong...
echo.
echo ========================================
echo HOAN THANH SUA LOI
echo ========================================
echo.
echo CAC BUOC TIEP THEO:
echo.
echo 1. Mo XAMPP Control Panel (chay voi quyen Administrator)
echo    - Click phai chuot vao XAMPP Control Panel
echo    - Chon "Run as administrator"
echo.
echo 2. Click nut "Start" cho MySQL trong XAMPP
echo.
echo 3. Cho 15-20 giay de MySQL khoi dong hoan toan
echo.
echo 4. Kiem tra log:
echo    - Click nut "Logs" cua MySQL trong XAMPP
echo    - Tim dong "Ready to accept connections" hoac "mysqld: ready for connections"
echo    - Neu KHONG thay dong nay, MySQL chua khoi dong thanh cong
echo.
echo 5. Neu van khong chay:
echo    a) Chay script chuan doan: chuan-doan-mysql.bat
echo    b) Doc file log chi tiet tai: %MYSQL_DATA%\mysql_error.log
echo    c) Hoac tim file .err trong thu muc: %MYSQL_DATA%
echo.
echo 6. Sau khi MySQL chay thanh cong:
echo    - Chay script test: kiem-tra-mysql.bat
echo    - Hoac mo phpMyAdmin: http://localhost/phpmyadmin
echo.
echo ========================================
echo BACKUP FILE DA TAO: %BACKUP_FILE%
echo ========================================
echo.
pause




















