'use client';

import React from 'react';
import { Plus, Minus, Navigation } from 'lucide-react';
import { useMapContext } from './MapContext';
import { useMapStore } from '@/hooks/useMapStore';
import styles from './MapControls.module.scss';

export function MapControls() {
  const { map } = useMapContext();
  const { userLocation } = useMapStore();

  const handleZoomIn = () => map?.zoomIn();
  const handleZoomOut = () => map?.zoomOut();

  const handleLocateUser = () => {
    if (!map) return;
    
    if (userLocation) {
      map.flyTo({ center: userLocation, zoom: 16, essential: true });
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 16, essential: true
        });
      }, (error) => {
        console.warn("Geolocation denied or failed", error);
      }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 });
    }
  };

  return (
    <div className={styles.controlsStrip}>
      {/* Zoom controls */}
      <div className={styles.zoomGroup}>
        <button 
          className={styles.zoomBtn}
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className={styles.zoomDivider} />
        <button 
          className={styles.zoomBtn}
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Locate control */}
      <button 
        className={styles.locateBtn}
        onClick={handleLocateUser}
        aria-label="Find my location"
      >
        <Navigation className="w-5 h-5" />
      </button>
    </div>
  );
}
