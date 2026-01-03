@echo off
chcp 65001 >nul
echo ========================================
echo XEM LOG MYSQL
echo ========================================
echo.

if exist "D:\xampp\mysql\data\*.err" (
    echo Tim thay file log loi MySQL:
    echo.
    for %%f in ("D:\xampp\mysql\data\*.err") do (
        echo ========================================
        echo File: %%~nxf
        echo ========================================
        echo.
        type "%%f" | more
        echo.
    )
) else (
    echo Khong tim thay file log loi MySQL
    echo.
    echo Cac file trong thu muc data:
    dir /b "D:\xampp\mysql\data\*.err" 2>nul
    if errorlevel 1 (
        echo Khong co file .err nao
    )
)

echo.
echo ========================================
echo CAC FILE LOG KHAC:
echo ========================================
if exist "D:\xampp\mysql\data\mysql_error.log" (
    echo.
    echo File: mysql_error.log
    echo ----------------------------------------
    type "D:\xampp\mysql\data\mysql_error.log" | more
)

echo.
pause





