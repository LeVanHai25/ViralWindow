# CHƯƠNG 4. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG

## 4.1. Mục tiêu kiểm thử

Quá trình kiểm thử hệ thống được thực hiện nhằm đảm bảo hệ thống đáp ứng đầy đủ các yêu cầu chức năng và phi chức năng đã đề ra.

**Đảm bảo hệ thống vận hành đúng yêu cầu**
- Xác nhận rằng tất cả các chức năng đã được cài đặt đều hoạt động đúng như thiết kế.
- Đảm bảo hệ thống xử lý đúng các nghiệp vụ cốt lõi như quy trình đăng nhập, lập báo giá, quản lý dự án, quản lý kho vật tư và quản lý tài chính.

**Phát hiện và loại bỏ lỗi**
- Phát hiện các lỗi trong quá trình xử lý logic nghiệp vụ, đặc biệt là các lỗi liên quan đến tính toán báo giá (BOM), kiểm soát tồn kho và ghi nhận tài chính.
- Phát hiện các lỗi về giao diện, trải nghiệm người dùng và thông báo thời gian thực.

**Kiểm tra tính bảo mật và phân quyền**
- Đảm bảo cơ chế phân quyền theo mô hình Role-Based Access Control (RBAC) hoạt động chính xác.
- Ngăn chặn truy cập trái phép vào các chức năng quan trọng như phê duyệt báo giá, xóa dự án, xuất kho.

**Đánh giá hiệu suất và độ ổn định**
- Kiểm tra khả năng xử lý đồng thời và cập nhật thời gian thực thông qua Socket.IO khi có nhiều người dùng cùng thao tác.
- Đánh giá thời gian phản hồi của các thao tác nghiệp vụ cơ bản.

**Xác nhận tính ứng dụng thực tế**
- Đảm bảo hệ thống giải quyết hiệu quả các vấn đề thực tế như quản lý dự án phân tán, thiếu kiểm soát tồn kho và quy trình báo giá thủ công tốn thời gian.

---

## 4.2. Kiểm thử hệ thống

### 4.2.1. Kiểm thử chức năng Đăng nhập

**Bảng 4.1. Kết quả kiểm thử chức năng Đăng nhập**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Đăng nhập | Đăng nhập thành công | Nhập đúng tên đăng nhập và mật khẩu → Nhấn Đăng nhập | Hệ thống chuyển hướng về Dashboard đúng với vai trò người dùng | Đạt |
| 2 | | Đăng nhập sai mật khẩu | Nhập đúng tên đăng nhập, sai mật khẩu → Nhấn Đăng nhập | Hệ thống hiển thị thông báo "Sai tên đăng nhập hoặc mật khẩu", không cho phép truy cập | Đạt |
| 3 | | Đăng nhập để trống thông tin | Bỏ trống các trường bắt buộc → Nhấn Đăng nhập | Hệ thống yêu cầu nhập đầy đủ thông tin, không thực hiện đăng nhập | Đạt |
| 4 | | Truy cập trang bảo vệ khi chưa đăng nhập | Nhập trực tiếp URL trang nội bộ vào trình duyệt | Hệ thống tự động chuyển hướng về trang Đăng nhập | Đạt |
| 5 | | Đăng xuất khỏi hệ thống | Nhấn nút "Đăng xuất" | Token bị xóa, hệ thống chuyển về trang Đăng nhập | Đạt |

---

### 4.2.2. Kiểm thử chức năng Quản lý khách hàng

