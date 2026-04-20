import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LocationPin } from '../types';

// デフォルトアイコンの修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createPhotoIcon = (photoUrl: string) =>
  L.divIcon({
    html: `<div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">
    <img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'" />
  </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    className: '',
  });

const createInitialIcon = (name: string) =>
  L.divIcon({
    html: `<div style="width:40px;height:40px;border-radius:50%;background:#4A90E2;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:16px;">
    ${name.charAt(0).toUpperCase()}
  </div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    className: '',
  });

interface ClickHandlerProps {
  onClick?: (lat: number, lng: number) => void;
}

function ClickHandler({ onClick }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function SearchBox({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'ja' } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setError('場所が見つかりませんでした');
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      map.flyTo([lat, lon], 13);
      onSelect(lat, lon);
    } catch {
      setError('検索に失敗しました');
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 'min(320px, 80vw)' }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '4px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="住所・地名で検索"
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1.5px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 14px',
            background: '#4A90E2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
          }}
        >
          🔍
        </button>
      </form>
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#e74c3c', background: 'white', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface MapViewProps {
  pins?: LocationPin[];
  onPinClick?: (userId: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  selectedLat?: number | null;
  selectedLng?: number | null;
  style?: React.CSSProperties;
}

export default function MapView({
  pins = [],
  onPinClick,
  onMapClick,
  center = [35.6762, 139.6503],
  zoom = 10,
  selectedLat,
  selectedLng,
  style,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', ...style }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onMapClick} />
      {onMapClick && <SearchBox onSelect={onMapClick} />}
      {pins.map((pin) => (
        <Marker
          key={pin.userId}
          position={[pin.displayLatitude, pin.displayLongitude]}
          icon={pin.photoUrl ? createPhotoIcon(pin.photoUrl) : createInitialIcon(pin.name || '?')}
          eventHandlers={{
            click: () => onPinClick && onPinClick(pin.userId),
          }}
        >
          <Tooltip direction="top" offset={[0, -44]} opacity={0.9}>
            {pin.name}
          </Tooltip>
        </Marker>
      ))}
      {selectedLat != null && selectedLng != null && (
        <Marker position={[selectedLat, selectedLng]} />
      )}
    </MapContainer>
  );
}
