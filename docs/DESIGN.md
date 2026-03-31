# DMap — Design System

> Material Design 3 inspired. Accessibility-first. Google Maps-like UX.
>
> **Owner**: UI Agent · **Source of truth** for all visual decisions.
> **Stack**: Vanilla CSS custom properties — no UI library dependency.

---

## 1. Design Philosophy

**"Accessible Clarity"** — A premium, map-first interface that serves disabled users with the same polish Google Maps gives everyone else. We combine M3's systematic approach with a warm, human-centered aesthetic.

### Core Principles
1. **Map is the hero** — UI floats over the map, never obscures it
2. **Scan, then read** — Color + shape for instant recognition, text for detail
3. **Universal by default** — WCAG AA minimum, AAA where practical
4. **Familiar patterns** — Google Maps UX conventions users already know

---

## 2. Color System

### 2.1 Brand Palette (M3 Tonal)

Seed color: **Accessible Blue** `#0b57d0` — trust, wayfinding, universally understood.

| Token | Light Mode | Dark Mode | Role |
|-------|-----------|-----------|------|
| `--color-primary` | `#0b57d0` | `#a8c7fa` | Primary actions, active states |
| `--color-primary-container` | `#d3e3fd` | `#0842a0` | Selected states, active filters |
| `--color-on-primary` | `#ffffff` | `#062e6f` | Text/icon on primary |
| `--color-on-primary-container` | `#041e49` | `#d3e3fd` | Text/icon on primary-container |
| `--color-secondary` | `#5e5f62` | `#c7c6ca` | Secondary text, labels |
| `--color-secondary-container` | `#e2e1e6` | `#46464a` | Chips, secondary buttons |
| `--color-tertiary` | `#006c6e` | `#4dd9db` | Accents, links |
| `--color-error` | `#ba1a1a` | `#ffb4ab` | Errors, destructive actions |
| `--color-error-container` | `#ffdad6` | `#93000a` | Error backgrounds |
| `--color-outline` | `#747775` | `#8e918f` | Borders (when needed) |
| `--color-outline-variant` | `#c4c7c5` | `#444746` | Subtle dividers |

### 2.2 Surface Hierarchy (M3 Tonal Nesting)

Depth is achieved through tonal shifts, not drop shadows. Each layer is one step lighter/darker.

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--color-surface` | `#f8faf8` | `#1a1c1a` | Page background |
| `--color-surface-dim` | `#d9dbd9` | `#1a1c1a` | Dimmed areas |
| `--color-surface-container-lowest` | `#ffffff` | `#0e0f0e` | Elevated cards, modals |
| `--color-surface-container-low` | `#f2f4f2` | `#1e201e` | Side panels, drawers |
| `--color-surface-container` | `#eceeed` | `#232523` | Filter panels, headers |
| `--color-surface-container-high` | `#e7e9e7` | `#282a28` | Active sections |
| `--color-surface-container-highest` | `#e1e3e1` | `#333533` | Tooltips, menus |
| `--color-on-surface` | `#1b1c1b` | `#e2e3e0` | Primary text |
| `--color-on-surface-variant` | `#444746` | `#c4c7c5` | Secondary text |

> **The "No-Line" Rule**: Do NOT use `1px solid` borders to separate sections. Use background tonal shifts instead. A sidebar at `surface-container-low` against `surface` creates a felt boundary without a drawn one.

### 2.3 Scoring Colors (6 Tiers)

Users rate **1-10** (granular). The UI groups these into **6 color tiers** for at-a-glance recognition. The number is always displayed alongside the color.

**Color-blind safety**: This palette avoids red/green confusion. Each tier uses a **unique shape indicator** in addition to color (per WCAG SC 1.4.1).

