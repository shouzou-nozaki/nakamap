import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LocationPin } from '../types';

const JAPAN_CENTER: [number, number] = [36.5, 136.5];
const DEFAULT_ZOOM = 10;
const MIN_ZOOM = 5;
const JAPAN_BOUNDS: L.LatLngBoundsLiteral = [
  [20.0, 122.0],
  [46.0, 154.0],
];

const SELECTED_ICON = L.divIcon({
  html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">📍</div>',
  iconSize: [28, 32],
  iconAnchor: [14, 32],
  className: '',
});

function createPinIcon(pin: LocationPin): L.DivIcon {
  const s = 32;
  const html = pin.photoUrl
    ? `<div style="width:${s}px;height:${s}px;border-radius:50%;overflow:hidden;border:2.5px solid #4A90E2;background:white;box-sizing:border-box">
        <img src="${pin.photoUrl}" style="width:100%;height:100%;object-fit:cover"/>
       </div>`
    : `<div style="width:${s}px;height:${s}px;border-radius:50%;background:#4A90E2;color:white;font-size:13px;font-weight:700;border:2.5px solid white;box-sizing:border-box;line-height:${s - 5}px;text-align:center">
        ${(pin.name ?? '?').charAt(0)}
       </div>`;
  return L.divIcon({ html, className: '', iconSize: [s, s], iconAnchor: [s / 2, s / 2] });
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onMapClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function SearchBox({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [locating, setLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
    }
  }, []);

  const handleSearch = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchError('');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'ja' } },
      );
      const data: { lat: string; lon: string }[] = await res.json();
      if (data.length === 0) { setSearchError('場所が見つかりませんでした'); return; }
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      map.flyTo([lat, lon], 13);
      onSelect(lat, lon);
    } catch {
      setSearchError('検索に失敗しました');
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) { setSearchError('位置情報が利用できません'); return; }
    setLocating(true);
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        map.flyTo([lat, lon], 14);
        onSelect(lat, lon);
        setLocating(false);
      },
      () => {
        setSearchError('位置情報の取得に失敗しました');
        setLocating(false);
      },
      { timeout: 10000 },
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, width: 'min(340px, 85vw)' }}
    >
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '4px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="住所・地名で検索"
          style={{
            flex: 1, padding: '8px 12px', border: '1.5px solid #ddd',
            borderRadius: '8px', fontSize: '14px', outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 12px', background: '#4A90E2', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          🔍
        </button>
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locating}
          title="現在地を設定"
          style={{
            padding: '8px 12px', background: locating ? '#aaa' : '#27ae60', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px',
            cursor: locating ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {locating ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', animation: 'spin 1s linear infinite' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          )}
        </button>
      </form>
      {searchError && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#e74c3c', background: 'white', padding: '4px 8px', borderRadius: '6px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          {searchError}
        </p>
      )}
    </div>
  );
}

interface LeafletDetailMapProps {
  pins?: LocationPin[];
  onPinClick?: (userId: number) => void;
  onMapClick?: (lat: number, lng: number) => void;
  center?: [number, number];
  selectedLat?: number | null;
  selectedLng?: number | null;
}

export default function LeafletDetailMap({ pins = [], onPinClick, onMapClick, center, selectedLat, selectedLng }: LeafletDetailMapProps) {
  const initialCenter = center ?? JAPAN_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxBounds={JAPAN_BOUNDS}
      maxBoundsViscosity={1.0}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        noWrap={true}
      />
      <RecenterMap center={initialCenter} />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {onMapClick && <SearchBox onSelect={onMapClick} />}
      {selectedLat != null && selectedLng != null && (
        <Marker position={[selectedLat, selectedLng]} icon={SELECTED_ICON} />
      )}
      {pins.map(pin => (
        <Marker
          key={pin.userId}
          position={[pin.displayLatitude, pin.displayLongitude]}
          icon={createPinIcon(pin)}
          eventHandlers={{ click: () => onPinClick?.(pin.userId) }}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
            {pin.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
