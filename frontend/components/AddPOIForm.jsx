'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/components/AddPOIForm.module.css';
import { useAuth } from '@/context/AuthContext';

export default function AddPOIForm({ location, initialData, onClose, onSuccess, getScoreVisuals }) {
  const { user } = useAuth();
  const isEditMode = !!initialData;
  const [categories, setCategories] = useState([]);
  const [features, setFeatures] = useState([]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    category_id: initialData?.category_id || '',
  });
  
  const [ratings, setRatings] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/accessibility-features').then(r => r.json())
    ]).then(([cats, feats]) => {
      const validCats = Array.isArray(cats) ? cats : [];
      const validFeats = Array.isArray(feats) ? feats : [];
      setCategories(validCats);
      setFeatures(validFeats);
      if (validCats.length > 0 && !isEditMode) setFormData(prev => ({ ...prev, category_id: validCats[0].id }));
      
      if (isEditMode && initialData.accessibility_features) {
        const initialRatings = {};
        initialData.accessibility_features.forEach(f => {
          if (f.quality_rating) initialRatings[f.id] = f.quality_rating;
        });
        setRatings(initialRatings);
      }
    });
  }, [initialData, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const accessibility_features = Object.keys(ratings)
      .map(id => ({
        feature_id: parseInt(id),
        is_available: true,
        quality_rating: ratings[id],
      }))
      .filter(f => f.quality_rating >= 1 && f.quality_rating <= 10);
      
    const payload = {
      ...formData,
      lat: isEditMode ? initialData.lat : location.lat,
      lng: isEditMode ? initialData.lng : location.lng,
      accessibility_features
    };

    try {
      const url = isEditMode ? `/api/pois/${initialData.id}` : '/api/pois';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (!isEditMode) {
          if (user && (user.role === 'admin' || user.role === 'moderator')) {
            alert('Đã thêm địa điểm thành công!');
          } else {
            alert('Đã gửi đề xuất thêm địa điểm! Vui lòng chờ Admin phê duyệt để hiển thị trên bản đồ.');
          }
        }
        onSuccess();
      } else {
        const error = await res.json();
        alert('Lỗi: ' + error.error);
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedFeatures = features.reduce((acc, feat) => {
    if (!acc[feat.feature_group]) acc[feat.feature_group] = [];
    acc[feat.feature_group].push(feat);
    return acc;
  }, {});

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditMode ? 'Chỉnh sửa địa điểm' : 'Thêm địa điểm mới'}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên địa điểm *</label>
            <input 
              required
              className={styles.input}
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Địa chỉ</label>
            <input 
              className={styles.input}
              type="text" 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Danh mục *</label>
            <select 
              required
              className={styles.select}
              value={formData.category_id} 
              onChange={e => setFormData({...formData, category_id: e.target.value})}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name_vi}</option>)}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Vị trí lấy từ bản đồ</label>
            <div className={styles.locationDisplay}>
              {isEditMode ? `${initialData.lat.toFixed(5)}, ${initialData.lng.toFixed(5)}` : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
            </div>
          </div>

          {!isEditMode && (
            <h3 className={styles.sectionTitle}>Đánh giá tiêu chí tiếp cận (1-10)</h3>
          )}
          
          {!isEditMode && Object.entries(groupedFeatures).map(([group, feats]) => (
            <div key={group} className={styles.featureGroup}>
              <h4 className={styles.groupTitle}>{
                group === 'mobility' ? '♿ Vận động' : 
                group === 'visual' ? '👁️ Thị giác' : 
                group === 'hearing' ? '👂 Thính giác' : '🧠 Nhận thức'
              }</h4>
              
              {feats.map(f => (
                <div key={f.id} className={styles.featureRow}>
                  <div className={styles.featureLabel}>{f.name_vi}</div>
                  <input 
                    type="range" 
                    min="1" max="10" 
                    value={ratings[f.id] || 0} 
                    onChange={e => setRatings({...ratings, [f.id]: parseInt(e.target.value)})}
                    className={styles.slider}
                  />
                  <span className={styles.ratingValue} style={{ 
                    color: ratings[f.id] ? getScoreVisuals(ratings[f.id]).colorVar : 'var(--color-outline)' 
                  }}>
                    {ratings[f.id] ? `${ratings[f.id]}/10` : 'Chưa xếp hạng'}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <div className={styles.footer}>
            <button type="button" className={styles.btnOutline} onClick={onClose}>Hủy</button>
            <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Cập nhật địa điểm' : 'Lưu địa điểm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
