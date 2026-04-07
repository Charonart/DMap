'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Bookmark, ExternalLink } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { CategoryIconBadge } from '@/lib/categoryMeta';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMapStore } from '@/hooks/useMapStore';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/primitives.module.scss';

export function SavedPlacesList() {
  const { setSelectedPoiId } = useMapStore();
  const { setProfileOpen } = useAuthStore();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['user.saved'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/profile/saved');
      return res.data.data; // Record<string, poi[]>
    },
  });

  if (isLoading) {
    return (
      <div className={styles.breakdownRoot}>
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
      </div>
    );
  }

  const collectionEntries = collections ? Object.entries(collections) : [];
  const totalPois = collectionEntries.reduce((sum, [, pois]: [string, any]) => sum + (pois?.length || 0), 0);

  if (totalPois === 0) {
    return <div className={styles.emptyState}>Bạn chưa lưu địa điểm nào. Bấm ❤️ trên trang chi tiết POI để lưu!</div>;
  }

  const handleViewOnMap = (poiId: string | number) => {
    setSelectedPoiId(String(poiId));
    setProfileOpen(false);
  };

  return (
    <div className={styles.breakdownRoot}>
      {collectionEntries.map(([collectionName, pois]: [string, any]) => (
        <div key={collectionName}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Bookmark className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            {collectionName} ({pois?.length || 0})
          </h3>

          <div className={styles.reviewList}>
            {pois?.map((poi: any) => (
              <Card key={poi.poi_id} style={{ padding: '1rem', cursor: 'pointer' }} onClick={() => handleViewOnMap(poi.poi_id)}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <CategoryIconBadge iconKey={poi.category_icon} categoryName={null} size={48} />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontWeight: 700, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>
                        {poi.name}
                      </h4>
                      <ScoreBadge score={poi.overall_score || 0} size="sm" />
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.25rem' }}>
                      {poi.address || 'Không rõ địa chỉ'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 700, marginTop: '0.5rem' }}>
                      <ExternalLink className="w-3 h-3" /> Xem trên bản đồ
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
