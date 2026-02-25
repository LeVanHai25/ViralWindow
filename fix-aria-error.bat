@echo off
chcp 65001 >nul
echo ========================================
echo FIX ARIA RECOVERY ERROR
echo ========================================
echo.

echo [1/5] Dang dung MySQL...
taskkill /F /IM mysqld.exe 2>nul
if %errorlevel% equ 0 (
    echo    Da dung mysqld.exe
) else (
    echo    Khong co mysqld.exe dang chay
)
taskkill /F /IM mysql.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/5] Xoa cac file aria_log...
cd /d "D:\xampp\mysql\data"
if %errorlevel% equ 0 (
    if exist aria_log.* (
        del /Q aria_log.* 2>nul
        echo    Da xoa cac file aria_log
    ) else (
        echo    Khong tim thay file aria_log
    )
) else (
    echo    Loi: Khong the vao thu muc D:\xampp\mysql\data
    pause
    exit /b 1
)

echo [3/5] Chay aria_chk de recover...
cd /d "D:\xampp\mysql\bin"
if %errorlevel% equ 0 (
    if exist aria_chk.exe (
        echo    Dang chay aria_chk...
        aria_chk -r -f "D:\xampp\mysql\data\mysql\*.MAI" 2>nul
        if %errorlevel% equ 0 (
            echo    Da chay aria_chk thanh cong
        ) else (
            echo    Canh bao: aria_chk co the co loi, nhung khong sao
        )
    ) else (
        echo    Canh bao: Khong tim thay aria_chk.exe
    )
) else (
    echo    Canh bao: Khong the vao thu muc D:\xampp\mysql\bin
)

echo.
echo [4/5] Hoan thanh!
echo.
echo [5/5] Vui long khoi dong lai MySQL trong XAMPP Control Panel
echo       Neu van loi, thu xoa cac file aria_log.* thu cong
echo.
pause