| Tier | Score | Token | Color (Light) | Color (Dark) | Shape Indicator | Label |
|------|-------|-------|--------------|-------------|----------------|-------|
| Excellent | 9-10 | `--color-score-excellent` | `#0d7377` | `#4dd9db` | ★ Star | Tuyệt vời |
| Good | 7-8 | `--color-score-good` | `#2e7d32` | `#81c784` | ● Circle | Tốt |
| Fair | 5-6 | `--color-score-fair` | `#f9a825` | `#ffd54f` | ◆ Diamond | Trung bình |
| Poor | 3-4 | `--color-score-poor` | `#e65100` | `#ffab40` | ▲ Triangle | Kém |
| Inaccessible | 1-2 | `--color-score-inaccessible` | `#c62828` | `#ef9a9a` | ✕ Cross | Không thể tiếp cận |
| Unrated | 0 | `--color-score-unrated` | `#747775` | `#8e918f` | ○ Empty circle | Chưa đánh giá |

**On-score text colors** (text displayed ON the score color background):

| Token | Light | Dark |
|-------|-------|------|
| `--color-on-score-excellent` | `#ffffff` | `#003738` |
| `--color-on-score-good` | `#ffffff` | `#1b5e20` |
| `--color-on-score-fair` | `#1b1c1b` | `#1b1c1b` |
| `--color-on-score-poor` | `#ffffff` | `#1b1c1b` |
| `--color-on-score-inaccessible` | `#ffffff` | `#1b1c1b` |
| `--color-on-score-unrated` | `#ffffff` | `#1b1c1b` |

> **Why this palette?**
> - Teal (`#0d7377`) for excellent — avoids green, distinct from blue primary
> - Green (`#2e7d32`) for good — paired with circle shape, not used alone
> - Amber (`#f9a825`) for fair — high visibility, caution signal
> - Orange (`#e65100`) for poor — warm warning, distinct from red
> - Red (`#c62828`) for inaccessible — universal danger/stop signal
> - Gray (`#747775`) for unrated — neutral, clearly "no data"
>
> Tested conceptually for deuteranopia (red-green) and protanopia: teal vs green is distinguishable by luminance difference, and each tier has a unique shape.

---

## 3. Typography

### 3.1 Font Choice

**Primary**: `Inter` — Modern geometric sans-serif. Excellent x-height for readability. Supports Vietnamese characters fully. Available via Google Fonts.

**Fallback stack**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Monospace** (for scores/data): `'Roboto Mono', 'Cascadia Code', monospace`

### 3.2 Type Scale (M3-based)

All sizes use `rem` for user font-size scaling. Minimum body: `1rem` (16px).

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|------------|----------------|-------|
| `--font-display-lg` | 3.5rem (56px) | 400 | 1.14 | -0.02em | Hero text (rarely used) |
| `--font-display-md` | 2.8rem (45px) | 400 | 1.16 | -0.02em | Large feature text |
| `--font-headline-lg` | 2rem (32px) | 600 | 1.25 | -0.01em | POI name in detail panel |
| `--font-headline-md` | 1.75rem (28px) | 600 | 1.29 | 0 | Section headers |
| `--font-headline-sm` | 1.5rem (24px) | 600 | 1.33 | 0 | Card titles |
| `--font-title-lg` | 1.375rem (22px) | 500 | 1.27 | 0 | Panel titles |
| `--font-title-md` | 1rem (16px) | 500 | 1.5 | 0.01em | POI name in popup |
| `--font-title-sm` | 0.875rem (14px) | 500 | 1.43 | 0.01em | Chip text, labels |
| `--font-body-lg` | 1rem (16px) | 400 | 1.6 | 0.03em | Reviews, descriptions |
| `--font-body-md` | 0.875rem (14px) | 400 | 1.43 | 0.02em | Secondary content |
| `--font-body-sm` | 0.75rem (12px) | 400 | 1.33 | 0.03em | Captions, timestamps |
| `--font-label-lg` | 0.875rem (14px) | 500 | 1.43 | 0.01em | Button text |
| `--font-label-md` | 0.75rem (12px) | 500 | 1.33 | 0.04em | Small labels |

> **Readability rules**:
> - Body text line-height: minimum `1.6` (prevents crowding for visually impaired users)
> - Never use `font-size` below `0.75rem` (12px)
> - All text: minimum contrast 4.5:1 (AA). Body text targets 7:1 (AAA)
> - `--color-on-surface` (`#1b1c1b`) on `--color-surface` (`#f8faf8`) = **13.8:1** ratio ✓ AAA

---

