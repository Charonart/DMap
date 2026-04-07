'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Trophy, Medal, MapPin, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './LeaderboardTab.module.scss';
import primStyles from '@/styles/primitives.module.scss';
import { cn } from '@/lib/utils';

export function LeaderboardTab() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/leaderboard');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className={primStyles.breakdownRoot}>
        <Skeleton style={{ width: '100%', height: '6rem', borderRadius: '1rem' }} />
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} style={{ width: '100%', height: '4rem', borderRadius: '0.75rem' }} />
        ))}
      </div>
    );
  }

  const ranked = (leaderboard || []).filter((u: any) => u.trust_score > 0);

  if (ranked.length === 0) {
    return <div className={primStyles.emptyState}>Chưa có người đóng góp nào có điểm uy tín. Hãy là người đầu tiên!</div>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.topCard}>
        <Trophy className={styles.trophyIcon} />
        <h2 className={styles.leaderboardTitle}>Bảng Vinh Danh</h2>
        <p className={styles.leaderboardSub}>Top {ranked.length} đóng góp viên xuất sắc nhất cộng đồng DMap</p>
      </div>

      <div className={primStyles.reviewList}>
        {ranked.map((user: any, index: number) => {
          const rank = index + 1;
          const poiCount = parseInt(user.poi_count) || 0;
          const reviewCount = parseInt(user.review_count) || 0;
          const isTop3 = rank <= 3;
          const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--color-outline)';

          return (
            <Card 
              key={user.id} 
              className={cn(styles.userCard, isTop3 && styles.top3)}
            >
              <div 
                className={styles.rank}
                style={{ color: rankColor }}
              >
                #{rank}
              </div>

              <div className={styles.avatar}>
                {user.username?.charAt(0)?.toUpperCase() || '?'}
              </div>

              <div className={styles.info}>
                <h4 className={styles.username}>
                  <span>{user.username}</span>
                  {isTop3 && <Medal className="w-4 h-4 text-primary shrink-0" />}
                </h4>
                <div className={styles.statsRow}>
                  {poiCount > 0 && (
                    <span className={styles.statItem}>
                      <MapPin className="w-3 h-3" /> {poiCount}
                    </span>
                  )}
                  {reviewCount > 0 && (
                    <span className={styles.statItem}>
                      <MessageSquare className="w-3 h-3" /> {reviewCount}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.scoreCol}>
                <div className={styles.trustScore}>{user.trust_score}</div>
                <div className={styles.scoreLabel}>Uy Tín</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
