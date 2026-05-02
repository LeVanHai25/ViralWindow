# MỞ ĐẦU

## 1. Lý do chọn đề tài

Trong cuộc Cách mạng Công nghiệp 4.0, chuyển đổi số không còn là sự lựa chọn mà đã trở thành yêu cầu bắt buộc đối với mọi doanh nghiệp nếu muốn duy trì và phát triển năng lực cạnh tranh. Đặc biệt, đối với các doanh nghiệp sản xuất và kinh doanh nhỏ và vừa (SMEs) tại Việt Nam – vốn là bộ phận nòng cốt của nền kinh tế – việc ứng dụng công nghệ thông tin vào quản trị vận hành đang gặp nhiều rào cản về chi phí, nhân lực và tính đặc thù của ngành nghề.

Ngành sản xuất cửa nhôm kính là một lĩnh vực có quy trình nghiệp vụ cực kỳ phức tạp và mang tính tùy biến cao. Mỗi sản phẩm được tạo ra không chỉ đơn thuần là một bộ cửa, mà là sự kết hợp của hàng trăm linh kiện, vật tư từ thanh nhôm, kính, phụ kiện kim khí đến các loại vật tư phụ như gioăng, keo, ốc vít. Thách thức lớn nhất đối với các doanh nghiệp trong ngành này chính là công đoạn **bóc tách vật tư (BOM - Bill of Materials)**. Hiện nay, đa số các xưởng sản xuất vẫn thực hiện công đoạn này một cách thủ công dựa trên kinh nghiệm của kỹ thuật viên, dẫn đến nhiều hệ lụy: sai số cao, hiệu suất thấp và khó quản trị dữ liệu tập trung.

Công ty Cổ phần ViralWindow là một đơn vị điển hình trong lĩnh vực cung cấp giải pháp cửa nhôm kính cao cấp. Với khối lượng dự án ngày càng tăng, nhu cầu về một hệ thống quản trị tập trung, có khả năng tự động hóa quy trình bóc tách kỹ thuật và kết nối các bộ phận từ Kinh doanh - Kỹ thuật - Kho - Kế toán là vô cùng cấp thiết.

Xuất phát từ những vấn đề thực tiễn trên, tác giả đã lựa chọn thực hiện đề tài: **"Xây dựng hệ thống quản lý kinh doanh và sản xuất cho doanh nghiệp nhỏ"**. Đề tài tập trung vào việc nghiên cứu và xây dựng hệ thống ViralWindow App – một nền tảng quản trị tổng thể, trong đó điểm nhấn công nghệ là bộ máy **BOM Engine** giúp tự động hóa hoàn toàn quy trình tính toán vật tư từ các mẫu thiết kế (templates), góp phần tối ưu hóa nguồn lực và chuyên nghiệp hóa quy trình sản xuất cho doanh nghiệp.

## 2. Mục tiêu đề tài

### 2.1. Mục tiêu chung
Xây dựng một hệ thống phần mềm quản trị doanh nghiệp trên nền tảng Web, hỗ trợ Công ty Cổ phần ViralWindow số hóa toàn diện quy trình từ khâu quản lý khách hàng, lập báo giá đến bóc tách vật tư sản xuất và theo dõi tài chính, kho vận.

### 2.2. Mục tiêu cụ thể
- **Khảo sát và đặc tả:** Nghiên cứu sâu quy trình bóc tách vật tư và luồng nghiệp vụ thực tế tại xưởng sản xuất nhôm kính để xây dựng tài liệu đặc tả yêu cầu (SRS) chính xác.
- **Thiết kế hệ thống:** Sử dụng ngôn ngữ mô hình hóa UML để thiết kế kiến trúc hệ thống, quy trình nghiệp vụ và sơ đồ cơ sở dữ liệu quan hệ tối ưu.
- **Phát triển module BOM Engine:** Xây dựng bộ quy tắc (rules) và công cụ tính toán tự động danh mục vật tư cho các dòng sản phẩm chính dựa trên kích thước và quy cách kỹ thuật.
- **Quản trị tích hợp:** Phát triển các phân hệ quản lý Dự án, Báo giá, Kho (nhập/xuất/tồn), Tài chính và hệ thống phân quyền (RBAC).
- **Kiểm thử và đánh giá:** Thực hiện kiểm thử phần mềm để đảm bảo tính chính xác của thuật toán tính toán vật tư và độ ổn định của hệ thống.

## 3. Đối tượng và phạm vi nghiên cứu

### 3.1. Đối tượng nghiên cứu
- Quy trình nghiệp vụ quản lý sản xuất và kinh doanh nhôm kính.
- Công nghệ phát triển Web Fullstack: Node.js (Express framework), MariaDB/MySQL, JavaScript/HTML/CSS.
- Các giải pháp xác thực bảo mật (JWT, Bcrypt) và kiến trúc RESTful API.
- Thuật toán bóc tách vật tư tự động dựa trên dữ liệu cấu trúc (JSON Templates).

### 3.2. Phạm vi nghiên cứu
- **Về nghiệp vụ:** Tập trung vào các mảng: Quản lý khách hàng; Dự án; Báo giá; Bóc tách vật tư (BOM); Kho vật tư; Tài chính và công nợ.
- **Về sản phẩm hỗ trợ:** Hỗ trợ tính toán vật tư cho 05 nhóm sản phẩm: Cửa đi mở quay, Cửa trượt, Cửa sổ, Vách kính và Lan can kính.
- **Về công nghệ:** Kiến trúc Client-Server, nền tảng Web, chạy trên môi trường Windows/XAMPP/Node.js.

