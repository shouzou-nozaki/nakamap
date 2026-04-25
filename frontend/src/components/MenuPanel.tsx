import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

interface MenuPanelProps {
  onClose: () => void;
  onDeleteCircle?: () => void;
  circleName?: string;
}

export default function MenuPanel({ onClose, onDeleteCircle, circleName }: MenuPanelProps) {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 20px',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#333',
    borderRadius: '8px',
    margin: '4px 8px',
    transition: 'background 0.15s',
    border: 'none',
    background: 'none',
    width: 'calc(100% - 16px)',
    textAlign: 'left',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '280px',
        height: '100vh',
        backgroundColor: 'white',
        boxShadow: '4px 0 16px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInLeft 0.25s ease',
      }}
    >
      {/* ヘッダー: ロゴ＋サークル名 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4A90E2, #357abd)',
          padding: '32px 20px 24px',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}
          >
            🗺️
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '12px', opacity: 0.8 }}>なかまっぷ</p>
            <p style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{circleName || ''}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* メニュー項目 */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <button
          style={menuItemStyle}
          onClick={() => { navigate('/circles'); onClose(); }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: '20px' }}>🏠</span>
          サークル一覧
        </button>
        <button
          style={menuItemStyle}
          onClick={() => { navigate('/circles/new'); onClose(); }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: '20px' }}>➕</span>
          サークルを作成
        </button>
        <button
          style={menuItemStyle}
          onClick={() => { navigate('/circles/join'); onClose(); }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: '20px' }}>🔗</span>
          サークルに参加
        </button>

        <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />

        {onDeleteCircle && (
          <button
            style={{ ...menuItemStyle, color: '#e74c3c' }}
            onClick={() => { onDeleteCircle(); onClose(); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <span style={{ fontSize: '20px' }}>🗑️</span>
            サークルを削除
          </button>
        )}

        <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />

        <button
          style={{ ...menuItemStyle, color: '#e74c3c' }}
          onClick={handleLogout}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: '20px' }}>🚪</span>
          ログアウト
        </button>
      </nav>
    </div>
  );
}
