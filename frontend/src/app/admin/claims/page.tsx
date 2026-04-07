'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BadgeCheck, Loader2, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';

import { AdminPOIDetail } from '@/components/admin/AdminPOIDetail';

export default function ClaimsPage() {
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [action, setAction] = useState<'approved' | 'rejected' | 'detail' | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const { data: claims, isLoading } = useQuery({
    queryKey: ['admin.claims.pending'],
    queryFn: async () => {
      // By default the API returns status=pending
      const res = await axiosInstance.get('/admin/claims');
      return res.data.data;
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.put(`/admin/claims/${selectedClaim.id}`, {
        status: action,
        admin_note: adminNote
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.claims.pending'] });
      handleCloseDialog();
    }
  });

  const handleOpenDialog = (claim: any, nextAction: 'approved' | 'rejected' | 'detail') => {
    setSelectedClaim(claim);
    setAction(nextAction);
    setAdminNote('');
  };

  const handleCloseDialog = () => {
    setSelectedClaim(null);
    setAction(null);
    setAdminNote('');
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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Xét duyệt Doanh nghiệp</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: '2rem' }}>
        Kiểm tra giấy phép kinh doanh để chuyển quyền sở hữu (Claim) địa điểm cho tổ chức.
      </p>

      {(!claims || claims.length === 0) ? (
        <Card style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--color-outline)' }}>
            <Check className="w-12 h-12" />
          </div>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-on-surface-variant)' }}>
            Không có yêu cầu nào!
          </p>
          <p style={{ color: 'var(--color-outline)' }}>
            Tất cả các yêu cầu Claim POI đã được xử lý.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {claims.map((claim: any) => (
            <Card key={claim.id} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ backgroundColor: '#146c2e15', padding: '0.5rem', borderRadius: '50%', color: '#146c2e' }}>
                      <BadgeCheck className="w-5 h-5" />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Yêu cầu sở hữu: {claim.poi_name}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div><span style={{ color: 'var(--color-outline)' }}>Địa chỉ POI:</span> {claim.poi_address}</div>
                    <div><span style={{ color: 'var(--color-outline)' }}>Người yêu cầu:</span> {claim.user_username} ({claim.user_email})</div>
                    <div><span style={{ color: 'var(--color-outline)' }}>Ngày gửi:</span> {new Date(claim.created_at).toLocaleString('vi-VN')}</div>
                  </div>
                </div>

                <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {claim.document_url ? (
                    <a 
                      href={claim.document_url} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        padding: '1rem', border: '1px dashed var(--color-primary)', 
                        borderRadius: '0.5rem', color: 'var(--color-primary)',
                        textDecoration: 'none', fontWeight: 600, justifyContent: 'center'
                      }}
                    >
                      <ImageIcon className="w-5 h-5" />
                      Xem tài liệu đính kèm
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div style={{ padding: '1rem', border: '1px dashed var(--color-error)', borderRadius: '0.5rem', color: 'var(--color-error)', textAlign: 'center', fontSize: '0.875rem' }}>
                      Không có tài liệu
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: 'auto' }}>
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenDialog(claim, 'detail')}
                    >
                      Chi tiết POI
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleOpenDialog(claim, 'rejected')}
                      style={{ color: 'var(--color-error)' }}
                    >
                      Từ chối
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => handleOpenDialog(claim, 'approved')}
                    >
                      Cấp quyền sở hữu
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent style={{ maxWidth: action === 'detail' ? '600px' : '425px', padding: action === 'detail' ? '1.5rem 1.5rem 0' : '1.5rem' }}>
          <DialogHeader style={action === 'detail' ? { marginBottom: '1rem' } : undefined}>
            <DialogTitle>
              {action === 'approved' ? 'Cấp quyền sở hữu' : action === 'rejected' ? 'Từ chối yêu cầu' : 'Chi tiết địa điểm'}
            </DialogTitle>
          </DialogHeader>
          
          {action === 'detail' ? (
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(80vh - 4rem)' }}>
              <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
                <AdminPOIDetail poiId={selectedClaim?.poi_id} />
              </div>
              <DialogFooter style={{ marginTop: '1rem', paddingBottom: '1.5rem' }}>
                <Button variant="ghost" onClick={handleCloseDialog}>Đóng</Button>
                <Button variant="outline" onClick={() => setAction('rejected')} style={{ color: 'var(--color-error)' }}>Từ chối</Button>
                <Button variant="primary" onClick={() => setAction('approved')}>Cấp quyền sở hữu</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div style={{ padding: '1rem 0' }}>
                <p style={{ marginBottom: '1rem' }}>
                  Bạn đang {action === 'approved' ? 'cấp quyền quản lý' : 'từ chối'} định danh cho địa điểm <strong>{selectedClaim?.poi_name}</strong>.
                </p>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Ghi chú cho doanh nghiệp (Admin Note)
                </label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="ví dụ: Giấy phép bị mờ, không khớp tên..."
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
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={handleCloseDialog}>
                  Hủy
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending || (action === 'rejected' && adminNote.trim().length === 0)}
                  style={action === 'rejected' ? { backgroundColor: 'var(--color-error)' } : {}}
                >
                  {reviewMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
