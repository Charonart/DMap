'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Star, MapPin } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from '@/styles/primitives.module.scss';

export function ContributionsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['user.contributions'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/profile/contributions');
      return res.data.data; // { pois: [...], reviews: [...] }
    },
  });

  if (isLoading) {
    return (
      <div className={styles.breakdownRoot}>
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
    return <div className={styles.emptyState}>Bạn chưa có đóng góp nào. Hãy đánh giá hoặc thêm địa điểm mới!</div>;
  }

  return (
    <div className={styles.breakdownRoot}>
      {/* Reviews section */}
      {reviews.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Đánh giá của tôi ({reviews.length})
          </h3>
          <div className={styles.reviewList}>
            {reviews.map((review: any) => (
              <Card key={review.id} style={{ padding: '1rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>POI #{review.poi_id}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <ScoreBadge score={review.rating} />
                </div>
                {review.comment && (
                  <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {review.comment}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* POIs section */}
      {pois.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingTop: reviews.length > 0 ? '1.5rem' : 0, borderTop: reviews.length > 0 ? '1px solid rgba(116,119,117,0.08)' : 'none' }}>
            <MapPin className="w-5 h-5" style={{ color: 'var(--color-tertiary)' }} /> Địa điểm đã thêm ({pois.length})
          </h3>
          <div className={styles.reviewList}>
            {pois.map((poi: any) => {
              const statusLabel = poi.status === 'approved' ? 'Đã duyệt' : poi.status === 'rejected' ? 'Bị từ chối' : 'Đang chờ duyệt';
              const statusColor = poi.status === 'approved' ? 'var(--color-score-good)' : poi.status === 'rejected' ? 'var(--color-error)' : '#f9a825';
              const statusBg = poi.status === 'approved' ? 'rgba(46,125,50,0.1)' : poi.status === 'rejected' ? 'rgba(186,26,26,0.1)' : 'rgba(249,168,37,0.15)';

              return (
                <Card key={poi.id} style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontWeight: 700, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {poi.name_vi || poi.name}
                      </h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)' }}>
                        {poi.address || 'Không rõ địa chỉ'}
                      </p>
                    </div>
                    <span style={{ padding: '0.25rem 0.5rem', backgroundColor: statusBg, color: statusColor, fontSize: '0.75rem', fontWeight: 700, borderRadius: '0.25rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                      {statusLabel}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
