# DMap — Phase 2 Development Tasks (Production-Ready)

> **Source**: `docs/V2_PLANNING.md` & `docs/PRODUCTION_ARCHITECTURE.md`
> **Goal**: UI Polish, User Authentication, Moderation, and Anti-Exploit.

---

## ⚡ Priority Order
**Senior Developer** (T13-T14) sẽ được ưu tiên hoàn thiện toàn bộ chức năng (Functional Core) trước.
Sau khi chức năng hoàn thiện, **UI Designer** mới quay lại xử lý T10 (UI Polish).
Cuối cùng, **Reality Checker** chạy vòng QA chốt hạ ở T15.

---


## 💎 Senior Developer Tasks

### [x] T11: Xây dựng Hệ thống Xác thực (OAuth 2.0 / JWT)
**Description**: Trở thành hệ thống Stateless 100%. Sinh ra JWT lưu vào HttpOnly Cookie sau khi Login thành công. Tạo bảng `users` trong PostGIS.
**Acceptance Criteria**:
- Form Đăng Nhập / Đăng Ký.
- User chưa đăng nhập không được bấm Add POI.
- JWT Cookie chạy trơn tru, chống XSS.
**Files to create**: `backend/controllers/auth.js`, `frontend/components/AuthModal.jsx`, `data/v2_patch.sql`

### [x] T12: Chức năng Edit History (Audit Log) & Nút Rollback (Anti-Exploit)
**Description**: Bất kỳ sửa đổi/thêm mới/đánh giá nào cũng lưu JSON `previous_data` vào bảng `edit_history`. Xây dựng luồng Rollback Server-side (1 click phục hồi DB của Admin).
**Acceptance Criteria**:
- Xóa/Sửa POI tự động bắn log vào Database.
- Lệnh Rollback `POST /api/admin/rollback/:id` đổi ngược data thành công.
**Files to create/edit**: `backend/services/poi.js`, Database Schema.

### [x] T13: Thuật toán Time-Decay & Mở rộng Trọng số (Trust Score)
**Description**: 
1. Update API `GET /api/pois` để giảm trọng số điểm của Review cũ > 12 tháng.
2. Chấm điểm 1-10 không dựa vào trung bình cộng. Trọng số điểm được quyết định bởi `Trust Score` của người đánh giá.

### [x] T14: Hệ thống Cắm cờ (Flagging) & Admin Dashboard Mini
**Description**: Mở luồng Report sai sự thật. Admin Dashboard ẩn/hiện POI rác và Ban User.
**Acceptance Criteria**:
- Nút "Report" hoạt động.
- API lấy danh sách list bị cắm cờ.
- Chặn API từ các account có `status = 'banned'` lấy mẻ lưới cuối.

### [x] T16: Photo Uploads (`poi_photos`)
**Description**: Cho phép người dùng xác thực upload ảnh thực tế tại các POI để làm bằng chứng (Dốc/Khu vệ sinh/...).
**Acceptance Criteria**:
- API upload bằng `multer`.
- Schema `poi_photos` có liên kết.
- Detail Panel hiển thị Grid ảnh và nút Thêm Ảnh.

### [x] T17: Security Hardening API
**Description**: Bảo vệ Server Node.js trước Exploiter spam bots theo định chuẩn Production V2.
**Acceptance Criteria**:
- Cài `helmet` bảo vệ Headers.
- `express-rate-limit` chống spam API ồ ạt.
- `xss-clean` để rửa input text.

## 🎨 UI Designer Tasks

### [ ] T10: Revamp V1 Giao Diện (UI Polish Pass & Anti-Slop)
**Description**: Dọn dẹp cục diện "AI Slop" của bản V1 theo yêu cầu User. Đập đi xây lại cấu trúc CSS của toàn bộ Component (`POIDetailPanel`, `Filter`, `Marker`, `AddPOIForm`). Áp dụng chuẩn M3 hoặc cấu trúc thiết kế Clean hiện đại.
**Acceptance Criteria**:
- Giao diện đạt ngưỡng "Commercial/Production ready".
- Màu sắc bám sát 6-tier system.
**Files to edit**: `frontend/styles/*`

## 🧐 Reality Checker Tasks

### [ ] T15: Security & Architecture QA Pass (The V2 Audit)
**Description**: End-to-end đóng vai Bot Exploiter spam liên tục API xem Rate Limiting có block không. Nhúng mã HTML vào Text Input xem Middleware có chặn không. Khảo sát A11y của giao diện mới.
