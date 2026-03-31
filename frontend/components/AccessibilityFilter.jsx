'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/components/AccessibilityFilter.module.css';

export default function AccessibilityFilter({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(data => {
       if (Array.isArray(data)) setCategories(data);
    });
  }, []);

  const update = (key, val) => {
    onChange({ ...filters, [key]: val });
  };

  const disabilityGroups = [
    { id: 'mobility', icon: '♿', label: 'Vận động' },
    { id: 'visual', icon: '👁️', label: 'Thị giác' },
    { id: 'hearing', icon: '👂', label: 'Thính giác' },
    { id: 'cognitive', icon: '🧠', label: 'Nhận thức' }
  ];

  return (
    <div className={styles.panel}>
      {/* Search */}
      <div className={styles.searchBar}>
        <span style={{marginRight: 8}}>🔍</span>
        <input 
          type="text"
          className={styles.searchInput}
          placeholder="Tìm kiếm địa điểm..."
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
        {filters.search && (
           <button onClick={() => update('search', '')} style={{background: 'none', border:'none', cursor:'pointer', fontSize: 18}}>✕</button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className={styles.sectionTitle}>Danh mục</h3>
        <div className={styles.chipContainer}>
          <button 
             className={`${styles.chip} ${!filters.category ? styles.active : ''}`}
             onClick={() => update('category', '')}
          >Tất cả</button>
          {categories.map(c => (
            <button 
               key={c.id} 
               className={`${styles.chip} ${filters.category === c.id ? styles.active : ''}`}
               onClick={() => update('category', filters.category === c.id ? '' : c.id)}
            >
               {c.icon} {c.name_vi}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Groups */}
      <div>
        <h3 className={styles.sectionTitle}>Nhu cầu tiếp cận</h3>
        <div className={styles.groupGrid}>
          {disabilityGroups.map(g => (
            <button 
              key={g.id}
              className={`${styles.groupToggle} ${filters.feature_group === g.id ? styles.active : ''}`}
              onClick={() => update('feature_group', filters.feature_group === g.id ? '' : g.id)}
            >
              {g.icon} {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Min Score */}
      <div>
         <div style={{display:'flex', justifyContent: 'space-between', marginBottom: 8}}>
            <h3 className={styles.sectionTitle} style={{margin:0}}>Mức điểm tối thiểu</h3>
            <div style={{fontWeight:'bold', color: 'var(--color-primary)'}}>
               {filters.min_score > 0 ? `${filters.min_score}/10` : 'Bất kỳ'}
            </div>
         </div>
         <input 
            type="range" 
            min="0" max="10" 
            value={filters.min_score} 
            onChange={(e) => update('min_score', parseInt(e.target.value))}
            className={styles.slider}
         />
      </div>
    </div>
  );
}
