import JapanPrefectureMap from './JapanPrefectureMap';
import LeafletDetailMap from './LeafletDetailMap';
import type { LocationPin } from '../types';

interface MapViewProps {
  pins?: LocationPin[];
  onPinClick?: (userId: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  selectedLat?: number | null;
  selectedLng?: number | null;
  style?: React.CSSProperties;
  mapType?: 'simple' | 'detail';
}

export default function MapView({
  pins = [],
  onPinClick,
  onMapClick,
  selectedLat,
  selectedLng,
  center,
  style,
  mapType = 'simple',
}: MapViewProps) {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      {mapType === 'detail' ? (
        <LeafletDetailMap
          pins={pins}
          onPinClick={onPinClick}
          onMapClick={onMapClick}
          center={center}
          selectedLat={selectedLat}
          selectedLng={selectedLng}
        />
      ) : (
        <JapanPrefectureMap
          pins={pins}
          onPinClick={onPinClick}
          onPrefectureClick={onMapClick}
          selectedLat={selectedLat}
          selectedLng={selectedLng}
        />
      )}
    </div>
  );
}
