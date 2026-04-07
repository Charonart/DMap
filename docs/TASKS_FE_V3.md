# DMap — Frontend Development Tasks (V3 Rewrite)

> **Source**: `docs/SPEC.md`, `docs/DESIGN.md`, `docs/AGENT_RULES.md`
> **Stack MANDATORY**: Next.js 16+ App Router, TypeScript, SCSS (Sass) Modules, MapLibre GL JS, Zustand, TanStack React Query v5, Axios, CVA.

---

## Task Management Guidelines
- **Developer**: Read `docs/AGENT_RULES.md` Section 9 before you begin. You are barred from modifying anything outside the `frontend/` folder unless explicitly tasked.
- Each ticket is designed for 30-60 minutes. Update `[x]` upon completion.
- After completing a major Phase, log it in `docs/STATUS.md`.

---

## Task List

### Phase 1: Móng Nhà (Infrastructure Setup)

#### [x] T_FE_1.1: Trấn Chỉnh Cấu Hình SCSS & CVA
**Description**: Hiện tại `frontend` đã có Next.js và TypeScript. Nhiệm vụ của bạn là cài đặt thêm thư viện `class-variance-authority`, `clsx`, và `lucide-react`. Sau đó cấu hình file Global Sass (`app/globals.scss`) để thêm các mã màu 1-10 (`--color-score-excellent`), M3 primary colors `#0b57d0`, và cấu trúc biến dùng chung. Tạo file `lib/utils.ts` xuất hàm `cn()`.
**Acceptance Criteria**:
- `lib/utils.ts` tồn tại và merge class không lỗi với CVA.
- File `globals.scss` được update đủ hệ màu M3 và kiến trúc variables/mixins theo `DESIGN.md`.

#### [x] T_FE_1.2: Thiết lập Tầng Data Fetching (Axios + React Query)
**Description**: Cài `axios` và `@tanstack/react-query`. Cấu hình Provider cho nó.
**Acceptance Criteria**:
- Sinh `lib/axios.ts` chứa Base Instance có `withCredentials: true`, và `response.data` extractor form `{ status, data, message }`.
- Sinh `components/providers/QueryProvider.tsx` bọc quanh layout root của Next.js.
- Bắt lỗi HTTP 401 tự động clear credentials/bắn Event mở Modal Login.

#### [x] T_FE_1.3: Khởi tạo Zustand Map Store 
**Description**: Xóa hết thói quen dùng setState() hỗn loạn khi kéo Map. Cài `zustand`.
**Acceptance Criteria**:
- Tạo `hooks/useMapStore.ts`. Store chứa: `viewState` (zoom, pitch, center), `bbox`, và `selectedPoiId`.
- Dữ liệu store này sẽ được chia sẻ cho cả `<MapCore>` và `<FilterPanel>`.

---

### Phase 2: Hệ Thống Component Tiêu Chuẩn (Design System)

#### [ ] T_FE_2.1: Bảng điều khiển Button & Badge UI Component (`cva`)
**Description**: Thiết kế cục tính năng chuẩn Material 3 để tái sử dụng bằng CVA và SCSS Modules.
**Acceptance Criteria**:
- `components/ui/Button.tsx` (kèm `Button.module.scss`): chứa các biến thể (primary, outline, ghost, FAB) bằng `cva`.
- `components/ui/ScoreBadge.tsx`: nhận prop `score` (0-10) -> render ra cái Badge điểm có nền tương ứng bằng biến (--color-score-).

#### [ ] T_FE_2.2: Bố cục Layout Tổng Thể (Search & FABs)
**Description**: Xây dựng UI Vỏ cho Desktop & Mobile tại `app/(map)/page.tsx` (Chưa nhét map vào, chỉ xây Vỏ).
**Acceptance Criteria**:
- Search Bar nằm lửng lơ trên cùng, có nút Hamburger gọi Sidebar ở bên mép.
- Cụm nút Trợ năng (`Accessibility FAB`) nổi góc phải dưới.

---

### Phase 3: Bản Đồ Lõi (Map Engine)

#### [ ] T_FE_3.1: Nhúng Bản Đồ MapLibre (`MapCore.tsx`)
**Description**: Cài `maplibre-gl`. Tạo `div` canvas. Config trỏ tile server về `localhost:3636`.
**Acceptance Criteria**:
- Map kéo thả siêu nhanh, dùng `useRef` chống re-render vô lý khi React thay đổi UI.
- Initial center là `[106.6280, 10.8540]` (City Center Ho Chi Minh).

#### [ ] T_FE_3.2: Render Điểm Đánh Giá Lên Bản Đồ (React Query data)
**Description**: Viết hook `usePoisQuery()` xài Axios gọi `GET /api/pois.geojson`. Dùng layer native `map.addLayer({ type: 'symbol' })` để nhúng các icon POI lên bản đồ.
**Acceptance Criteria**:
- Kéo qua/kéo lại bản đồ -> update `bbox` trên zustand -> React Query tự gọi API lại với debounce -> update source json cho map tự vẽ lại point.
- Áp dụng cấu hình Collision (`icon-allow-overlap: false`) để tránh POI chèn chúc.

#### [ ] T_FE_3.3: Sự Kiện Bấm POI -> FlyTo
**Description**: Map bắt sự kiện Click vào feature trên map. Chạy hàm `flyTo()` của maplibre đưa point đấy vào trung tâm camera. Đồng thời set `selectedPoiId` vào Zustand để kích hoạt bắn bảng Panel ngang.

---

### Phase 4: Lắp Ghép Tính Năng V3 (Hệ API Mới)

#### [ ] T_FE_4.1: Xây Dựng Bảng Chi Tiết POI (Slide Panel M3)
**Description**: Màn hình Slide bửa ra từ góc phải (cạnh Search bar) nếu có `selectedPoiId`. Dùng useQuery fetch `GET /api/pois/:id`.
**Acceptance Criteria**:
- Vẽ thang điểm Bar bằng tính toán inline width `style={{ width: '80%' }}`.
- Hiển thị comment, hình ảnh upload.
- Menu 3 nút [Save], [Write Review], [Report].

#### [ ] T_FE_4.2: Tích Hợp Đăng Nhập & Hồ Sơ (Auth Flow)
**Description**: Triển khai `LoginModal.tsx` và API gọi `/api/auth/me`. 
**Acceptance Criteria**:
- Lấy thành công cookie HttpOnly, hiện tên User.
- Dùng Auth chặn các hành vi bấm "Add Note", "Rate". Nếu chưa Auth -> popup form login.

#### [ ] T_FE_4.3: Tính năng Create POI Component Modal
**Description**: Bấm FAB Thêm Điểm. Pick trên map. 
**Acceptance Criteria**:
- Flow Create gọi thành công `/api/pois`. Validation form bằng React Hook Form để user không gửi rác/thiếu name.
- React Query invalidates lại data POIs để hiển thị ngay cục pin đó.
