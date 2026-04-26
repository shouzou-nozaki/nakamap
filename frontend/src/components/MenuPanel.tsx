import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import nakamapLogo from '../assets/nakamap-logo.png';

interface MenuPanelProps {
  onClose: () => void;
  onDeleteCircle?: () => void;
  circleName?: string;
  isAdmin?: boolean;
  onCircleNameUpdate?: (newName: string) => Promise<void>;
  circleId?: number;
  stampEnabled?: boolean;
  onStampToggle?: (enabled: boolean) => Promise<void>;
}

export default function MenuPanel({ onClose, onDeleteCircle, circleName, isAdmin, onCircleNameUpdate, circleId, stampEnabled, onStampToggle }: MenuPanelProps) {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [stampToggling, setStampToggling] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleEditStart = () => {
    setEditName(circleName || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!editName.trim() || !onCircleNameUpdate) return;
    setSaving(true);
    try {
      await onCircleNameUpdate(editName.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
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
          <img
            src={nakamapLogo}
            alt="なかまっぷ"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              objectFit: 'contain',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 2px', fontSize: '12px', opacity: 0.8 }}>なかまっぷ</p>
            {editing ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: '15px',
                    fontWeight: 700,
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderRadius: '6px',
                    color: 'white',
                    padding: '4px 8px',
                    outline: 'none',
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                  style={{
                    background: 'rgba(255,255,255,0.25)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: saving ? 'default' : 'pointer',
                    padding: '4px 8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {saving ? '…' : '保存'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <p style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>{circleName || ''}</p>
                {isAdmin && (
                  <button
                    onClick={handleEditStart}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.75)',
                      cursor: 'pointer',
                      padding: '2px',
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="サークル名を変更"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
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

        {circleId && (
          <>
            <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />
            <button
              style={menuItemStyle}
              onClick={() => { navigate(`/circles/${circleId}/stamp`); onClose(); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: '20px' }}>🎫</span>
              なかまスタンプ
            </button>
            {isAdmin && onStampToggle && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 10px 46px', margin: '0 8px', borderRadius: '8px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>スタンプ機能</span>
                <button
                  onClick={async () => {
                    setStampToggling(true);
                    try { await onStampToggle(!stampEnabled); } finally { setStampToggling(false); }
                  }}
                  disabled={stampToggling}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: stampToggling ? 'default' : 'pointer',
                    background: stampEnabled ? '#4A90E2' : '#ccc', position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px', left: stampEnabled ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            )}
          </>
        )}

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
