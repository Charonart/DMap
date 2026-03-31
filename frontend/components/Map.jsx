'use client';

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';

async function initMapIcons(map) {
  const styles = getComputedStyle(document.documentElement);
  
  const getScoreVisualsCanvas = (score) => {
    if (score >= 9) return { color: styles.getPropertyValue('--color-score-excellent').trim() || '#0d7377', onColor: '#ffffff', shape: '★' };
    if (score >= 7) return { color: styles.getPropertyValue('--color-score-good').trim() || '#2e7d32', onColor: '#ffffff', shape: '●' };
    if (score >= 5) return { color: styles.getPropertyValue('--color-score-fair').trim() || '#f9a825', onColor: '#000000', shape: '◆' };
    if (score >= 3) return { color: styles.getPropertyValue('--color-score-poor').trim() || '#e65100', onColor: '#ffffff', shape: '▲' };
    if (score >= 1) return { color: styles.getPropertyValue('--color-score-inaccessible').trim() || '#c62828', onColor: '#ffffff', shape: '✕' };
    return { color: styles.getPropertyValue('--color-score-unrated').trim() || '#747775', onColor: '#ffffff', shape: '○' };
  };

  const loadIcon = (score) => {
     return new Promise(resolve => {
        const { color, onColor, shape } = getScoreVisualsCanvas(score);
        const svg = `
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 48 20 48C20 48 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="${color}"/>
            <text x="20" y="20" fill="${onColor}" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="central">${shape}</text>
            <circle cx="30" cy="10" r="10" fill="${color}" stroke="${onColor}" stroke-width="2"/>
            <text x="30" y="10" fill="${onColor}" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" dominant-baseline="central">${score > 0 ? score : '-'}</text>
          </svg>
        `.trim();
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve({ id: `marker-score-${score}`, img });
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
     });
  };

  for (let i = 0; i <= 10; i++) {
     if (!map.hasImage(`marker-score-${i}`)) {
        const { id, img } = await loadIcon(i);
        map.addImage(id, img);
     }
  }
}

export function getScoreVisuals(score) {
  if (score >= 9) return { colorVar: 'var(--color-score-excellent)', onColor: 'var(--color-on-score-excellent)', shape: '★', label: 'Tuyệt vời' };
  if (score >= 7) return { colorVar: 'var(--color-score-good)', onColor: 'var(--color-on-score-good)', shape: '●', label: 'Tốt' };
  if (score >= 5) return { colorVar: 'var(--color-score-fair)', onColor: 'var(--color-on-score-fair)', shape: '◆', label: 'Trung bình' };
  if (score >= 3) return { colorVar: 'var(--color-score-poor)', onColor: 'var(--color-on-score-poor)', shape: '▲', label: 'Kém' };
  if (score >= 1) return { colorVar: 'var(--color-score-inaccessible)', onColor: 'var(--color-on-score-inaccessible)', shape: '✕', label: 'Không thể tiếp cận' };
  return { colorVar: 'var(--color-score-unrated)', onColor: 'var(--color-on-score-unrated)', shape: '○', label: 'Chưa đánh giá' };
}

export default function Map({ onSelectPoi, refreshTrigger, addingMode, onLocationSelected, filtersQuery }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  
  const addingModeRef = useRef(addingMode);
  const onLocationSelectedRef = useRef(onLocationSelected);
  const onSelectPoiRef = useRef(onSelectPoi);
  const filtersQueryRef = useRef(filtersQuery);

  useEffect(() => {
    addingModeRef.current = addingMode;
    onLocationSelectedRef.current = onLocationSelected;
    onSelectPoiRef.current = onSelectPoi;
    filtersQueryRef.current = filtersQuery;
  }, [addingMode, onLocationSelected, onSelectPoi, filtersQuery]);

  useEffect(() => {
    let mapInstance = null;

    fetch('https://tiles.openfreemap.org/styles/liberty')
      .then(res => res.json())
      .then(style => {
        if (style.sources && style.sources.openmaptiles) {
          style.sources.openmaptiles.url = `http://${window.location.hostname}:3636/osm-2020-02-10-v3.11_vietnam_ho-chi-minh-city`;
        }

        mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: style,
          center: [106.6280, 10.8540],
          zoom: 14,
        });
        
        mapRef.current = mapInstance;

        mapInstance.on('load', async () => {
          await initMapIcons(mapInstance);
          loadPOIs(mapInstance);
        });

        mapInstance.on('click', (e) => {
          if (addingModeRef.current && onLocationSelectedRef.current) {
            onLocationSelectedRef.current({ lng: e.lngLat.lng, lat: e.lngLat.lat });
          }
        });

      })
      .catch(err => {
        console.error("Failed to load map style:", err);
      });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      loadPOIs(mapRef.current);
    }
  }, [refreshTrigger, filtersQuery]);

  const loadPOIs = (mapInstance) => {
    const url = filtersQueryRef.current ? `/api/pois.geojson?${filtersQueryRef.current}` : '/api/pois.geojson';
    fetch(url, { credentials: 'include' })
      .then(res => res.json())
      .then(geoJson => {
        if (!mapInstance.getSource('pois')) {
          mapInstance.addSource('pois', { type: 'geojson', data: geoJson });
          
          mapInstance.addLayer({
            id: 'pois-layer',
            type: 'symbol',
            source: 'pois',
            layout: {
              'icon-image': ['concat', 'marker-score-', ['coalesce', ['get', 'overall_score'], 0]],
              'icon-size': [
                'interpolate', ['linear'], ['zoom'],
                10, 0,
                11, 0.5,
                14, 1
              ],
              'icon-anchor': 'bottom',
              'icon-allow-overlap': false, // Google Maps style clustering/collision!
              'text-field': ['get', 'name'],
              'text-offset': [0, 0.5],
              'text-anchor': 'top',
              'text-size': [
                'interpolate', ['linear'], ['zoom'],
                13, 0,
                14, 14
              ]
            },
            paint: {
              'text-color': '#111111',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            }
          });

          mapInstance.on('click', 'pois-layer', (e) => {
             if (addingModeRef.current) return;
             if (onSelectPoiRef.current && e.features.length > 0) {
                 onSelectPoiRef.current(e.features[0].properties.id);
             }
          });

          mapInstance.on('mouseenter', 'pois-layer', () => {
             if (!addingModeRef.current) mapInstance.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.on('mouseleave', 'pois-layer', () => {
             mapInstance.getCanvas().style.cursor = '';
          });

        } else {
          mapInstance.getSource('pois').setData(geoJson);
        }
      })
      .catch(err => console.error("Error loading POIs:", err));
  };

  return <div ref={mapContainer} className="map-container" style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }} />;
}
