
interface Cloud {
  id: number;
  top: string;
  width: number;
  duration: number;
  delay: number;
  opacity: number;
}

const CLOUDS: Cloud[] = [
  { id: 1, top: '8%',  width: 180, duration: 40, delay: 0,   opacity: 0.9 },
  { id: 2, top: '18%', width: 120, duration: 55, delay: -15, opacity: 0.75 },
  { id: 3, top: '30%', width: 220, duration: 48, delay: -8,  opacity: 0.85 },
  { id: 4, top: '12%', width: 90,  duration: 62, delay: -30, opacity: 0.65 },
  { id: 5, top: '42%', width: 160, duration: 44, delay: -22, opacity: 0.7  },
  { id: 6, top: '55%', width: 100, duration: 70, delay: -5,  opacity: 0.55 },
  { id: 7, top: '5%',  width: 140, duration: 50, delay: -40, opacity: 0.8  },
];

function Cloud({ top, width, duration, delay, opacity }: Omit<Cloud, 'id'>) {
  const height = Math.round(width * 0.38);
  const bumpSize = Math.round(width * 0.38);
  const bumpLeft = Math.round(width * 0.22);
  const bump2Size = Math.round(width * 0.28);
  const bump2Left = Math.round(width * 0.52);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        width,
        height,
        opacity,
        animation: `floatCloud ${duration}s ${delay}s linear infinite`,
        willChange: 'transform',
      }}
    >
      {/* 雲の本体 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '60%',
        background: 'white',
        borderRadius: '40px',
        boxShadow: '0 4px 15px rgba(255,255,255,0.5)',
      }} />
      {/* 左の丸 */}
      <div style={{
        position: 'absolute',
        bottom: '35%',
        left: bumpLeft,
        width: bumpSize,
        height: bumpSize,
        background: 'white',
        borderRadius: '50%',
      }} />
      {/* 右の丸 */}
      <div style={{
        position: 'absolute',
        bottom: '28%',
        left: bump2Left,
        width: bump2Size,
        height: bump2Size,
        background: 'white',
        borderRadius: '50%',
      }} />
    </div>
  );
}

export default function CloudBackground() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #5ba3d9 0%, #87ceeb 35%, #b8dff5 70%, #dff0fb 100%)',
      pointerEvents: 'none',
    }}>
      {CLOUDS.map(({ id, ...props }) => (
        <Cloud key={id} {...props} />
      ))}
    </div>
  );
}
