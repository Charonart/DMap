'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Trophy, Medal, MapPin, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from '@/styles/primitives.module.scss';

export function LeaderboardTab() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/leaderboard');
      return res.data.data; // array of { id, username, trust_score, poi_count, review_count, ... }
    },
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  if (isLoading) {
    return (
      <div className={styles.breakdownRoot}>
        <Skeleton style={{ width: '100%', height: '6rem', borderRadius: '1rem' }} />
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} style={{ width: '100%', height: '4rem', borderRadius: '0.75rem' }} />
        ))}
      </div>
    );
  }

  // Filter users with trust_score > 0
  const ranked = (leaderboard || []).filter((u: any) => u.trust_score > 0);

  if (ranked.length === 0) {
    return <div className={styles.emptyState}>Chưa có người đóng góp nào có điểm uy tín. Hãy là người đầu tiên!</div>;
  }

  return (
    <div className={styles.breakdownRoot}>
      <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: 'rgba(0,108,110,0.1)', borderRadius: '1rem' }}>
        <Trophy className="w-12 h-12" style={{ color: 'var(--color-tertiary)', margin: '0 auto 0.5rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-tertiary)', marginBottom: '0.25rem' }}>Bảng Vinh Danh</h2>
        <p style={{ color: 'var(--color-on-surface-variant)' }}>Top {ranked.length} đóng góp viên xuất sắc nhất cộng đồng DMap</p>
      </div>

      <div className={styles.reviewList}>
        {ranked.map((user: any, index: number) => {
          const rank = index + 1;
          const poiCount = parseInt(user.poi_count) || 0;
          const reviewCount = parseInt(user.review_count) || 0;

          return (
            <Card 
              key={user.id} 
              style={{ 
                padding: '1rem', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem',
                ...(rank <= 3 ? { borderLeft: '3px solid var(--color-primary)', backgroundColor: 'rgba(11,87,208,0.03)' } : {})
              }}
            >
              <div style={{ width: '2rem', fontWeight: 900, fontSize: '1.25rem', textAlign: 'center', color: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--color-outline)' }}>
                #{rank}
              </div>

              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: 'var(--color-surface-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-on-surface)', flexShrink: 0 }}>
                {user.username?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontWeight: 700, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                  {rank <= 3 && <Medal className="w-4 h-4" style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                </h4>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>
                  {poiCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin className="w-3 h-3" /> {poiCount} địa điểm
                    </span>
                  )}
                  {reviewCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MessageSquare className="w-3 h-3" /> {reviewCount} đánh giá
                    </span>
                  )}
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-tertiary)' }}>{user.trust_score}</div>
                <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-on-surface-variant)' }}>Uy Tín</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
