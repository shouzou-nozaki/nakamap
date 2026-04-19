import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCircle } from '../api/circles';

export default function CreateCirclePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createdCircleId, setCreatedCircleId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('サークル名を入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createCircle(name.trim());
      setJoinCode(result.joinCode);
      setCreatedCircleId(result.circleId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'サークルの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (joinCode && createdCircleId) {
    return (
      <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ margin: '0 0 8px', color: '#222', fontSize: '22px' }}>サークルを作成しました</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 24px' }}>
            以下の参加コードをメンバーに共有してください
          </p>
          <div
            style={{
              background: '#f0f7ff',
              border: '2px dashed #4A90E2',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#888', fontWeight: 600 }}>参加コード</p>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#4A90E2', letterSpacing: '4px' }}>
              {joinCode}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(joinCode).catch(() => {});
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              border: '1.5px solid #4A90E2',
              color: '#4A90E2',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            コードをコピー
          </button>
          <button
            onClick={() => navigate(`/circles/${createdCircleId}`)}
            style={{
              width: '100%',
              padding: '14px',
              background: '#4A90E2',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            マップへ進む
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#4A90E2', fontSize: '15px', cursor: 'pointer', padding: '0 0 16px', fontWeight: 600 }}
        >
          ← 戻る
        </button>
        <h2 style={{ margin: '0 0 24px', fontSize: '22px', color: '#222' }}>サークルを作成</h2>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#555', fontWeight: 600 }}>
              サークル名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 大学友達グループ"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
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
            {loading ? '作成中...' : 'サークルを作成'}
          </button>
        </form>
      </div>
    </div>
  );
}
