import { useState, useRef, useMemo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, useZoomPanContext } from 'react-simple-maps';
import { PREFECTURE_COLOR_MAP, PREFECTURE_MAP, findNearestPrefecture } from '../utils/prefectureData';
import type { LocationPin } from '../types';

const GEO_URL = '/japan.topojson';

const MAP_CENTER: [number, number] = [136.5, 36.5];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

interface PinMarkerProps {
  pin: LocationPin;
  offset: [number, number];
  r: number;
  onPinClick?: (userId: number) => void;
  wasDrag: (e: React.MouseEvent) => boolean;
  onTooltip: (name: string, x: number, y: number) => void;
  onTooltipMove: (x: number, y: number) => void;
  onTooltipHide: () => void;
}

function PinMarker({ pin, offset, r, onPinClick, wasDrag, onTooltip, onTooltipMove, onTooltipHide }: PinMarkerProps) {
  const { k } = useZoomPanContext();
  const [dx, dy] = offset;
  const ri = r - 2;
  return (
    <g transform={`scale(${1 / k})`}>
      <line x1="0" y1="0" x2={dx} y2={dy} stroke="#4A90E2" strokeWidth="1.5" />
      <circle cx="0" cy="0" r={Math.round(r * 0.15)} fill="#4A90E2" stroke="white" strokeWidth="1.5" />
      <g
        transform={`translate(${dx}, ${dy})`}
        onClick={(e: React.MouseEvent) => { if (!wasDrag(e)) onPinClick?.(pin.userId); }}
        onMouseEnter={(e: React.MouseEvent) => onTooltip(pin.name ?? '', e.clientX, e.clientY)}
        onMouseMove={(e: React.MouseEvent) => onTooltipMove(e.clientX, e.clientY)}
        onMouseLeave={onTooltipHide}
        style={{ cursor: 'pointer' }}
      >
        <defs>
          <clipPath id={`clip-${pin.userId}`}>
            <circle cx="0" cy="0" r={ri} />
          </clipPath>
        </defs>
        {pin.photoUrl ? (
          <>
            <circle cx="0" cy="0" r={r} fill="white" stroke="#4A90E2" strokeWidth="2" />
            <image href={pin.photoUrl} x={-ri} y={-ri} width={ri * 2} height={ri * 2} clipPath={`url(#clip-${pin.userId})`} />
          </>
        ) : (
          <>
            <circle cx="0" cy="0" r={r} fill="#4A90E2" />
            <text textAnchor="middle" dominantBaseline="central" style={{ fontSize: `${Math.round(r * 0.8)}px`, fill: 'white', fontWeight: 700, pointerEvents: 'none' }}>
              {(pin.name ?? '?').charAt(0)}
            </text>
          </>
        )}
      </g>
    </g>
  );
}

const PROJECTION_CONFIG = {
  center: MAP_CENTER,
  scale: 1700,
};

const DRAG_THRESHOLD = 5;

const SVG_W = 800, SVG_H = 600;

function projectSVG(lng: number, lat: number): [number, number] {
  const merc = (φ: number) => Math.log(Math.tan(Math.PI / 4 + φ * Math.PI / 360));
  const minM = merc(24), maxM = merc(46);
  return [(lng - 122) / 32 * SVG_W, (1 - (merc(lat) - minM) / (maxM - minM)) * SVG_H];
}

function edgeOffset(seaDeg: number, leaderLength: number): [number, number] {
  const rad = seaDeg * Math.PI / 180;
  return [Math.sin(rad) * leaderLength, -Math.cos(rad) * leaderLength];
}

// 複数ピンを同一県に配置する際の perpendicular 拡散
function spreadOffsets(base: [number, number], count: number): [number, number][] {
  const [bx, by] = base;
  const len = Math.sqrt(bx * bx + by * by) || 1;
  const nx = -by / len, ny = bx / len;
  const step = 36;
  return Array.from({ length: count }, (_, i) => {
    const s = (i - (count - 1) / 2) * step;
    return [bx + nx * s, by + ny * s] as [number, number];
  });
}

interface JapanPrefectureMapProps {
  pins?: LocationPin[];
  onPinClick?: (userId: number) => void;
  onPrefectureClick?: (lat: number, lng: number) => void;
  selectedLat?: number | null;
  selectedLng?: number | null;
}

interface PrefGroup {
  prefId: number;
  pins: LocationPin[];
  offsets: [number, number][];
}

const ICON_MIN_DIST = 110; // アイコン直径(90) + マージン