## 4. Spacing System

### 4.1 Base Unit: 4px

Scale follows a progressive pattern for consistent rhythm:

| Token | Value | Common Usage |
|-------|-------|-------------|
| `--space-0` | 0 | Reset |
| `--space-1` | 4px | Tight padding (icon to text) |
| `--space-2` | 8px | Internal component padding |
| `--space-3` | 12px | Compact list items |
| `--space-4` | 16px | Standard padding, card internal |
| `--space-5` | 20px | Between related groups |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Panel padding |
| `--space-10` | 40px | Large section gaps |
| `--space-12` | 48px | Major layout gaps |
| `--space-16` | 64px | Page-level margins |

### 4.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` | 4px | Small elements (badges, tags) |
| `--radius-sm` | 8px | Buttons, chips, inputs |
| `--radius-md` | 12px | Cards, panels |
| `--radius-lg` | 16px | Modals, large containers |
| `--radius-xl` | 24px | Bottom sheets, FAB |
| `--radius-full` | 9999px | Circular elements (avatar, score badge) |

---

## 5. Elevation & Depth

### 5.1 Tonal Layering (Primary Method)

Depth is expressed through surface tonal shifts (see §2.2), NOT through heavy drop shadows. Darker/lighter tones = higher visual elevation.

```
Layer 0: --color-surface              (page background)
Layer 1: --color-surface-container-low  (side panels, drawers)
Layer 2: --color-surface-container      (filter panel, headers)
Layer 3: --color-surface-container-high (active sections, hover)
Layer 4: --color-surface-container-highest (tooltips, menus)
```

### 5.2 Shadow System (Supplementary)

