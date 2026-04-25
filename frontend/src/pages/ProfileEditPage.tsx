import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import PhotoUpload from '../components/PhotoUpload';
import { getMyLocation, updateLocation } from '../api/locations';
import { getProfile, updateProfile } from '../api/profiles';
import useAuthStore from '../store/authStore';

export default function ProfileEditPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [hobby, setHobby] = useState('');
  const [comment, setComment] = useState('');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'location'>('info');

  const id = Number(circleId);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const [profile, myLoc] = await Promise.all([
          getProfile(id, userId),
          getMyLocation(id),
        ]);
        setName(profile.name || '');
        setPhotoUrl(profile.photoUrl || '');
        setHobby(profile.hobby || '');
        setComment(profile.comment || '');
        if (myLoc) {
          setSelectedLat(myLoc.displayLatitude);
          setSelectedLng(myLoc.displayLongitude);
        }
      } catch {
        setError('プロフィールの読み込みに失敗しました');
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id, userId]);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const promises: Promise<any>[] = [
        updateProfile(id, {
          name: name.trim(),
          photoUrl: photoUrl.trim() || null,
          hobby: hobby.trim() || null,
          comment: comment.trim() || null,
        }),
      ];
      if (selectedLat !== null && selectedLng !== null) {
        promises.push(updateLocation(id, selectedLat, selectedLng));
      }
      await Promise.all(promises);
      navigate(`/circles/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || '更新に失敗しました');
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

  if (initialLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* ヘッダー */}
      <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: '#4A90E2', fontSize: '15px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
        >
          ← 戻る
        </button>
        <h1 style={{ margin: 0, fontSize: '17px', color: '#222', fontWeight: 700 }}>プロフィール編集</h1>
      </div>

      {/* ステップ切り替え */}
      <div style={{ background: 'white', padding: '12px 20px', borderBottom: '1px solid #eee', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setStep('info')}
          style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: step === 'info' ? '#4A90E2' : '#f0f0f0',
            color: step === 'info' ? 'white' : '#666',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          プロフィール情報
        </button>
        <button
          onClick={() => setStep('location')}
          style={{
            padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: step === 'location' ? '#4A90E2' : '#f0f0f0',
            color: step === 'location' ? 'white' : '#666',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          居住地設定
        </button>
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
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#4A90E2')}
                onBlur={(e) => (e.target.style.borderColor = '#ddd')}
              />
            </div>
            <div>
              <label style={labelStyle}>一言コメント</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
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
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#93c0ef' : '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '16px',
            }}
          >
            {loading ? '更新中...' : '保存する'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          <div style={{ background: 'white', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
              地図をクリックして居住地を変更してください
            </p>
          </div>

          <div style={{ flex: 1 }}>
            <MapView
              onMapClick={handleMapClick}
              selectedLat={selectedLat}
              selectedLng={selectedLng}
              center={selectedLat !== null ? [selectedLat, selectedLng!] : undefined}
              style={{ height: '100%' }}
            />
          </div>

          <div style={{ background: 'white', padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid #eee' }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#93c0ef' : '#4A90E2',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '更新中...' : '保存する'}
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