function resolveCollisions(groups: PrefGroup[]): PrefGroup[] {
  // 全アイコンのSVG座標を収集
  type IconPos = { gi: number; pi: number; x: number; y: number };
  const icons: IconPos[] = [];
  for (let gi = 0; gi < groups.length; gi++) {
    const { prefId, offsets } = groups[gi];
    const pref = PREFECTURE_MAP[prefId];
    if (!pref) continue;
    const [px, py] = projectSVG(pref.lng, pref.lat);
    for (let pi = 0; pi < offsets.length; pi++) {
      icons.push({ gi, pi, x: px + offsets[pi][0], y: py + offsets[pi][1] });
    }
  }
  // force-push で重なりを解消
  for (let iter = 0; iter < 20; iter++) {
    for (let i = 0; i < icons.length; i++) {
      for (let j = i + 1; j < icons.length; j++) {
        const dx = icons[j].x - icons[i].x;
        const dy = icons[j].y - icons[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist < ICON_MIN_DIST) {
          const push = (ICON_MIN_DIST - dist) / 2;
          const ux = dx / dist, uy = dy / dist;
          icons[i].x -= ux * push;
          icons[i].y -= uy * push;
          icons[j].x += ux * push;
          icons[j].y += uy * push;
        }
      }
    }
  }
  // オフセットを更新
  const result = groups.map(g => ({ ...g, offsets: [...g.offsets] as [number, number][] }));
  for (const { gi, pi, x, y } of icons) {
    const pref = PREFECTURE_MAP[result[gi].prefId];
    if (!pref) continue;
    const [px, py] = projectSVG(pref.lng, pref.lat);
    result[gi].offsets[pi] = [x - px, y - py];
  }
  return result;
}

export default function JapanPrefectureMap({
  pins = [],
  onPinClick,
  onPrefectureClick,
  selectedLat,
  selectedLng,
}: JapanPrefectureMapProps) {
  const isMobile = useIsMobile();
  const iconRadius = isMobile ? 45 : 14;
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [pinTooltip, setPinTooltip] = useState<{ name: string; x: number; y: number } | null>(null);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  const wasDrag = (e: React.MouseEvent) => {
    if (!mouseDownPos.current) return false;
    const dx = e.clientX - mouseDownPos.current.x;
    const dy = e.clientY - mouseDownPos.current.y;
    return Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD;
  };

  const selectedPrefId =
    selectedLat != null && selectedLng != null
      ? findNearestPrefecture(selectedLat, selectedLng).id
      : null;

  // ピンを県ごとにグループ化し、衝突解決済みオフセットを計算
  const prefGroups = useMemo<PrefGroup[]>(() => {
    const map = new Map<number, LocationPin[]>();
    for (const pin of pins) {
      const pref = findNearestPrefecture(pin.displayLatitude, pin.displayLongitude);
      const arr = map.get(pref.id) ?? [];
      arr.push(pin);
      map.set(pref.id, arr);
    }
    const leaderLength = isMobile ? 90 : 50;
    const groups: PrefGroup[] = Array.from(map.entries()).map(([prefId, ps]) => {
      const pref = PREFECTURE_MAP[prefId];
      const base = pref ? edgeOffset(pref.seaDeg, leaderLength) : [0, 0] as [number, number];
      return { prefId, pins: ps, offsets: spreadOffsets(base, ps.length) };
    });
    return resolveCollisions(groups);
  }, [pins, iconRadius]);

  return (
    <div
      style={{ width: '100%', height: '100%', background: '#EAF4FB', position: 'relative', overflow: 'hidden', touchAction: 'none' }}
      onMouseDown={(e) => { mouseDownPos.current = { x: e.clientX, y: e.clientY }; }}
    >
      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        width={800}
        height={600}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup center={MAP_CENTER} zoom={isMobile ? 1.8 : 1} minZoom={0.8} maxZoom={isMobile ? 12 : 6}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const prefId = geo.properties.id as number;
                const isHovered = hoveredId === prefId;
                const isSelected = selectedPrefId === prefId;
                const baseColor = PREFECTURE_COLOR_MAP[prefId] ?? '#D0E8FF';
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isSelected ? '#4A90E2' : isHovered ? '#FFC947' : baseColor}
                    stroke="white"
                    strokeWidth={1.2}
                    style={{
                      default: { outline: 'none', cursor: onPrefectureClick ? 'pointer' : 'default' },
                      hover:   { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => { setHoveredId(prefId); }}
                    onMouseLeave={() => { setHoveredId(null); }}
                    onClick={(e: React.MouseEvent) => {
                      if (wasDrag(e) || !onPrefectureClick) return;
                      const pref = PREFECTURE_MAP[prefId];
                      if (pref) onPrefectureClick(pref.lat, pref.lng);
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* 県ごとのメンバーアイコン（衝突解決済み） */}
          {prefGroups.map(({ prefId, pins: groupPins, offsets }) => {
            const pref = PREFECTURE_MAP[prefId];
            if (!pref) return null;

            return groupPins.map((pin, i) => (
              <Marker key={pin.userId} coordinates={[pref.lng, pref.lat]}>
                <PinMarker
                  pin={pin}
                  offset={offsets[i]}
                  r={iconRadius}
                  onPinClick={onPinClick}
                  wasDrag={wasDrag}
                  onTooltip={(name, x, y) => setPinTooltip({ name, x, y })}
                  onTooltipMove={(x, y) => setPinTooltip(prev => prev ? { ...prev, x, y } : null)}
                  onTooltipHide={() => setPinTooltip(null)}
                />
              </Marker>
            ));
          })}
        </ZoomableGroup>
      </ComposableMap>

      {pinTooltip && (
        <div style={{
          position: 'fixed',
          left: pinTooltip.x + 12,
          top: pinTooltip.y - 8,
          background: 'rgba(0,0,0,0.75)',
          color: 'white',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          pointerEvents: 'none',
          zIndex: 9999,
          whiteSpace: 'nowrap',
        }}>
          {pinTooltip.name}
        </div>
      )}
    </div>
  );
}
