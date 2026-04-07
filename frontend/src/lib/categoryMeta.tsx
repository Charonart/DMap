import React from 'react';
import {
  UtensilsCrossed, Hospital, GraduationCap, TreePine,
  ShoppingBag, Bus, Landmark, Hotel, Clapperboard,
  HeartPulse, MapPin, LayoutGrid,
} from 'lucide-react';

// ─────────────────────────────────────────────────
// 1. Icon Registry: backend `icon` field → Lucide component
// ─────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'utensils':      UtensilsCrossed,
  'hospital':      Hospital,
  'school':        GraduationCap,
  'tree':          TreePine,
  'shopping-bag':  ShoppingBag,
  'bus':           Bus,
  'building':      Landmark,
  'bed':           Hotel,
  'film':          Clapperboard,
  'heart-pulse':   HeartPulse,
};

// ─────────────────────────────────────────────────
// 2. Accent Color Registry: backend `name` field → hex
// ─────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  restaurant:     '#E65100',
  hospital:       '#C62828',
  school:         '#1565C0',
  park:           '#2E7D32',
  shopping:       '#7B1FA2',
  transport:      '#00838F',
  government:     '#455A64',
  accommodation:  '#0277BD',
  entertainment:  '#F57C00',
  healthcare:     '#AD1457',
};

const FALLBACK_COLOR = '#747775';

// ─────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────

/**
 * Get the Lucide icon component for a category.
 * @param iconKey — the `icon` field from backend (e.g. "utensils", "hospital")
 * @param size — icon size in rem, default 1rem (16px)
 */
export function getCategoryIcon(iconKey?: string | null, size = 16): React.ReactNode {
  const Icon = (iconKey && ICON_MAP[iconKey]) || MapPin;
  return <Icon width={size} height={size} strokeWidth={2.5} />;
}

/**
 * Get the Lucide icon component for the "All" filter chip.
 */
export function getAllIcon(size = 16): React.ReactNode {
  return <LayoutGrid width={size} height={size} strokeWidth={2.5} />;
}

/**
 * Get the accent hex color for a category.
 * @param name — the `name` field from backend (e.g. "restaurant", "park")
 */
export function getCategoryColor(name?: string | null): string {
  return (name && COLOR_MAP[name]) || FALLBACK_COLOR;
}

/**
 * Render an icon badge: small circle with accent bg + white icon.
 * Used inside Chips, POIResultCard placeholders, etc.
 */
export function CategoryIconBadge({
  iconKey,
  categoryName,
  size = 24,
}: {
  iconKey?: string | null;
  categoryName?: string | null;
  size?: number;
}) {
  const color = getCategoryColor(categoryName);
  const iconSize = Math.round(size * 0.58); // icon is ~58% of badge

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {getCategoryIcon(iconKey, iconSize)}
    </span>
  );
}
