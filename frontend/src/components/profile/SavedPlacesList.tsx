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
import styles from './SavedPlacesList.module.scss';
import primStyles from '@/styles/primitives.module.scss';
import { cn } from '@/lib/utils';

export function SavedPlacesList() {
  const { setSelectedPoiId } = useMapStore();
  const { setProfileOpen } = useAuthStore();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['user.saved'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/profile/saved');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className={primStyles.breakdownRoot}>
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
      </div>
    );
  }

  const collectionEntries = collections ? Object.entries(collections) : [];
  const totalPois = collectionEntries.reduce((sum, [, pois]: [string, any]) => sum + (pois?.length || 0), 0);

  if (totalPois === 0) {
    return <div className={primStyles.emptyState}>Bạn chưa lưu địa điểm nào. Bấm ❤️ trên trang chi tiết POI để lưu!</div>;
  }

  const handleViewOnMap = (poiId: string | number) => {
    setSelectedPoiId(String(poiId));
    setProfileOpen(false);
  };

  return (
    <div className={styles.root}>
      {collectionEntries.map(([collectionName, pois]: [string, any]) => (
        <section key={collectionName} className={styles.section}>
          <h3 className={styles.sectionHeader}>
            <Bookmark className="w-5 h-5 text-primary" />
            {collectionName} ({pois?.length || 0})
          </h3>

          <div className={primStyles.reviewList}>
            {pois?.map((poi: any) => (
              <Card key={poi.poi_id} className={styles.card} onClick={() => handleViewOnMap(poi.poi_id)}>
                <div className={styles.cardContent}>
                  <div className={styles.iconSlot}>
                    <CategoryIconBadge iconKey={poi.category_icon} categoryName={null} size={40} />
                  </div>
                  
                  <div className={styles.info}>
                    <div className={styles.titleRow}>
                      <h4 className={styles.title}>
                        {poi.name}
                      </h4>
                      <ScoreBadge score={poi.overall_score || 0} size="sm" />
                    </div>
                    <p className={styles.address}>
                      {poi.address || 'Không rõ địa chỉ'}
                    </p>
                    <div className={styles.viewAction}>
                      <ExternalLink className="w-3 h-3" /> Xem trên bản đồ
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