Used only for floating elements over the map. Shadow color uses `on-surface` tint, never pure black.

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(27, 28, 27, 0.08)` | Subtle lift (chips, buttons) |
| `--shadow-md` | `0 4px 12px rgba(27, 28, 27, 0.10)` | Cards, popups |
| `--shadow-lg` | `0 8px 32px rgba(27, 28, 27, 0.12)` | Floating panels, map overlays |
| `--shadow-xl` | `0 16px 48px rgba(27, 28, 27, 0.16)` | Modals, bottom sheets |

### 5.3 Map Overlays (Strict M3)

All UI elements floating directly over the map MUST use solid M3 surface colors with appropriate elevation (shadows) to separate them from the map.

```css
.m3-overlay {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

/* Dark mode */
.dark .m3-overlay {
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-lg);
}
```

> **Strict M3 Rule**: Do not use `backdrop-filter` or semi-transparent backgrounds for primary surfaces. Use tonal surfaces and shadows to create depth.

---

## 6. Component Specifications

### 6.1 Map Pins (SPEC §2.1)

The primary interaction element. Must be instantly recognizable and accessible.

- **Size**: 40px wide × 48px tall (includes pointer) — tap target area extends to 48px × 48px minimum
- **Structure**: Teardrop shape with score tier color fill
- **Score badge**: 20px circle at top-center of pin, white text, `--font-label-md`, showing numeric score
- **Shape indicator**: Tier shape icon (★●◆▲✕○) displayed inside the pin body, 16px
- **Unrated pins**: Use `--color-score-unrated` with dashed outline style

**States**:
| State | Visual Change |
|-------|--------------|
| Default | Score color fill, subtle shadow |
| Hover | Scale `1.15`, shadow increases to `--shadow-md` |
| Focus | 3px `--color-primary` outline ring (offset 2px) |
| Selected | Scale `1.2`, popup appears, shadow `--shadow-lg` |
| Clustered | Circular cluster badge showing count |

### 6.2 POI Popup Card (SPEC §2.1)

Appears on pin click. Mimics Google Maps info window.

- **Width**: 280px (fixed)
- **Background**: `--color-surface-container-lowest`
- **Border-radius**: `--radius-md` (12px)
- **Shadow**: `--shadow-lg`
- **Padding**: `--space-4` (16px)
- **Layout**:
  ```
  ┌─────────────────────────────────┐
  │ [Category Icon]  POI Name       │  ← --font-title-md, 500 weight
  │ 📍 Address line                 │  ← --font-body-md, --color-on-surface-variant
  │                                 │
  │ ┌──────┐  ★ Mobility: 8/10     │  ← Score breakdown (top 2 groups)
  │ │ 8.5  │  👁️ Visual: 9/10      │
  │ │ GOOD │                       │
  │ └──────┘                       │  ← Score badge: tier color bg, --font-headline-sm
  │                                 │
  │ [ View Details →          ]     │  ← Text button, --color-primary
  └─────────────────────────────────┘
         ▽  (pointer triangle)
  ```

### 6.3 POI Detail Panel (SPEC §2.3)

**Desktop**: Slide-in panel from the right, 400px wide.
**Mobile**: Bottom sheet, swipeable, 3 snap points (peek / half / full).

- **Background**: `--color-surface-container-low`
- **Border-radius**: `--radius-xl` (top-left and top-right on mobile bottom sheet)
- **Shadow**: `--shadow-xl` (left edge on desktop)
- **Header**:
  - POI name: `--font-headline-lg` (32px, 600 weight)
  - Category badge: `--color-secondary-container` background, `--radius-sm`
  - Close button: 48px × 48px touch target, top-right
- **Overall Score Section**:
  - Large score display: `--font-display-md` (45px), centered
  - Score tier color background pill with tier label
  - Shape indicator next to score
- **Accessibility Breakdown**:
  - 4 disability groups (♿ 👁️ 👂 🧠) as horizontal cards
  - Each card: icon + group name + score bar (filled proportionally)
  - Score bar: 4px height, rounded, tier color fill on `--color-outline-variant` background
- **Feature Ratings List**:
  - Grouped by disability type
  - Each feature: name + 1-10 slider visualization + optional note
  - Background alternates: `--color-surface-container-low` / `--color-surface-container`
- **Reviews Section**:
  - Review cards: `--color-surface-container-lowest` background
  - Star rating + text + timestamp
  - Spacing between reviews: `--space-4`
- **Action Bar** (bottom):
  - "Get Directions" button: filled, `--color-primary`, `--radius-sm`
  - "Rate this place" button: outlined, `--color-primary`, `--radius-sm`
  - Both buttons: 48px height (touch target), `--font-label-lg`

### 6.4 Filter Panel (SPEC §2.5)

- **Background**: M3 Overlay (`.m3-overlay`)
- **Border-radius**: `--radius-lg` (right corners on desktop)
- **Sections**:

**Search Bar** (top):
- Height: 48px, `--radius-sm`
- Background: `--color-surface-container-lowest`
- Placeholder: "Tìm kiếm địa điểm..." (Search places...)
- Search icon (left), clear button (right when filled)

**Category Filters**:
- M3 Filter Chips, horizontal wrap
- Chip size: 36px height, `--radius-sm`, `--space-2` gap
- Unselected: `--color-surface-container` bg, `--color-on-surface` text
- Selected: `--color-primary-container` bg, `--color-on-primary-container` text, checkmark icon
- Categories: Nhà hàng, Bệnh viện, Công viên, Trường học, Cửa hàng, Khách sạn...

**Accessibility Group Filter**:
- 4 toggle buttons (♿ Mobility, 👁️ Visual, 👂 Hearing, 🧠 Cognitive)
- Layout: 2×2 grid, each button 48px × 48px
- Unselected: outlined, `--color-outline` border
- Selected: `--color-tertiary` fill, white icon

**Minimum Score Slider**:
- Range: 0-10, step 1
- Track: `--color-outline-variant`, 4px height
- Filled track: `--color-primary`
- Thumb: 24px circle, `--color-primary`, `--shadow-sm`
- Label above thumb showing current value

### 6.5 Add POI Form (SPEC §2.4)

Full-screen modal (mobile) or right panel overlay (desktop).

- **Background**: `--color-surface`
- **Header**: "Thêm địa điểm mới" (Add new place), `--font-headline-md`, close button (X)
- **Form fields** (M3 outlined text fields):
  - Height: 56px
  - Border: 1px `--color-outline`, → 2px `--color-primary` on focus
  - Border-radius: `--radius-xs` (4px)
  - Label: Floating label animation (M3 standard)
  - Error state: `--color-error` border + `--color-error-container` background

**Location Picker**:
- Inline mini-map with draggable pin
- "Chạm vào bản đồ để chọn vị trí" (Tap map to choose location)
- Coordinates display below: `--font-body-sm`, monospace

**Accessibility Rating Section**:
- Grouped by disability type (tabs or accordion)
- Each feature: label + 1-10 discrete slider
- Slider marks at each integer, active marks colored by tier
- Optional note field below each feature: `--font-body-md`

**Submit Button**:
- Full-width, 48px height
- `--color-primary` fill, white text, `--radius-sm`
- Loading state: circular progress indicator

### 6.6 Accessibility Toolbar (SPEC §2.6)

Floating toolbar, bottom-right of screen (above map controls).

- **Layout**: Vertical stack of icon buttons, M3 solid background (`--color-surface-container-lowest`)
- **Border-radius**: `--radius-lg`
- **Each button**: 48px × 48px, icon only, tooltip on hover
- **Buttons**:
  1. `A+` — Increase font size (up to 150%)
  2. `A-` — Decrease font size (down to 100%)
  3. `◑` — Toggle high contrast mode
  4. `♿` — Toggle accessibility overlay (show all scores)
- **Active state**: `--color-primary-container` background, `--color-primary` icon
- **Separator**: 1px `--color-outline-variant` at 15% opacity between groups

### 6.7 Navigation Header (SPEC §2.1)

Top app bar, M3 style. Solid surface with shadow over the map.

- **Height**: 64px (desktop), 56px (mobile)
- **Background**: M3 Overlay (`.m3-overlay`)
- **Layout**:
  ```
  ┌──────────────────────────────────────────────────┐
  │  🗺️ DMap    [Search............🔍]   [≡ Menu]   │
  │  Logo+Name   Expandable search bar    Hamburger  │
  └──────────────────────────────────────────────────┘
  ```
- **Logo**: "DMap" in `--font-title-lg`, `--color-primary`, 500 weight
- **Search**: Expandable — icon-only on mobile, expands to full bar on tap
- **Menu button**: 48px × 48px, opens filter panel (mobile) or settings drawer

### 6.8 Floating Action Button — "Add Place"

- **Position**: Bottom-right, above accessibility toolbar. 16px margin from edges
- **Size**: 56px × 56px (M3 FAB standard)
- **Shape**: `--radius-xl` (24px) — M3 squircle
- **Color**: `--color-primary-container` bg, `--color-on-primary-container` icon
- **Icon**: `+` or map pin icon, 24px
- **Shadow**: `--shadow-lg`
- **Extended FAB** (optional, desktop): 56px height, auto width, includes "Thêm địa điểm" label
- **States**:
  - Hover: `--shadow-xl`, slight brightness increase
  - Focus: 3px `--color-primary` outline ring
  - Pressed: Ripple effect from touch point

---

## 7. Interactive States

All interactive components follow this state system:

| State | Visual Treatment |
|-------|-----------------|
| **Default** | Base styling as specified |
| **Hover** | `surface-container-high` overlay at 8% opacity + cursor pointer |
| **Focus** | 3px `--color-primary` outline ring, 2px offset. MUST be visible |
| **Active/Pressed** | `surface-container-high` overlay at 12% opacity, scale 0.98 |
| **Selected** | `--color-primary-container` background, `--color-on-primary-container` text |
| **Disabled** | 38% opacity, no pointer events |

> **Focus visibility rule**: Focus rings must ALWAYS be visible (no `outline: none`). This is non-negotiable for keyboard navigation and screen reader users.

---

## 8. Motion & Animation

### Easing Curves (M3 Standard)
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Most transitions |
| `--ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Enter/exit, route changes |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0, 1)` | Elements entering screen |
| `--ease-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | Elements leaving screen |

