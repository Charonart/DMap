'use client';

import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useMapContext } from './MapContext';
import { useMapStore } from '@/hooks/useMapStore';
import maplibregl from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';
import { POIPinMarker } from './POIPinMarker';

export function POIMarkerLayer() {
  const { map } = useMapContext();
  const { bbox, selectedPoiId, setSelectedPoiId, filterCategoryId, filterSearchQuery, filterMinScore, filterFeatures } = useMapStore();
  const markersRef = useRef<{ [id: string]: { marker: maplibregl.Marker, root: Root, el: HTMLElement } }>({});

  const { data: geojson } = useQuery({
    queryKey: ['pois.geojson', bbox, filterCategoryId, filterSearchQuery, filterMinScore, filterFeatures],
    queryFn: async () => {
      if (!bbox) return { type: "FeatureCollection", features: [] };
      const [min_lng, min_lat, max_lng, max_lat] = bbox.split(',');
      const res = await axiosInstance.get('/pois.geojson', {
        params: { 
          min_lng, min_lat, max_lng, max_lat, limit: 50,
          category: filterCategoryId || undefined,
          search: filterSearchQuery || undefined,
          min_score: filterMinScore || undefined,
          features: filterFeatures.length > 0 ? filterFeatures.join(',') : undefined
        }
      });
      return res.data;
    },
    enabled: !!bbox,
    staleTime: 5000,
  });

  useEffect(() => {
    if (!map || !geojson) return;

    // Track which IDs are in the new geojson
    const newIds = new Set<string>();

    geojson.features.forEach((feature: any) => {
      if (!feature.properties || !feature.properties.id) return;
      const id = feature.properties.id?.toString();
      if (!id) return;
      const [lng, lat] = feature.geometry.coordinates;
      newIds.add(id);

      // If marker doesn't exist, create it
      if (!markersRef.current[id]) {
        const el = document.createElement('div');
        const root = createRoot(el);
        
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedPoiId(id);
        });

        // Use custom marker element
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current[id] = { marker, root, el };
      }

      // Update the React component inside the marker
      const isActive = selectedPoiId === id;
      markersRef.current[id].root.render(
        <POIPinMarker 
          score={feature.properties.overall_score || 0} 
          categoryIcon={feature.properties.category_icon || feature.properties.icon || null}
          categoryName={feature.properties.category_name || feature.properties.category || ''}
          category={feature.properties.category || feature.properties.category_name || ''} 
          active={isActive} 
        />
      );
      
      markersRef.current[id].marker.setLngLat([lng, lat]);
      markersRef.current[id].el.style.zIndex = isActive ? '50' : '1';
    });

    // Cleanup markers that are no longer in the geojson
    Object.keys(markersRef.current).forEach((id) => {
      if (!newIds.has(id)) {
        const { marker, root } = markersRef.current[id];
        marker.remove();
        setTimeout(() => root.unmount(), 0);
        delete markersRef.current[id];
      }
    });

  }, [map, geojson, selectedPoiId, setSelectedPoiId]);

  // Clean up ALL markers on unmount
  useEffect(() => {
    return () => {
      Object.values(markersRef.current).forEach(({ marker, root }) => {
        marker.remove();
        setTimeout(() => root.unmount(), 0);
      });
      markersRef.current = {};
    };
  }, []);

  return null;
}
