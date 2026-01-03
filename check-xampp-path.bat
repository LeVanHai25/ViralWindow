@echo off
chcp 65001 >nul
echo ========================================
echo KIEM TRA DUONG DAN XAMPP
echo ========================================
echo.

if exist "D:\xampp\mysql\data" (
    echo [OK] Thu muc D:\xampp\mysql\data ton tai
) else (
    echo [LOI] Khong tim thay D:\xampp\mysql\data
    echo        Vui long kiem tra duong dan XAMPP cua ban
)

if exist "D:\xampp\mysql\bin\aria_chk.exe" (
    echo [OK] Tim thay aria_chk.exe
) else (
    echo [LOI] Khong tim thay aria_chk.exe
)

if exist "D:\xampp\mysql\data\aria_log.*" (
    echo [TIM THAY] Co file aria_log trong thu muc data
    dir /b "D:\xampp\mysql\data\aria_log.*" 2>nul
) else (
    echo [OK] Khong co file aria_log
)

echo.
pause





