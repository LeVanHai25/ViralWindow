# KỊCH BẢN THUYẾT TRÌNH ĐỒ ÁN TỐT NGHIỆP: VIRALWINDOW
**Tên đề tài:** Xây dựng phần mềm quản lý xưởng Nhôm Kính - ViralWindow
**Người thực hiện:** [Tên của bạn] - [MSSV]
**Thời gian dự kiến:** 10 - 15 phút (Tương đương 15 - 18 slide)

---

## PHẦN 1: CẤU TRÚC SLIDE VÀ LỜI THOẠI CHI TIẾT

### Slide 1: Trang Bìa
- **Nội dung hiển thị:** Tên đề tài, tên SVTH, MSSV, Tên GVHD.
- **Lời thoại:** 
  > "Kính thưa Hội đồng bảo vệ đồ án tốt nghiệp, kính thưa các thầy cô và các bạn sinh viên. Em là [Tên của bạn], sinh viên lớp [Tên lớp]. Hôm nay, em xin phép trình bày về đồ án tốt nghiệp với đề tài: 'Xây dựng phần mềm quản lý xưởng Nhôm Kính - ViralWindow'. Đề tài này được thực hiện dưới sự hướng dẫn của thầy/cô [Tên GVHD]."

### Slide 2: Đặt vấn đề (Pain points)
- **Nội dung hiển thị:** Các khó khăn hiện tại (Quản lý thủ công, dễ sai sót, rời rạc dữ liệu).
- **Lời thoại:** 
  > "Lý do em chọn đề tài này xuất phát từ thực tế các xưởng nhôm kính vừa và nhỏ hiện nay đa số vẫn đang quản lý hoàn toàn thủ công. Việc bóc tách vật tư, tính toán báo giá hay quản lý công nợ đều làm trên Excel hoặc sổ sách. Điều này không những mất nhiều thời gian mà còn tiềm ẩn rủi ro sai sót rất lớn, dẫn đến thất thoát vật tư và tài chính."

### Slide 3: Mục tiêu & Phạm vi (Giải pháp ViralWindow)
- **Nội dung hiển thị:** Sơ đồ 6 Module cốt lõi (CRM, Kỹ thuật, Kho, Tài chính, AI, Admin).
- **Lời thoại:** 
  > "Để giải quyết bài toán đó, em đã xây dựng hệ thống ViralWindow. Mục tiêu của hệ thống là số hóa toàn bộ quy trình, xóa bỏ ranh giới dữ liệu giữa các phòng ban. Hệ thống bao phủ 6 phân hệ cốt lõi: từ Quản lý khách hàng, bóc tách Kỹ thuật, kiểm soát Kho vật tư, cho đến quản trị Tài chính công nợ và Phân quyền hệ thống."

### Slide 4 & 5: Công nghệ & Kiến trúc hệ thống
- **Nội dung hiển thị:** Tech stack (Frontend, Backend, DB) & Sơ đồ kiến trúc (Client-Server).
- **Lời thoại:** 
  > "Về mặt công nghệ, hệ thống được thiết kế theo mô hình Client-Server. Frontend sử dụng HTML/CSS/JS thuần kết hợp các framework giao diện hiện đại để tối ưu UI/UX. Backend và Cơ sở dữ liệu được em thiết kế chặt chẽ [nêu tên Backend/DB]. Kiến trúc này đảm bảo tính mở rộng cao và bảo mật tốt thông qua cơ chế xác thực người dùng."

### Slide 6 & 7: Phân tích thiết kế (Use Case & ERD)
- **Nội dung hiển thị:** Hình ảnh sơ đồ Use Case và Sơ đồ ERD chuẩn hóa.
- **Lời thoại:** 
  > "Trên màn hình là sơ đồ Use Case tổng quát thể hiện luồng tương tác của các tác nhân như Nhân viên kinh doanh, Kỹ thuật, Thủ kho và Kế toán. Tiếp theo là sơ đồ thực thể liên kết (ERD). Cơ sở dữ liệu được em thiết kế đạt chuẩn 3NF, xử lý chặt chẽ các quan hệ N-N trong nghiệp vụ quản lý báo giá và công nợ tài chính."

### Slide 8, 9, 10: Điểm nhấn công nghệ
- **Nội dung hiển thị:** Các hình ảnh nổi bật về giao diện, tính năng báo giá động, Dark mode.
- **Lời thoại:** 
  > "Điểm nhấn của hệ thống không chỉ nằm ở chức năng mà còn ở trải nghiệm người dùng (UX). Hệ thống cung cấp giao diện chuẩn hóa, có chế độ Dark Mode global bảo vệ mắt. Thay vì dùng các thông báo mặc định của trình duyệt gây gián đoạn, em đã tự phát triển hệ thống VWModal để thông báo mượt mà. Bên cạnh đó, logic tính toán báo giá được liên kết tự động trực tiếp từ giá vật tư trong kho, đảm bảo độ chính xác tuyệt đối."

