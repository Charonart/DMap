# DMap — Production Architecture Guidelines

> **Source of Truth**: Tuân thủ nghiêm ngặt để đảm bảo DMap không chỉ là MVP mà là một hệ thống thương mại (Production-Ready) có Kiến Trúc Sạch, An Toàn và Sẵn Sàng Mở Rộng (Scale-Ready).

## 1. Database & Caching (The Backbone)
- **Hệ quản trị**: PostgreSQL 15 + PostGIS.
- **Spatial Indexing (Bắt buộc)**: Mọi query quét tọa độ địa lý phải dùng index không gian lưới (`GIST Index`). Thay vì lấy toàn bộ POI, chỉ query trong Bounding Box của màn hình hiện tại (`ST_MakeEnvelope`).
- **Connection Pooling**: Backend Express phải cấu hình `pg-pool` để tái sử dụng kết nối thay vì liên tục mở kết nối mới gây tràn RAM.
- **Sẵn sàng cho Cache**: API phải được thiết kế dạng Phi trạng thái (Stateless) ngay từ đầu để sau này chỉ cần thả Redis vào giữa (Cache các Category, tính năng tiếp cận) mà không phải sửa code core.

## 2. Clean Architecture (Tách Lớp Kiến Trúc Code)
- **Backend (Express)**:
  - **Cấm** nhồi nhét mọi thứ vào vòng đời `server.js`.
  - Tuân thủ quy tắc 3 lớp: `Controllers` (Nhận/Trả Request) → `Services` (Chứa não xử lý logic tính điểm 1-10) → `Repositories` (Chỗ duy nhất đụng vào SQL Database).
- **Frontend (Next.js)**:
  - Tách bạch logic gọi API (`utils/api`) và Giao diện (Components).
  - Tối ưu MapLibre: Không nhét Map state vào cấp Component ngoài cùng (Root) gây Re-render diện rộng. Dùng `useRef` triệt để để bọc Map Instance nhằm khóa UI.

## 3. Deep Security & Web Hardening
- **Rate Limiting**: Áp đặt giới hạn băng thông (ví dụ: `express-rate-limit` cấm 1 IP POST quá 5 bài review/15 phút) để bóp nghẹt Bot Spam tọa độ.
- **Data Validation**: Không tin tưởng bất cứ Data nào đẩy từ Client. Mọi Input (đặc biệt text Review) phải đi qua chốt kiểm dịch (Middleware Zod/Joi) chống SQL Injection và XSS.
- **Network Headers**: Áp dụng thư viện `Helmet` và giới hạn `CORS` chỉ tin tưởng tên miền của Frontend Next.js.

## 4. Dockerization & Khả Năng Scale-out (Future Proof)
- **Runtime Hiện Tại**: Sử dụng **Docker Compose** làm tiêu chuẩn (1 cụm gồm DB, Martin Tile Server, Backend, Frontend).
- **Quy Tắc Vàng (Stateless)**: Không lưu bất kỳ File cấu hình, Session (Auth JWT/Cookies Token) hay Hình ảnh nào vào ổ cứng cục bộ (Local Disk) của Container Backend. Hình ảnh (V2) phải đẩy lên Cloud (S3/Cloudinary/R2).
- **Lợi ích Vàng**: Nhờ kiến trúc Stateless, DMap hiện tại chạy rất nhẹ trên Docker Compose 1 node. Giai đoạn đầu chưa cần áp dụng hệ thống cồng kềnh như Kubernetes ngay, nhưng nếu tương lai lượng User bùng nổ, cấu trúc này có thể Scale-Out bằng cách nhấc nguyên cụm Docker ném sang **Kubernetes (k8s)** hoặc AWS ECS nhân bản thành 10 Pod Server cân bằng tải mà không cần đập móng xây lại.
- **Môi trường (Envs)**: Phải duy trì nhánh Repository `Staging` để QA test nghiệm thu trước khi chạy lệnh CI/CD Deploy vào `Production`.

