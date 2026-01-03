@echo off
chcp 65001 >nul
echo ========================================
echo TẠO BẢNG NOTIFICATIONS
echo ========================================
echo.

echo [1] Đang tạo bảng notifications...
"C:\xampp\mysql\bin\mysql.exe" -u root -p viral_window_db < "backend\sql\create_notifications_table.sql"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Tạo bảng notifications thành công!
    echo.
    echo Bảng đã được tạo với:
    echo - 7 thông báo mẫu
    echo - Indexes tối ưu
    echo.
    echo Bây giờ bạn có thể:
    echo 1. Mở http://localhost:5500/notifications.html
    echo 2. Click icon chuông ở góc phải header
    echo.
) else (
    echo.
    echo ❌ Lỗi khi tạo bảng!
    echo.
    echo Thử:
    echo 1. Kiểm tra MySQL đang chạy
    echo 2. Kiểm tra database "viral_window_db" tồn tại
    echo 3. Chạy file SQL thủ công trong phpMyAdmin
    echo.
)

pause