### Duration
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-short` | `100ms` | Hover, ripple |
| `--duration-medium` | `250ms` | Panel slide, chip toggle |
| `--duration-long` | `400ms` | Page transitions, bottom sheet |

### Key Animations
- **Pin hover**: Scale 1.0 → 1.15, `--duration-short`, `--ease-standard`
- **Panel slide-in**: translateX(100%) → translateX(0), `--duration-long`, `--ease-decelerate`
- **Bottom sheet**: translateY(100%) → snap position, `--duration-long`, `--ease-emphasized`
- **Chip toggle**: Background color crossfade, `--duration-medium`, `--ease-standard`
- **Score count-up**: Number ticks from 0 to value on detail panel open, `--duration-long`

> **Reduced motion**: Respect `prefers-reduced-motion: reduce`. Replace all animations with instant state changes. Keep opacity transitions only.

---

## 9. Dark Mode

Activated by `prefers-color-scheme: dark` or manual toggle in accessibility toolbar.

### Surface Inversion
Dark mode uses the **Dark Mode** column values from §2.1 and §2.2. Key differences:
- Surfaces become dark (`#1a1c1a` base), progressing lighter for elevation
- Primary color becomes lighter variant (`#a8c7fa`) for readability on dark backgrounds
- Score colors use lighter tints for visibility on dark surfaces (see §2.3 Dark column)
- Shadows become more subtle (reduce opacity by 50%)
- Glassmorphism: dark surface at 85% opacity

