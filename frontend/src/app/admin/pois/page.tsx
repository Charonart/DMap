'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { POIHeaderInfo } from '@/components/poi/POIHeaderInfo';
import { POIPerformanceBreakdown } from '@/components/poi/POIPerformanceBreakdown';

import { AdminPOIDetail } from '@/components/admin/AdminPOIDetail';

export default function PendingPoisPage() {
  const queryClient = useQueryClient();
  const [selectedPoi, setSelectedPoi] = useState<any>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'detail' | null>(null);
  const [note, setNote] = useState('');

  const { data: pois, isLoading } = useQuery({
    queryKey: ['admin.pois.pending'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/pois/pending');
      return res.data.data;
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.put(`/admin/pois/${selectedPoi.id}/review`, {
        status: action,
        note
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.pois.pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin.stats'] });
      handleClose();
    }
  });

  const handleOpenDialog = (poi: any, nextAction: 'approved' | 'rejected' | 'detail') => {
    setSelectedPoi(poi);
    setAction(nextAction);
    setNote('');
  };

  const handleClose = () => {
    setSelectedPoi(null);
    setAction(null);
    setNote('');
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Xét duyệt địa điểm</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
        Các địa điểm mới do người dùng đóng góp đang chờ phê duyệt.
      </p>

      {(!pois || pois.length === 0) ? (
        <Card style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-outline)' }}>
            <Check className="w-12 h-12" />
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
            Tất cả đã được xử lý!
          </p>
          <p style={{ color: 'var(--color-outline)' }}>
            Không có địa điểm nào đang chờ duyệt lúc này.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pois.map((poi: any) => (
            <Card key={poi.id} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'row', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ backgroundColor: 'rgba(11, 87, 208, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--color-primary)' }}>
                <MapPin className="w-6 h-6" />
              </div>
              
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{poi.name}</h3>
                <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{poi.address}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-outline)' }}>
                  <span>Ngày tạo: {new Date(poi.created_at).toLocaleString('vi-VN')}</span>
                  <span>ID: {poi.id}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <Button 
                  variant="outline"
                  onClick={() => handleOpenDialog(poi, 'detail')}
                >
                  Chi tiết
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleOpenDialog(poi, 'rejected')}
                  style={{ color: 'var(--color-error)' }}
                >
                  Từ chối
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleOpenDialog(poi, 'approved')}
                >
                  Phê duyệt
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedPoi} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent style={{ maxWidth: action === 'detail' ? '600px' : '425px', padding: action === 'detail' ? '1.5rem 1.5rem 0' : '1.5rem' }}>
          <DialogHeader style={action === 'detail' ? { marginBottom: '1rem', display: 'none' } : undefined}>
            <DialogTitle className={action === 'detail' ? 'sr-only' : ''}>
              {action === 'approved' ? 'Phê duyệt địa điểm' : action === 'rejected' ? 'Từ chối địa điểm' : 'Chi tiết địa điểm'}
            </DialogTitle>
          </DialogHeader>
          
          {action === 'detail' ? (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(80vh - 4rem)' }}>
              <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                <AdminPOIDetail poiId={selectedPoi?.id} />
              </div>
              <DialogFooter style={{ marginTop: '1rem', paddingBottom: '1.5rem' }}>
                <Button variant="ghost" onClick={handleClose}>Đóng</Button>
                <Button variant="outline" onClick={() => setAction('rejected')} style={{ color: 'var(--color-error)' }}>Từ chối</Button>
                <Button variant="primary" onClick={() => setAction('approved')}>Phê duyệt</Button>
              </DialogFooter>
            </div>
          ) : (
            <div style={{ padding: '1rem 0' }}>
              <p style={{ marginBottom: '1rem' }}>
                Bạn đang {action === 'approved' ? 'phê duyệt' : 'từ chối'} địa điểm <strong>{selectedPoi?.name}</strong>.
              </p>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Ghi chú {action === 'rejected' ? '(Bắt buộc)' : '(Tuỳ chọn)'}
              </label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Lý do..."
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  fontFamily: 'inherit'
                }}
              />
              <DialogFooter style={{ marginTop: '1rem' }}>
                <Button variant="ghost" onClick={handleClose}>Hủy</Button>
                <Button 
                  variant="primary" 
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending || (action === 'rejected' && note.trim().length === 0)}
                  style={action === 'rejected' ? { backgroundColor: 'var(--color-error)' } : {}}
                >
                  {reviewMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
