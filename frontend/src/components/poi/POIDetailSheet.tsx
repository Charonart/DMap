'use client';
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useMapStore } from '@/hooks/useMapStore';
import { Sheet, SheetContent } from '@/components/ui/Sheet';
import { POIHeaderInfo } from './POIHeaderInfo';
import { POIPerformanceBreakdown } from './POIPerformanceBreakdown';
import { POIActionRow } from './POIActionRow';
import { PhotoGallery } from './PhotoGallery';
import { ReviewList } from './ReviewList';
import { AIReviewSummary } from './AIReviewSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMapContext } from '@/components/map/MapContext';
import styles from './POIDetailSheet.module.scss';
import { cn } from '@/lib/utils';
import { ClaimPOIDialog } from './ClaimPOIDialog';
import { BadgeCheck } from 'lucide-react';

export function POIDetailSheet() {
  const { selectedPoiId, setSelectedPoiId } = useMapStore();
  const { map } = useMapContext();
  const isOpen = !!selectedPoiId;
  const [claimOpen, setClaimOpen] = React.useState(false);

  const { data: poiData, isLoading } = useQuery({
    queryKey: ['pois', selectedPoiId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pois/${selectedPoiId}`);
      return res.data.data;
    },
    enabled: isOpen
  });

  // Optional: pan map to POI when pulling up sheet
  useEffect(() => {
    if (map && poiData && poiData.lat && poiData.lng) {
      map.flyTo({ center: [poiData.lng, poiData.lat], zoom: 16 });
    }
  }, [map, poiData]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setSelectedPoiId(null)} modal={false}>
      <SheetContent side="detailPanel" padding="none">
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Skeleton className={styles.skeletonImg} />
            <Skeleton className={styles.skeletonTitle} />
            <Skeleton className={styles.skeletonDesc} />
          </div>
        ) : poiData ? (
          <div className={cn(styles.contentBody, "no-scrollbar")}>
            <div className={styles.headerSection}>
              <POIHeaderInfo poi={poiData} />
              <POIActionRow poi={poiData} />
            </div>

            <div className={styles.tabSection}>
              <Tabs defaultValue="overview" className={styles.tabsRoot}>
                <TabsList className={styles.tabsList}>
                  <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh Giá</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className={styles.tabContentOverview}>
                  <POIPerformanceBreakdown features={poiData.accessibility_features} />
                  <PhotoGallery poiId={poiData.id} />
                  
                  {/* Claim POI Section */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(var(--color-outline-rgb), 0.1)', textAlign: 'center' }}>
                    {poiData.is_verified ? (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <BadgeCheck className="w-4 h-4" />
                        Đã được xác nhận bởi chủ sở hữu
                      </div>
                    ) : (
                      <button 
                        onClick={() => setClaimOpen(true)}
                        style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Bạn là chủ địa điểm này? Xác nhận quyền sở hữu
                      </button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className={styles.tabContentReviews}>
                  <AIReviewSummary poiId={poiData.id} />
                  <ReviewList poiId={poiData.id} />
                </TabsContent>
              </Tabs>
            </div>
            
            <ClaimPOIDialog 
              poiId={poiData.id} 
              poiName={poiData.name} 
              open={claimOpen} 
              onClose={() => setClaimOpen(false)} 
            />
          </div>
        ) : (
          <div className={styles.errorState}>Lỗi khi tải thông tin địa điểm</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
