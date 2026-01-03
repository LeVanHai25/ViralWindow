@echo off
chcp 65001 >nul
echo ========================================
echo KHOI DONG MYSQL THU CONG - XEM LOI CHI TIET
echo ========================================
echo.

set MYSQL_BIN=D:\xampp\mysql\bin
set MYSQL_DATA=D:\xampp\mysql\data

echo [INFO] Dang khoi dong MySQL tu command line...
echo        De xem loi chi tiet neu co
echo.
echo        Neu MySQL khoi dong thanh cong, ban se thay:
echo        - "Ready to accept connections"
echo        - Hoac "mysqld: ready for connections"
echo.
echo        NEU CO LOI, ban se thay cac dong loi mau do
echo.
echo [WARNING] Khong dong cua so nay neu MySQL dang chay!
echo           Nhan Ctrl+C de dung MySQL
echo.
echo ========================================
echo.

cd /d "%MYSQL_BIN%"
mysqld.exe --console --defaults-file="D:\xampp\mysql\bin\my.ini" --datadir="D:\xampp\mysql\data" --basedir="D:\xampp\mysql"

echo.
echo ========================================
echo MySQL da dung (hoac bi loi)
echo ========================================
pause

