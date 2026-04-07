'use client';
import React, { useEffect, useRef } from 'react';
import { useMapStore } from '@/hooks/useMapStore';
import { useMapContext } from './MapContext';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import { UserLocationPulsingDot } from './UserLocationPulsingDot';

/**
 * Headless component that tracks geolocation and syncs a Marker to map.
 */
export function GeolocationTracker() {
  const { map } = useMapContext();
  const setUserLocation = useMapStore((s) => s.setUserLocation);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (!map || !('geolocation' in navigator)) return;

    let watchId: number;

    const setupMarker = () => {
      // Create a custom DOM element
      const el = document.createElement('div');
      
      // Render our React Pulsing Dot into it
      const root = createRoot(el);
      root.render(<UserLocationPulsingDot />);

      markerRef.current = new maplibregl.Marker({ element: el, pitchAlignment: 'map' })
        .setLngLat([0, 0])
        .addTo(map);
    };

    if (!markerRef.current) setupMarker();

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading } = position.coords;

        if (markerRef.current) {
          markerRef.current.setLngLat([longitude, latitude]);
          setUserLocation([longitude, latitude]); // Cache it!
          
          // If we have heading (bearing), update the DOM dot
          if (heading !== null) {
            const root = createRoot(markerRef.current.getElement());
            root.render(<UserLocationPulsingDot bearing={heading} />);
          }
        }
      },
      (error) => {
        console.warn('Geolocation track error:', error.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (markerRef.current) markerRef.current.remove();
    };
  }, [map]);

  return null;
}
