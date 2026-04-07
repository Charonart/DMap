'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Star, MapPin } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './ContributionsList.module.scss';
import primStyles from '@/styles/primitives.module.scss';
import { cn } from '@/lib/utils';

export function ContributionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['user.contributions'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/profile/contributions');
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className={primStyles.breakdownRoot}>
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
        <Skeleton style={{ width: '100%', height: '5rem', borderRadius: '0.75rem' }} />
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const pois = data?.pois || [];
  const hasNothing = reviews.length === 0 && pois.length === 0;

  if (hasNothing) {
    return <div className={primStyles.emptyState}>Bạn chưa có đóng góp nào. Hãy đánh giá hoặc thêm địa điểm mới!</div>;
  }

  return (
    <div className={styles.root}>
      {/* Reviews section */}
      {reviews.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionHeader}>
            <Star className="w-5 h-5 text-primary" />
            Đánh giá của tôi ({reviews.length})
          </h3>
          <div className={primStyles.reviewList}>
            {reviews.map((review: any) => (
              <Card key={review.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div className="min-w-0">
                    <h4 className={styles.itemTitle}>POI #{review.poi_id}</h4>
                    <p className={styles.itemDate}>
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <ScoreBadge score={review.rating} />
                </div>
                {review.comment && (
                  <p className={styles.itemComment}>
                    {review.comment}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* POIs section */}
      {pois.length > 0 && (
        <section className={cn(styles.section, reviews.length > 0 && styles.divider)}>
          <h3 className={styles.sectionHeader}>
            <MapPin className="w-5 h-5 text-tertiary" />
            Địa điểm đã thêm ({pois.length})
          </h3>
          <div className={primStyles.reviewList}>
            {pois.map((poi: any) => {
              const statusLabel = poi.status === 'approved' ? 'Đã duyệt' : poi.status === 'rejected' ? 'Bị từ chối' : 'Đang chờ';
              const statusColor = poi.status === 'approved' ? 'var(--color-score-good)' : poi.status === 'rejected' ? 'var(--color-error)' : '#f9a825';
              const statusBg = poi.status === 'approved' ? 'rgba(46,125,50,0.1)' : poi.status === 'rejected' ? 'rgba(186,26,26,0.1)' : 'rgba(249,168,37,0.15)';

              return (
                <Card key={poi.id} className={styles.itemCard}>
                  <div className="flex justify-between items-center w-full">
                    <div className="min-w-0 flex-1">
                      <h4 className={cn(styles.itemTitle, "truncate")}>
                        {poi.name_vi || poi.name}
                      </h4>
                      <p className={cn(styles.itemDate, "truncate")}>
                        {poi.address || 'Không rõ địa chỉ'}
                      </p>
                    </div>
                    <span 
                      className={styles.poiStatus}
                      style={{ backgroundColor: statusBg, color: statusColor }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
