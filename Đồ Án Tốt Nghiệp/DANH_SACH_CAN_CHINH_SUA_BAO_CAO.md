# DANH SÁCH CHI TIẾT CÁC MỤC CẦN CHỈNH SỬA TRONG BÁO CÁO TỐT NGHIỆP
*(Căn cứ theo File báo cáo hiện tại và Quy định trình bày của Trường Đại học Công nghiệp Hà Nội)*

## 1. Căn Lề Trang (Page Margins)
Toàn bộ văn bản đang sai lề trang hoàn toàn so với quy chuẩn.
- **Trái (Left):** Hiện tại `2.54 cm` ➔ Cần sửa thành: `3.5 cm`
- **Phải (Right):** Hiện tại `1.27 cm` ➔ Cần sửa thành: `2.0 cm`
- **Trên (Top):** Hiện tại `6.35 cm` ➔ Cần sửa thành: `2.5 cm`
- **Dưới (Bottom):** Hiện tại `0.49 cm` ➔ Cần sửa thành: `2.0 cm`

## 2. Font Chữ Và Định Dạng Dòng (Typography)
Báo cáo đang chứa nhiều font chữ hỗn tạp và sai cỡ chữ do copy/paste.
- **Font chữ:** Phải thống nhất dùng font **Times New Roman** cho toàn bộ Body Text.
- **Cỡ chữ:** Phải thống nhất dùng cỡ chữ **14pt**.
- **Dãn dòng (Line Spacing):** Phải set dãn dòng là **1.5 lines** cho toàn bộ Body text. Không nén hoặc kéo giãn chữ.

## 3. Đánh Số Trang (Header/Footer)
- **Lỗi hiện tại:** Văn bản chưa được thiết lập đánh số trang.
- **Yêu cầu chỉnh sửa:** Đánh số trang nằm ở **giữa**, **phía trên đầu** của mỗi trang giấy. (Vào *Insert* > *Page Number* > *Top of Page*).

## 4. Cấu Trúc Heading & Đánh Số Tiểu Mục
Đây là lỗi nặng nhất, gây sai lệch nghiêm trọng cho Mục lục (TOC). Cần sửa theo các mục sau:

### 4.1. Phần Mở đầu
- Đang dùng thẻ `Heading 2` cho các mục ("Lý do chọn đề tài", "Mục tiêu đề tài"...). Cần phải đánh số thứ tự cho các mục này (ví dụ: 1. Lý do chọn đề tài, 2. Mục tiêu đề tài...).

### 4.2. Chương 1 & Chương 2
- Đang thiếu hoàn toàn việc đánh số thứ tự cho các tiểu mục.
- **Cần sửa:** Đánh số theo cấu trúc phân nhóm. Ví dụ:
  - `1.1. Giới thiệu về HTML5...`
  - `1.2. Giới thiệu về Node.js...`

### 4.3. Chương 3 (Lỗi phân cấp Heading nghiêm trọng)
- **Thiếu đánh số:** Các mục đầu tiên đang bị trống số thứ tự. Cần bổ sung thành `3.1. Công nghệ và môi trường sử dụng`, `3.2. Bảo mật trong hệ thống`, `3.3. Triển khai hệ thống`,...
- **Lỗi cấp độ thẻ Heading:**
  - Mục `3.4. Giao diện Quản trị` đang bị nhầm thành thẻ `Heading 1` (điều này khiến nó ngang hàng với tiêu đề Chương). ➔ **Phải hạ xuống thành `Heading 2`.**
  - Các mục con như `3.3.1. Giao diện trang Đăng nhập` đang bị thiết lập thẻ `Heading 2`. ➔ **Phải hạ xuống thành `Heading 3`.**

### 4.4. Phần Kết luận
- Đang dùng thẻ `Heading 2` cho các mục "1. Những kết quả đạt được", "2. Hạn chế...". Theo quy định, phần Kết luận nên viết thành đoạn văn liền mạch hoặc dùng số thứ tự thông thường, không nên dùng thẻ Heading có phân cấp giống như trong Chương vì sẽ làm rác Mục lục.

## 5. Danh Mục Tài Liệu Tham Khảo
- **Lỗi hiện tại:** Đang sử dụng đánh số thứ tự bằng ngoặc vuông (vd: `[1] Nguyễn Văn Ba`, `[2] Phạm Văn Ất`).
- **Yêu cầu chỉnh sửa:**
  - **Không đánh số thứ tự [1], [2] ở đầu dòng.**
  - Sắp xếp các tài liệu theo **thứ tự bảng chữ cái (ABC)** của tên tác giả.
  - Định dạng chuẩn: `Tên tác giả (năm xuất bản), Tên sách/tài liệu (in nghiêng), Nhà xuất bản, Nơi xuất bản.`
  - Căn lề: Nếu tài liệu dài hơn 1 dòng, từ dòng thứ 2 trở đi phải lùi vào trong `1 cm` (Hanging indent).

---
**💡 Ghi chú quan trọng:** Anh nên thực hiện sửa mục **1 (Căn lề)** và **4 (Heading)** đầu tiên. Bởi vì khi anh canh lại lề và chỉnh lại cấu trúc, tổng số lượng trang cũng như bố cục toàn bộ văn bản sẽ bị thay đổi sắp xếp lại toàn bộ.
