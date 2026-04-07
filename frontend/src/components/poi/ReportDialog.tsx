'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Flag, Send } from 'lucide-react';
import styles from './ActionSheets.module.scss';

interface ReportDialogProps {
  variant: 'poi' | 'review';
  targetId: string | number;
  open: boolean;
  onClose: () => void;
}

export function ReportDialog({ variant, targetId, open, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState('');

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (variant === 'poi') {
        await axiosInstance.post(`/pois/${targetId}/flag`, { reason: reason.trim() });
      } else {
        await axiosInstance.post(`/reviews/${targetId}/report`, { reason: reason.trim() });
      }
    },
    onSuccess: () => {
      setReason('');
      onClose();
      setToast('Đã gửi báo cáo thành công. Cảm ơn bạn!');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể gửi báo cáo';
      setToast(msg);
      setTimeout(() => setToast(''), 3000);
    },
  });

  if (!open) {
    return toast ? <div className={styles.toast}>{toast}</div> : null;
  }

  const canSubmit = reason.trim().length >= 5 && !reportMutation.isPending;
  const title = variant === 'poi' ? 'Báo cáo địa điểm' : 'Báo cáo đánh giá';
  const Icon = variant === 'poi' ? AlertTriangle : Flag;

  return (
    <>
      <div className={styles.reportOverlay} onClick={onClose}>
        <div className={styles.reportPanel} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.reportHeader}>
            <div className={styles.reportIconCircle}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className={styles.reportTitle}>{title}</h2>
          </div>

          {/* Body */}
          <div className={styles.reportBody}>
            <p className={styles.reportHint}>
              Vui lòng cho chúng tôi biết lý do bạn muốn báo cáo{' '}
              {variant === 'poi' ? 'địa điểm này' : 'đánh giá này'}.
              Tối thiểu 5 ký tự.
            </p>
            <textarea
              className={styles.textarea}
              placeholder="Nhập lý do báo cáo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className={styles.reportFooter}>
            <Button variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => reportMutation.mutate()}
              disabled={!canSubmit}
              style={{ backgroundColor: 'var(--color-error)' }}
            >
              <Send className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
              {reportMutation.isPending ? 'Đang gửi...' : 'Gửi báo cáo'}
            </Button>
          </div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
