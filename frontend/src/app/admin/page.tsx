'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Users, MapPin, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string, 
  value: number | string, 
  icon: React.ElementType, 
  color: string 
}) {
  return (
    <Card style={{ backgroundColor: 'var(--color-surface)', height: '100%' }}>
      <CardHeader style={{ paddingBottom: '0.5rem', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <CardTitle style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', margin: 0 }}>
          {title}
        </CardTitle>
        <div style={{ backgroundColor: `${color}15`, padding: '0.5rem', borderRadius: '0.5rem', color }}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-on-surface)' }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin.stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/stats');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-error)' }}>
        Không thể tải dữ liệu thống kê. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tổng quan hệ thống</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
        Các chỉ số quan trọng của DMap
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard 
          title="Người dùng hệ thống" 
          value={stats.totalUsers} 
          icon={Users} 
          color="#0b57d0" 
        />
        <StatCard 
          title="Tổng địa điểm (POI)" 
          value={stats.totalPois} 
          icon={MapPin} 
          color="#146c2e" 
        />
        <StatCard 
          title="Chờ xét duyệt" 
          value={stats.pendingPois} 
          icon={Clock} 
          color="#eebf09" 
        />
        <StatCard 
          title="Điểm bị cắm cờ" 
          value={stats.flaggedPois} 
          icon={AlertTriangle} 
          color="#b3261e" 
        />
      </div>
    </div>
  );
}