## 4. Cấu trúc đồ án
Báo cáo đồ án tốt nghiệp gồm phần mở đầu, kết luận và 4 chương nội dung:
- **Chương 1: Cơ sở lý thuyết.**
- **Chương 2: Phân tích và thiết kế hệ thống.**
- **Chương 3: Xây dựng và cài đặt hệ thống.**
- **Chương 4: Kiểm thử và đánh giá.**

---

# CHƯƠNG 1: CƠ SỞ LÝ THUYẾT

## 1.1. Tổng quan về hệ thống quản trị doanh nghiệp (ERP)

### 1.1.1. Khái niệm và vai trò
ERP (Enterprise Resource Planning) là hệ thống hoạch định nguồn lực doanh nghiệp, tích hợp tất cả các khâu quản lý của một tổ chức (Kế toán, Nhân sự, Kho, Sản xuất, Bán hàng...) vào một hệ thống cơ sở dữ liệu duy nhất. Vai trò của ERP là đảm bảo dòng chảy dữ liệu thông suốt giữa các bộ phận, giảm thiểu thao tác thủ công và hỗ trợ ra quyết định dựa trên số liệu thực tế.

### 1.1.2. Xu hướng ERP cho doanh nghiệp nhỏ và vừa (SMEs)
Thay vì các hệ thống ERP đồ sộ và đắt đỏ như SAP hay Oracle, các doanh nghiệp sản xuất nhỏ tại Việt Nam có xu hướng sử dụng các "Mini-ERP" hoặc phần mềm quản trị chuyên biệt. Các hệ thống này thường được xây dựng trên nền tảng Web (Cloud-based) để dễ dàng truy cập và tiết kiệm chi phí hạ tầng.

## 1.2. Nghiệp vụ bóc tách vật tư (BOM) trong ngành nhôm kính

### 1.2.1. Khái niệm BOM (Bill of Materials)
BOM là danh mục chi tiết tất cả các nguyên vật liệu, linh kiện, cụm chi tiết và số lượng cần thiết để sản xuất một sản phẩm hoàn chỉnh. Trong ngành cửa nhôm kính, một bản BOM bao gồm 4 nhóm chính:
- **Nhôm:** Các mã thanh nhôm (khung bao, cánh, nẹp kính...) với chiều dài cắt cụ thể.
- **Kính:** Loại kính (cường lực, dán an toàn), kích thước dài x rộng.
- **Phụ kiện:** Bản lề, khóa, tay nắm, chốt...
- **Vật tư phụ:** Gioăng cao su, keo silicon, ốc vít, ke góc.

### 1.2.2. Thách thức trong việc tính toán BOM tự động
Khác với sản phẩm may mặc hay điện tử có định mức cố định, sản phẩm cửa nhôm kính có kích thước biến thiên theo thực tế công trình. Do đó, BOM không phải là một danh sách tĩnh mà là kết quả của một bộ máy tính toán (BOM Engine) dựa trên các công thức trừ khấu hao kỹ thuật cho từng hệ nhôm khác nhau.

## 1.3. Các công nghệ sử dụng trong phát triển hệ thống

### 1.3.1. Ngôn ngữ lập trình và Framework
- **Node.js:** Một môi trường chạy JavaScript phía máy chủ, dựa trên Chrome's V8 engine. Node.js sử dụng mô hình I/O không chặn (non-blocking) và hướng sự kiện, rất phù hợp cho các ứng dụng quản lý cần xử lý nhiều truy vấn đồng thời.
- **Express.js:** Framework tối giản và linh hoạt cho Node.js, cung cấp bộ tính năng mạnh mẽ để xây dựng các ứng dụng Web và API.

### 1.3.2. Hệ quản trị cơ sở dữ liệu MariaDB/MySQL
MariaDB là một nhánh của MySQL, là hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở phổ biến nhất thế giới. Nó đảm bảo tính toàn vẹn dữ liệu thông qua các ràng buộc khóa ngoại (Foreign Keys) và hỗ trợ các Transaction phức tạp trong quản lý kho và tài chính.

### 1.3.3. Kiến trúc RESTful API
Kiến trúc này cho phép tách biệt hoàn toàn giữa Frontend (giao diện người dùng) và Backend (xử lý logic), giao tiếp với nhau qua các phương thức HTTP chuẩn (GET, POST, PUT, DELETE) với định dạng dữ liệu JSON. Điều này giúp hệ thống dễ dàng mở rộng và bảo trì.

### 1.3.4. Bảo mật với JWT và Bcrypt
- **JWT (JSON Web Token):** Phương thức xác thực không trạng thái (stateless), giúp truyền tải thông tin an toàn giữa các bên dưới dạng đối tượng JSON.
- **Bcrypt:** Thư viện mã hóa mật khẩu một chiều mạnh mẽ, đảm bảo an toàn thông tin người dùng ngay cả khi cơ sở dữ liệu bị lộ.

## 1.4. Quy trình phát triển phần mềm Agile/Scrum

Đồ án áp dụng mô hình Agile/Scrum để phát triển hệ thống theo các chu kỳ ngắn (Sprints). Phương pháp này giúp tác giả có thể nhận phản hồi nhanh chóng từ Mentor và người dùng thực tế tại ViralWindow để điều chỉnh chức năng phù hợp với nhu cầu sản xuất.