## 5. SEO & Core Web Vitals
- **Next.js SSR/SSG**: Các URL chia sẻ địa điểm (ví dụ: `dmap.vn/place/123`) ưu tiên Server-Side Rendering (SSR) để bung thẻ `<meta>` OpenGraph cho SEO và Facebook/Zalo Social Share hiển thị Thumbnail + Điểm 1-10.
- **Tốc độ (Web Vitals)**: Trì hoãn (Lazy Load) MapLibre JS script vài mili-giây đầu tiên để nhường băng thông Render Giao Diện Khung chữ (Skeleton). Đảm bảo điểm số LCP và CLS luôn đạt hạng Xanh trên PageSpeed Insights.

## 6. User-Centric Engineering (Kiến trúc xoay quanh Con Người)
Đặc thù của DMap là người khuyết tật, hệ thống User phải đạt chuẩn A11y cao nhất:
- **Xác thực Không-rào-cản (Accessible Auth)**: Bắt buộc tích hợp **OAuth 2.0 (Google/Facebook Login)**. Không ép người khiếm thị/vận động gõ Mật khẩu phức tạp. Lõi xác thực dùng **JWT (JSON Web Tokens)** lưu tại `HttpOnly Cookies`.
- **Hồ sơ Cá nhân hóa (Personalized Profiling)**: Điểm 1-10 phải được "uốn" theo từng User. Hệ thống lưu loại khuyết tật của User, và Next.js sẽ Highlight đúng các POI phù hợp với cơ địa của họ.
- **Quyền riêng tư (GDPR/Privacy)**: Không lưu IP. Cung cấp tính năng "Xóa toàn bộ dữ liệu của tôi" (Right to be forgotten) vì dữ liệu y tế/vị trí là cực kỳ nhạy cảm.
- **Gamification & Trust Score**: Không tính điểm trung bình cộng thô kệch. Backend sử dụng Thuật toán Trung bình có Trọng số (Weighted Average). User hoạt động lâu năm, upload ảnh thật sẽ có "Trust Score" cao, trọng số đánh giá x3 lần User mới.

## 7. Data Quality & Decay (Chống "Thối rữa" Dữ Liệu)
- **Vấn đề**: Một nhà hàng 10/10 hôm nay có thể xây lại và bít cửa xe lăn vào năm sau. Dữ liệu tĩnh sẽ giết chết người dùng.
- **Giải pháp**: Ứng dụng thuật toán **Sự phá hủy theo thời gian (Time-decay Rating)**. Các đánh giá cũ hơn 12 tháng sẽ bị trừ dần trọng số. UI sẽ tự động kích hoạt Cờ cảnh báo: *"Dữ liệu này đã cũ, bạn có muốn cập nhật không?"*

## 8. Offline & Connectivity (Sẵn Sàng Mất Mạng)
- **Vấn đề**: Người khuyết tật đang đi tìm đường trong trạm tàu điện ngầm hoặc vùng ven 4G yếu, rớt mạng = mất phương hướng.
- **Giải pháp**: Xây dựng kiến trúc **Progressive Web App (PWA)** tích hợp Service Workers. Caching lại toàn bộ vùng bản đồ (Tile Region) và data POI gần nhất. Cho phép load App và xem Map ngay cả khi "No Internet".

## 9. Legal & Reliability (Pháp Lý & Sự An Toàn)
- **Vấn đề**: Nếu app bảo 10/10, nhưng User xe lăn tới nơi bị mắc kẹt do sai số, họ có thể khởi kiện DMap.
- **Giải pháp**: Chèn **Terms of Service (ToS)** buộc đồng ý trước khi xem Map. Gắn Disclaimer (Cảnh báo miễn trừ trách nhiệm pháp lý) tại mỗi Modal Chi tiết địa điểm: *"Dữ liệu được đóng góp từ cộng đồng, xin vui lòng xác minh trước khi di chuyển"*.

---
**@SeniorDeveloper & @UIDesigner**: Kể từ nay, tài liệu Kiến trúc này (Architecture Document) là BỘ LUẬT bao trùm cả Technical lẫn Business. Mọi dòng Code và Commit không đạt chuẩn các mục trên sẽ bị Project Manager (PM) Request Changes vô điều kiện.
