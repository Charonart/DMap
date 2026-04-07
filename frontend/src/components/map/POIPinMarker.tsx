'use client';
import React from 'react';
import { getCategoryIcon, getCategoryColor } from '@/lib/categoryMeta';

function getScoreColor(score: number) {
  if (score >= 9) return 'var(--color-score-excellent)';
  if (score >= 7) return 'var(--color-score-good)';
  if (score >= 5) return 'var(--color-score-fair)';
  if (score >= 3) return 'var(--color-score-poor)';
  if (score > 0) return 'var(--color-score-inaccessible)';
  return 'var(--color-score-unrated)';
}

function getScoreTextColor(score: number) {
  return score >= 5 && score < 7 ? 'var(--color-on-surface)' : '#fff';
}

interface POIPinMarkerProps {
  score: number;
  categoryIcon?: string | null;   // backend `icon` field
  categoryName?: string | null;   // backend `name` field  
  category?: string;              // legacy fallback  
  active?: boolean;
}

export function POIPinMarker({ score, categoryIcon, categoryName, category, active }: POIPinMarkerProps) {
  const bg = getScoreColor(score);
  const textColor = getScoreTextColor(score);
  const scale = active ? 1.25 : (score >= 9 ? 1.1 : score >= 7 ? 1.05 : score >= 5 ? 1 : 0.95);
  
  // Use accent color for the teardrop pin background when unrated
  const pinBg = score > 0 ? bg : getCategoryColor(categoryName || category);
  
  // Resolve icon from registry (uses backend `icon` field)
  const icon = getCategoryIcon(categoryIcon, 16);

  return (
    <div style={{
      position: 'relative', display: 'flex', transition: 'all 0.3s', pointerEvents: 'auto',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', transformOrigin: 'bottom center',
      transform: `scale(${scale})`, cursor: 'pointer', zIndex: active ? 30 : 10,
    }}>
      {/* Teardrop shape */}
      <div style={{
        width: '2rem', height: '2rem', borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)', border: '3px solid white',
        backgroundColor: pinBg, color: textColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(27,28,27,0.15)',
      }}>
        <div style={{ transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>

      {/* Score badge */}
      {score > 0 && (
        <div style={{
          position: 'absolute', top: '-0.5rem', right: '-0.5rem',
          width: '1.5rem', height: '1.5rem', borderRadius: '9999px',
          border: '2px solid white', backgroundColor: bg, color: textColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '0.625rem',
        }}>
          {score.toFixed(1)}
        </div>
      )}
    </div>
  );
}
