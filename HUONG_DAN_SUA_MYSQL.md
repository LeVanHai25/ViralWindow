# Hướng Dẫn Sửa Lỗi MySQL XAMPP Không Chạy

## 🔍 Phân Tích Log

Từ log bạn cung cấp, MySQL (MariaDB) đang:
- ✅ Khởi động thành công (InnoDB buffer pool, tablespace)
- ✅ Tạo socket trên IPv6 (`Server socket created on IP: '::'`)
- ❌ **KHÔNG** thấy dòng "Ready to accept connections"
- ❌ **KHÔNG** bind được vào port 3306 để nhận kết nối

## 🎯 Nguyên Nhân Có Thể

1. **Port 3306 bị chiếm bởi process khác**
2. **MySQL chỉ bind IPv6 mà không bind IPv4**
3. **File my.ini cấu hình bind-address sai**
4. **MySQL Windows Service xung đột**

## 🛠️ Cách Sửa

### Phương Pháp 1: Chạy Script Tự Động (Khuyên Dùng)

```bash
# Chạy script với quyền Administrator
fix-mysql-port-bind.bat
```

Script sẽ:
- ✅ Dọn tất cả process MySQL
- ✅ Kiểm tra và giải phóng port 3306
- ✅ Tắt MySQL Windows Service
- ✅ Xóa file PID cũ
- ✅ Kiểm tra và backup file my.ini

### Phương Pháp 2: Sửa Thủ Công

#### Bước 1: Dọn Process MySQL

Mở Command Prompt (Admin) và chạy:
```bash
taskkill /F /IM mysqld.exe
taskkill /F /IM mysql.exe
```

#### Bước 2: Kiểm Tra Port 3306

```bash
netstat -ano | findstr :3306
```

Nếu có process nào đang dùng port 3306, kill process đó:
```bash
taskkill /F /PID [PID_SO]
```

#### Bước 3: Tắt MySQL Windows Service

```bash
net stop MySQL80
sc config MySQL80 start= disabled
```

#### Bước 4: Kiểm Tra File my.ini

Mở file: `D:\xampp\mysql\bin\my.ini`

Tìm section `[mysqld]` và đảm bảo có:
```ini
[mysqld]
bind-address = 127.0.0.1
port = 3306
```

Nếu không có `bind-address`, thêm vào. Nếu `bind-address = ::` hoặc `bind-address = 0.0.0.0`, đổi thành `127.0.0.1`.

#### Bước 5: Xóa File PID

```bash
del D:\xampp\mysql\data\*.pid
```

#### Bước 6: Khởi Động Lại MySQL

1. Mở XAMPP Control Panel (chạy với quyền Admin)
2. Click "Start" cho MySQL
3. Chờ 10-15 giây
4. Kiểm tra log - phải thấy dòng: `Ready to accept connections` hoặc `mysqld: ready for connections`

## ✅ Kiểm Tra MySQL Đã Chạy

### Cách 1: Kiểm Tra Process
```bash
tasklist | findstr mysqld.exe
```

### Cách 2: Kiểm Tra Port
```bash
netstat -ano | findstr :3306
```

Phải thấy:
```
TCP    0.0.0.0:3306           0.0.0.0:0              LISTENING        [PID]
TCP    [::]:3306              [::]:0                 LISTENING        [PID]
```

### Cách 3: Test Kết Nối
```bash
cd D:\xampp\mysql\bin
mysql.exe -u root -e "SELECT VERSION();"
```

Hoặc chạy script:
```bash
kiem-tra-mysql.bat
```

## 🚨 Nếu Vẫn Không Chạy

### Giải Pháp 1: Xóa File ibtmp1
```bash
del D:\xampp\mysql\data\ibtmp1
```
File này sẽ được tạo lại tự động khi MySQL khởi động.

### Giải Pháp 2: Kiểm Tra Log Chi Tiết
1. Trong XAMPP Control Panel, click "Logs" của MySQL
2. Tìm dòng lỗi (thường có [ERROR] hoặc [Warning])
3. Copy toàn bộ log lỗi và tìm kiếm trên Google

### Giải Pháp 3: Backup và Khôi Phục
1. Backup folder `D:\xampp\mysql\data` (nếu có database quan trọng)
2. Xóa folder `D:\xampp\mysql\data`
3. Khởi động lại MySQL (sẽ tạo lại folder data trống)
4. Import lại database từ backup

### Giải Pháp 4: Cài Đặt Lại XAMPP
Nếu tất cả đều không được, có thể cần cài đặt lại XAMPP.

## 📝 Lưu Ý Quan Trọng

1. **Luôn chạy XAMPP Control Panel với quyền Administrator**
2. **Không chạy MySQL Windows Service cùng lúc với XAMPP MySQL**
3. **Đảm bảo port 3306 không bị firewall chặn**
4. **Kiểm tra Windows Event Viewer** nếu MySQL crash liên tục

## 🔗 Liên Kết Hữu Ích

- [XAMPP MySQL Troubleshooting](https://www.apachefriends.org/docs/mysql.html)
- [MariaDB Error Log](https://mariadb.com/kb/en/error-log/)




















