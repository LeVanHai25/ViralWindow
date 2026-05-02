# KẾT LUẬN

Đề tài **"Xây dựng phần mềm quản lý dự án cửa nhôm kính ViralWindow"** được thực hiện với mục tiêu xây dựng một hệ thống quản trị doanh nghiệp (ERP) chuyên biệt, đáp ứng các nhu cầu quản lý thực tế trong lĩnh vực sản xuất và thi công cửa nhôm kính. Hệ thống hướng đến việc số hóa toàn bộ quy trình vận hành, từ khâu tiếp nhận khách hàng, lập báo giá, quản lý dự án, điều phối sản xuất, quản lý kho vật tư cho đến theo dõi tài chính, nhằm nâng cao hiệu quả quản lý, giảm thiểu sai sót và tối ưu nguồn lực doanh nghiệp.

Trong quá trình thực hiện đề tài, tác giả không chỉ hoàn thành việc xây dựng một hệ thống phần mềm có tính ứng dụng thực tế cao mà còn tích lũy được nhiều kiến thức và kinh nghiệm quý báu trong lĩnh vực phát triển phần mềm.

---

## 1. Những kết quả đạt được

### 1.1. Về mặt công nghệ

- Nắm vững quy trình phát triển phần mềm hoàn chỉnh theo thực tế, bao gồm các giai đoạn: khảo sát yêu cầu, phân tích hệ thống, thiết kế kiến trúc, lập trình, kiểm thử và triển khai.
- Xây dựng thành công hệ thống web đa vai trò (Admin, Manager, Sales, Inventory, Finance), đáp ứng đầy đủ các nghiệp vụ đặc thù của doanh nghiệp sản xuất cửa nhôm kính.
- Làm chủ các công nghệ phát triển giao diện hiện đại như **HTML5, CSS3, JavaScript (ES6+)**, đảm bảo giao diện thân thiện và dễ sử dụng.
- Thành thạo việc xây dựng RESTful API bằng **Node.js** và **Express.js**, xử lý hiệu quả các nghiệp vụ phía máy chủ.
- Hiểu và áp dụng tốt việc thiết kế cơ sở dữ liệu quan hệ với **MySQL 8.0**, bao gồm chuẩn hóa dữ liệu, thiết lập ràng buộc và sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu.
- Triển khai thành công cơ chế bảo mật với **JWT (JSON Web Token)** và mô hình phân quyền **RBAC (Role-Based Access Control)**.
- Tích hợp công nghệ truyền thông thời gian thực thông qua **Socket.IO**, giúp hệ thống cập nhật dữ liệu tức thời.
- Bước đầu ứng dụng trí tuệ nhân tạo thông qua **Google Gemini AI API** để hỗ trợ phân tích nghiệp vụ và mở rộng tính năng thông minh.
- Sử dụng hiệu quả các công cụ phát triển phần mềm như Visual Studio Code, Postman, MySQL Workbench và Git.

### 1.2. Về mặt chức năng và triển khai hệ thống

Hệ thống đã đáp ứng tốt các yêu cầu nghiệp vụ thực tế:

**Đối với nhân viên kinh doanh (Sales):**

- Tạo dự án và lập báo giá nhanh chóng.
- Tự động bóc tách vật tư (BOM) dựa trên hệ nhôm và kích thước thực tế của từng hạng mục cửa.

**Đối với bộ phận kho:**

- Quản lý tồn kho theo thời gian thực.
- Tạo phiếu nhập/xuất kho chính xác.
- Cảnh báo tồn kho thấp trực quan trên giao diện.

**Đối với bộ phận tài chính:**

- Ghi nhận thu chi, theo dõi công nợ từng khách hàng.
- Xem báo cáo doanh thu, chi phí và lợi nhuận theo thời gian.

**Đối với quản trị viên:**

- Quản lý tài khoản và phân quyền người dùng.
- Theo dõi nhật ký hoạt động hệ thống (Activity Log).
- Giám sát toàn bộ hoạt động của hệ thống.

Hệ thống đã được kiểm thử với tỷ lệ thành công cao **(93,5%)**, cho thấy tính ổn định và khả năng đáp ứng yêu cầu nghiệp vụ trong môi trường thực tế.

---

## 2. Hạn chế của hệ thống

Mặc dù đạt được nhiều kết quả tích cực, hệ thống vẫn còn một số hạn chế cần được ghi nhận:

- Hệ thống hiện đang triển khai trên môi trường nội bộ (On-premise), chưa áp dụng kiến trúc phân tán hoặc cân bằng tải (Load Balancing).
- Chưa kiểm thử khả năng chịu tải với số lượng lớn người dùng đồng thời.
- Tính năng cảnh báo tồn kho thấp mới dừng ở mức hiển thị trực quan, chưa có cơ chế thông báo đẩy (Push Notification) tự động.
- Giao diện chưa được tối ưu hoàn toàn cho thiết bị di động (màn hình nhỏ).
- Chưa triển khai các cơ chế bảo mật nâng cao như giao thức **HTTPS/SSL** và xác thực hai yếu tố **(2FA)** cho môi trường vận hành thực tế.

---

## 3. Hướng phát triển trong tương lai

Để nâng cao chất lượng và khả năng ứng dụng thực tế, hệ thống có thể được phát triển theo các hướng sau:

- Hoàn thiện hệ thống, khắc phục các lỗi còn tồn tại và tối ưu hiệu năng xử lý truy vấn cơ sở dữ liệu.
- Triển khai hệ thống lên nền tảng đám mây (Cloud), áp dụng mô hình High Availability (tính sẵn sàng cao) và Load Balancing (cân bằng tải).
- Phát triển ứng dụng di động (iOS/Android) phục vụ nhân viên cập nhật tiến độ và xem bản vẽ kỹ thuật trực tiếp tại công trường.
- Nâng cấp tích hợp AI: dự báo nhu cầu vật tư, phân tích xu hướng doanh thu và đề xuất kế hoạch sản xuất, nhập hàng tối ưu dựa trên dữ liệu lịch sử.
- Áp dụng kiểm thử tự động (Automated Testing) bao gồm Unit Test và Integration Test nhằm nâng cao chất lượng phần mềm trong quá trình phát triển liên tục.
- Tích hợp với các hệ thống bên ngoài: phần mềm kế toán (MISA, Fast Accounting) và phần mềm thiết kế kỹ thuật (AutoCAD, SketchUp).
- Phát triển hệ thống giao tiếp nội bộ (Chat realtime) giữa các bộ phận, gắn liền với từng dự án cụ thể.

---

## 4. Tổng kết

Có thể khẳng định rằng hệ thống ViralWindow đã đạt được mục tiêu đề ra ban đầu, cung cấp một giải pháp quản lý toàn diện, hỗ trợ doanh nghiệp nâng cao hiệu quả vận hành và từng bước thực hiện chuyển đổi số trong lĩnh vực sản xuất cửa nhôm kính.

Đề tài không chỉ mang ý nghĩa học thuật mà còn có giá trị thực tiễn cao, có thể tiếp tục được phát triển thành một sản phẩm phần mềm hoàn chỉnh, phục vụ trực tiếp cho doanh nghiệp trong ngành xây dựng và sản xuất cửa nhôm kính tại Việt Nam.
