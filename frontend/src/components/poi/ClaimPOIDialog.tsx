'use client';
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { BadgeCheck, Send, X } from 'lucide-react';
import styles from './ActionSheets.module.scss';
import { FormGroup } from '@/components/ui/FormLayout';

interface ClaimPOIDialogProps {
  poiId: string | number;
  poiName: string;
  open: boolean;
  onClose: () => void;
}

export function ClaimPOIDialog({ poiId, poiName, open, onClose }: ClaimPOIDialogProps) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const resetForm = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!photo) throw new Error('Vui lòng chọn ảnh / tài liệu chứng minh');

      const formData = new FormData();
      formData.append('document', photo);
      
      const res = await axiosInstance.post(`/pois/${poiId}/claim`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      resetForm();
      onClose();
      setToast('Đã gửi yêu cầu xác nhận. Quản trị viên sẽ sớm liên hệ!');
      setTimeout(() => setToast(''), 4000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Không thể yêu cầu claim';
      setToast(msg);
      setTimeout(() => setToast(''), 4000);
    },
  });

  if (!open) {
    return toast ? <div className={styles.toast}>{toast}</div> : null;
  }

  const canSubmit = !!photo && !claimMutation.isPending;

  return (
    <>
      <div className={styles.reportOverlay} onClick={handleClose}>
        <div className={styles.reportPanel} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.reportHeader}>
            <div className={styles.reportIconCircle} style={{ background: 'rgba(0, 150, 136, 0.12)', color: 'var(--color-primary)' }}>
              <BadgeCheck className="w-5 h-5" />
            </div>
            <h2 className={styles.reportTitle}>Xác nhận Sở Hữu</h2>
          </div>

          {/* Body */}
          <div className={styles.reportBody}>
            <p className={styles.reportHint}>
              Bạn có phải là chủ sở hữu / nhà quản lý của <strong>{poiName}</strong>? <br /><br />
              Vui lòng tải lên <strong>Giấy phép kinh doanh</strong> hoặc hình ảnh chứng minh bạn là chủ cơ sở. Quản trị viên sẽ duyệt yêu cầu này để cấp quyền quản lý cho bạn.
            </p>

            <FormGroup label="Tài liệu chứng minh (Bắt buộc)">
              {!photoPreview ? (
                <label className={styles.uploadArea}>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,application/pdf" 
                    style={{ display: 'none' }} 
                    onChange={handleDocumentChange} 
                  />
                  <div className={styles.uploadContent}>
                    <span className={styles.uploadIcon}>📄</span>
                    <span className={styles.uploadText}>Bấm chọn file (JPG, PNG, PDF)</span>
                  </div>
                </label>
              ) : (
                <div className={styles.photoPreviewWrapper}>
                  {photo?.type.includes('pdf') ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--color-surface)' }}>
                      <span className={styles.uploadIcon}>📑</span>
                      <p className={styles.uploadText} style={{ marginTop: '0.5rem' }}>Đã chọn tài liệu PDF</p>
                    </div>
                  ) : (
                    <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={styles.photoRemoveBtn} 
                    onClick={() => {
                      setPhoto(null);
                      URL.revokeObjectURL(photoPreview);
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </FormGroup>
          </div>

          {/* Footer */}
          <div className={styles.reportFooter}>
            <Button variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => claimMutation.mutate()}
              disabled={!canSubmit}
            >
              <Send className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
              {claimMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
