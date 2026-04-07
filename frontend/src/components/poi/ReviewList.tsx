'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { ReviewCard } from './ReviewCard';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from '@/styles/primitives.module.scss';

export function ReviewList({ poiId }: { poiId: string | number }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['pois.reviews', String(poiId)],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pois/${poiId}/reviews`);
      return res.data.data;
    },
    enabled: !!poiId
  });

  if (isLoading) {
    return (
      <div className={styles.reviewList}>
        <Skeleton style={{ width: '100%', height: '8rem', borderRadius: '0.75rem' }} />
        <Skeleton style={{ width: '100%', height: '8rem', borderRadius: '0.75rem' }} />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return <div className={styles.emptyState}>Chưa có đánh giá nào. Hãy là người đầu tiên!</div>;
  }

  return (
    <div className={styles.reviewList}>
      {reviews.map((r: any) => (
        <ReviewCard key={r.id} review={r} poiId={poiId} />
      ))}
    </div>
  );
}
