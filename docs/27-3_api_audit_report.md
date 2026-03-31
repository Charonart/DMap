# 🔍 DMap Backend API — Audit Report

> **Auditor**: Senior Project Manager Agent
> **Date**: 2026-03-27
> **Scope**: All 9 route modules, 9 controllers, 2 middleware, server.js entry point
> **Total Endpoints Reviewed**: ~40 API endpoints

---

## Tổng quan

Backend DMap hiện có kiến trúc MVC tổ chức tốt (Router/Controller tách biệt). Tuy nhiên, sau khi review toàn bộ source code, phát hiện **~20 vấn đề** ở nhiều mức độ nghiêm trọng.

---

## 🔴 CRITICAL — Lỗi bảo mật nghiêm trọng

### 1. JWT Secret hardcode fallback
**File**: [auth.js](file:///d:/1._Project/DMap/backend/middleware/auth.js#L4)
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'dmap_v2_ultra_secret_jwt_key';
```
> [!CAUTION]
> Nếu `.env` thiếu `JWT_SECRET`, hệ thống sẽ tự dùng string cố định. Attacker chỉ cần đoán đúng string này → forge JWT token → chiếm bất kỳ tài khoản nào.
> **Fix**: Bỏ fallback, crash ngay khi thiếu biến môi trường.

---

### 2. `optionalAuth` không check banned user
**File**: [auth.js](file:///d:/1._Project/DMap/backend/middleware/auth.js#L22-L32)

| Middleware | Check banned? |
|---|---|
| `requireAuth` | ✅ Có — query DB check `status` |
| `optionalAuth` | ❌ Không — chỉ decode token, không check DB |

> [!WARNING]
> User bị banned vẫn có `req.user` đầy đủ khi đi qua `optionalAuth`. Hậu quả:
> - `GET /api/pois.geojson` (dùng `optionalAuth`) → banned admin/mod vẫn thấy POI pending/hidden
> - `GET /api/pois/:id` (dùng `optionalAuth`) → banned user vẫn được cấp `permissions.can_edit = true`

---

### 3. `requireAuth` dùng stale JWT payload
**File**: [auth.js](file:///d:/1._Project/DMap/backend/middleware/auth.js#L6-L19)
```javascript
req.user = decoded; // ← Dùng data từ JWT, KHÔNG phải từ DB
```
> [!WARNING]
> Middleware query DB để check `status` nhưng vẫn gán `req.user = decoded` (payload cũ từ token). Nếu admin đổi role user từ `admin` → `user` trong DB, token cũ vẫn giữ `role: 'admin'` trong tối đa **1 giờ** (JWT expiry). Mọi route check `req.user.role` sẽ bị bypass.
> **Fix**: Gán `req.user` từ DB query, không từ `decoded`.

---

### 4. Refresh Token dùng chung JWT_SECRET với Access Token
**File**: [authController.js](file:///d:/1._Project/DMap/backend/controllers/authController.js#L25-L26)
```javascript
const token = jwt.sign({...}, JWT_SECRET, { expiresIn: '1h' });
const refreshToken = jwt.sign({...}, JWT_SECRET, { expiresIn: '7d' });
```
> [!WARNING]
> Cả Access Token và Refresh Token đều ký bằng cùng `JWT_SECRET`. Attacker lấy được 1 token có thể dùng thay thế token kia. Refresh Token cũng không lưu DB → **không thể revoke** khi user đổi mật khẩu hoặc bị ban.

---

### 5. Admin Delete User = Hard Delete
**File**: [adminController.js](file:///d:/1._Project/DMap/backend/controllers/adminController.js#L56-L64)
```javascript
await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
```
> [!CAUTION]
> POIs dùng Soft Delete (`deleted_at`), nhưng Users lại bị **Hard Delete**. Mâu thuẫn với triết lý "bảo vệ đóng góng cộng đồng" đã nêu trong `STATUS.md`. User bị xóa → review CASCADE delete → mất hết data đánh giá.

---

## 🟠 HIGH — Lỗi logic quan trọng

### 6. Anti-Exploit middleware chạy TRƯỚC `express.json()`
**File**: [server.js](file:///d:/1._Project/DMap/backend/server.js#L34-L44)
```javascript
app.use((req, res, next) => { delete req.body.id; next(); }); // Line 35-40
app.use(express.json()); // Line 44 — parse JSON AFTER the check
```
> [!IMPORTANT]
> `req.body` chưa được parse tại thời điểm middleware chạy → `req.body` luôn = `undefined` → middleware **hoàn toàn vô dụng**. Body chỉ có data sau khi `express.json()` chạy xong.

---

### 7. `GET /api/pois` thiếu `optionalAuth` → không phân biệt admin/user
**File**: [poiRoutes.js](file:///d:/1._Project/DMap/backend/routes/poiRoutes.js#L8)
```javascript
router.get('/', poiController.getPois); // Không có auth middleware nào
```
So sánh:
- `GET /api/pois.geojson` → có `optionalAuth` → admin thấy pending POI ✅
- `GET /api/pois` → không có auth → **luôn filter `status = 'approved'`** → admin search cũng không thấy pending ✅ (đúng nhưng inconsistent)
- `GET /api/pois/nearby` → có `optionalAuth` nhưng controller **không dùng `req.user`** gì cả → middleware thừa

---

### 8. Review Upload dùng Local Disk, Photo Upload dùng Cloudinary
| Controller | Upload method |
|---|---|
| [reviewController.js](file:///d:/1._Project/DMap/backend/controllers/reviewController.js#L6-L30) | `multer.diskStorage()` → save local `/uploads/` |
| [photoController.js](file:///d:/1._Project/DMap/backend/controllers/photoController.js#L7-L23) | `multer.memoryStorage()` → upload Cloudinary |

> [!WARNING]
> Cùng 1 ứng dụng nhưng 2 bộ upload khác nhau. Review ảnh lưu local (sẽ mất nếu restart Docker container), POI ảnh lưu Cloudinary. **Không nhất quán** và local upload đã từng được quyết định loại bỏ theo `STATUS.md` entry T22.

---

### 9. `updatePoi` audit log ghi `poi_id` sai
**File**: [poiController.js](file:///d:/1._Project/DMap/backend/controllers/poiController.js#L300-L303)
```javascript
'INSERT INTO edit_history (user_id, poi_id, previous_data, action_type) VALUES ($1, $2, $3, $4)',
[req.user.id, Object.keys(oldPoi).length ? req.params.id : null, ...]
```
> Điều kiện `Object.keys(oldPoi).length ? ...` luôn truthy (object luôn có keys) → vô nghĩa. Nên đơn giản: `[req.user.id, req.params.id, ...]`

---

### 10. Rollback Delete → `ON CONFLICT DO NOTHING` = nuốt lỗi lặng
**File**: [poiController.js](file:///d:/1._Project/DMap/backend/controllers/poiController.js#L387-L392)
```javascript
INSERT INTO pois (...) VALUES (...) ON CONFLICT (id) DO NOTHING
```
> Nếu POI đã tồn tại (chưa xóa vật lý, chỉ soft-delete), `DO NOTHING` sẽ **không restore** mà cũng **không báo lỗi**. Cần `DO UPDATE SET deleted_at = NULL` thay vì `DO NOTHING`.

---

### 11. Rollback không restore `deleted_at`, `status`, `is_hidden`
**File**: [poiController.js](file:///d:/1._Project/DMap/backend/controllers/poiController.js#L387-L400)

Soft Delete set `deleted_at = CURRENT_TIMESTAMP`, nhưng Rollback insert lại POI mới **không reset** `deleted_at` về `NULL`. POI được "khôi phục" nhưng vẫn bị filter bởi `WHERE deleted_at IS NULL`.

---

## 🟡 MEDIUM — Vấn đề thiết kế/nhất quán

### 12. Response format không nhất quán

| Controller | Success Response |
|---|---|
| `categoryController` | `res.json(rows)` — array trực tiếp |
| `photoController` | `res.json({ status: 'success', data: rows })` — wrapped |
| `poiController` | `res.json(rows)` — array trực tiếp |
| `bookmarkController` | `res.json({ message: '...', bookmark: rows[0] })` — message |
| `authController` | `res.json({ user: {...} })` — wrapped |

> [!NOTE]
> Không có chuẩn response envelope. Backend chuẩn nên dùng format thống nhất, ví dụ: `{ status, data, message, error }`.

---

### 13. Error response format không nhất quán

| Controller | Error Response |
|---|---|
| authController | `{ error: '...' }` |
| photoController | `{ status: 'error', message: '...' }` |
| validators | `{ errors: [...] }` — array |
| bookmarkController | `{ error: '...' }` |

---

### 14. `getPois` không có pagination
**File**: [poiController.js](file:///d:/1._Project/DMap/backend/controllers/poiController.js#L3-L57)

`GET /api/pois` trả về **tất cả** POI matching filter, không có `LIMIT/OFFSET`. Nếu DB có 10,000+ POI → response khổng lồ, crash browser.

So sánh: `getPoiGeoJson` có `LIMIT 500`, `getUsers` có pagination. Nhưng `getPois`, `getContributions`, `getReviews` thì không.

---

### 15. Admin routes thiếu middleware `requireAdmin` tập trung
**File**: [adminRoutes.js](file:///d:/1._Project/DMap/backend/routes/adminRoutes.js)

Mỗi controller function tự check role ở đầu:
```javascript
if (req.user.role !== 'admin') return res.status(403)...
```
> Duplicate code ở 10+ chỗ. Nên tạo middleware `requireAdmin` hoặc `requireRole('admin')` và apply 1 lần ở route level.

---

### 16. `updatePoi` không có `validatePoi` validation
**File**: [poiRoutes.js](file:///d:/1._Project/DMap/backend/routes/poiRoutes.js#L13-L14)
```javascript
router.post('/', requireAuth, validatePoi, poiController.createPoi); // ✅ có validation
router.put('/:id', requireAuth, poiController.updatePoi); // ❌ không validation
```
> Create POI có `express-validator`, nhưng Update POI thì KHÔNG. User có thể gửi data bẩn khi edit.

---

### 17. `login` endpoint thiếu validation
**File**: [authRoutes.js](file:///d:/1._Project/DMap/backend/routes/authRoutes.js#L7)
```javascript
router.post('/register', validateRegister, authController.register); // ✅
router.post('/login', authController.login); // ❌ không validate
```

---

### 18. `addReview` validate rating nhưng **sau khi** parse `req.body`
**File**: [reviewController.js](file:///d:/1._Project/DMap/backend/controllers/reviewController.js#L56-L59)

Rating validation nằm trong controller thay vì middleware. Nên dùng `express-validator` thống nhất.

---

## 🔵 LOW — Cải thiện chất lượng code

### 19. `GET /api/pois/:id` hở data user review
**File**: [poiController.js](file:///d:/1._Project/DMap/backend/controllers/poiController.js#L206-L209)
```javascript
pool.query('SELECT * FROM user_reviews WHERE poi_id = $1', [req.params.id])
```
> `SELECT *` trả về **tất cả** cột bao gồm `user_id` (UUID) cho mọi anonymous visitor. Nên SELECT cụ thể, loại bỏ data nhạy cảm.

---

### 20. `createUser` admin không validate input
**File**: [adminController.js](file:///d:/1._Project/DMap/backend/controllers/adminController.js#L30-L41)

Admin tạo user mới không có validation email/password. Có thể tạo user với password rỗng hoặc email sai format.

---

### 21. `unsavePoi` dùng DELETE method nhưng đọc `req.body`
**File**: [bookmarkController.js](file:///d:/1._Project/DMap/backend/controllers/bookmarkController.js#L45)
```javascript
const collectionName = req.body.collection_name;
```
> [!NOTE]
> HTTP DELETE request gửi body là **non-standard** (RFC 7231). Nhiều client/proxy strip body khỏi DELETE request. Nên dùng query parameter thay thế.

---

### 22. `xss-clean` package đã deprecated
**File**: [package.json](file:///d:/1._Project/DMap/backend/package.json#L23)
```json
"xss-clean": "^0.1.4"
```
> Package `xss-clean` đã **deprecated** trên npm, không còn maintain. Nên dùng `helmet` CSP hoặc custom sanitizer.

---

## 📊 Tóm tắt theo severity

| Severity | Count | Cần fix ngay? |
|---|---|---|
| 🔴 CRITICAL | 5 | ✅ Phải fix trước deploy |
| 🟠 HIGH | 6 | ✅ Fix trong sprint này |
| 🟡 MEDIUM | 7 | ⚠️ Fix trước production |
| 🔵 LOW | 4 | 💡 Nên cải thiện |

---

## 🎯 Đề xuất ưu tiên fix

1. **Ngay lập tức**: Fix JWT Secret fallback (#1), Anti-Exploit middleware order (#6), `requireAuth` dùng DB data (#3)
2. **Trong tuần**: Thống nhất upload strategy (#8), fix Rollback logic (#10, #11), thêm pagination (#14)
3. **Trước production**: Chuẩn hóa response format (#12, #13), thêm validation thiếu (#16, #17), tạo `requireAdmin` middleware (#15)
