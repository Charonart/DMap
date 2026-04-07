'use client';
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { NativeSlider } from '@/components/ui/NativeSlider';
import { NativeSelect } from '@/components/ui/Input';
import { FormGroup } from '@/components/ui/FormLayout';
import { X, Send, Accessibility } from 'lucide-react';
import styles from './ActionSheets.module.scss';

function getScoreLabel(score: number) {
  if (score >= 9) return 'Tuyệt vời';
  if (score >= 7) return 'Tốt';
  if (score >= 5) return 'Trung bình';
  if (score >= 3) return 'Kém';
  return 'Không thể tiếp cận';
}

function getScoreColor(score: number) {
  if (score >= 9) return 'var(--color-score-excellent)';
  if (score >= 7) return 'var(--color-score-good)';
  if (score >= 5) return 'var(--color-score-fair)';
  if (score >= 3) return 'var(--color-score-poor)';
  return 'var(--color-score-inaccessible)';
}

interface WriteReviewSheetProps {
  poiId: string | number;
  poiName: string;
  open: boolean;
  onClose: () => void;
}

export function WriteReviewSheet({ poiId, poiName, open, onClose }: WriteReviewSheetProps) {
  const [rating, setRating] = useState(7);
  const [comment, setComment] = useState('');
  const [disabilityType, setDisabilityType] = useState('general');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const queryClient = useQueryClient();

  // Clean form
  const resetForm = () => {
    setComment('');
    setRating(7);
    setDisabilityType('general');
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('comment', comment.trim());
      formData.append('disability_type', disabilityType);
      if (photo) {
        formData.append('image', photo);
      }
      
      const res = await axiosInstance.post(`/pois/${poiId}/reviews`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pois.reviews', String(poiId)] });
      queryClient.invalidateQueries({ queryKey: ['pois', String(poiId)] });
      queryClient.invalidateQueries({ queryKey: ['user.contributions'] });
      resetForm();
      onClose();
      setToast('Đã gửi đánh giá thành công!');
      setTimeout(() => setToast(''), 3000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể gửi đánh giá';
      setToast(msg);
      setTimeout(() => setToast(''), 3000);
    },
  });

  if (!open) {
    return toast ? <div className={styles.toast}>{toast}</div> : null;
  }

  const canSubmit = comment.trim().length >= 5 && !reviewMutation.isPending;

  return (
    <>
      <div className={styles.reviewSheetOverlay} onClick={handleClose}>
        <div className={styles.reviewSheetPanel} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.reviewSheetHeader}>
            <div>
              <h2 className={styles.reviewSheetTitle}>Đánh giá</h2>
              <p className={styles.reviewSheetSubtitle}>{poiName}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Body */}
          <div className={styles.reviewSheetBody}>
            {/* Score Picker */}
            <div className={styles.scorePicker}>
              <FormGroup label="Điểm tiếp cận (1-10)">
                <div className={styles.scoreDisplay}>
                  <span className={styles.scoreValue} style={{ color: getScoreColor(rating) }}>
                    {rating}
                  </span>
                  <div>
                    <div className={styles.scoreLabel} style={{ color: getScoreColor(rating) }}>
                      {getScoreLabel(rating)}
                    </div>
                    <ScoreBadge score={rating} size="sm" />
                  </div>
                </div>
                <NativeSlider
                  min={1}
                  max={10}
                  step={1}
                  value={rating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRating(Number(e.target.value))}
                  valueLabel={rating}
                />
              </FormGroup>
            </div>

            {/* Comment */}
            <FormGroup label="Nhận xét chi tiết" htmlFor="review-comment" required>
              <textarea
                id="review-comment"
                className={styles.textarea}
                placeholder="Mô tả trải nghiệm tiếp cận tại đây... (tối thiểu 5 ký tự)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </FormGroup>

            {/* Disability type */}
            <FormGroup label="Góc nhìn khuyết tật" htmlFor="disability-type">
              <NativeSelect
                id="disability-type"
                value={disabilityType}
                onChange={(e) => setDisabilityType(e.target.value)}
                leftIcon={<Accessibility className="w-4 h-4" />}
              >
                <option value="general">Chung / Tổng quan</option>
                <option value="wheelchair">♿ Xe lăn</option>
                <option value="visual">👁️ Thị giác</option>
                <option value="hearing">👂 Thính giác</option>
                <option value="cognitive">🧠 Nhận thức</option>
              </NativeSelect>
            </FormGroup>

            {/* Photo Upload */}
            <FormGroup label="Ảnh thực tế (Tùy chọn)">
              {!photoPreview ? (
                <label className={styles.uploadArea}>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp" 
                    style={{ display: 'none' }} 
                    onChange={handlePhotoChange} 
                  />
                  <div className={styles.uploadContent}>
                    <span className={styles.uploadIcon}>📷</span>
                    <span className={styles.uploadText}>Bấm để chọn ảnh từ máy</span>
                  </div>
                </label>
              ) : (
                <div className={styles.photoPreviewWrapper}>
                  <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={styles.photoRemoveBtn} 
                    onClick={removePhoto}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </FormGroup>
          </div>

          {/* Footer */}
          <div className={styles.reviewSheetFooter}>
            <Button
              variant="primary"
              onClick={() => reviewMutation.mutate()}
              disabled={!canSubmit}
              style={{ width: '100%' }}
            >
              <Send className="w-4 h-4" style={{ marginRight: '0.5rem' }} />
              {reviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </>
  );
}
