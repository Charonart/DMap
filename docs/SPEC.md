# DMap — Project Specification

> Community-driven accessibility map for disabled people in Ho Chi Minh City, Vietnam.
> Inspired by [wheelmap.org](https://wheelmap.org) with a more granular 1-10 scoring system.

---

## 1. Product Vision

DMap helps wheelchair users, visually impaired people, and others with disabilities find and rate accessible places in their city. Users can:
- Browse a map showing accessibility-scored locations
- Filter places by disability type and accessibility features
- Add new places and rate their accessibility (1-10)
- Read and write community reviews

## 2. Core Features

### 2.1 Map View (Home Page)
- Full-screen interactive map centered on Ho Chi Minh City
- Map tiles served from OpenFreeMap / local .mbtiles via Martin
- POI markers color-coded by accessibility score (1-10)
- Click marker → show POI popup with name, score, category
- Click "View Details" → open side panel

### 2.2 Accessibility Scoring (1-10 Scale)
This is the **key differentiator** from wheelmap.org's simple 3-color system.

| Score | Label | Color | Meaning |
|-------|-------|-------|---------|
| 9-10 | Excellent | *TBD — UI Agent* | Fully accessible, exceeds requirements |
| 7-8 | Good | *TBD — UI Agent* | Accessible with minor limitations |
| 5-6 | Fair | *TBD — UI Agent* | Partially accessible, some barriers |
| 3-4 | Poor | *TBD — UI Agent* | Significant barriers |
| 1-2 | Inaccessible | *TBD — UI Agent* | Not accessible |
| 0 | Unrated | *TBD — UI Agent* | Not yet rated |

> **Note**: Exact color palette will be defined in `docs/DESIGN.md` by the UI Agent.

The overall score is computed from individual feature ratings per disability group:
- **Mobility** (♿): ramps, elevators, wide doors, accessible WC, flat surfaces
- **Visual** (👁️): braille signs, audio signals, tactile paving, high-contrast signs
- **Hearing** (👂): sign language staff, visual alarms, hearing loops
- **Cognitive** (🧠): simple signage, quiet spaces

### 2.3 POI Detail Panel
- Slide-in panel from right side (bottom sheet on mobile)
- Shows: name, address, overall score, category, description
- Accessibility breakdown: score per disability group
- Individual feature ratings with notes
- Community reviews list
- "Get Directions" button (opens Google Maps)

### 2.4 Add/Rate a Place
- Click "Add Place" → click on map to set location
- Fill form: name, address, category
- Rate each accessibility feature (1-10 slider + optional note)
- Submit → saves to database

### 2.5 Search & Filters
- Search by place name or address
- Filter by category (restaurant, hospital, park, etc.)
- Filter by accessibility feature group (mobility, visual, hearing, cognitive)
- Filter by minimum score

### 2.6 Accessibility Toolbar
- Font size increase/decrease
- High contrast toggle
- Screen reader support (semantic HTML, ARIA labels)

## 3. Technical Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **Next.js** (React, App Router) |
| Map | **MapLibre GL JS** |
| Tile Server | **Martin** (serves .mbtiles) |
| Styling | **Vanilla CSS** (custom design system) |
| Backend API | **Express.js** (Node.js) |
| Database | **PostgreSQL 15 + PostGIS** |
| Containerization | **Docker Compose** |
| Font | *TBD — UI Agent* (will be defined in `docs/DESIGN.md`) |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | List all categories |
| GET | `/api/accessibility-features` | List features (filter by group) |
| GET | `/api/pois` | List POIs (filter: category, bbox, features, min_score) |
| GET | `/api/pois/nearby` | Find POIs near coordinates |
| GET | `/api/pois/:id` | POI detail with features + reviews |
| GET | `/api/pois.geojson` | All POIs as GeoJSON FeatureCollection |
| POST | `/api/pois` | Create new POI |
| PUT | `/api/pois/:id` | Update POI |
| DELETE | `/api/pois/:id` | Delete POI |
| POST | `/api/pois/:id/reviews` | Add review |
| GET | `/api/pois/:id/reviews` | List reviews for POI |

### Database Schema

- `categories` — POI categories with Vietnamese names and icons
- `accessibility_features` — Feature definitions grouped by disability type
- `pois` — Places with PostGIS geometry, overall score
- `poi_accessibility` — N:N junction: POI ↔ Feature with 1-10 ratings
- `user_reviews` — Community reviews with 1-10 rating

## 4. Project Structure

```
DMap/
├── docs/                   # All specs, designs, and agent rules
│   ├── SPEC.md             # This file — project specification
│   ├── DESIGN.md           # Design system (colors, typography, components)
│   └── AGENT_RULES.md      # Multi-agent communication protocol
├── frontend/               # Next.js application
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   └── styles/             # CSS files
├── backend/                # Express.js API
│   └── server.js
├── data/                   # Database init + map tiles
│   ├── init.sql
│   └── *.mbtiles
├── docker-compose.yml
└── .agents/                # Agent skill definitions
```

## 5. Target Scope (MVP)

### In Scope
- [x] Map displaying POIs from PostGIS
- [x] Color-coded markers (1-10 score)
- [x] POI detail panel
- [x] Add new POI form
- [x] Rate accessibility features
- [x] Community reviews
- [x] Search and filter
- [x] Accessibility toolbar
- [x] Mobile responsive

### Out of Scope (v1)
- User authentication / accounts
- Admin panel
- Photo uploads
- Real-time elevator/escalator status
- Multi-language (Vietnamese only for v1)
- PWA / offline mode

## 6. Geographic Focus

- **City**: Ho Chi Minh City, Vietnam
- **Map Center**: `[106.6280, 10.8540]` (Công Viên Phần Mềm Quang Trung, Quận 12)
- **Default Zoom**: 14
- **Tile Source**: Local .mbtiles via Martin at `localhost:3636`
