# DMap — Project Specification (Phase 3 Rewrite)

> Community-driven accessibility map for disabled people in Ho Chi Minh City, Vietnam.
> Inspired by [wheelmap.org](https://wheelmap.org) with a more granular 1-10 scoring system.
> **V3 Architecture**: Next.js App Router, SCSS (Sass), MapLibre GL JS, Zustand.

---

## 1. Product Vision

DMap helps wheelchair users, visually impaired people, and others with disabilities find and rate accessible places in their city. Users can:
- Browse a high-performance WebGL map showing accessibility-scored locations.
- Filter places by disability type, category, and minimum score.
- Create an account to Add, Rate, Bookmark, and Report reviews.
- Business owners can Claim POIs to become verified managers.

## 2. Core Features

### 2.1 Map View (Home Page)
- Full-screen interactive map centered on Ho Chi Minh City (`[106.6280, 10.8540]`).
- Map tiles served from local `.mbtiles` via Martin Tile Server.
- POI markers (WebGL Symbols) color-coded by accessibility score (1-10).
- Floating Search Bar containing a **Hamburger/Menu button** that opens a left sidebar for advanced filters.
- Collision Detection ensures markers scale smoothly without overlapping.
- **Interaction**: Clicking a POI uses `flyTo()` to center the marker, and instantly slides out the POI Detail Panel.
- **Accessibility FAB**: A rounded Floating Action Button near the bottom-right corner provides quick access to High Contrast and Font Resizing toggles.

### 2.2 Accessibility Scoring (1-10 Scale)
This is the **key differentiator** from wheelmap.org's simple 3-color system.

- **9-10 (Tuyệt vời)**: Fully accessible, exceeds requirements.
- **7-8 (Tốt)**: Accessible with minor limitations.
- **5-6 (Trung bình)**: Partially accessible, some barriers.
- **3-4 (Kém)**: Significant barriers.
- **1-2 (Không thể tiếp cận)**: Not accessible.
- **0 (Chưa đánh giá)**: Not yet rated.

The overall score is computed from individual feature ratings per disability group:
- **Mobility** (♿): ramps, elevators, wide doors, accessible WC.
- **Visual** (👁️): braille signs, audio signals, tactile paving.
- **Hearing** (👂): sign language staff, visual alarms.
- **Cognitive** (🧠): simple signage, quiet spaces.

### 2.3 POI Detail Panel (Bottom Sheet / Sidebar)
- Slide-in M3 panel showing Name, Address, Overall Score, Photos, and Category.
- Accessibility breakdown: score per disability group and individual features.
- Community reviews list with photos and Helpful/Not Helpful reaction voting.
- Action Buttons: "Đánh giá" (Review), "Lưu" (Bookmark), "Báo Cáo" (Report), "Tìm Đường".

### 2.4 User Accounts & Authentication
- Secure JWT Auth via `HttpOnly` Cookies.
- View Contributions, Trust Score, and Saved Bookmarks.
- Only logged-in users can rate places or upload photos (Cloudinary integration).

### 2.5 Filters & Search
- Full-text autocomplete search by name or address.
- M3 Filter Chips: Category (restaurant, hospital), Disability Type.
- Minimum Score Slider (0-10).

### 2.6 Claiming & Admin Moderation
- Users can flag/report abusive POIs or Reviews.
- Businesses can submit a Claim Request to gain ownership of a POI.
- Admins can rollback malicious edits via Edit History API.

---

## 3. Technical Stack (V3 FE Update)

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | **Next.js 16+** (App Router, **TypeScript**) |
| **Map Engine** | **MapLibre GL JS** (Native Symbol Layers for rendering) |
| **Styling & UI** | **SCSS (Sass)** + **CVA/clsx** for scalable UI Components |
| **State Management** | **Zustand** (Strictly for Map/Filter state to prevent deep re-renders) |
| **Data Fetching** | **TanStack React Query v5** paired with **Axios** (Configured with `withCredentials`) |
| Backend API | Express.js (Node.js) — *V2 Already Built* |
| Database | PostgreSQL 15 + PostGIS — *V2 Already Built* |

### Key API Integration Specs
The backend provides 51 endpoints organized as follows. All responses follow `{ status, data, message }` structure.

**Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`.  
**POIs**: `GET /api/pois.geojson` (Bounding Box search), `GET /api/pois/:id`, `POST /api/pois`, `PUT /api/pois/:id`, `DELETE /api/pois/:id`.  
**Reviews & Reactions**: `GET/POST /api/pois/:id/reviews`, `POST /api/pois/:id/reviews/:review_id/helpful`.  
**Photos**: `POST /api/pois/:id/photos` (Multipart form to Cloudinary).  
**Bookmarks**: `GET /api/users/me/bookmarks`, `POST /api/pois/:id/save`.  
**Search**: `GET /api/search/autocomplete?q=...`.  
**Claims**: `POST /api/pois/:id/claim`.  
**Reports**: `POST /api/reviews/:review_id/report`, `POST /api/pois/:id/flag`.  
**Admin**: `GET /api/admin/reports`, `GET /api/admin/claims`, `POST /api/admin/rollback`.

---

## 4. Frontend Project Structure (Target)

DMap/frontend/
├── app/                  # Next.js App Router Setup
│   ├── (map)/            # Main map layout (Full Screen)
│   ├── (auth)/           # Login/Register Pages
│   └── globals.scss      # SCSS entry point + CSS Variables
├── components/
│   ├── map/              # MapCore.jsx, MapWrapper.jsx
│   ├── ui/               # Reusable SCSS Modules + CVA buttons, chips
│   └── panels/           # POIDetailPanel.jsx, FilterPanel.jsx
├── hooks/                # useMapStore.js (Zustand), useGeolocation.js
├── lib/                  # axios.js (axios instance), utils.js (CVA merge)
└── styles/               # Global SCSS mixins and functions
```

## 5. Implementation Constraints (The "Do It Right" Rule)
1. **SCSS Architecture**: All colors and padding MUST be defined in standard SCSS or SCSS Modules. Tailwind is entirely forbidden.
2. **Never store Map Instance in React Context**: Use `useRef` to store the map canvas to completely prevent React re-renders from destroying MapLibre state. Use `Zustand` to orchestrate interactions.
3. **Handle API Auth Errors Globally**: Let the Axios interceptor catch `401 Unauthorized` and trigger the Login Modal, rather than manually checking auth on every click.
4. **Collision Detection on Map**: Let MapLibre's `icon-allow-overlap: false` handle the scaling of pins when thousands of markers load in an area. Do not use React to hide/show pins dynamically based on zoom.
