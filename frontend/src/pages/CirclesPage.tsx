import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import nakamapLogo from '../assets/nakamap-logo.png';
import { getCircles } from '../api/circles';
import type { CircleListItem } from '../types';

export default function CirclesPage() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<CircleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCircles()
      .then(setCircles)
      .catch(() => setError('サークル一覧の取得に失敗しました'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* ヘッダー */}
      <div
        style={{
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', color: '#4A90E2', fontWeight: 700 }}>
          <img src={nakamapLogo} alt="なかまっぷ" style={{ width: '24px', height: '24px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '8px' }} />なかまっぷ
        </h1>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>サークル一覧</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate('/circles/join')}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1.5px solid #4A90E2',
                color: '#4A90E2',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              参加
            </button>
            <button
              onClick={() => navigate('/circles/new')}
              style={{
                padding: '8px 16px',
                background: '#4A90E2',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              作成
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>読み込み中...</div>
        )}
        {error && (
          <div
            style={{
              background: '#fff5f5',
              border: '1px solid #fcc',
              color: '#e74c3c',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {!loading && circles.length === 0 && !error && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#888',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌍</div>
            <p style={{ margin: 0, fontSize: '16px' }}>まだサークルに参加していません</p>
            <p style={{ margin: '8px 0 0', fontSize: '14px' }}>サークルを作成または参加してみましょう</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {circles.map((circle) => (
            <button
              key={circle.circleId}
              onClick={() => navigate(`/circles/${circle.circleId}`)}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '18px 20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,144,226,0.2)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#222' }}>
                  {circle.name}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
                  {circle.memberCount}人 · {circle.role === 'OWNER' ? 'オーナー' : 'メンバー'}
                </p>
              </div>
              <span style={{ fontSize: '20px', color: '#ccc' }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
