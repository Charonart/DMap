'use client';
import React from 'react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Chip } from '@/components/ui/Chip';
import { CategoryIconBadge } from '@/lib/categoryMeta';
import styles from './POIComponents.module.scss';

export function POIHeaderInfo({ poi }: { poi: any }) {
  if (!poi) return null;

  return (
    <div className={styles.root}>
      {poi.image_url ? (
        <div className={styles.imageBlock}>
          <img src={poi.image_url} alt={poi.name} className={styles.heroImage} />
          <div className={styles.scoreBadgeOverlay}>
            <ScoreBadge score={poi.overall_score || 0} />
          </div>
        </div>
      ) : (
        <div className={styles.titleRow}>
          <h2 className={styles.poiTitle}>{poi.name}</h2>
          <ScoreBadge score={poi.overall_score || 0} />
        </div>
      )}

      {poi.image_url && (
        <h2 className={styles.poiTitle}>{poi.name}</h2>
      )}

      <p className={styles.address}>{poi.address}</p>

      <div className={styles.metaRow}>
        <Chip 
          variant="outline" 
          size="sm"
          icon={<CategoryIconBadge iconKey={poi.category_icon} categoryName={poi.category_name} size={20} />}
        >
          {poi.category_name_vi || poi.category_name}
        </Chip>
        {poi.status === 'pending' && <Chip variant="outline" size="sm">Đang xác duyệt</Chip>}
      </div>
      
      {poi.description && (
        <p className={styles.description}>{poi.description}</p>
      )}
    </div>
  );
}
