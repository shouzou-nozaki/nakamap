import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinCircle } from '../api/circles';

export default function JoinCirclePage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError('参加コードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const circle = await joinCircle(joinCode.trim());
      navigate(`/circles/${circle.circleId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'サークルへの参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#4A90E2', fontSize: '15px', cursor: 'pointer', padding: '0 0 16px', fontWeight: 600 }}
        >
          ← 戻る
        </button>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🔗</div>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#222' }}>サークルに参加</h2>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: '14px' }}>
            招待コードを入力してサークルに参加しましょう
          </p>
        </div>

        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#555', fontWeight: 600 }}>
              参加コード
            </label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="例: ABC123"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '4px',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4A90E2')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fcc', color: '#e74c3c', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#93c0ef' : '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '参加中...' : 'サークルに参加'}
          </button>
        </form>
      </div>
    </div>
  );
}
