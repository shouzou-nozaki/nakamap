import { create } from 'zustand';

interface MapState {
  mapType: 'simple' | 'detail';
  setMapType: (type: 'simple' | 'detail') => void;
}

const useMapStore = create<MapState>((set) => ({
  mapType: 'simple',
  setMapType: (type) => set({ mapType: type }),
}));

export default useMapStore;
