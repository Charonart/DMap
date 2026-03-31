'use client';

import { useState } from 'react';
import styles from '../styles/components/AddReviewForm.module.css';

export default function AddReviewForm({ poiId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    disability_type: '',
    visited_at: new Date().toISOString().split('T')[0]
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => formPayload.append(key, formData[key]));
      if (imageFile) {
        formPayload.append('image', imageFile);
      }

      const res = await fetch(`/api/pois/${poiId}/reviews`, {
        method: 'POST',
        // No headers needed for FormData
        body: formPayload
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
        <div className={styles.header}>
          <h2 id="review-modal-title" className={styles.title}>Đánh giá địa điểm</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">×</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="rating">Đánh giá chung (1-10) *</label>
            <div className={styles.ratingControl}>
              <span>1</span>
              <input 
                id="rating"
                name="rating"
                type="range" 
                min="1" 
                max="10" 
                step="1" 
                value={formData.rating} 
                onChange={handleChange}
                required
              />
              <span>10</span>
            </div>
            <div className={styles.ratingValue}>Điểm: {formData.rating}/10</div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="disability_type">Loại khuyết tật (Tùy chọn)</label>
            <select 
              id="disability_type"
              name="disability_type"
              value={formData.disability_type} 
              onChange={handleChange}
            >
              <option value="">-- Không tiết lộ --</option>
              <option value="mobility">Vận động ♿</option>
              <option value="visual">Thị giác 👁️</option>
              <option value="hearing">Thính giác 👂</option>
              <option value="cognitive">Nhận thức 🧠</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment">Nhận xét chi tiết</label>
            <textarea 
              id="comment"
              name="comment"
              value={formData.comment} 
              onChange={handleChange}
              placeholder="Chia sẻ trải nghiệm của bạn về độ tiếp cận ở đây..."
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="visited_at">Ngày ghé thăm</label>
            <input 
              id="visited_at"
              name="visited_at"
              type="date" 
              value={formData.visited_at} 
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="review_image">Hình ảnh thực tế (Tùy chọn)</label>
            <input 
              id="review_image"
              name="image"
              type="file" 
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.btnSecondary} disabled={loading}>Hủy</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
