import type { LocationPin } from '../types';

interface MemberListPanelProps {
  pins: LocationPin[];
  myUserId?: number;
  onMemberClick: (userId: number) => void;
  onClose: () => void;
}

export default function MemberListPanel({ pins, myUserId, onMemberClick, onClose }: MemberListPanelProps) {
  const sorted = [...pins].sort((a, b) => {
    if (a.userId === myUserId) return -1;
    if (b.userId === myUserId) return 1;
    return 0;
  });
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '320px',
        height: '100vh',
        backgroundColor: 'white',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #eee',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>
          メンバー
          <span style={{ marginLeft: '8px', fontSize: '14px', color: '#999', fontWeight: 400 }}>
            {pins.length}人
          </span>
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '22px',
            cursor: 'pointer',
            color: '#666',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
        {pins.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
            メンバーがいません
          </p>
        ) : (
          sorted.map((pin) => (
            <button
              key={pin.userId}
              onClick={() => onMemberClick(pin.userId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {pin.photoUrl ? (
                <img
                  src={pin.photoUrl}
                  alt={pin.name}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #4A90E2',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#4A90E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'white',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {pin.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span style={{ fontSize: '15px', color: '#333', fontWeight: 500 }}>
                {pin.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
