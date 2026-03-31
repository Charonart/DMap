'use client';

import { useState } from 'react';
import Map, { getScoreVisuals } from '@/components/Map';
import POIDetailPanel from '@/components/POIDetailPanel';
import AddPOIForm from '@/components/AddPOIForm';
import AccessibilityFilter from '@/components/AccessibilityFilter';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { requireLogin, user, logout } = useAuth();
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [addingMode, setAddingMode] = useState(false);
  const [newLocation, setNewLocation] = useState(null);
  const [editingPoi, setEditingPoi] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_score: 0,
    feature_group: ''
  });

  const queryObj = {};
  if (filters.search) queryObj.search = filters.search;
  if (filters.category) queryObj.category = filters.category;
  if (filters.min_score > 0) queryObj.min_score = filters.min_score;
  if (filters.feature_group) queryObj.feature_group = filters.feature_group;
  const filtersQuery = new URLSearchParams(queryObj).toString();

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Map 
        onSelectPoi={(id) => {
          if (!addingMode) setSelectedPoiId(id);
        }} 
        addingMode={addingMode}
        onLocationSelected={(coords) => {
          if (addingMode) {
             setNewLocation(coords);
          }
        }}
        refreshTrigger={refreshTrigger}
        filtersQuery={filtersQuery}
      />
      
      {/* Header & Search */}
      <div className="m3-overlay" style={{ position: 'absolute', top: 16, left: 16, height: 64, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '16px', padding: '0 24px', zIndex: 20 }}>
        <h1 style={{ margin: 0, font: 'var(--font-title-lg)', color: 'var(--color-primary)' }}>🗺️ DMap</h1>
        <div style={{ borderLeft: '1px solid var(--color-outline-variant)', height: '32px' }}></div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ font: 'var(--font-label-md)', color: 'var(--color-on-surface)', fontWeight: 600 }}>{user.email.split('@')[0]}</span>
            <button onClick={logout} style={{ background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', font: 'var(--font-label-sm)', textDecoration: 'underline' }}>Thoát</button>
          </div>
        ) : (
          <button className="hover-scale" onClick={() => requireLogin()} style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', padding: '8px 16px', borderRadius: 'var(--radius-full)', cursor: 'pointer', font: 'var(--font-label-md)', fontWeight: 600 }}>Đăng nhập</button>
        )}
      </div>

      {!addingMode && (
          <AccessibilityFilter filters={filters} onChange={setFilters} />
      )}

      {/* FAB - Add Place */}
      {!addingMode && (
        <button 
          onClick={() => {
            if (requireLogin()) {
              setAddingMode(true);
              setSelectedPoiId(null);
            }
          }}
          aria-label="Thêm địa điểm"
          title="Thêm địa điểm mới"
          className="hover-scale"
          style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20, width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', border: 'none', boxShadow: 'var(--shadow-md)', cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          +
        </button>
      )}

      {/* Detail Panel */}
      {selectedPoiId && !addingMode && !editingPoi && (
        <POIDetailPanel 
          poiId={selectedPoiId} 
          onClose={() => setSelectedPoiId(null)} 
          getScoreVisuals={getScoreVisuals}
          onEdit={(poi) => {
            if (!poi) {
              setRefreshTrigger(prev => prev + 1); // delete called
            } else {
              setEditingPoi(poi);
            }
          }}
        />
      )}

      {/* Add POI Mode Instruction */}
      {addingMode && !newLocation && (
        <div className="m3-overlay" style={{ position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', padding: '16px 24px', borderRadius: 'var(--radius-lg)', zIndex: 20, textAlign: 'center' }}>
          <p style={{ margin: 0, font: 'var(--font-title-md)', color: 'var(--color-on-surface)' }}>Chạm vào bản đồ để chọn vị trí...</p>
          <button onClick={() => setAddingMode(false)} style={{ marginTop: 12, background: 'var(--color-surface)', border: '1px solid var(--color-outline)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', font: 'var(--font-label-md)', color: 'var(--color-on-surface)' }}>Hủy</button>
        </div>
      )}

      {/* Add / Edit POI Form */}
      {(newLocation || editingPoi) && (
        <AddPOIForm 
          location={newLocation} 
          initialData={editingPoi}
          onClose={() => { setAddingMode(false); setNewLocation(null); setEditingPoi(null); }}
          onSuccess={() => {
            setAddingMode(false);
            setNewLocation(null);
            setEditingPoi(null);
            if (editingPoi) setSelectedPoiId(null); // Return to default map view if edited
            setRefreshTrigger(prev => prev + 1);
          }}
          getScoreVisuals={getScoreVisuals}
        />
      )}
    </main>
  );
}
