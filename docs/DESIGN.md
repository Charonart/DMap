# DMap — Design System

> Material Design 3 inspired. Accessibility-first. Google Maps-like UX.
>
> **Owner**: UI Agent · **Source of truth** for all visual decisions.
> **Stack**: **Tailwind CSS** — No pre-built UI library dependency (e.g., no MUI or Shadcn), strictly using custom Tailwind configurations to enforce Material Design 3 tokens.

---

## 1. Design Philosophy

**"Accessible Clarity"** — A premium, map-first interface that serves disabled users with the same polish Google Maps gives everyone else. We combine M3's systematic approach with a warm, human-centered aesthetic.

### Core Principles
1. **Map is the hero** — UI floats over the map, never obscures it.
2. **Scan, then read** — Color + shape for instant recognition, text for detail.
3. **Universal by default** — WCAG AA minimum, AAA where practical.
4. **Familiar patterns** — Google Maps UX conventions users already know.

---

## 2. Tailwind Configuration System

To implement M3 with Tailwind, we must extend `tailwind.config.ts`. Here are the exact tokens to map into the `theme.extend` object.

### 2.1 Brand Palette (M3 Tonal)

Seed color: **Accessible Blue** `#0b57d0` — trust, wayfinding, universally understood. Implement these inside `colors`.

```javascript
colors: {
  primary: {
    DEFAULT: '#0b57d0', // Use class: bg-primary, text-primary
    container: '#d3e3fd', // Use class: bg-primary-container
    dark: '#a8c7fa', // Next.js dark mode override if needed
    'container-dark': '#0842a0'
  },
  'on-primary': {
    DEFAULT: '#ffffff', // Use class: text-on-primary
    container: '#041e49'
  },
  secondary: {
    DEFAULT: '#5e5f62',
    container: '#e2e1e6',
  },
  tertiary: {
    DEFAULT: '#006c6e',
  },
  error: {
    DEFAULT: '#ba1a1a',
    container: '#ffdad6',
  },
  outline: {
    DEFAULT: '#747775',
    variant: '#c4c7c5'
  }
}
```

### 2.2 Surface Hierarchy (M3 Tonal Nesting)

Depth is achieved through tonal shifts, not drop shadows. Each layer is one step lighter/darker.

```javascript
colors: {
  surface: {
    DEFAULT: '#f8faf8',
    dim: '#d9dbd9',
    container: {
      lowest: '#ffffff', // Elevated cards, modals: bg-surface-container-lowest
      low: '#f2f4f2',    // Side panels, drawers
      DEFAULT: '#eceeed',// Filter panels, headers
      high: '#e7e9e7',   // Active sections
      highest: '#e1e3e1' // Tooltips, menus
    }
  },
  'on-surface': {
    DEFAULT: '#1b1c1b',
    variant: '#444746'
  }
}
```

> **The "No-Line" Rule**: Do NOT use `border` classes to separate sections unless necessary. A sidebar at `bg-surface-container-low` against `bg-surface` creates a felt boundary without a drawn one.

### 2.3 Scoring Colors (6 Tiers)

Users rate **1-10**. The UI groups these into **6 color tiers**. Add these to Tailwind `colors` config to allow `bg-score-excellent`, `text-score-poor`, etc.

| Tier | Score | Tailwind Class | Color | Shape Indicator | Label |
|------|-------|----------------|-------|----------------|-------|
| Excellent | 9-10 | `score-excellent` | `#0d7377` | ★ Star | Tuyệt vời |
| Good | 7-8 | `score-good` | `#2e7d32` | ● Circle | Tốt |
| Fair | 5-6 | `score-fair` | `#f9a825` | ◆ Diamond | Trung bình |
| Poor | 3-4 | `score-poor` | `#e65100` | ▲ Triangle | Kém |
| Inaccessible | 1-2 | `score-inaccessible` | `#c62828` | ✕ Cross | Không thể tiếp cận |
| Unrated | 0 | `score-unrated` | `#747775` | ○ Empty circle | Chưa đánh giá |

---

## 3. Typography

### 3.1 Font Choice

**Primary**: `Inter` — Implement using Tailwind's `font-sans` by importing google fonts.
**Monospace** (for scores/data): `'Roboto Mono'` -> Tailwind `font-mono`.

### 3.2 Type Scale (M3-based)

All sizes use `rem`. Extend Tailwind's typography inside `fontSize`:

