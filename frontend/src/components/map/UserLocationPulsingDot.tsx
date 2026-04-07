'use client';
import React from 'react';

export function UserLocationPulsingDot({ bearing, className }: { bearing?: number | null; className?: string }) {
  const hasBearing = bearing !== undefined && bearing !== null && !Number.isNaN(bearing);

  return (
    <div className={className} style={{
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '120px', height: '120px', pointerEvents: 'none',
    }}>
      
      {/* 1. Accuracy circle */}
      <div style={{
        position: 'absolute', inset: '30px',
        backgroundColor: 'rgba(11,87,208,0.1)', borderRadius: '9999px',
        border: '1px solid rgba(11,87,208,0.2)',
      }} />

      {/* 2. Direction beam */}
      {hasBearing && (
        <div 
          style={{ position: 'absolute', inset: 0, transition: 'transform 0.3s', transform: `rotate(${bearing}deg)` }}
        >
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}>
             <path d="M 50 50 L 25 6.7 A 50 50 0 0 1 75 6.7 Z" fill="url(#beamGrad)" />
             <defs>
               <radialGradient id="beamGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
               </radialGradient>
             </defs>
          </svg>
        </div>
      )}

      {/* 3. Core blue dot */}
      <div style={{
        position: 'absolute', width: '18px', height: '18px',
        backgroundColor: 'var(--color-primary)', borderRadius: '9999px',
        boxShadow: '0 0 0 3px white, 0 1px 3px rgba(0,0,0,0.2)',
        zIndex: 10,
      }} />
    </div>
  );
}
