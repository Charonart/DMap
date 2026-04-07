'use client';
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { Button } from '@/components/ui/Button';
import { Map, Bookmark, BookmarkCheck, Star, AlertTriangle, Share2 } from 'lucide-react';
import { WriteReviewSheet } from './WriteReviewSheet';
import { ReportDialog } from './ReportDialog';
import styles from './POIComponents.module.scss';

export function POIActionRow({ poi }: { poi: any }) {
  const [showReview, setShowReview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const { requireAuth, isAuthenticated } = useAuthGuard();
  const queryClient = useQueryClient();

  // ── Check if already bookmarked ──
  const { data: savedData } = useQuery({
    queryKey: ['user.saved'],
    queryFn: async () => {
      const res = await axiosInstance.get('/users/profile/saved');
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  // Derive bookmark state from saved data
  const isBookmarked = (() => {
    if (!savedData) return false;
    for (const collection of Object.values(savedData)) {
      if (Array.isArray(collection) && collection.some((p: any) => String(p.poi_id) === String(poi?.id))) {
        return true;
      }
    }
    return false;
  })();

  // ── Save mutation ──
  const saveMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/pois/${poi.id}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user.saved'] });
    },
    onError: (err: any) => {
      // 409 = already saved, still refresh the query
      if (err?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['user.saved'] });
      }
    },
  });

  // ── Unsave mutation ──
  const unsaveMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/pois/${poi.id}/save`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user.saved'] });
    },
  });

  if (!poi) return null;

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`, '_blank');
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      unsaveMutation.mutate();
    } else {
      saveMutation.mutate();
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?poi=${poi.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DMap - ${poi.name}`,
          text: `Xem địa điểm ${poi.name} trên DMap!`,
          url,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Đã sao chép liên kết vào clipboard!');
    }
  };

  const isMutating = saveMutation.isPending || unsaveMutation.isPending;

  return (
    <>
      <div className={styles.actionRow}>
        <Button variant="ghost" size="actionCol" onClick={handleDirections} style={{ color: 'var(--color-primary)' }}>
          <Map className="w-5 h-5" />
          <span className={styles.actionLabel}>Đường Đi</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="actionCol" 
          onClick={handleShare}
          style={{ color: 'var(--color-secondary)' }}
        >
          <Share2 className="w-5 h-5" />
          <span className={styles.actionLabel}>Chia sẻ</span>
        </Button>

        <Button 
          variant="ghost" 
          size="actionCol" 
          onClick={() => requireAuth(handleBookmark)}
          disabled={isMutating}
          style={{ color: isBookmarked ? 'var(--color-primary)' : undefined }}
        >
          {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          <span className={styles.actionLabel}>{isBookmarked ? 'Đã lưu' : 'Lưu lại'}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="actionCol" 
          onClick={() => requireAuth(() => setShowReview(true))}
          style={{ color: 'var(--color-tertiary)' }}
        >
          <Star className="w-5 h-5" />
          <span className={styles.actionLabel}>Đánh giá</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="actionCol" 
          onClick={() => requireAuth(() => setShowReport(true))}
          style={{ color: 'var(--color-error)' }}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className={styles.actionLabel}>Báo lỗi</span>
        </Button>
      </div>

      <WriteReviewSheet 
        poiId={poi.id} 
        poiName={poi.name} 
        open={showReview} 
        onClose={() => setShowReview(false)} 
      />

      <ReportDialog
        variant="poi"
        targetId={poi.id}
        open={showReport}
        onClose={() => setShowReport(false)}
      />
    </>
  );
}
