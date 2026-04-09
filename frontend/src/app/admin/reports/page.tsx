'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Flag, Loader2, MessageSquare, MapPin, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { AdminPOIDetail } from '@/components/admin/AdminPOIDetail';

type TabType = 'reviews' | 'pois';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [detailPoiId, setDetailPoiId] = useState<string | number | null>(null);

  // Queries
  const { data: reviewReports, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['admin.reports.reviews'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/reports');
      return res.data.data;
    },
    enabled: activeTab === 'reviews'
  });

  const { data: poiFlags, isLoading: isPoiFlagsLoading } = useQuery({
    queryKey: ['admin.reports.flags'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/flags');
      return res.data.data;
    },
    enabled: activeTab === 'pois'
  });

  // Mutations for Reviews
  const resolveReviewMutation = useMutation({
    mutationFn: async ({ id, status, delete_review }: { id: string | number, status: string, delete_review?: boolean }) => {
      await axiosInstance.put(`/admin/reports/${id}`, { status, delete_review });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.reports.reviews'] });
    }
  });

  // Mutations for POI Flags
  const resolveFlagMutation = useMutation({
    mutationFn: async (poiId: string | number) => {
      await axiosInstance.post(`/admin/flags/${poiId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.reports.flags'] });
      queryClient.invalidateQueries({ queryKey: ['admin.stats'] });
    }
  });

  const hidePoiMutation = useMutation({
    mutationFn: async (poiId: string | number) => {
      // Reject POI (soft delete / hide)
      await axiosInstance.put(`/admin/pois/${poiId}/review`, { status: 'rejected', note: 'Vi phạm quy định, đã qua tố cáo.' });
    },
    onSuccess: (_, poiId) => {
      // Clear flags as well
      resolveFlagMutation.mutate(poiId);
    }
  });


  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quản lý vi phạm</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
        Theo dõi và xử lý các báo cáo từ cộng đồng.
      </p>

      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs 
          value={activeTab} 
          onValueChange={(val) => setActiveTab(val as TabType)}
        >
          <TabsList>
            <TabsTrigger value="reviews">Báo cáo bình luận</TabsTrigger>
            <TabsTrigger value="pois">Cắm cờ địa điểm</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'reviews' && (
        <div>
          {isReviewsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (!reviewReports || reviewReports.length === 0) ? (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <CheckCircle2 className="w-12 h-12 mx-auto text-outline mb-4" style={{ margin: '0 auto 1rem', color: 'var(--color-outline)' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Cộng đồng trong sạch!</p>
              <p style={{ color: 'var(--color-outline)' }}>Không có báo cáo đánh giá xấu nào.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviewReports.map((report: any) => (
                <Card key={report.id} style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-error)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ backgroundColor: '#b3261e15', padding: '0.75rem', borderRadius: '50%', color: 'var(--color-error)' }}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, color: 'var(--color-error)', fontSize: '0.875rem' }}>Lý do báo cáo: {report.reason}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', marginBottom: '1rem' }}>
                        Báo cáo bởi {report.reporter_username || 'Ẩn danh'} lúc {new Date(report.created_at).toLocaleString('vi-VN')}
                      </p>
                      
                      <div style={{ backgroundColor: 'var(--color-surface-dim)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Nội dung bị báo cáo ({report.review_rating}⭐) - bởi {report.reviewer_name}</p>
                        <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--color-on-surface-variant)' }}>"{report.review_comment}"</p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="outline"
                          onClick={() => setDetailPoiId(report.poi_id)}
                        >
                          Chi tiết POI
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => resolveReviewMutation.mutate({ id: report.id, status: 'dismissed' })}
                          disabled={resolveReviewMutation.isPending}
                        >
                          Bỏ qua
                        </Button>
                        <div style={{ flex: 1 }} />
                        <Button 
                          variant="outline"
                          onClick={() => resolveReviewMutation.mutate({ id: report.id, status: 'resolved', delete_review: true })}
                          disabled={resolveReviewMutation.isPending}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa Đánh Giá
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pois' && (
        <div>
          {isPoiFlagsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (!poiFlags || poiFlags.length === 0) ? (
            <Card style={{ padding: '3rem', textAlign: 'center' }}>
              <CheckCircle2 className="w-12 h-12 mx-auto text-outline mb-4" style={{ margin: '0 auto 1rem', color: 'var(--color-outline)' }} />
              <p style={{ fontSize: '1.125rem', fontWeight: 600 }}>Tuyệt vời!</p>
              <p style={{ color: 'var(--color-outline)' }}>Không có địa điểm nào bị cắm cờ tồi.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {poiFlags.map((poi: any) => (
                <Card key={poi.id} style={{ padding: '1.5rem', borderLeft: '4px solid #eebf09' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ backgroundColor: '#eebf0915', padding: '0.75rem', borderRadius: '50%', color: '#aa8800' }}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{poi.name}</h3>
                          <p style={{ fontSize: '0.875rem', color: 'var(--color-outline)', marginBottom: '0.5rem' }}>ID: {poi.id} | Số lượng cờ: <strong style={{ color: '#aa8800' }}>{poi.flag_count}</strong></p>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'var(--color-surface-dim)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Danh sách lý do cắm cờ:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                          {poi.flags?.map((f: any, idx: number) => (
                            <li key={idx} style={{ marginBottom: '0.25rem', color: 'var(--color-on-surface-variant)' }}>
                              {f.reason} (bởi {f.username ? `@${f.username}` : `User ID: ${f.user_id}`})
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button
                          variant="outline"
                          onClick={() => setDetailPoiId(poi.id)}
                        >
                          Chi tiết POI
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => hidePoiMutation.mutate(poi.id)}
                          disabled={hidePoiMutation.isPending}
                          style={{ color: 'var(--color-error)' }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa Địa Điểm (Xác nhận xấu)
                        </Button>
                        <div style={{ flex: 1 }} />
                        <Button 
                          variant="outline"
                          onClick={() => resolveFlagMutation.mutate(poi.id)}
                          disabled={resolveFlagMutation.isPending}
                        >
                          Tha lỗi (Gỡ cờ)
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POI Info Dialog */}
      <Dialog open={!!detailPoiId} onOpenChange={(open) => !open && setDetailPoiId(null)}>
        <DialogContent style={{ maxWidth: '600px', padding: '1.5rem 1.5rem 0' }}>
          <DialogHeader style={{ marginBottom: '1rem', display: 'none' }}>
            <DialogTitle className="sr-only">Chi tiết địa điểm</DialogTitle>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(80vh - 4rem)' }}>
            <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
              {detailPoiId && <AdminPOIDetail poiId={detailPoiId} />}
            </div>
            <DialogFooter style={{ marginTop: '1rem', paddingBottom: '1.5rem' }}>
              <Button variant="ghost" onClick={() => setDetailPoiId(null)}>Đóng</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
