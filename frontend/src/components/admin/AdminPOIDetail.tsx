import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { POIHeaderInfo } from '@/components/poi/POIHeaderInfo';
import { POIPerformanceBreakdown } from '@/components/poi/POIPerformanceBreakdown';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminPOIDetail({ poiId }: { poiId: string | number }) {
  const { data: poiData, isLoading } = useQuery({
    queryKey: ['pois', poiId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/pois/${poiId}`);
      return res.data.data;
    },
    enabled: !!poiId
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
        <Skeleton style={{ height: '200px', borderRadius: '1rem' }} />
        <Skeleton style={{ height: '40px', width: '60%' }} />
        <Skeleton style={{ height: '100px', borderRadius: '1rem' }} />
      </div>
    );
  }

  if (!poiData) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-outline)' }}>Không tìm thấy thông tin POI.</div>;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '1rem', border: '1px solid var(--color-outline-variant)' }}>
      <POIHeaderInfo poi={poiData} />
      <div style={{ padding: '0 1.5rem 1.5rem' }}>
        <POIPerformanceBreakdown features={poiData.accessibility_features || []} />
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
          <div style={{ fontSize: '0.875rem' }}><strong>ID POI:</strong> {poiData.id}</div>
          <div style={{ fontSize: '0.875rem' }}><strong>Tọa độ:</strong> {poiData.lng}, {poiData.lat}</div>
          {poiData.phone && <div style={{ fontSize: '0.875rem' }}><strong>SĐT:</strong> {poiData.phone}</div>}
          {poiData.website && <div style={{ fontSize: '0.875rem' }}><strong>Web:</strong> <a href={poiData.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{poiData.website}</a></div>}
          {poiData.opening_hours && <div style={{ fontSize: '0.875rem' }}><strong>Giờ mở cửa:</strong> <pre style={{ fontFamily: 'inherit', margin: 0, whiteSpace: 'pre-wrap' }}>{poiData.opening_hours}</pre></div>}
        </div>
      </div>
    </div>
  );
}