---

## PHẦN 2: KỊCH BẢN DEMO THỰC TẾ TRÊN PHẦN MỀM (3 - 4 phút)
*(Nên thao tác trực tiếp hoặc phát video quay sẵn)*

**1. Màn hình Dashboard (Tổng quan)**
- **Thao tác:** Lướt qua các thẻ thống kê. Chuyển đổi Dark/Light mode.
- **Lời thoại:** 
  > "Dạ thưa Hội đồng, em xin phép demo hệ thống. Đây là trang Dashboard, nơi cung cấp bức tranh tài chính và tiến độ công việc theo thời gian thực. Giao diện cũng hỗ trợ chuyển đổi Dark/Light mode linh hoạt."

**2. Luồng Khách hàng & Báo giá**
- **Thao tác:** Mở danh sách Báo giá, xem chi tiết 1 form báo giá đã có sẵn (đầy đủ nhôm, kính, phụ kiện).
- **Lời thoại:** 
  > "Em xin đi vào luồng nghiệp vụ chính. Khi kỹ thuật viên tạo Báo Giá cho khách hàng, dữ liệu không phải nhập tay hoàn toàn. Hệ thống tự động liên kết với Kho để kéo lên đơn giá chuẩn của Nhôm, Kính và tính toán tổng chi phí tự động dựa trên diện tích. Điều này khắc phục triệt để lỗi tính sai trên Excel."

**3. Luồng Quản lý Kho**
- **Thao tác:** Chuyển sang module Kho Vật Tư. Chỉ vào số lượng tồn kho.
- **Lời thoại:** 
  > "Khi báo giá thành đơn hàng, dữ liệu chạy thẳng về Kho. Thủ kho sẽ thấy ngay số lượng tồn để xuất cho sản xuất. Nếu vật tư dưới định mức, hệ thống sẽ cảnh báo nhập thêm."

**4. Luồng Tài chính (Kế toán)**
- **Thao tác:** Mở module Tài chính -> Phiếu thu. Demo tạo 1 phiếu thu, hiển thị VWModal. Trỏ chuột vào các Badge trạng thái (Đang nợ, Đã thanh toán).
- **Lời thoại:** 
  > "Sau khi có đơn hàng, Kế toán sẽ lập phiếu thu tiền cọc. Quá trình nhập liệu được hỗ trợ bởi hệ thống VWModal do em tùy biến. Hệ thống tự động đối soát để cập nhật trạng thái Công nợ khách hàng (Chưa thanh toán, Đã tất toán) bằng các dải màu (Badge) trực quan, giúp chủ xưởng không cần lật lại sổ sách."

**5. Kết thúc Demo**
- **Thao tác:** Quay về Dashboard, Đăng xuất.
- **Lời thoại:** 
  > "Ngoài ra, hệ thống phân quyền Admin đảm bảo mỗi nhân viên chỉ truy cập đúng nghiệp vụ của mình. Đó là luồng khép kín của ViralWindow, em xin kết thúc phần demo và quay lại slide ạ."

---

## PHẦN 3: TỔNG KẾT & CÂU HỎI DỰ PHÒNG

### Slide 14 & 15: Kết quả đạt được & Hướng phát triển
- **Lời thoại:** 
  > "Kết quả đạt được của đồ án là đã xây dựng thành công phần mềm ViralWindow hoạt động ổn định, đáp ứng nghiệp vụ thực tế của một xưởng nhôm kính. Tuy nhiên, hệ thống vẫn còn hạn chế là chưa có App Mobile chuyên dụng. Trong tương lai, em định hướng sẽ phát triển thêm phiên bản Mobile App cho thợ đo đạc tại công trình và ứng dụng AI để dự báo nhu cầu vật tư."

### Slide 16: Lời cảm ơn
- **Lời thoại:** 
  > "Phần trình bày của em đến đây là kết thúc. Em xin chân thành cảm ơn Hội đồng đã lắng nghe. Rất mong nhận được những câu hỏi và ý kiến đóng góp từ các thầy cô để đồ án hoàn thiện hơn ạ. Em xin cảm ơn!"

### [Bí kíp] - Một số câu hỏi Hội đồng có thể hỏi và cách trả lời:
1. **Tại sao em lại thiết kế CSDL (bảng A, bảng B) như thế này?** 
   -> Hãy giải thích dựa trên chuẩn hóa 3NF và luồng nghiệp vụ thực tế.
2. **Điểm khó nhất khi em code phần mềm này là gì?** 
   -> Trả lời về phần thiết kế kiến trúc Component, xử lý Dark Mode global, VWModal, hoặc logic tự động tính toán từ Kho sang Báo giá.
3. **Làm sao để bảo mật hệ thống?** 
   -> Trả lời về phân quyền Role-based, mã hóa password, và xác thực phiên đăng nhập (Token/Session).
