import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import nakamapLogo from '../assets/nakamap-logo.png';
import MapView from '../components/MapView';
import PhotoUpload from '../components/PhotoUpload';
import { registerLocation } from '../api/locations';
import { updateProfile } from '../api/profiles';
import useAuthStore from '../store/authStore';
import useMapStore from '../store/mapStore';

export default function ProfileSetupPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { name: storeName, photoUrl: storePhotoUrl } = useAuthStore();
  const { mapType } = useMapStore();

  const [name, setName] = useState(storeName || '');
  const [photoUrl, setPhotoUrl] = useState(storePhotoUrl || '');
  const [hobby, setHobby] = useState('');
  const [comment, setComment] = useState('');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'location'>('info');

  const id = Number(circleId);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }
    if (selectedLat === null || selectedLng === null) {
      setError('居住地の都道府県を選択してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        updateProfile(id, {
          name: name.trim(),
          photoUrl: photoUrl.trim() || null,
          hobby: hobby.trim() || null,
          comment: comment.trim() || null,
        }),
        registerLocation(id, selectedLat, selectedLng),
      ]);
      navigate(`/circles/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #ddd',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    color: '#555',
    fontWeight: 600,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* ヘッダー */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={nakamapLogo} alt="なかまっぷ" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '17px', color: '#222', fontWeight: 700 }}>プロフィール設定</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>サークルに参加するための情報を入力してください</p>
        </div>
      </div>

      {/* ステップインジケーター */}
      <div style={{ background: 'white', padding: '12px 20px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px' }}>
        {['プロフィール情報', '居住地設定'].map((label, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: i === (step === 'info' ? 0 : 1) ? '#4A90E2' : i < (step === 'info' ? 0 : 1) ? '#27ae60' : '#ddd',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, flexShrink: 0,
            }}>
              {i < (step === 'info' ? 0 : 1) ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '13px', color: i === (step === 'info' ? 0 : 1) ? '#4A90E2' : '#888', fontWeight: i === (step === 'info' ? 0 : 1) ? 600 : 400 }}>
              {label}
            </span>
            {i < 1 && <span style={{ color: '#ccc', marginLeft: '4px' }}>›</span>}
          </div>
        ))}
      </div>

      {step === 'info' ? (
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>名前 <span style={{ color: '#e74c3c' }}>*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="あなたの名前"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#4A90E2')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>プロフィール画像</label>
              <PhotoUpload value={photoUrl || null} onChange={setPhotoUrl} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>趣味</label>
              <input
                type="text"
                value={hobby}
                onChange={(e) => setHobby(e.target.value)}
                placeholder="例: 読書、旅行"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#4A90E2')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={labelStyle}>一言コメント</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="自己紹介など"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                onFocus={(e) => (e.target.style.borderColor = '#4A90E2')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fcc', color: '#e74c3c', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', margin: '16px 0' }}>
              {error}
            </div>
          )}

          <button
            onClick={() => {
              if (!name.trim()) { setError('名前を入力してください'); return; }
              setError('');
              setStep('location');
            }}
            style={{
              width: '100%',
              padding: '14px',
              background: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            次へ: 居住地を設定 →
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
              居住している都道府県をタップしてください
            </p>
            {selectedLat !== null && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#4A90E2', fontWeight: 600 }}>
                ✓ 都道府県を選択しました
              </p>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <MapView
              onMapClick={handleMapClick}
              selectedLat={selectedLat}
              selectedLng={selectedLng}
              style={{ height: '100%' }}
              mapType={mapType}
            />
          </div>

          <div style={{ background: 'white', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setStep('info'); setError(''); }}
              style={{
                flex: 1,
                padding: '12px',
                background: 'white',
                border: '1.5px solid #ddd',
                color: '#666',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← 戻る
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedLat === null}
              style={{
                flex: 2,
                padding: '12px',
                background: loading || selectedLat === null ? '#93c0ef' : '#4A90E2',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading || selectedLat === null ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '登録中...' : '完了してマップへ'}
            </button>
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fcc', color: '#e74c3c', padding: '10px 16px', fontSize: '14px' }}>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
