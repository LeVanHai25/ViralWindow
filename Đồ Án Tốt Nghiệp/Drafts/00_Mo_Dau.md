# MỞ ĐẦU

## 1. Lý do chọn đề tài

Trong cuộc Cách mạng Công nghiệp 4.0, chuyển đổi số không còn là sự lựa chọn mà đã trở thành yêu cầu bắt buộc đối với mọi doanh nghiệp nếu muốn duy trì và phát triển năng lực cạnh tranh. Đặc biệt, đối với các doanh nghiệp sản xuất và kinh doanh nhỏ và vừa (SMEs) tại Việt Nam – vốn là bộ phận nòng cốt của nền kinh tế – việc ứng dụng công nghệ thông tin vào quản trị vận hành đang gặp nhiều rào cản về chi phí, nhân lực và tính đặc thù của ngành nghề.

Ngành sản xuất cửa nhôm kính là một lĩnh vực có quy trình nghiệp vụ cực kỳ phức tạp và mang tính tùy biến cao. Mỗi sản phẩm được tạo ra không chỉ đơn thuần là một bộ cửa, mà là sự kết hợp của hàng trăm linh kiện, vật tư từ thanh nhôm, kính, phụ kiện kim khí đến các loại vật tư phụ như gioăng, keo, ốc vít. Thách thức lớn nhất đối với các doanh nghiệp trong ngành này chính là công đoạn **bóc tách vật tư (BOM - Bill of Materials)**. Hiện nay, đa số các xưởng sản xuất vẫn thực hiện công đoạn này một cách thủ công dựa trên kinh nghiệm của kỹ thuật viên, dẫn đến nhiều hệ lụy:
- **Sai số cao:** Dễ dẫn đến tình trạng thiếu hụt vật tư làm chậm tiến độ thi công hoặc dư thừa gây lãng phí vốn lưu động.
- **Hiệu suất thấp:** Việc tính toán thủ công cho một công trình lớn có thể mất hàng giờ, thậm chí hàng ngày.
- **Khó quản trị:** Dữ liệu báo giá, kho bãi và tài chính thường rời rạc, không có sự liên kết, gây khó khăn cho ban lãnh đạo trong việc đưa ra các quyết định kinh doanh kịp thời.

Công ty Cổ phần ViralWindow là một đơn vị điển hình trong lĩnh vực cung cấp giải pháp cửa nhôm kính cao cấp. Với khối lượng dự án ngày càng tăng, nhu cầu về một hệ thống quản trị tập trung, có khả năng tự động hóa quy trình bóc tách kỹ thuật và kết nối các bộ phận từ Kinh doanh - Kỹ thuật - Kho - Kế toán là vô cùng cấp thiết.

Xuất phát từ những vấn đề thực tiễn trên, tác giả đã lựa chọn thực hiện đề tài: **"Xây dựng hệ thống quản lý kinh doanh và sản xuất cho doanh nghiệp nhỏ"**. Đề tài tập trung vào việc nghiên cứu và xây dựng hệ thống ViralWindow App – một nền tảng quản trị tổng thể, trong đó điểm nhấn công nghệ là bộ máy **BOM Engine** giúp tự động hóa hoàn toàn quy trình tính toán vật tư từ các mẫu thiết kế (templates), góp phần tối ưu hóa nguồn lực và chuyên nghiệp hóa quy trình sản xuất cho doanh nghiệp.

## 2. Mục tiêu đề tài

### 2.1. Mục tiêu chung
Xây dựng một hệ thống phần mềm quản trị doanh nghiệp (ERP thu nhỏ) trên nền tảng Web, hỗ trợ Công ty Cổ phần ViralWindow số hóa toàn diện quy trình từ khâu quản lý khách hàng, lập báo giá đến bóc tách vật tư sản xuất và theo dõi tài chính, kho vận.

