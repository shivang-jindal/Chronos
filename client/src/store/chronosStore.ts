import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TemporalState {
  currentYear: number;
  startYear: number;
  endYear: number;
  resolution: 'year' | 'quarter' | 'month' | 'week' | 'day';
  playing: boolean;
  speed: number;
  direction: 'forward' | 'backward';
}

export interface LayerConfig {
  visible: boolean;
  opacity: number;
  style: string;
  timeEnabled: boolean;
}

export interface LayerState {
  [key: string]: LayerConfig;
}

export interface CameraState {
  lat: number;
  lon: number;
  zoom: number;
  heading: number;
  pitch: number;
}

export interface UIState {
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  activeModal: string | null;
  voiceActive: boolean;
  voiceListening: boolean;
  camera: CameraState;
}

export interface ChronosState {
  temporal: TemporalState;
  layers: LayerState;
  ui: UIState;
  visualizationStyle: string;
  timeRange: { start: number; end: number };
  animationPlaying: boolean;
  animationSpeed: number;
  comparisonMode: boolean;
  comparisonA: { year: number; layer: string } | null;
  comparisonB: { year: number; layer: string } | null;
  voiceActive: boolean;
  voiceListening: boolean;
  camera: CameraState;
  notifications: Array<{ id: string; type: string; message: string; timestamp: number }>;

  // Actions
  setCurrentYear: (year: number) => void;
  setTimeRange: (range: { start: number; end: number }) => void;
  setResolution: (resolution: TemporalState['resolution']) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: TemporalState['direction']) => void;
  toggleLayer: (layerId: string, visible?: boolean) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setLayerStyle: (layerId: string, style: string) => void;
  setVisualizationStyle: (style: string) => void;
  setAnimationPlaying: (playing: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
  setComparisonMode: (enabled: boolean) => void;
  setComparisonA: (data: { year: number; layer: string } | null) => void;
  setComparisonB: (data: { year: number; layer: string } | null) => void;
  setCamera: (camera: Partial<CameraState>) => void;
  setVoiceActive: (active: boolean) => void;
  setVoiceListening: (listening: boolean) => void;
  toggleVoice: () => void;
  addNotification: (notification: { type: string; message: string }) => void;
  removeNotification: (id: string) => void;
  reset: () => void;
}

const DEFAULT_LAYERS: LayerState = {
  landsat_annual: { visible: true, opacity: 1, style: 'natural', timeEnabled: true },
  sentinel2_annual: { visible: false, opacity: 1, style: 'natural', timeEnabled: true },
  planet_nicfi_annual: { visible: false, opacity: 1, style: 'natural', timeEnabled: true },
  night_lights_annual: { visible: false, opacity: 0.8, style: 'night_lights', timeEnabled: true },
  urban_extents_annual: { visible: false, opacity: 0.8, style: 'ndbi', timeEnabled: true },
  water_annual: { visible: false, opacity: 0.8, style: 'ndwi', timeEnabled: true },
  glacier_annual: { visible: false, opacity: 0.8, style: 'ndsi', timeEnabled: true },
  coastline_annual: { visible: false, opacity: 0.8, style: 'ndwi', timeEnabled: true },
  cropland_annual: { visible: false, opacity: 0.8, style: 'ndvi', timeEnabled: true },
  sea_ice_annual: { visible: false, opacity: 0.8, style: 'ndsi', timeEnabled: true },
  night_lights_monthly: { visible: false, opacity: 0.8, style: 'night_lights', timeEnabled: true },
  fire_monthly: { visible: false, opacity: 0.8, style: 'thermal', timeEnabled: true },
  precipitation_monthly: { visible: false, opacity: 0.8, style: 'precipitation', timeEnabled: true },
  temperature_monthly: { visible: false, opacity: 0.8, style: 'thermal', timeEnabled: true }
};

