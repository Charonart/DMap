# Kế Hoạch Tương Lai cho DMap (T21 - Phase 3)

Đây là tài liệu lưu trữ (Backlog) các Module tiếp theo của hệ thống, sẽ được phát triển sau khi Module 1 hoàn thành.

## 🌟 Module 2: Thả cảm xúc & Khóa xếp hạng (Gamification)
> *Google Maps cho phép Like review. Nó quyết định thuật toán Review nào nổi lên đầu tiên trên Panel chứ không chỉ xếp theo thời gian!*
- **Database**: Bảng `review_reactions (user_id, review_id, is_helpful)`.
- **APIs**:
  - `POST /api/pois/:id/reviews/:review_id/helpful`: Upvote cho 1 bài đánh giá sâu sắc.
  - `GET /api/pois/:id/reviews`: Phải sửa lại query để `ORDER BY helpful_count DESC, created_at DESC`. Càng hữu ích, càng đẩy lên Top.

## 🌟 Module 3: Claim POI (Xác nhận Doanh Nghiệp)
> *Google Maps có nhãn "Doanh nghiệp này đã được xác nhận" (Claimed).*
- **Phân tích**: Khuyến khích doanh nghiệp nhảy vào cải tạo cơ sở hạ tầng bằng cách cho họ quyền làm chủ địa điểm trên bản đồ.
- **Database**: Cột `is_claimed` và `owner_user_id` trong `pois`. Bảng `poi_claims` lưu giấy tờ/hình ảnh request.
- **APIs**:
  - `POST /api/pois/:id/claim`: Chủ quán upload giấy tờ đăng ký kinh doanh/hình ảnh gửi lên Admin.
  - `GET /api/admin/claims`: Danh sách Request cấp Tick xanh.
  - `PUT /api/admin/claims/:id`: Duyệt. Update `is_verified = TRUE` và đổi cờ sở hữu sang doanh nghiệp.

## 🌟 Module 4: Khung Tìm Kiếm (Geo-Search & Auto-Complete)
> *Hiện tại Search của ta chỉ là tìm tên chứa từ khóa (ILIKE). Google Maps dùng Indexing siêu tốc.*
- **Phân tích**: Cần API phục vụ cho thanh Search thả xuống với tốc độ mili-giây.
- **APIs**:
  - `GET /api/search/autocomplete?q=...`: Truy xuất siêu nhanh giới hạn 5 kết quả (Mẹo: Có thể dùng PostgreSQL Trigram FTS).
  - Tối ưu Indexing cho bảng `pois(name, address)`.

## 🌟 Module 5: Báo Cáo Chéo & Leaderboard (Cộng Đồng)
> *Google Maps có bảng xếp hạng Local Guide.*
- **Phân tích**: Cuộc chiến rank giữa các User để thúc đẩy việc đóng góp review.
- **APIs**:
  - `POST /api/reviews/:review_id/report`: Cờ báo cáo không chỉ đánh vào Tọa độ, mà phải đánh được vào các Bình luận lăng mạ/Chửi thề hoặc Ảnh rác.
  - `GET /api/users/leaderboard`: Xếp hạng 50 Kỵ Sĩ DMap đóng góp nhiều Review và POIs nhất (dựa trên `trust_score` và volume đóng góp).
