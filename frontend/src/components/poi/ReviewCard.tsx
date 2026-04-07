'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { ThumbsUp, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReportDialog } from './ReportDialog';
import styles from '@/styles/primitives.module.scss';

export function ReviewCard({ review, poiId }: { review: any; poiId?: string | number }) {
  const [helpfulCount, setHelpfulCount] = useState<number>(review.helpful_count || 0);
  const [hasVoted, setHasVoted] = useState(!!review.has_voted);
  const [showReport, setShowReport] = useState(false);
  const { requireAuth } = useAuthGuard();
  const queryClient = useQueryClient();
  
  // Sync state when props change (e.g. background refetch)
  React.useEffect(() => {
    setHelpfulCount(review.helpful_count || 0);
    setHasVoted(!!review.has_voted);
  }, [review.helpful_count, review.has_voted]);
  
  const dateStr = new Date(review.created_at).toLocaleDateString('vi-VN');

  // ── Helpful toggle — Optimistic Update ──
  const helpfulMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/pois/${poiId}/reviews/${review.id}/helpful`);
      return res.data.data; // { helpful_count, action }
    },
    // Chạy NGAY LẬP TỨC khi user vừa bấm nút (bỏ qua network delay)
    onMutate: async () => {
      // Lưu lại state hiện tại để làm "bảo hiểm" lỡ API lỗi (Rollback)
      const previousVoted = hasVoted;
      const previousCount = helpfulCount;

      // Cập nhật state NGAY LẬP TỨC để UI nhảy số và lật màu ngay
      setHasVoted(!previousVoted);
      setHelpfulCount(prev => previousVoted ? Math.max(0, prev - 1) : prev + 1);

      // Trả về context để lỡ có lỗi thì lấy lại
      return { previousVoted, previousCount };
    },
    onError: (err, variables, context) => {
      // Nếu API trả về lỗi (ví dụ rớt mạng), roll_back UI về cái cũ
      if (context) {
        setHasVoted(context.previousVoted);
        setHelpfulCount(context.previousCount);
      }
    },
    onSuccess: (data) => {
      // (Background operation) Khi API chạy xong, update số server trả về lần chót cho chắc chắn
      setHelpfulCount(data.helpful_count);
      setHasVoted(data.action === 'added');
      queryClient.invalidateQueries({ queryKey: ['pois.reviews', String(poiId)] });
    },
  });

  return (
    <>
      <div className={styles.reviewCard}>
        <div className={styles.reviewHeader} style={{ justifyContent: 'space-between' }}>
          <div className={styles.reviewHeader}>
            <div className={styles.reviewAvatar}>
              {review.reviewer_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={styles.reviewMeta}>
              <span className={styles.reviewUser}>{review.reviewer_name}</span>
              <span className={styles.reviewDate}>{dateStr}</span>
            </div>
          </div>
          <ScoreBadge score={review.rating} />
        </div>

        <p className={styles.reviewBody}>{review.comment}</p>

        {review.image_url && (
          <div style={{ width: '100%', height: '8rem', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: 'var(--color-surface-dim)' }}>
            <img src={review.image_url} alt="Review attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(116,119,117,0.08)' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', backgroundColor: 'var(--color-surface-dim)', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
            KN: {review.disability_type || 'Chung'}
          </span>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => requireAuth(() => helpfulMutation.mutate())}
              style={{ color: hasVoted ? 'var(--color-primary)' : undefined }}
            >
              <ThumbsUp className="w-4 h-4" style={{ fill: hasVoted ? 'currentColor' : 'none' }} />
              <span style={{ marginLeft: '0.25rem' }}>Hữu ích ({helpfulCount})</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => requireAuth(() => setShowReport(true))}
              style={{ color: 'var(--color-error)', padding: '0.25rem 0.5rem' }}
            >
              <Flag className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ReportDialog
        variant="review"
        targetId={review.id}
        open={showReport}
        onClose={() => setShowReport(false)}
      />
    </>
  );
}
