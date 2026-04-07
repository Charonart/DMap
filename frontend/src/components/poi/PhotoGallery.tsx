'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from '@/styles/primitives.module.scss';

export function PhotoGallery({ poiId }: { poiId: string }) {
  const { data: photos, isLoading } = useQuery({
    queryKey: ['pois.photos', poiId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pois/${poiId}/photos`);
      return res.data.data;
    },
    enabled: !!poiId
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', overflow: 'hidden' }}>
        <Skeleton style={{ width: '6rem', height: '6rem', flexShrink: 0, borderRadius: '0.5rem' }} />
        <Skeleton style={{ width: '6rem', height: '6rem', flexShrink: 0, borderRadius: '0.5rem' }} />
        <Skeleton style={{ width: '6rem', height: '6rem', flexShrink: 0, borderRadius: '0.5rem' }} />
      </div>
    );
  }

  if (!photos || photos.length === 0) return null;

  return (
    <div className={styles.breakdownRoot}>
      <h3 className={styles.breakdownTitle}>Hình ảnh ({photos.length})</h3>
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
        {photos.map((url: string, i: number) => (
          <div key={i} style={{ width: '6rem', height: '6rem', flexShrink: 0, borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: 'var(--color-surface-dim)' }}>
            <img src={url} alt="Location photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
