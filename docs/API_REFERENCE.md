# DMap Backend API — Báo Cáo Chi Tiết cho Frontend

> **Version**: V3 | **Date**: 2026-03-28 | **Base URL**: `http://localhost:4000/api`
> **Total Endpoints**: 51 | **Auth**: httpOnly Cookie (auto-sent by browser)

---

## 📌 Response Format Chuẩn

```js
// Success
{ status: "success", data: <any> }
{ status: "success", data: [...], pagination: { limit, offset } }
{ status: "success", message: "..." }

// Error
{ status: "error", message: "..." }
{ status: "error", errors: [{msg, path, location}] } // validation errors

// NGOẠI LỆ: /api/pois.geojson → trả raw GeoJSON FeatureCollection
```

---

## 🔑 1. Authentication (5 endpoints)

| # | Method | Path | Body | Response `data` |
|---|--------|------|------|-----------------|
| 1 | POST | `/auth/register` | `{email, password, username?}` | `{user: {id,email,username,role,status}}` + set cookies |
| 2 | POST | `/auth/login` | `{email, password}` | `{user: {id,email,username,role,status}}` + set cookies |
| 3 | POST | `/auth/logout` | — | message |
| 4 | GET | `/auth/me` | — | `{user: {id,email,username,role,status,trust_score} \| null}` |
| 5 | POST | `/auth/refresh` | — | message + new access token cookie |

**FE Integration Notes**:
- Login/Register tự set cookie, FE chỉ cần `credentials: 'include'` trong `fetch()`
- `GET /auth/me` dùng để khôi phục session khi reload page
- Access token hết hạn sau 1h → call `/auth/refresh` (refresh token 7 ngày)

---

## 📂 2. Public Data (3 endpoints)

| # | Method | Path | Query Params | Response `data` |
|---|--------|------|-------------|-----------------|
| 6 | GET | `/categories` | — | `[{id, name, name_vi, icon}]` |
| 7 | GET | `/accessibility-features` | `?group=mobility` | `[{id, name, name_vi, icon, feature_group}]` |
| 8 | GET | `/search/autocomplete` | `?q=cafe` (min 2 chars) | `[{id, name, name_vi, address, category_name, category_icon, overall_score, relevance}]` (max 5) |

---

## 📍 3. POIs (11 endpoints)

### Đọc (Public)

| # | Method | Path | Query Params | Response |
|---|--------|------|-------------|----------|
| 9 | GET | `/pois` | `?category=&bbox=&min_score=&feature=&limit=50&offset=0` | `{data: [...], pagination}` |
| 10 | GET | `/pois/nearby` | `?lat=&lng=&radius=1000&limit=50` | `{data: [{...poi, distance_meters}]}` |
| 11 | GET | `/pois.geojson` | `?category=&min_score=&feature_group=&search=&min_lng=&min_lat=&max_lng=&max_lat=` | **Raw** GeoJSON `{type: "FeatureCollection", features: [...]}` |
| 12 | GET | `/pois/:id` | — | `{data: {poi..., permissions: {can_edit, can_delete}, accessibility_features: [...], reviews: [...]}}` |

### Ghi (Auth Required)

| # | Method | Path | Body | Auth | Response |
|---|--------|------|------|------|----------|
| 13 | POST | `/pois` | `{name, name_vi?, description?, address?, lat, lng, category_id, phone?, website?, opening_hours?, accessibility_features?: [...]}` | ✅ | `{data: {id, name, lng, lat, status}}` |
| 14 | PUT | `/pois/:id` | `{name?, name_vi?, description?, lat?, lng?, ...}` (all optional) | ✅ owner/admin | `{data: {id, name, lng, lat}}` |
| 15 | DELETE | `/pois/:id` | — | ✅ owner/admin | `{message}` (soft delete) |
| 16 | POST | `/pois/:id/flag` | `{reason}` | ✅ | `{data: {flag_count, is_hidden}}` |

**POI `status` Flow**: `pending` → `approved` / `rejected` (by admin)
**Permissions Object**: FE dùng `permissions.can_edit` để show/hide nút Edit/Delete

---

## ⭐ 4. Reviews (5 endpoints)

| # | Method | Path | Body | Auth | Response |
|---|--------|------|------|------|----------|
| 17 | GET | `/pois/:id/reviews` | — | — | `{data: [{id, poi_id, reviewer_name, rating, comment, disability_type, visited_at, created_at, helpful_count, image_url}]}` |
| 18 | POST | `/pois/:id/reviews` | `formdata: {rating(1-10), comment?, disability_type?, image?}` | ✅ | `{data: {review..., image_url}}` |
| 19 | PUT | `/pois/:id/reviews/:review_id` | `{rating?, comment?}` | ✅ owner/admin | `{data}` |
| 20 | DELETE | `/pois/:id/reviews/:review_id` | — | ✅ owner/admin | `{message}` |
| 21 | POST | `/pois/:id/reviews/:review_id/helpful` | — | ✅ | `{data: {helpful_count, action: 'added'\|'removed'}}` |

**FE Notes**:
- Reviews sorted by `helpful_count DESC` (most helpful first)
- Rating luôn 1-10, KHÔNG PHẢI 1-5
- Toggle helpful = POST cùng endpoint (add ↔ remove)