### Implementation
```css
@media (prefers-color-scheme: dark) {
  :root { /* swap all tokens to dark values */ }
}
.dark { /* manual toggle class — same overrides */ }
```

---

## 10. High Contrast Mode

Toggled via accessibility toolbar (◑ button). Applies `.high-contrast` class to `<html>`.

### Changes from Default
| Property | Default | High Contrast |
|----------|---------|--------------|
| Text color | `#1b1c1b` | `#000000` |
| Background | `#f8faf8` | `#ffffff` |
| Borders | Tonal shifts only | 2px solid `#000000` |
| Score colors | Standard palette | Increased saturation + black text |
| Focus ring | 3px primary | 4px black, 2px offset |
| Font weight | As specified | +100 (body 400→500) |
| Link underline | None | Always underlined |

> **Pure black exception**: High contrast mode is the ONE case where `#000000` text is permitted, to maximize contrast ratio to 21:1.

---

## 11. Responsive Breakpoints

| Token | Value | Description |
|-------|-------|-------------|
| `--breakpoint-mobile` | 480px | Small phones |
| `--breakpoint-tablet` | 768px | Tablets, large phones |
| `--breakpoint-desktop` | 1024px | Desktop |
| `--breakpoint-wide` | 1440px | Wide desktop |

### Layout Adaptations
| Component | Mobile (< 768px) | Desktop (≥ 1024px) |
|-----------|-------------------|---------------------|
| POI Detail | Bottom sheet (swipeable) | Right side panel (400px) |
| Filter Panel | Full-width drawer (slide from left) | Fixed left panel (320px) |
| Search | Icon → expands on tap | Always visible in header |
| FAB | 56px circle, bottom-right | Extended FAB with label |
| Nav Header | 56px height, compact | 64px height, full |
| Accessibility Toolbar | Horizontal, bottom-center | Vertical, bottom-right |

---

## 12. Do's and Don'ts

### ✅ Do
- Use `--color-surface-container-*` tiers to create visual hierarchy
- Prioritize spacing (`--space-6`+) over lines and borders
- Ensure EVERY interactive element has minimum 48px × 48px touch target
- Use solid M3 surfaces (`--color-surface-container-*`) for ALL UI floating over the map
- Always show shape indicator alongside score color
- Test all text for 4.5:1 contrast minimum (7:1 for body text)
- Use `rem` units for all font sizes (supports user scaling)
- Provide visible focus rings on all interactive elements

### ❌ Don't
- Don't use pure black `#000` for text (use `--color-on-surface` `#1b1c1b`) — except in high contrast mode
- Don't use `1px solid` dividers — use background tonal shifts
- Don't use heavy/dark drop shadows — use tinted ambient shadows
- Don't rely on color alone for scoring — always pair with shape + number
- Don't set `outline: none` without an alternative focus indicator
- Don't use font sizes below `0.75rem` (12px)
- Don't crowd the interface — when in doubt, increase spacing by one increment
- Don't obstruct more than 40% of the map view with overlays
