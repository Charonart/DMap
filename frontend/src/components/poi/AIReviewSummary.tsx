'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';

interface AIReviewSummaryProps {
  poiId: number | string;
}

export function AIReviewSummary({ poiId }: AIReviewSummaryProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['ai-summary', poiId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/ai/summary/${poiId}`);
      return res.data.data;
    },
    enabled: !!poiId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Don't render if not enough reviews or error
  if (error || (!isLoading && !data?.summary)) return null;

  return (
    <div style={{
      margin: '0 0 1rem',
      padding: '0.75rem 1rem',
      backgroundColor: 'rgba(0, 108, 110, 0.06)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(0, 108, 110, 0.12)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        marginBottom: '0.5rem',
      }}>
        <Sparkles className="w-3.5 h-3.5" style={{ color: '#006c6e' }} />
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#006c6e',
          letterSpacing: '0.01em',
        }}>
          Tóm tắt AI
        </span>
        {data?.cached && (
          <span style={{
            fontSize: '0.625rem',
            color: 'var(--color-on-surface-variant)',
            marginLeft: 'auto',
            opacity: 0.6,
          }}>
            cached
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <Skeleton style={{ height: '0.75rem', width: '100%' }} />
          <Skeleton style={{ height: '0.75rem', width: '90%' }} />
          <Skeleton style={{ height: '0.75rem', width: '70%' }} />
        </div>
      ) : (
        <p style={{
          fontSize: '0.8125rem',
          lineHeight: 1.6,
          color: 'var(--color-on-surface)',
          margin: 0,
        }}>
          {data?.summary}
        </p>
      )}
    </div>
  );
}