---

## 📸 5. Photos (2 endpoints)

| # | Method | Path | Body | Auth |
|---|--------|------|------|------|
| 22 | GET | `/pois/:id/photos` | — | — |
| 23 | POST | `/pois/:id/photos` | `formdata: {image, review_id?}` | ✅ |

---

## 🔖 6. Bookmarks (2 endpoints)

| # | Method | Path | Body/Query | Auth |
|---|--------|------|-----------|------|
| 24 | POST | `/pois/:id/save` | body: `{collection_name?: "Yêu thích"}` | ✅ |
| 25 | DELETE | `/pois/:id/save` | query: `?collection_name=Yêu thích` | ✅ |

> ⚠️ **DELETE dùng query params**, KHÔNG dùng body

---

## 🏢 7. Business Claiming (1 user endpoint)

| # | Method | Path | Body | Auth |
|---|--------|------|------|------|
| 26 | POST | `/pois/:id/claim` | `formdata: {document}` (PDF/image) | ✅ |

---

## 🚩 8. Review Reports (1 user endpoint)

| # | Method | Path | Body | Auth |
|---|--------|------|------|------|
| 27 | POST | `/reviews/:review_id/report` | `{reason}` (min 5 chars) | ✅ |

---

## 👤 9. User Profile (5 endpoints)

| # | Method | Path | Body | Response `data` |
|---|--------|------|------|-----------------|
| 28 | GET | `/users/profile` | — | `{id, email, username, role, status, created_at, trust_score}` |
| 29 | PUT | `/users/profile` | `{username?, oldPassword?, newPassword?}` | `{message}` |
| 30 | GET | `/users/profile/contributions` | `?limit=50&offset=0` | `{pois: [...], reviews: [...]}` |
| 31 | GET | `/users/profile/saved` | — | `{"Yêu thích": [{poi_id, name, ...}], ...}` |
| 32 | GET | `/users/leaderboard` | — | `[{id, username, trust_score, poi_count, review_count, total_contributions}]` (top 50) |

---

## 🛡️ 10. Admin Dashboard (16 endpoints) — `requireAdmin` / `requireAdminOrMod`

### POI Moderation (admin/mod)

| # | Method | Path | Body | Response |
|---|--------|------|------|----------|
| 33 | GET | `/admin/stats` | — | `{totalUsers, totalPois, pendingPois, flaggedPois}` |
| 34 | GET | `/admin/pois/pending` | — | `{data: [...]}` |
| 35 | PUT | `/admin/pois/:id/review` | `{status: 'approved'\|'rejected', note?}` | `{message}` |
| 36 | GET | `/admin/history` | `?limit=50&offset=0` | `{data, pagination}` |
| 37 | POST | `/admin/rollback/:history_id` | — | `{data: {poi_id}}` (admin only) |

### Flag Management (admin/mod)

| # | Method | Path | Response |
|---|--------|------|----------|
| 38 | GET | `/admin/flags` | `{data: [{id, name, flag_count, is_hidden, flags: [...]}]}` |
| 39 | POST | `/admin/flags/:id/resolve` | `{message}` |

### User Management (admin only)

| # | Method | Path | Body | Response |
|---|--------|------|------|----------|
| 40 | GET | `/admin/users` | `?limit=50&offset=0` | `{data, pagination}` |
| 41 | POST | `/admin/users` | `{email, password, role?, status?, username?}` | `{data: user}` |
| 42 | PUT | `/admin/users/:id` | `{role?, status?, trust_score?}` | `{data: user}` |
| 43 | DELETE | `/admin/users/:id` | — | `{message}` (soft delete) |
| 44 | PUT | `/admin/users/:id/status` | `{status: 'active'\|'banned'}` | `{message}` |

### Business Claims (admin/mod)

| # | Method | Path | Query/Body | Response |
|---|--------|------|-----------|----------|
| 45 | GET | `/admin/claims` | `?status=pending` | `{data: [{...claim, poi_name, poi_address, user_email}]}` |
| 46 | PUT | `/admin/claims/:id` | `{status: 'approved'\|'rejected', admin_note?}` | `{message}` |

### Review Reports (admin/mod)

| # | Method | Path | Query/Body | Response |
|---|--------|------|-----------|----------|
| 47 | GET | `/admin/reports` | `?status=pending` | `{data: [{...report, review_rating, review_comment, reporter_username}]}` |
| 48 | PUT | `/admin/reports/:id` | `{status: 'resolved'\|'dismissed', delete_review?: true}` | `{message}` |

---

## 🔧 FE Integration Checklist

- [ ] Mọi `fetch()` cần `credentials: 'include'` (gửi cookie)
- [ ] Response luôn có `.data.status` → check `=== 'success'`
- [ ] Data thực nằm ở `.data.data` (trừ GeoJSON là `.data` trực tiếp)
- [ ] Validation errors ở `.data.errors[]` (array of `{msg, path}`)
- [ ] Rating luôn 1-10 trên toàn hệ thống
- [ ] Pagination dùng `limit` + `offset` (không dùng `page`)
- [ ] Delete bookmark dùng query param, không dùng body
- [ ] Review image upload dùng `FormData`, không dùng JSON