**Bảng 4.2. Kết quả kiểm thử chức năng Quản lý khách hàng**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Quản lý khách hàng | Thêm khách hàng mới thành công | Nhập đầy đủ thông tin: Tên, Số điện thoại, Địa chỉ → Lưu | Khách hàng được tạo thành công, xuất hiện trong danh sách | Đạt |
| 2 | | Thêm khách hàng thiếu tên | Bỏ trống trường "Tên khách hàng" → Lưu | Hệ thống báo lỗi, không tạo được khách hàng | Đạt |
| 3 | | Cập nhật thông tin khách hàng | Sửa số điện thoại, địa chỉ → Lưu | Hệ thống hiển thị thông báo cập nhật thành công | Đạt |
| 4 | | Tìm kiếm khách hàng theo tên | Nhập từ khóa tên khách hàng vào ô tìm kiếm | Danh sách lọc đúng kết quả tương ứng | Đạt |
| 5 | | Tìm kiếm không có kết quả | Nhập từ khóa không tồn tại | Hệ thống hiển thị thông báo "Không tìm thấy kết quả phù hợp" | Đạt |
| 6 | | Xóa khách hàng đang có dự án | Chọn khách hàng đang có dự án liên kết → Xóa | Hệ thống hiển thị cảnh báo, không cho phép xóa | Không đạt (Hệ thống chưa hỗ trợ kiểm tra ràng buộc liên kết đầy đủ trước khi xóa) |

---

### 4.2.3. Kiểm thử chức năng Quản lý dự án

**Bảng 4.3. Kết quả kiểm thử chức năng Quản lý dự án**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Quản lý dự án | Tạo dự án mới thành công | Nhập đầy đủ Tên dự án, Khách hàng, Ngày bắt đầu → Lưu | Dự án được tạo với trạng thái "Mới", thông báo gửi đến Quản lý | Đạt |
| 2 | | Tạo dự án thiếu tên | Bỏ trống trường "Tên dự án" → Lưu | Hệ thống báo lỗi, không tạo được dự án | Đạt |
| 3 | | Tạo dự án thiếu khách hàng | Bỏ trống trường "Khách hàng" → Lưu | Hệ thống báo lỗi, không tạo được dự án | Đạt |
| 4 | | Cập nhật trạng thái dự án | Manager đổi trạng thái "Mới" → "Đang thi công" | Trạng thái cập nhật thành công, nhật ký ghi nhận thay đổi | Đạt |
| 5 | | Nhân viên không có quyền đổi trạng thái | Nhân viên Sales cố thay đổi trạng thái dự án | Không hiển thị nút thay đổi trạng thái, hệ thống từ chối | Đạt |
| 6 | | Lọc dự án theo trạng thái | Chọn bộ lọc "Đang thi công" | Chỉ hiển thị các dự án có trạng thái "Đang thi công" | Đạt |
| 7 | | Tìm kiếm dự án theo tên | Nhập từ khóa tên dự án | Danh sách lọc đúng kết quả | Đạt |
| 8 | | Xóa dự án | Manager chọn dự án → Xóa → Xác nhận | Dự án biến mất khỏi danh sách | Đạt |

---

### 4.2.4. Kiểm thử chức năng Quản lý kỹ thuật

**Bảng 4.4. Kết quả kiểm thử chức năng Quản lý kỹ thuật**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Quản lý kỹ thuật | Xem danh mục hệ nhôm | Truy cập trang Quản lý kỹ thuật | Danh sách hệ nhôm hiển thị đầy đủ tên hệ, thông số kỹ thuật, giá | Đạt |
| 2 | | Thêm hệ nhôm mới thành công | Nhập đầy đủ Tên hệ, Thông số, Giá → Lưu | Hệ nhôm được thêm vào danh mục, xuất hiện trong danh sách | Đạt |
| 3 | | Thêm hệ nhôm thiếu thông tin | Bỏ trống trường bắt buộc → Lưu | Hệ thống báo lỗi, không tạo được | Đạt |
| 4 | | Cập nhật thông số hệ nhôm | Sửa giá hoặc thông số kỹ thuật → Lưu | Thông tin được cập nhật thành công | Đạt |
| 5 | | Xóa hệ nhôm không còn sử dụng | Chọn hệ nhôm → Xóa → Xác nhận | Hệ nhôm bị xóa khỏi danh mục | Đạt |

---

### 4.2.5. Kiểm thử chức năng Quản lý kho vật tư

