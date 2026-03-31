'use client';

import { useEffect, useState } from 'react';
import styles from '../styles/components/POIDetailPanel.module.css';
import AddReviewForm from './AddReviewForm';
import { useAuth } from '@/context/AuthContext';

const groupFeatures = (features) => {
  const groups = { mobility: [], visual: [], hearing: [], cognitive: [] };
  const names = { mobility: '♿ Vận động', visual: '👁️ Thị giác', hearing: '👂 Thính giác', cognitive: '🧠 Nhận thức' };
  
  if (!features) return [];
  features.forEach(f => {
    if (groups[f.feature_group]) groups[f.feature_group].push(f);
  });
  
  return Object.keys(groups).filter(k => groups[k].length > 0).map(k => ({
    key: k,
    name: names[k] || k,
    items: groups[k]
  }));
};

export default function POIDetailPanel({ poiId, onClose, getScoreVisuals, onEdit }) {
  const { user, requireLogin } = useAuth();
  const [poi, setPoi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa điểm này?')) return;
    try {
      const res = await fetch(`/api/pois/${poiId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      onClose();
      // Need a way to trigger map refresh, let's assume parent handles it if we call onEdit without args
      if (onEdit) onEdit(null); 
    } catch (err) {
      alert('Không thể xóa: ' + err.message);
    }
  };

  const fetchPoiData = () => {
    setLoading(true);
    fetch(`/api/pois/${poiId}`)
      .then(res => res.json())
      .then(data => {
        // Fetch photos natively as well
        fetch(`/api/pois/${poiId}/photos`)
          .then(res2 => res2.json())
          .then(photoData => {
            setPoi({...data, photos: photoData.data || []});
            setLoading(false);
          })
          .catch(err2 => {
            console.error("Failed to fetch photos", err2);
            setPoi({...data, photos: []});
            setLoading(false);
          });
      })
      .catch(err => {
        console.error("Failed to fetch POI info", err);
        setLoading(false);
      });
  };

  const handleEditReview = async (review) => {
    const newRating = prompt('Nhập điểm mới (1-10):', review.rating);
    if (!newRating) return;
    const newComment = prompt('Nhập nhận xét mới:', review.comment);
    if (newComment === null) return;

    try {
      const res = await fetch(`/api/pois/${poiId}/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: parseInt(newRating), comment: newComment })
      });
      if (res.ok) fetchPoiData();
      else alert('Lỗi sửa đánh giá');
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      const res = await fetch(`/api/pois/${poiId}/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) fetchPoiData();
      else alert('Lỗi xóa đánh giá');
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  useEffect(() => {
    if (!poiId) return;
    fetchPoiData();
  }, [poiId]);

  if (!poiId) return null;

  return (
    <div className={styles.panel}>
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface)' }}>Đang tải dữ liệu...</div>
      ) : poi && !poi.error ? (
        <>
          <div className={styles.header}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className={styles.title}>{poi.name}</h2>
                <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>📍 {poi.address}</div>
                <div className={styles.categoryBadge}>{poi.category_icon || '📌'} {poi.category_name_vi || poi.category_name}</div>
                {poi.status === 'pending' && user && (user.role === 'admin' || user.role === 'moderator') && (
                  <button onClick={async () => {
                    try {
                      const res = await fetch(`/api/admin/pois/${poiId}/approve`, { method: 'PUT' });
                      if (res.ok) { fetchPoiData(); if(onEdit) onEdit(); }
                      else alert('Lỗi duyệt địa điểm');
                    } catch(err) { alert('Lỗi kết nối'); }
                  }} style={{ background: 'var(--color-primary)', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', border: 'none', marginTop: '8px' }}>
                    ✅ Duyệt Địa Điểm
                  </button>
                )}
              </div>
              <button className={styles.closeButton} onClick={onClose} aria-label="Đóng">×</button>
            </div>
            {poi.permissions?.can_edit && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => { if (onEdit) onEdit(poi); }} 
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  ✏️ Sửa
                </button>
                {poi.permissions?.can_delete && (
                  <button 
                    onClick={handleDelete} 
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-error)', color: 'var(--color-error)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    🗑️ Xóa
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.scoreSection}>
            <div className={styles.largeScore}>{poi.overall_score || '-'} <span style={{fontSize: '24px'}}>/ 10</span></div>
            {(() => {
              const { colorVar, onColor, shape, label } = getScoreVisuals(poi.overall_score || 0);
              return (
                <div className={styles.scorePill} style={{ background: colorVar, color: onColor }}>
                  <span>{shape}</span> {label}
                </div>
              );
            })()}
          </div>
          
          <div className={styles.scrollable}>
            {poi.description && (
              <p style={{font: 'var(--font-body-lg)', marginBottom: 'var(--space-6)', color: 'var(--color-on-surface)'}}>{poi.description}</p>
            )}
            
            <h3 className={styles.sectionTitle}>Chi Tiết Tiếp Cận</h3>
            {groupFeatures(poi.accessibility_features).length > 0 ? groupFeatures(poi.accessibility_features).map(group => (
              <div key={group.key} className={styles.featureList} style={{marginBottom: 'var(--space-4)'}}>
                <h4 style={{font: 'var(--font-title-md)', margin: '0 0 var(--space-2) 0', color: 'var(--color-on-surface)'}}>{group.name}</h4>
                {group.items.map(feat => {
                  const { colorVar } = getScoreVisuals(feat.quality_rating || 0);
                  const widthPct = feat.quality_rating ? (feat.quality_rating * 10) + '%' : '0%';
                  return (
                    <div key={feat.id} className={styles.featureItem}>
                      <div className={styles.featureHeader}>
                        <span>{feat.name_vi || feat.name}</span>
                        <span>{feat.quality_rating ? `${feat.quality_rating}/10` : 'Chưa đánh giá'}</span>
                      </div>
                      {feat.quality_rating && (
                        <div className={styles.scoreBarBg}>
                          <div className={styles.scoreBarFill} style={{ width: widthPct, background: colorVar }} />
                        </div>
                      )}
                      {feat.note && <div style={{font: 'var(--font-body-sm)', color: 'var(--color-on-surface-variant)', marginTop: '4px'}}>✏️ {feat.note}</div>}
                    </div>
                  );
                })}
              </div>
            )) : (
              <p style={{ color: 'var(--color-outline)' }}>Chưa có thông tin tiếp cận chi tiết.</p>
            )}

            <h3 className={styles.sectionTitle}>Đánh Giá Từ Cộng Đồng</h3>
            {poi.reviews && poi.reviews.length > 0 ? (
              poi.reviews.map(r => (
                <div key={r.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <strong>{r.reviewer_name || 'Người dùng ẩn danh'}</strong>
                      <span style={{ marginLeft: '8px' }}>⭐ {r.rating}/10</span>
                    </div>
                    {user && (r.user_id === user.id || user.role === 'admin') && (
                      <div>
                        <button onClick={() => handleEditReview(r)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '12px' }}>✏️ Sửa</button>
                        <button onClick={() => handleDeleteReview(r.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '12px', marginLeft: '8px' }}>🗑️ Xóa</button>
                      </div>
                    )}
                  </div>
                  <div className={styles.reviewBody} style={{ marginBottom: r.image_url ? '8px' : '0' }}>{r.comment || 'Không có bình luận.'}</div>
                  {r.image_url && (
                    <img src={'http://localhost:4000' + r.image_url} alt="Review attachment" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-outline)' }} />
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--color-outline)', paddingBottom: '24px' }}>Chưa có đánh giá nào.</p>
            )}
          </div>
          
          <div className={styles.actionBar}>
            <button className={styles.btnOutline} onClick={() => { if (requireLogin()) setIsReviewing(true); }}>Đánh giá</button>
            <button className={styles.btnPrimary} onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`)}>Chỉ đường</button>
          </div>
        </>
      ) : (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-error)' }}>Không tìm thấy địa điểm</div>
      )}

      {isReviewing && (
        <AddReviewForm 
          poiId={poiId} 
          onClose={() => setIsReviewing(false)} 
          onSuccess={() => {
            setIsReviewing(false);
            fetchPoiData();
          }}
        />
      )}
    </div>
  );
}
