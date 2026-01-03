@echo off
chcp 65001 >nul
echo ========================================
echo HUONG DAN KHOI DONG MYSQL
echo ========================================
echo.

echo [THONG TIN] Da sua cac van de sau:
echo    [OK] Xoa innodb_force_recovery = 1
echo    [OK] Dat bind-address = 127.0.0.1
echo    [OK] Dat port = 3306
echo    [OK] Xoa ib_logfile (MySQL se tao lai)
echo    [OK] Xoa file PID
echo.

echo ========================================
echo CAC BUOC KHOI DONG MYSQL:
echo ========================================
echo.
echo 1. DONG XAMPP Control Panel neu dang mo
echo.
echo 2. MO LAI XAMPP Control Panel VOI QUYEN ADMINISTRATOR:
echo    - Click PHAI CHUOT vao XAMPP Control Panel
echo    - Chon "Run as administrator"
echo.
echo 3. Click nut "START" cho MySQL
echo.
echo 4. CHO 30-60 GIAY (lan dau co the lau hon vi MySQL tao lai log files)
echo.
echo 5. KIEM TRA LOG:
echo    - Click nut "LOGS" cua MySQL trong XAMPP
echo    - Phai thay dong: "Ready to accept connections"
echo    - HOAC: "mysqld: ready for connections"
echo.
echo 6. NEU THAY DONG "Ready to accept connections":
echo    [SUCCESS] MySQL da khoi dong thanh cong!
echo    Ban co the:
echo    - Mo phpMyAdmin: http://localhost/phpmyadmin
echo    - Chay: kiem-tra-mysql.bat de test ket noi
echo.
echo 7. NEU VAN KHONG THAY "Ready to accept connections":
echo    [ERROR] MySQL van chua khoi dong thanh cong
echo    Vui long:
echo    - Copy TOAN BO log va gui cho nguoi ho tro
echo    - Hoac chay: chuan-doan-mysql.bat
echo    - Hoac xem file log: D:\xampp\mysql\data\mysql_error.log
echo.
echo ========================================
echo CHU Y:
echo ========================================
echo.
echo - Lan dau khoi dong sau khi xoa ib_logfile co the MAT 30-60 GIAY
echo - MySQL se tu dong tao lai ib_logfile0 va ib_logfile1
echo - DUNG TAT MySQL khi dang tao log files
echo.
echo ========================================
pause




