**Bảng 4.5. Kết quả kiểm thử chức năng Quản lý kho vật tư**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Quản lý kho vật tư | Nhập kho thành công | Chọn vật tư, nhập SL=100m, Đơn giá hợp lệ → Lưu | Phiếu nhập được tạo, tồn kho tăng đúng số lượng | Đạt |
| 2 | | Nhập kho với số lượng âm | Nhập SL=-50 → Lưu | Hệ thống báo lỗi, không tạo phiếu nhập | Đạt |
| 3 | | Xuất kho đủ số lượng | Xuất 50m (tồn kho: 100m) → Lưu | Phiếu xuất được tạo, tồn kho giảm còn 50m | Đạt |
| 4 | | Xuất kho vượt tồn kho | Xuất 150m (tồn kho: 100m) → Lưu | Hệ thống thông báo "Số lượng tồn kho không đủ", không tạo phiếu | Đạt |
| 5 | | Cảnh báo tồn kho thấp | Tồn kho xuống dưới mức tối thiểu đã cài đặt | Hệ thống hiển thị cảnh báo màu đỏ, chưa gửi thông báo tự động | Không đạt (Cơ chế Push Notification tự động chưa được tích hợp) |
| 6 | | Xem lịch sử giao dịch kho | Truy cập tab "Lịch sử giao dịch" | Hiển thị toàn bộ phiếu nhập/xuất theo thứ tự thời gian | Đạt |

---

### 4.2.6. Kiểm thử chức năng Lập báo giá

**Bảng 4.6. Kết quả kiểm thử chức năng Lập báo giá**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Lập báo giá | Tạo báo giá thành công | Chọn dự án → Thêm cửa nhôm hệ 60mm, R=1200mm, C=2100mm, SL=2 → Lưu | Hệ thống tự động tính toán BOM, báo giá lưu trạng thái "Nháp" | Đạt |
| 2 | | Thêm hạng mục kích thước không hợp lệ | Nhập R=0, C=-500 → Thêm hạng mục | Hệ thống báo lỗi "Kích thước không hợp lệ", từ chối lưu | Đạt |
| 3 | | Lưu báo giá không có hạng mục | Không thêm hạng mục → Lưu | Hệ thống thông báo phải có ít nhất 1 hạng mục mới được lưu | Đạt |
| 4 | | Áp dụng chiết khấu | Nhập chiết khấu 5%, tổng trước chiết khấu: 10.000.000đ | Thành tiền sau chiết khấu = 9.500.000đ, tính toán đúng | Đạt |
| 5 | | Gửi báo giá cho khách hàng | Nhấn "Gửi cho Khách" trên báo giá hợp lệ | Trạng thái cập nhật "Đã gửi", thời gian gửi được ghi nhận | Đạt |
| 6 | | Xuất báo giá ra file Excel | Nhấn "Xuất file" trên màn hình báo giá | File Excel được tải xuống đúng định dạng, đầy đủ thông tin | Đạt |

---

### 4.2.7. Kiểm thử chức năng Quản lý người dùng

**Bảng 4.7. Kết quả kiểm thử chức năng Quản lý người dùng**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Quản lý người dùng | Thêm tài khoản mới thành công | Admin nhập đầy đủ Tên, Email, Vai trò → Lưu | Tài khoản được tạo thành công, xuất hiện trong danh sách | Đạt |
| 2 | | Thêm tài khoản thiếu thông tin | Bỏ trống trường "Email" hoặc "Vai trò" → Lưu | Hệ thống báo lỗi, không tạo được tài khoản | Đạt |
| 3 | | Cập nhật thông tin tài khoản | Sửa tên, số điện thoại → Lưu | Hệ thống hiển thị thông báo cập nhật thành công | Đạt |
| 4 | | Thêm tài khoản với email đã tồn tại | Nhập email đã được sử dụng → Lưu | Hệ thống thông báo "Email đã tồn tại", không tạo được | Không đạt (Validation kiểm tra trùng email chưa được xử lý phía Backend) |
| 5 | | Nhân viên không có quyền truy cập | Đăng nhập role=Sales → truy cập trang Quản lý người dùng | Hệ thống ẩn menu hoặc trả về thông báo "Không có quyền truy cập" | Đạt |