### 2.2. Mục tiêu cụ thể
- **Khảo sát và đặc tả:** Nghiên cứu sâu quy trình bóc tách vật tư và luồng nghiệp vụ thực tế tại xưởng sản xuất nhôm kính để xây dựng tài liệu đặc tả yêu cầu (SRS) chính xác.
- **Thiết kế hệ thống:** Sử dụng ngôn ngữ mô hình hóa UML để thiết kế kiến trúc hệ thống, quy trình nghiệp vụ và sơ đồ cơ sở dữ liệu quan hệ tối ưu.
- **Phát triển module BOM Engine:** Xây dựng bộ quy tắc (rules) và công cụ tính toán tự động danh mục vật tư cho các dòng sản phẩm chính (Cửa đi, Cửa sổ, Vách kính, Lan can) dựa trên kích thước và quy cách kỹ thuật.
- **Quản trị tích hợp:** Phát triển các phân hệ quản lý Dự án, Báo giá đa phiên bản, Quản lý Kho (nhập/xuất/tồn), Quản lý Tài chính (thu chi/công nợ) và hệ thống phân quyền (RBAC).
- **Kiểm thử và triển khai:** Thực hiện kiểm thử phần mềm để đảm bảo tính chính xác của thuật toán tính toán vật tư và độ ổn định của hệ thống trước khi vận hành thử nghiệm.

## 3. Đối tượng và phạm vi nghiên cứu

### 3.1. Đối tượng nghiên cứu
- Quy trình nghiệp vụ quản lý sản xuất và kinh doanh tại các doanh nghiệp nhôm kính nhỏ và vừa.
- Công nghệ phát triển Web Fullstack: Node.js (Express framework), MariaDB/MySQL, JavaScript/HTML/CSS.
- Các giải pháp xác thực bảo mật (JWT, Bcrypt) và kiến trúc RESTful API.
- Thuật toán bóc tách vật tư tự động dựa trên dữ liệu cấu trúc (JSON Templates).

### 3.2. Phạm vi nghiên cứu
- **Về nghiệp vụ:** Tập trung vào các mảng cốt lõi: Quản lý khách hàng; Quản lý dự án; Lập báo giá và quản lý phiên bản; Bóc tách vật tư kỹ thuật (BOM); Quản lý kho vật tư; Quản lý tài chính và công nợ.
- **Về sản phẩm hỗ trợ:** Hỗ trợ tính toán vật tư cho 05 nhóm sản phẩm phổ biến: Cửa đi mở quay, Cửa trượt, Cửa sổ, Vách kính cố định và Lan can kính.
- **Về công nghệ:** Hệ thống được triển khai theo kiến trúc Client-Server, hoạt động trên nền tảng trình duyệt Web, phù hợp cho việc vận hành tại văn phòng và nhà xưởng.

## 4. Phương pháp nghiên cứu

Đồ án được thực hiện dựa trên các phương pháp nghiên cứu chính:
- **Phương pháp khảo sát:** Phỏng vấn chuyên gia kỹ thuật và bộ phận kế toán kho tại ViralWindow để nắm bắt thực tế.
- **Phương pháp phân tích hướng đối tượng (OOAD):** Sử dụng UML để mô hình hóa hệ thống.
- **Mô hình phát triển phần mềm Agile/Scrum:** Chia nhỏ quá trình phát triển thành các Sprint (tuần) để đảm bảo tiến độ và khả năng phản hồi yêu cầu linh hoạt.
- **Phương pháp kiểm thử hộp đen (Black-box Testing):** Kiểm tra các chức năng dựa trên đầu vào và kết quả mong đợi.

## 5. Cấu trúc đồ án

Nội dung đồ án ngoài phần mở đầu và kết luận được chia thành 4 chương chính:

**Chương 1: Cơ sở lý thuyết.** Giới thiệu về các công nghệ sử dụng (Node.js, MariaDB), kiến trúc RESTful API và các khái niệm về quản trị sản xuất, BOM trong ngành nhôm kính.

**Chương 2: Phân tích và thiết kế hệ thống.** Trình bày các biểu đồ Use Case, Activity, Sequence và thiết kế cơ sở dữ liệu chi tiết cho 17 bảng dữ liệu của hệ thống.

**Chương 3: Xây dựng và cài đặt hệ thống.** Mô tả chi tiết quá trình triển khai mã nguồn, cấu trúc thư mục, cách thức hoạt động của BOM Engine và giao diện các module chức năng.

**Chương 4: Kiểm thử và đánh giá.** Trình bày kế hoạch kiểm thử, kết quả test case và đánh giá mức độ đáp ứng của hệ thống so với mục tiêu ban đầu.
