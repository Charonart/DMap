'use client';

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '@/hooks/useMapStore';
import { useMapContext } from './MapContext';
import styles from './MapBox.module.scss';

export function MapBox({ children }: { children?: React.ReactNode }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { setMap } = useMapContext();
  const { viewState, setViewState, setBbox, setContextMenu } = useMapStore();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: process.env.NEXT_PUBLIC_MAP_STYLE || 'https://tiles.openfreemap.org/styles/liberty',
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    });

    // Handle map events to sync with Zustand store
    const updateStore = () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      
      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      });

      // Bounding box format: minLng,minLat,maxLng,maxLat
      if (bounds) {
        const bboxString = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        setBbox(bboxString);
      }
    };

    map.on('moveend', updateStore);
    map.on('zoomend', updateStore);

    // Context Menu Event (Right Click - Desktop)
    map.on('contextmenu', (e) => {
      setContextMenu({ x: e.point.x, y: e.point.y, lng: e.lngLat.lng, lat: e.lngLat.lat });
    });

    // Long-press polyfill (Mobile Touch)
    let touchTimer: NodeJS.Timeout;
    map.on('touchstart', (e) => {
      if (e.points.length !== 1) return; // Ignore multi-touch
      touchTimer = setTimeout(() => {
        setContextMenu({ x: e.point.x, y: e.point.y, lng: e.lngLat.lng, lat: e.lngLat.lat });
      }, 600); // Trigger after 600ms holding
    });

    const clearTouch = () => clearTimeout(touchTimer);
    map.on('touchend', clearTouch);
    map.on('touchmove', clearTouch);
    map.on('touchcancel', clearTouch);

    // Close Context Menu on drag/left-click
    map.on('click', () => setContextMenu(null));
    map.on('movestart', () => {
      clearTouch();
      setContextMenu(null);
    });

    // Initial bounding box update
    map.on('load', () => {
      setMap(map);
      updateStore();
    });

    return () => {
      map.remove();
      setMap(null);
    };
    // We strictly only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.container}>
      <div ref={mapContainerRef} className={styles.map} />
      {/* Children receive the map instance through MapContext */}
      {children}
    </div>
  );
}