const initialState = {
  temporal: {
    currentYear: 2024,
    startYear: 1984,
    endYear: 2024,
    resolution: 'year' as const,
    playing: false,
    speed: 1,
    direction: 'forward' as const
  },
  layers: DEFAULT_LAYERS,
  ui: {
    sidebarOpen: true,
    mobileNavOpen: false,
    activeModal: null,
    voiceActive: false,
    voiceListening: false,
    camera: { lat: 0, lon: 0, zoom: 2, heading: 0, pitch: 0 }
  },
  visualizationStyle: 'natural',
  timeRange: { start: 1984, end: 2024 },
  animationPlaying: false,
  animationSpeed: 1,
  comparisonMode: false,
  comparisonA: null,
  comparisonB: null,
  voiceActive: false,
  voiceListening: false,
  camera: { lat: 0, lon: 0, zoom: 2, heading: 0, pitch: 0 },
  notifications: [] as ChronosState['notifications']
};

export const useChronosStore = create<ChronosState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentYear: (year) => set((state) => ({
        temporal: { ...state.temporal, currentYear: Math.max(1984, Math.min(2050, year)) }
      })),

      setTimeRange: (range) => set((state) => ({
        temporal: { ...state.temporal, startYear: range.start, endYear: range.end },
        timeRange: range
      })),

      setResolution: (resolution) => set((state) => ({
        temporal: { ...state.temporal, resolution }
      })),

      setPlaying: (playing) => set((state) => ({
        temporal: { ...state.temporal, playing }
      })),

      setSpeed: (speed) => set((state) => ({
        temporal: { ...state.temporal, speed: Math.max(0.25, Math.min(10, speed)) }
      })),

      setDirection: (direction) => set((state) => ({
        temporal: { ...state.temporal, direction }
      })),

      toggleLayer: (layerId, visible) => set((state) => {
        const existing = state.layers[layerId];
        return {
          layers: {
            ...state.layers,
            [layerId]: {
              ...(existing ?? { visible: false, opacity: 1, style: 'natural', timeEnabled: true }),
              visible: visible ?? !(existing?.visible ?? false)
            }
          }
        };
      }),

      setLayerOpacity: (layerId, opacity) => set((state) => {
        const existing = state.layers[layerId];
        return {
          layers: {
            ...state.layers,
            [layerId]: {
              ...(existing ?? { visible: false, opacity: 1, style: 'natural', timeEnabled: true }),
              opacity: Math.max(0, Math.min(1, opacity))
            }
          }
        };
      }),

      setLayerStyle: (layerId, style) => set((state) => {
        const existing = state.layers[layerId];
        return {
          layers: {
            ...state.layers,
            [layerId]: {
              ...(existing ?? { visible: false, opacity: 1, style: 'natural', timeEnabled: true }),
              style
            }
          }
        };
      }),

      setVisualizationStyle: (style) => set({ visualizationStyle: style }),

      setAnimationPlaying: (playing) => set({ animationPlaying: playing }),

      setAnimationSpeed: (speed) => set({ animationSpeed: Math.max(0.25, Math.min(10, speed)) }),

      setComparisonMode: (enabled) => set({ comparisonMode: enabled }),

      setComparisonA: (data) => set({ comparisonA: data }),

      setComparisonB: (data) => set({ comparisonB: data }),

      setCamera: (camera) => set((state) => ({ camera: { ...state.camera, ...camera } })),

      setVoiceActive: (active) => set({ voiceActive: active }),

      setVoiceListening: (listening) => set({ voiceListening: listening }),

      toggleVoice: () => set((state) => ({ voiceActive: !state.voiceActive })),

      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { ...notification, id: crypto.randomUUID(), timestamp: Date.now() }]
      })),

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      reset: () => set(initialState)
    }),
    {
      name: 'chronos-store',
      partialize: (state) => ({
        temporal: state.temporal,
        layers: state.layers,
        visualizationStyle: state.visualizationStyle,
        timeRange: state.timeRange,
        comparisonMode: state.comparisonMode,
        comparisonA: state.comparisonA,
        comparisonB: state.comparisonB,
        voiceActive: state.voiceActive
      })
    }
  )
);
