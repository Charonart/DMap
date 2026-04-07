import { create } from 'zustand';

interface MapState {
  viewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  bbox: string | null; // Used for fetching ?bounds=
  selectedPoiId: number | string | null;
  userLocation: [number, number] | null; // Caches GPS loc for instant snapping
  contextMenu: { x: number; y: number; lng: number; lat: number } | null;
  
  // POI Creation
  isCreatingPOI: boolean;
  newPoiCoords: [number, number] | null;

  // Filter States
  filterCategoryId: string | number | null;
  filterSearchQuery: string;
  filterMinScore: number | null;
  filterFeatures: string[]; // List of required a11y feature IDs (optional)

  // Actions
  setViewState: (viewState: Partial<MapState['viewState']>) => void;
  setBbox: (bbox: string) => void;
  setSelectedPoiId: (id: number | string | null) => void;
  setUserLocation: (coords: [number, number]) => void;
  setContextMenu: (menu: { x: number; y: number; lng: number; lat: number } | null) => void;
  
  setIsCreatingPOI: (isCreating: boolean, coords?: [number, number]) => void;
  
  setFilterCategoryId: (id: string | number | null) => void;
  setFilterSearchQuery: (query: string) => void;
  setFilterMinScore: (score: number | null) => void;
  setFilterFeatures: (features: string[]) => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Center of Ho Chi Minh City by default
  viewState: {
    longitude: 106.6280,
    latitude: 10.8540,
    zoom: 14,
    pitch: 0,
    bearing: 0,
  },
  bbox: null,
  selectedPoiId: null,
  userLocation: null,
  contextMenu: null,
  
  isCreatingPOI: false,
  newPoiCoords: null,
  
  filterCategoryId: null,
  filterSearchQuery: '',
  filterMinScore: null,
  filterFeatures: [],

  setViewState: (newViewState) =>
    set((state) => ({
      viewState: { ...state.viewState, ...newViewState },
    })),
    
  setBbox: (bbox) => set({ bbox }),
  
  setSelectedPoiId: (id) => set({ selectedPoiId: id }),

  setUserLocation: (coords) => set({ userLocation: coords }),

  setContextMenu: (menu) => set({ contextMenu: menu }),

  setIsCreatingPOI: (isCreating, coords) => set({ isCreatingPOI: isCreating, newPoiCoords: coords || null }),

  setFilterCategoryId: (id) => set({ filterCategoryId: id }),
  setFilterSearchQuery: (query) => set({ filterSearchQuery: query }),
  setFilterMinScore: (score) => set({ filterMinScore: score }),
  setFilterFeatures: (features) => set({ filterFeatures: features }),
}));
