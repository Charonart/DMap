# V2 Planning: Security, Auth & Moderation

> Tài liệu này được chuẩn bị bởi Senior Project Manager, mô tả Sơ đồ Cơ sở dữ liệu (ERD) và Use Case cho giai đoạn V2. Mục tiêu tối thượng của V2 là Bảo mật, Phân quyền (Roles) và Chống Phá Hoại (Exploiter Defense).

## 1. V2 Entity Relationship Diagram (ERD)

Mở rộng cấu trúc gốc (PostGIS) bằng việc gắn thêm vòng bảo vệ Auth, Kiểm duyệt (Moderation) và lưu Log Server (Audit).

```mermaid
erDiagram
    users {
        int id PK
        string email
        string password_hash
        string role "user, moderator, admin"
        string status "active, banned"
        timestamp created_at
    }
    categories {
        int id PK
        string name "Ví dụ: Nhà hàng, Công viên"
        string icon "Tên icon hiển thị"
    }
    pois {
        int id PK
        string name "Tên địa điểm"
        string address "Địa chỉ"
        geometry geom "Tọa độ PostGIS"
        float overall_score "Điểm trung bình (1-10)"
        int category_id FK
        int created_by FK "Tham chiếu user_id"
    }
    accessibility_features {
        int id PK
        string name "Ví dụ: Dốc xe lăn, Chữ nổi"
        string group_type "mobility, visual, hearing, cognitive"
    }
    poi_accessibility {
        int poi_id FK
        int feature_id FK
        int rating "Điểm 1-10"
        int user_id FK "Ai đánh giá?"
        text notes
    }
    user_reviews {
        int id PK
        int poi_id FK
        int user_id FK "Người viết"
        int rating "1-10"
        text comment
        timestamp created_at
    }
    edit_history {
        int id PK
        int user_id FK "Người sửa"
        int poi_id FK
        jsonb previous_data "Dữ liệu JSON để rollback"
        timestamp edited_at
    }
    reports {
        int id PK
        int reporter_id FK "Người report"
        string target_type "poi, review, user"
        int target_id
        string reason "Spam, sai sự thật"
        string status "pending, resolved, dismissed"
    }
    poi_photos {
        int id PK
        int poi_id FK
        int user_id FK
        string image_url
        boolean is_verified "Admin duyệt chưa?"
    }

    users ||--o{ pois : "tạo"
    users ||--o{ user_reviews : "viết"
    users ||--o{ edit_history : "thực hiện"
    users ||--o{ reports : "báo cáo"
    users ||--o{ poi_photos : "upload"
    users ||--o{ poi_accessibility : "chấm điểm"
    
    categories ||--o{ pois : "thuộc nhóm"
    pois ||--o{ poi_accessibility : "được đánh giá bằng"
    accessibility_features ||--o{ poi_accessibility : "áp dụng cho"
    pois ||--o{ user_reviews : "nhận review"
    pois ||--o{ edit_history : "lưu lịch sử"
    pois ||--o{ poi_photos : "có hình ảnh thực tế"
```

## 2. V2 Use Case Diagram (Roles & Moderation)

Sơ đồ phân quyền tương tác, thiết lập hệ thống Tường lửa Bảo vệ Dữ liệu (Moderation & Rollback) để ngăn chặn Exploiter tạo Rác/Spam Tọa Độ.

```mermaid
flowchart LR
    Guest([Khách Vãng Lai])
    User([Thành Viên Đóng Góp])
    Mod([Moderator Kiểm Duyệt])
    Admin([Quản Trị Viên Hệ Thống])

    subgraph DMap Core - V2
        V(Xem Bản đồ & Lọc 1-10)
        A(Thêm POI & Đánh giá tính năng)
        R(Cắm cờ Report POI/Review giả mạo)
        P(Tải lên hình minh chứng Dốc/Khu vệ sinh)
    end

    subgraph Security & Admin Dashboard
        M1(Duyệt/Xóa Report)
        M2(Duyệt độ tin cậy của Ảnh)
        A1(Khóa Tài Khoản - Ban Exploiter)
        A2(Click 1 nút Rollback lại Database)
    end

    Guest --> V
    User --> V
    User --> A
    User --> R
    User --> P

    Mod --> M1
    Mod --> M2

    Admin --> M1
    Admin --> M2
    Admin --> A1
    Admin --> A2
```

## 3. Kiến Trúc Chống Phá Hoại (Anti-Exploit Architecture)
1. **Khách vãng lai** chỉ được xem bản đồ, đọc review, và sử dụng thanh Toolbar tiếp cận (Zoom Font, High Contrast).
2. **Thành viên đóng góp** phải được xác thực (Login/Auth) mới được cắm Marker mới lên PostGIS, chấm điểm (Rating) và đăng ảnh.
3. Khi xảy ra hành vi **Spam Bot / Phá Hoại (Kéo tool xả tọa độ sai/rác)**: Các User thường sẽ dùng luồng báo cáo sai phạm `reports`.
4. **Moderator / Admin** lập tức khóa mõm (Ban User) những tài khoản này. Sau đó, thay vì Server nổ tung, Admin sử dụng bảng `edit_history` (Audit Log chứa toàn bộ log API theo dạng Json) tải lại phiên bản DMap "5 phút trước vụ phá hoại" cực kỳ mượt mà.
