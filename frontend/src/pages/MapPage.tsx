import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import ProfilePanel from '../components/ProfilePanel';
import MenuPanel from '../components/MenuPanel';
import { getLocations } from '../api/locations';
import { getMyLocation } from '../api/locations';
import { getCircleDetail, deleteCircle } from '../api/circles';
import { getProfile } from '../api/profiles';
import type { LocationPin, Profile } from '../types';
import useAuthStore from '../store/authStore';

export default function MapPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { userId: myUserId } = useAuthStore();

  const [pins, setPins] = useState<LocationPin[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [circleName, setCircleName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [circleDeleted, setCircleDeleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const id = Number(circleId);

  const loadPins = useCallback(async () => {
    if (!id) return;
    try {
      const locs = await getLocations(id);
      setPins(locs);
    } catch {
      // エラーは静かに無視
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 自分の位置確認
        const myLoc = await getMyLocation(id);
        if (!myLoc) {
          navigate(`/circles/${id}/profile/setup`);
          return;
        }
        const detail = await getCircleDetail(id);
        setJoinCode(detail.joinCode);
        setCircleName(detail.name);
        await loadPins();
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 || status === 403) {
          setCircleDeleted(true);
        } else {
          navigate(`/circles/${id}/profile/setup`);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate, loadPins]);

  const handleDeleteCircle = async () => {
    setDeleteLoading(true);
    try {
      await deleteCircle(id);
      navigate('/circles');
    } catch {
      setDeleteLoading(false);
    }
  };

  const handlePinClick = async (userId: number) => {
    setShowProfile(true);
    setShowMenu(false);
    try {
      const profile = await getProfile(id, userId);
      setSelectedProfile(profile);
    } catch {
      setSelectedProfile(null);
    }
  };

  if (circleDeleted) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <div style={{ textAlign: 'center', color: '#666', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#333' }}>サークルが削除されました</p>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#888' }}>このサークルはadminによって削除されました</p>
          <button
            onClick={() => navigate('/circles')}
            style={{ padding: '10px 24px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            サークル一覧へ
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🗺️</div>
          <p>マップを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 地図 */}
      <div style={{ width: '100%', height: '100%' }}>
        <MapView
          pins={pins}
          onPinClick={handlePinClick}
          style={{ height: '100vh' }}
        />
      </div>

      {/* 上部バー */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          paddingTop: 'calc(12px + env(safe-area-inset-top))',
          paddingBottom: '12px',
          paddingLeft: '16px',
          paddingRight: '16px',
          pointerEvents: 'none',
        }}
      >
        {/* メニューボタン */}
        <button
          onClick={() => { setShowMenu(true); setShowProfile(false); }}
          style={{
            background: 'white',
            border: 'none',
            borderRadius: '10px',
            marginLeft: '54px',
            width: '44px',
            height: '44px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'all',
          }}
        >
          ☰
        </button>

{/* 招待コードボタン（adminのみ） */}
        {joinCode && (
          <button
            onClick={() => { setShowJoinCode(true); setShowMenu(false); setShowProfile(false); }}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '10px',
              width: '44px',
              height: '44px',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '8px',
              pointerEvents: 'all',
            }}
            title="招待コードを確認"
          >
            🔑
          </button>
        )}

{/* 自分のピンクリック用ボタン */}
        {myUserId && (
          <button
            onClick={() => handlePinClick(myUserId)}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '10px',
              width: '44px',
              height: '44px',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto',
              pointerEvents: 'all',
            }}
            title="自分のプロフィール"
          >
            👤
          </button>
        )}
      </div>

      {/* 再読み込みボタン */}
      <button
        onClick={loadPins}
        style={{
          position: 'absolute',
          bottom: 'calc(24px + env(safe-area-inset-bottom))',
          right: 'calc(16px + env(safe-area-inset-right))',
          zIndex: 500,
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="メンバー位置を更新"
      >
        🔄
      </button>

      {/* 招待コードモーダル */}
      {showJoinCode && joinCode && (
        <>
          <div
            onClick={() => setShowJoinCode(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              borderRadius: '16px',
              padding: '28px 32px',
              zIndex: 1000,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              minWidth: '260px',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#888' }}>招待コード</p>
            <p style={{ margin: '0 0 20px', fontSize: '32px', fontWeight: 700, letterSpacing: '6px', color: '#4A90E2' }}>
              {joinCode}
            </p>
            <button
              onClick={() => { navigator.clipboard.writeText(joinCode); }}
              style={{
                padding: '10px 24px',
                background: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginRight: '8px',
              }}
            >
              コピー
            </button>
            <button
              onClick={() => setShowJoinCode(false)}
              style={{
                padding: '10px 24px',
                background: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              閉じる
            </button>
          </div>
        </>
      )}

      {/* オーバーレイ */}
      {(showProfile || showMenu) && (
        <div
          onClick={() => { setShowProfile(false); setShowMenu(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 999,
          }}
        />
      )}

      {/* メニューパネル */}
      {showMenu && (
        <MenuPanel
          onClose={() => setShowMenu(false)}
          onDeleteCircle={joinCode !== null ? () => { setShowMenu(false); setShowDeleteModal(true); } : undefined}
        />
      )}

      {/* サークル削除確認モーダル */}
      {showDeleteModal && (
        <>
          <div
            onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: '16px', padding: '28px', zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)', width: 'min(360px, 90vw)',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#e74c3c' }}>⚠️ サークルを削除</p>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#555' }}>
              この操作は取り消せません。全メンバーのデータが削除されます。
            </p>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#333' }}>
              確認のため <strong>「{circleName}」</strong> と入力してください
            </p>
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={circleName}
              style={{
                width: '100%', padding: '10px 12px', border: '1.5px solid #ddd',
                borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '16px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                style={{ flex: 1, padding: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteCircle}
                disabled={deleteInput !== circleName || deleteLoading}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: deleteInput !== circleName || deleteLoading ? 'not-allowed' : 'pointer',
                  background: deleteInput !== circleName || deleteLoading ? '#f5a5a5' : '#e74c3c', color: 'white',
                }}
              >
                {deleteLoading ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* プロフィールパネル */}
      {showProfile && (
        <ProfilePanel
          profile={selectedProfile}
          onClose={() => { setShowProfile(false); setSelectedProfile(null); }}
        />
      )}
    </div>
  );
}
