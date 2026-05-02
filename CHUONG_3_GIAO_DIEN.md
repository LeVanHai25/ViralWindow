## 3.3. Các giao diện chức năng chính

### 3.3.1. Chức năng của trang Đăng nhập
Chức năng cho phép người dùng nhập email và mật khẩu để đăng nhập vào hệ thống. Giao diện được thiết kế với form đăng nhập nằm ở trung tâm màn hình trên nền gradient tím-xanh hiện đại. Các trường nhập liệu có icon minh họa rõ ràng. Hệ thống xử lý xác thực an toàn và cấp phát JWT Token. Khi người dùng nhập sai thông tin, hệ thống sẽ hiển thị thông báo lỗi trực tiếp. Chức năng này đóng vai trò bảo vệ toàn bộ các trang nội bộ của phần mềm.

Hình 3.1. Giao diện trang Đăng nhập

### 3.3.2. Chức năng của trang Tổng quan (Dashboard)
Đây là trang tổng quan hiển thị ngay sau khi người dùng đăng nhập thành công. Giao diện được chia thành ba khu vực chính. Khu vực bên trái là menu điều hướng, bao gồm các mục Tổng quan, Dự án, Kinh doanh, Kho hàng, Tài chính và Quản trị. Phía trên cùng là thanh tiêu đề hiển thị tên người dùng, chức vụ và chuông thông báo. 
Khu vực trung tâm hiển thị các chỉ số KPI quan trọng ở hàng trên cùng như: Tổng dự án đang chạy, Tổng doanh thu tháng, Tổng chi phí và Lợi nhuận. Bên dưới là biểu đồ thống kê thể hiện xu hướng doanh thu và chi phí theo từng tháng trong năm, giúp nhà quản lý dễ dàng nắm bắt tình hình hoạt động của doanh nghiệp chỉ qua một cái nhìn.

Hình 3.2. Giao diện trang Tổng quan

### 3.3.3. Chức năng của trang Quản lý Dự án
Đây là giao diện trung tâm để quản lý toàn bộ các dự án nhôm kính đang thực hiện. Danh sách dự án được hiển thị dưới dạng bảng chi tiết bao gồm Mã dự án, Tên dự án, Khách hàng, Ngày bắt đầu và Trạng thái hiện tại. Điểm nổi bật của trang này là việc sử dụng các thẻ (badge) màu sắc để phân biệt trạng thái dự án (Mới, Đang thi công, Hoàn thành, Hủy), giúp người dùng nhận biết nhanh chóng. Phía trên cùng có tích hợp thanh tìm kiếm và bộ lọc nâng cao theo trạng thái hoặc nhân viên phụ trách, giúp truy xuất dữ liệu dễ dàng khi số lượng dự án tăng cao.

Hình 3.3. Giao diện trang Quản lý dự án

### 3.3.4. Chức năng của trang Lập Báo giá
Đây là trang hỗ trợ nhân viên Sales tạo báo giá chi tiết cho khách hàng. Giao diện được chia làm hai phần chính: phần thông tin chung của dự án và phần thêm hạng mục. Điểm đặc biệt của chức năng này là khả năng tự động tính toán bóc tách vật tư (BOM). Khi người dùng chọn một hệ nhôm và nhập kích thước (Rộng × Cao), hệ thống sẽ tự động tính ra số lượng nhôm, kính, phụ kiện cần thiết và áp giá thành tiền. Phía dưới cùng của trang cung cấp phần tổng hợp chi phí, bao gồm tính toán chiết khấu và thuế VAT tự động trước khi xuất file gửi cho khách hàng.

Hình 3.4. Giao diện trang Lập Báo giá

### 3.3.5. Chức năng của trang Quản lý Kho vật tư
Trang này tổng hợp toàn bộ danh mục vật tư hiện có trong kho. Danh sách được phân loại rõ ràng thành Nhôm, Kính và Phụ kiện. Điểm đáng chú ý là hệ thống cảnh báo tồn kho: những vật tư có số lượng dưới mức tối thiểu quy định sẽ được đánh dấu bằng màu đỏ nổi bật để người quản lý kịp thời lên kế hoạch nhập hàng. Giao diện cung cấp hai thao tác chính là "Nhập kho" và "Xuất kho" với các tab lịch sử giao dịch đi kèm, giúp kiểm soát chặt chẽ luồng hàng hóa ra vào xưởng.

