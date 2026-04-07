'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface MapContextType {
  map: MapLibreMap | null;
  setMap: (map: MapLibreMap | null) => void;
}

const MapContext = createContext<MapContextType>({
  map: null,
  setMap: () => {},
});

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<MapLibreMap | null>(null);

  return (
    <MapContext.Provider value={{ map, setMap }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  return useContext(MapContext);
}