| M3 Token | Tailwind Map | Size | Weight | Usage |
|----------|--------------|------|--------|-------|
| Display Md | `text-display` | `[2.8rem, { lineHeight: '1.16' }]` | 400 | Large feature text |
| Headline Lg| `text-h1` | `[2rem, { lineHeight: '1.25' }]` | 600 | POI name strictly |
| Headline Md| `text-h2` | `[1.75rem, { lineHeight: '1.29' }]` | 600 | Section headers |
| Title Lg | `text-title` | `[1.375rem, { lineHeight: '1.27' }]` | 500 | Panel titles |
| Body Lg | `text-body` | `[1rem, { lineHeight: '1.6' }]` | 400 | Reviews, standard |
| Label Lg | `text-label` | `[0.875rem, { lineHeight: '1.43' }]` | 500 | M3 Buttons |

> All text: minimum contrast 4.5:1 (AA). `text-on-surface` (`#1b1c1b`) on `bg-surface` (`#f8faf8`) = **13.8:1** ratio ✓ AAA

---

## 4. Spacing, Radius & Elevation

### 4.1 Border Radius

Extend `borderRadius` in Tailwind:
- `rounded-xs` (`4px`) - Small badges
- `rounded-sm` (`8px`) - M3 Buttons, chips, inputs
- `rounded-md` (`12px`) - M3 Cards, panels
- `rounded-lg` (`16px`) - Modals
- `rounded-xl` (`24px`) - Bottom sheets, M3 FAB

### 4.2 Shadow System (M3 Overlays)

Used only for floating elements over the map. Shadow color uses `on-surface` tint. Add to `boxShadow` in Tailwind:

```javascript
boxShadow: {
  'm3-sm': '0 1px 3px rgba(27, 28, 27, 0.08)', // hover states
  'm3-md': '0 4px 12px rgba(27, 28, 27, 0.10)', // cards, popups
  'm3-lg': '0 8px 32px rgba(27, 28, 27, 0.12)', // floating panels, map headers
  'm3-xl': '0 16px 48px rgba(27, 28, 27, 0.16)' // bottom sheets
}
```

**Strict M3 Rule**: Floating UI overlays on MapLibre MUST combine `bg-surface-container-lowest`, `rounded-lg`, and `shadow-m3-lg`. Do NOT use Tailwind's `backdrop-blur`.

---

## 5. Component Specifications (Tailwind Examples)

### 5.1 Map Pins
- MapLibre Native Pins. You cannot style pins dynamically with Tailwind (as WebGL canvas renders them). You must draw the pins using JS Canvas API (`map.addImage()`) but pull the HEX colors from the defined Tailwind color palette above (`score-excellent` = `#0d7377`).

### 5.2 Floating Action Button (FAB) Add Place
Tailwind Class Construction:
```html
<button class="fixed bottom-4 right-4 w-14 h-14 rounded-xl shadow-m3-lg bg-primary-container text-on-primary-container hover:shadow-m3-xl hover:brightness-105 active:scale-95 transition-all duration-300 flex items-center justify-center">
  <PlusIcon class="w-6 h-6" />
</button>
```

### 5.3 Filter Chips
Tailwind Class Construction (Active):
```html
<button class="h-9 px-4 rounded-sm bg-primary-container text-on-primary-container font-label shadow-m3-sm transition-colors">
  ✓ Nhà hàng
</button>
```

### 5.4 Progress Feature Bar (1-10 Scale)
To show a POI feature rated 8/10 (Good):
```html
<div class="h-1 w-full bg-outline-variant rounded-full overflow-hidden">
  <div class="h-full bg-score-good" style="width: 80%"></div>
</div>
```

---

## 6. High Contrast Mode

Toggled via accessibility toolbar (◑ button). Applies `hc` class to `<html>`. Wait, in Tailwind, it's easier to use a `data-theme="high-contrast"` or similar modifier. Configuration can use Tailwind's arbitrary variants or multiple prefixes.

Alternatively, use Tailwind CSS Variables pattern or distinct semantic maps:
```css
/* In globals.css */
[data-theme='high-contrast'] {
  --color-surface: #ffffff;
  --color-on-surface: #000000;
  /* Override other tailwind variables mapped to CSS if needed */
}
```

## 7. Do's and Don'ts

### ✅ Do
- Use Tailwind utility classes mapped strictly to the M3 variables above.
- Provide `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` on all interactive elements.
- Ensure EVERY interactive element has a minimum `h-12 w-12` (48x48px) touch target space.
- Use `rem` text sizing in Tailwind configs.

### ❌ Don't
- Don't use random Tailwind colors (`text-blue-500`, `bg-red-400`). ONLY use the semantic aliases (`bg-primary`, `text-score-poor`).
- Don't use heavy/dark drop shadows (`shadow-2xl`) — use the M3 ambient shadows (`shadow-m3-lg`).
- Don't hide the focus ring (`outline-none` alone).
