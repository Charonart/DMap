'use client';
import React from 'react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Chip } from '@/components/ui/Chip';
import { CategoryIconBadge, getCategoryColor, getCategoryIcon } from '@/lib/categoryMeta';
import styles from '@/styles/primitives.module.scss';

export function POIResultCard({ poi, onClick }: { poi: any, onClick?: () => void }) {
  return (
    <div 
      className={styles.reviewCard}
      style={{ cursor: 'pointer', flexDirection: 'row', gap: '1rem', padding: '0.75rem', borderRadius: 0, borderBottom: '1px solid rgba(116,119,117,0.08)' }}
      onClick={onClick}
    >
      {/* Thumbnail: image or category icon badge */}
      <div style={{ 
        width: '5rem', height: '5rem', borderRadius: '0.75rem', overflow: 'hidden', flexShrink: 0, 
        position: 'relative',
        backgroundColor: poi.image_url ? 'var(--color-surface-container-high)' : `${getCategoryColor(poi.category_name)}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {poi.image_url ? (
          <img src={poi.image_url} alt={poi.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <CategoryIconBadge iconKey={poi.category_icon} categoryName={poi.category_name} size={40} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.25rem' }}>{poi.name}</h3>
          <ScoreBadge score={poi.overall_score || 0} size="sm" />
        </div>
        
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
          {poi.address || 'Không rõ địa chỉ'}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem', flexWrap: 'wrap' }}>
          <Chip 
            variant="outline" 
            size="sm"
            icon={<CategoryIconBadge iconKey={poi.category_icon} categoryName={poi.category_name} size={16} />}
          >
            {poi.category_name_vi || poi.category_name}
          </Chip>
          {poi.distance_meters && (
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {(poi.distance_meters / 1000).toFixed(1)} km
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
