'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { POIResultCard } from './POIResultCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMapStore } from '@/hooks/useMapStore';
import styles from '@/styles/primitives.module.scss';

export function POIResultList({ categoryId }: { categoryId?: string | null }) {
  const { setSelectedPoiId } = useMapStore();

  const { data: response, isLoading } = useQuery({
    queryKey: ['pois', 'list', categoryId],
    queryFn: async () => {
      const params: any = { limit: 20 };
      if (categoryId) params.category = categoryId;
      const res = await axiosInstance.get('/pois', { params });
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className={styles.reviewList}>
        {[1, 2, 3].map((v) => (
          <div key={v} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid rgba(116,119,117,0.08)', height: '6.5rem' }}>
            <Skeleton style={{ width: '5rem', height: '5rem', borderRadius: '0.5rem', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
              <Skeleton style={{ width: '75%', height: '1rem' }} />
              <Skeleton style={{ width: '100%', height: '0.75rem' }} />
              <Skeleton style={{ width: '3rem', height: '1rem', marginTop: 'auto' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = response?.data || [];

  if (items.length === 0) {
    return <div className={styles.emptyState}>Không tìm thấy địa điểm nào trong khu vực này.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((poi: any) => (
        <POIResultCard 
          key={poi.id} 
          poi={poi} 
          onClick={() => setSelectedPoiId(poi.id)} 
        />
      ))}
    </div>
  );
}
