import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import type { Profile } from '../types';

interface ProfilePanelProps {
  profile: Profile | null;
  onClose: () => void;
}

export default function ProfilePanel({ profile, onClose }: ProfilePanelProps) {
  const navigate = useNavigate();
  const { circleId } = useParams<{ circleId: string }>();
  const { userId: myUserId } = useAuthStore();
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const isMe = profile?.userId === myUserId;

  return (
    <>
    {isImageExpanded && profile?.photoUrl && (
      <div
        onClick={() => setIsImageExpanded(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'zoom-out',
        }}
      >
        <img
          src={profile.photoUrl}
          alt={profile.name}
          style={{
            maxWidth: '80vw',
            maxHeight: '80vh',
            borderRadius: '12px',
            objectFit: 'contain',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    )}
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
        <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>プロフィール</h3>
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

      {profile ? (
        <div style={{ padding: '24px 20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                onClick={() => setIsImageExpanded(true)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #4A90E2',
                  marginBottom: '12px',
                  cursor: 'zoom-in',
                }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#4A90E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white',
                  fontWeight: 'bold',
                  marginBottom: '12px',
                }}
              >
                {profile.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <h2 style={{ margin: 0, fontSize: '22px', color: '#222' }}>{profile.name}</h2>
          </div>

          {profile.comment && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#999', fontWeight: 600 }}>一言コメント</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#444', background: '#f5f5f5', borderRadius: '8px', padding: '10px 14px' }}>
                {profile.comment}
              </p>
            </div>
          )}

          {profile.hobby && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#999', fontWeight: 600 }}>趣味</p>
              <p style={{ margin: 0, fontSize: '15px', color: '#444', background: '#f5f5f5', borderRadius: '8px', padding: '10px 14px' }}>
                {profile.hobby}
              </p>
            </div>
          )}

          {isMe && (
            <button
              onClick={() => navigate(`/circles/${circleId}/profile/edit`)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4A90E2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '8px',
                fontWeight: 600,
              }}
            >
              プロフィールを編集
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
          読み込み中...
        </div>
      )}
    </div>
    </>
  );
}
