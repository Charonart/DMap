# DMap — Development Tasks

> **Source**: [SPEC.md](file:///d:/1._Project/DMap/docs/SPEC.md)
> **Stack**: Next.js + MapLibre + Express.js + PostGIS
> **Map Center**: `[106.6280, 10.8540]` (Quang Trung Q12)

---

## ⚡ Priority Order

Work flows in this order: **UI Designer first** → then **Senior Developer** → then **Reality Checker**.
Some tasks can run in parallel (marked below).

---

## 🎨 UI Designer Tasks

### [ ] T1: Define Complete Design System

**SPEC Reference**: §2.2, §3 (Font row)
**Description**: Fill in `docs/DESIGN.md` with the full design system. Define all CSS custom properties, the scoring color palette (1-10 → 6 tiers), typography, spacing, and component specifications.
**Acceptance Criteria**:

- 6-tier scoring colors defined with hex values
- Colors are color-blind safe (tested with simulation)
- Font choice specified with fallback stack
- Spacing scale defined (4px base)
- All text passes WCAG AA (4.5:1 contrast ratio)
- Component specs for: map pins, POI popup, detail panel, filter panel, add form, toolbar

**Files to create/edit**: `docs/DESIGN.md`

### [x] T1.5: UI Aesthetic Redesign (M3 Strict)
**Description**: Fully implement strict Material Design 3 styling across components (removing previous Glassmorphism attempts). Enhance `.layer` visuals, hover states, scrollbars, and progress bars.
**Files to create/edit**: `frontend/styles/globals.css`, component CSS modules.

---

## 💎 Senior Developer Tasks

> ⚠️ Wait for T1 (design system) before starting T3-T5. T2 can start immediately.

### [ ] T2: Set Up Next.js + MapLibre Frontend

**SPEC Reference**: §2.1, §3, §4
**Description**: Initialize Next.js project in `frontend/`. Add MapLibre GL JS. Create the base map page that shows tiles from Martin at `localhost:3636`, centered on Quang Trung Q12.
**Acceptance Criteria**:

- `npm run dev` starts Next.js at localhost:3000
- MapLibre map renders full-screen with tiles from Martin
- Map centered on `[106.6280, 10.8540]`, zoom 14
- No console errors

**Files to create**: `frontend/` directory with Next.js project

### [ ] T3: POI Markers on Map

**SPEC Reference**: §2.1, §2.2
**Description**: Fetch POIs from `GET /api/pois.geojson` and display as markers on the map. Color-code markers by `overall_score` using the 6-tier scale from `DESIGN.md`.
**Depends on**: T1 (colors), T2 (map)
**Acceptance Criteria**:

- Markers appear on map from API data
- Marker colors match score tiers from DESIGN.md
- Clicking a marker shows a popup (name, score, category)
- Popup has "View Details" button

**Files to create**: `frontend/components/Map.jsx`, `frontend/components/POIPopup.jsx`

### [x] T3.5: WebGL Architecture Upgrade

**SPEC Reference**: §2.1 (Performance)
**Description**: Major architecture upgrade to replace HTML DOM markers with Native WebGL Canvas rendering via MapLibre `SymbolLayer`. Includes dynamic SVG to Canvas image generation and native collision detection.
**Acceptance Criteria**:
- `updateMarkerVisibility` logic replaced by WebGL `interpolate` expressions
- Map handles hundreds of markers smoothly without frame drops
- Collision detection (`icon-allow-overlap: false`) works correctly

### [ ] T4: POI Detail Panel

**SPEC Reference**: §2.3
**Description**: Side panel (right) that opens when "View Details" is clicked. Shows full POI info: name, address, score, category, accessibility breakdown by disability group, reviews.
**Depends on**: T3
**Acceptance Criteria**:

- Panel slides in from right on desktop
- Bottom sheet on mobile (< 768px)
- Shows accessibility features grouped by: mobility, visual, hearing, cognitive
- Shows individual feature ratings (1-10)
- Shows community reviews
- Has "Get Directions" button (opens Google Maps)

**Files to create**: `frontend/components/POIDetailPanel.jsx`

### [ ] T5: Add POI Form

**SPEC Reference**: §2.4
**Description**: Form to add a new place. User clicks "Add Place" → clicks map to set location → fills form → submits via `POST /api/pois`.
**Depends on**: T2
**Acceptance Criteria**:

- Click map sets marker at location
- Form fields: name, address, category (dropdown)
- Rate each accessibility feature with 1-10 slider + optional note
- Submit saves to database via API
- New marker appears on map after submit

**Files to create**: `frontend/components/AddPOIForm.jsx`

### [ ] T6: Search and Filters

**SPEC Reference**: §2.5
**Description**: Filter panel with: search by name, filter by category, filter by feature group, filter by minimum score.
**Depends on**: T3
**Acceptance Criteria**:

- Search by name filters markers on map
- Category dropdown filters markers
- Feature group toggles (mobility/visual/hearing/cognitive)
- Minimum score slider (1-10)
- Filters call API with query params and update map

**Files to create**: `frontend/components/AccessibilityFilter.jsx`

### [x] T7: Accessibility Toolbar

**SPEC Reference**: §2.6
**Description**: Floating toolbar (top-right) with font size +/-, high contrast toggle, and screen reader support.
**Depends on**: T1 (design tokens)
**Acceptance Criteria**:

- Font size increase/decrease works on all text
- High contrast toggle changes CSS custom properties
- All interactive elements have ARIA labels
- Keyboard navigation works logically

**Files to create**: `frontend/components/AccessibilityToolbar.jsx`

### [ ] T8: Review Backend Code

**SPEC Reference**: §3
**Description**: Review and validate the existing `backend/server.js` and `data/init.sql`. Fix any issues. Ensure Docker setup works (`docker compose down -v && docker compose up -d`).
**Acceptance Criteria**:

- `docker compose up` starts db + martin without errors
- `curl localhost:4000/api/health` returns ok
- All API endpoints from SPEC §3 work correctly
- Sample POIs appear in Q12 area
- All ratings use 1-10 scale

**Files to review**: `backend/server.js`, `data/init.sql`, `docker-compose.yml`, `.env`

---

## 🧐 Reality Checker Tasks

### [x] T9: Full QA Pass

**Depends on**: T1-T8 all complete
**Description**: Run the full QA checklist from your SKILL.md. Test infrastructure, API, frontend, accessibility, and spec compliance.
**Acceptance Criteria**:

- QA report written to `docs/STATUS.md`
- Every SPEC §2.1-2.6 requirement checked
- All API endpoints tested with curl
- Browser testing for UI
- Accessibility checks (contrast, touch targets, keyboard nav)
- Honest rating given

---

## 📝 Summary

| Task | Agent | Depends On | Status |
|------|-------|-----------|--------|
| T1: Design System | UI Designer | — | [x] |
| T1.5: UI M3 Redesign | UI Designer | T1 | [x] |
| T2: Next.js + MapLibre Setup | Developer | — | [x] |
| T3: POI Markers | Developer | T1, T2 | [x] |
| T3.5: WebGL Marker Upgrade | Developer | T3 | [x] |
| T4: POI Detail Panel | Developer | T3 | [x] |
| T5: Add POI Form | Developer | T2 | [x] |
| T6: Search & Filters | Developer | T3 | [x] |
| T7: Accessibility Toolbar | Developer | T1 | [x] |
| T8: Review Backend | Developer | — | [x] |
| T9: Full QA Pass | Reality Checker | T1-T8 | [x] |