---

### 4.2.8. Kiểm thử chức năng Quản lý tài chính

**Bảng 4.8. Kết quả kiểm thử chức năng Quản lý tài chính**

| STT | Nhóm | Mô tả | Đầu vào | Đầu ra | Kết quả |
|-----|------|-------|---------|--------|---------|
| 1 | Quản lý tài chính | Ghi nhận chi phí hợp lệ | Nhập đầy đủ Loại chi phí, Số tiền, Dự án liên quan → Lưu | Chi phí được ghi nhận, lợi nhuận dự án được tính lại tự động | Đạt |
| 2 | | Ghi nhận chi phí với số tiền = 0 | Nhập Số tiền = 0 → Lưu | Hệ thống thông báo "Số tiền phải lớn hơn 0", không lưu | Đạt |
| 3 | | Ghi nhận thanh toán từ khách hàng | Nhập số tiền thanh toán hợp lệ, chọn phương thức → Lưu | Công nợ khách hàng giảm đúng số tiền, lịch sử thanh toán cập nhật | Đạt |
| 4 | | Xem công nợ khách hàng | Vào tab "Công nợ" của khách hàng | Hiển thị đầy đủ: Tổng hợp đồng, Đã thanh toán, Còn nợ | Đạt |
| 5 | | Xem báo cáo doanh thu theo tháng | Chọn tháng 04/2026 → Xem báo cáo | Biểu đồ và bảng số liệu hiển thị đúng tổng doanh thu, chi phí, lợi nhuận | Đạt |

---

## 4.3. Tổng kết kết quả kiểm thử

**Bảng 4.9. Bảng tổng hợp kết quả kiểm thử**

| Chức năng | Số Test Case | Đạt | Không đạt |
|-----------|-------------|-----|-----------|
| Đăng nhập | 5 | 5 | 0 |
| Quản lý khách hàng | 6 | 5 | 1 |
| Quản lý dự án | 8 | 8 | 0 |
| Quản lý kỹ thuật | 5 | 5 | 0 |
| Quản lý kho vật tư | 6 | 5 | 1 |
| Lập báo giá | 6 | 6 | 0 |
| Quản lý người dùng | 5 | 4 | 1 |
| Quản lý tài chính | 5 | 5 | 0 |
| **Tổng cộng** | **46** | **43** | **3** |

**Đánh giá tổng thể**

- Tổng số test case: **46**
- Số test case đạt: **43 (93,5%)**
- Số test case chưa đạt: **3 (6,5%)**

Hệ thống đạt tỷ lệ kiểm thử thành công cao (93,5%), cho thấy các chức năng chính đã được triển khai ổn định và đáp ứng yêu cầu nghiệp vụ. Các lỗi còn tồn tại chủ yếu liên quan đến:

- Ràng buộc dữ liệu (xóa dữ liệu có liên kết khóa ngoại).
- Kiểm soát dữ liệu trùng lặp (validation email phía Backend).
- Cơ chế cảnh báo và thông báo tự động (Push Notification).

Các lỗi này không ảnh hưởng nghiêm trọng đến hoạt động tổng thể của hệ thống và có thể được cải thiện trong các phiên bản tiếp theo.

**Đánh giá môi trường vận hành**

Hệ thống được kiểm thử trên nhiều môi trường khác nhau:

- Trình duyệt: Google Chrome, Microsoft Edge.
- Thiết bị: Máy tính để bàn, máy tính xách tay.

Kết quả cho thấy hệ thống hoạt động ổn định, giao diện hiển thị nhất quán và không phát sinh lỗi nghiêm trọng trong quá trình sử dụng.

**Định hướng kiểm thử trong tương lai**

Ngoài kiểm thử thủ công (Manual Testing), trong tương lai hệ thống có thể tích hợp kiểm thử tự động (Automated Testing) như Unit Test và Integration Test nhằm nâng cao chất lượng phần mềm và giảm thiểu lỗi trong quá trình phát triển liên tục.
