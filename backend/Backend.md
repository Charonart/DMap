# 🛠️ Phân tích Tech Stack Backend - DMap

Chào bạn! Dưới đây là toàn bộ "đồ nghề" (tech stack) mà hệ thống Backend của dự án DMap đang sử dụng. Nếu bạn đã biết HTML, CSS và JavaScript cơ bản, bạn có thể hiểu các thành phần này một cách dễ dàng.

---

## 1. Ngôn ngữ & Môi trường chạy (Runtime)
*   **Node.js**: Đây là môi trường cho phép JavaScript chạy được trên máy tính/server (thay vì chỉ chạy trên trình duyệt). Nó đóng vai trò là "nền móng" cho toàn bộ Backend.
*   **JavaScript (ES6+)**: Toàn bộ code logic phía sau đều viết bằng JavaScript, giống hệt ngôn ngữ bạn dùng để làm hiệu ứng trên web.

## 2. Framework chính (Web Framework)
*   **Express.js**: Một "bộ khung" siêu nhẹ giúp xây dựng API. 
    *   *Dễ hiểu:* Nếu Node.js là động cơ, thì Express.js là cái khung xe để bạn gắn bánh, vô lăng và các bộ phận khác vào. Nó giúp quản lý các đường dẫn (Routes) như `/api/pois` hay `/api/auth`.

## 3. Cơ sở dữ liệu (Database)
*   **PostgreSQL**: Nơi lưu trữ mọi dữ liệu của dự án (thông tin người dùng, địa điểm, đánh giá...). 
    *   *So sánh:* Giống như một file Excel khổng lồ và cực kỳ thông minh.
*   **PostGIS**: Đây là một "tiện ích mở rộng" cho PostgreSQL để xử lý dữ liệu bản đồ (tọa độ GPS, khoảng cách). Nếu không có cái này, Backend sẽ khó mà biết được địa điểm nào nằm ở đâu trên bản đồ.
*   **pg (node-postgres)**: Thư viện giúp code JavaScript của chúng ta "nói chuyện" và ra lệnh cho PostgreSQL.

## 4. Xác thực & Bảo mật (Authentication & Security)
Để tránh bị hacker tấn công và bảo vệ tài khoản người dùng:
*   **jsonwebtoken (JWT)**: Dùng để tạo ra các "thẻ thông hành" (token). Sau khi bạn đăng nhập, server đưa cho bạn 1 thẻ này. Lần sau bạn chỉ cần trình thẻ ra là được phép xem dữ liệu bí mật.
*   **bcryptjs**: Dùng để "băm" mật khẩu. Khi bạn lưu mật khẩu `123456`, nó sẽ biến thành một chuỗi loằng ngoằng. Kể cả Admin cũng không biết mật khẩu thật của bạn là gì.
*   **Helmet**: Một chiếc "mũ bảo hiểm" giúp bảo vệ ứng dụng khỏi các lỗi bảo mật web phổ biến.
*   **express-rate-limit**: Ngăn chặn việc một ai đó cố tình gửi hàng nghìn yêu cầu liên tục để làm sập server (chống spam).

## 5. Lưu trữ hình ảnh & File (Media)
*   **Cloudinary**: Một dịch vụ lưu trữ ảnh trên đám mây (Cloud). Các ảnh chụp địa điểm mà người dùng tải lên sẽ được gửi lên đây thay vì lưu trực tiếp trong máy chủ (giúp máy chủ nhẹ hơn).
*   **Multer**: Thư viện giúp Backend "đọc" và xử lý các file (như ảnh .jpg, .png) mà người dùng gửi lên từ Form.

## 6. Các công cụ hỗ trợ khác
*   **dotenv**: Dùng để quản lý các "bí mật" (như mật khẩu database, chìa khóa API) trong một file riêng gọi là `.env`, không để lộ ra ngoài code chính.
*   **cors**: Cho phép Website (Frontend) ở một địa chỉ khác có thể gọi vào Backend để lấy dữ liệu.
*   **express-validator**: Giúp kiểm tra dữ liệu người dùng gửi lên có hợp lệ không (ví dụ: email có đúng định dạng không, mật khẩu có đủ dài không).
*   **cookie-parser**: Giúp server đọc các thông tin được lưu trong "Cookie" của trình duyệt.

---

## 📂 Giải thích cấu trúc thư mục (Architecture)
Khi nhìn vào thư mục `backend`, bạn sẽ thấy:
1.  **`server.js`**: File chạy chính. Nơi mọi thứ bắt đầu.
2.  **`routes/`**: Định nghĩa các "địa chỉ" (URL API). Ví dụ: `GET /api/pois`.
3.  **`controllers/`**: Nơi chứa logic xử lý thực sự. (Ví dụ: Khi gọi `/api/pois`, controller sẽ vào database lấy dữ liệu và trả về cho bạn).
4.  **`middleware/`**: Các "trạm kiểm soát". Ví dụ: Kiểm tra xem bạn đã đăng nhập chưa trước khi cho phép đăng bài.
5.  **`config/`**: Nơi cấu hình kết nối Database.
6.  **`utils/`**: Các hàm bổ trợ dùng chung (như hàm xử lý ảnh, hàm định dạng ngày tháng).

---
> **Tóm lại**: Toàn bộ hệ thống này là một sự kết hợp giữa JavaScript (xử lý logic) và PostgreSQL (lưu trữ dữ liệu), được bảo vệ bởi các lớp bảo mật tiêu chuẩn.