Hình 3.5. Giao diện trang Quản lý Kho vật tư

### 3.3.6. Chức năng của trang Quản lý Tài chính
Đây là khu vực dành riêng cho bộ phận kế toán theo dõi dòng tiền của doanh nghiệp. Giao diện hiển thị 4 thẻ tổng hợp chính: Tổng thu, Tổng chi, Lợi nhuận và Tổng công nợ. Bên dưới là biểu đồ so sánh trực quan giữa thu và chi theo từng tháng. Trang này cung cấp các tab chức năng chi tiết cho phép tạo Phiếu Thu, Phiếu Chi và theo dõi Công nợ của từng khách hàng, giúp doanh nghiệp kiểm soát chặt chẽ sức khỏe tài chính.

Hình 3.6. Giao diện trang Tổng quan Tài chính

### 3.3.7. Chức năng của trang Quản lý Người dùng
Giao diện này dành riêng cho Admin để quản lý nhân sự trong hệ thống. Danh sách tài khoản được hiển thị với đầy đủ thông tin: Họ tên, Email, Trạng thái hoạt động và Vai trò (Role). Mỗi vai trò (Manager, Sales, Inventory, Finance) được gán một màu sắc riêng biệt giúp Admin dễ dàng phân biệt. Quản trị viên có thể thêm người dùng mới, cập nhật thông tin, đặt lại mật khẩu hoặc vô hiệu hóa các tài khoản không còn sử dụng.

Hình 3.7. Giao diện trang Quản lý Người dùng

### 3.3.8. Chức năng của trang Quản lý Phân quyền
Đây là trang cấu hình bảo mật quan trọng của hệ thống, được thiết kế dưới dạng ma trận quyền hạn (Role-Based Access Control). Các hàng tương ứng với vai trò người dùng và các cột là các module chức năng. Quản trị viên chỉ cần tích hoặc bỏ tích vào các ô checkbox (Xem, Tạo, Sửa, Xóa) để cấp hoặc thu hồi quyền truy cập. Mọi thay đổi sẽ lập tức có hiệu lực, giúp hệ thống hoạt động linh hoạt theo đúng cơ cấu của doanh nghiệp.

Hình 3.8. Giao diện trang Quản lý Phân quyền

### 3.3.9. Chức năng của trang Nhật ký Hoạt động (Activity Log)
Chức năng này giúp theo dõi và lưu vết toàn bộ các thao tác quan trọng diễn ra trong hệ thống. Giao diện hiển thị danh sách các sự kiện theo thứ tự thời gian thực, bao gồm thông tin người thực hiện, loại hành động (Tạo mới, Cập nhật, Xóa) và đối tượng bị tác động. Có tích hợp bộ lọc theo thời gian và theo người dùng, hỗ trợ Admin dễ dàng tra cứu, truy vết khi có sự cố dữ liệu xảy ra, đảm bảo tính minh bạch trong vận hành.

Hình 3.9. Giao diện trang Nhật ký Hoạt động

### 3.3.10. Chức năng của trang Cài đặt Hệ thống
Đây là khu vực cho phép tùy biến các thông số lõi của phần mềm. Giao diện được chia thành các thẻ (card) cấu hình độc lập bao gồm: Thông tin công ty (Tên, Logo, Địa chỉ), Cấu hình Email (SMTP để gửi thông báo), Cấu hình thông số Kho và Cài đặt mặc định cho Báo giá (Thuế suất VAT). Chức năng này giúp hệ thống dễ dàng tùy biến theo đặc thù của từng doanh nghiệp mà không cần can thiệp vào mã nguồn.

Hình 3.10. Giao diện trang Cài đặt Hệ thống
