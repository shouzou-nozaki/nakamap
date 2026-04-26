import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStampHistory, getStampRanking } from '../api/stamps';
import type { EncounterHistory, RankingEntry } from '../types';
import useAuthStore from '../store/authStore';

type Tab = 'history' | 'ranking';

export default function StampPage() {
  const { circleId } = useParams<{ circleId: string }>();
  const navigate = useNavigate();
  const { userId: myUserId } = useAuthStore();
  const id = Number(circleId);

  const [tab, setTab] = useState<Tab>('ranking');
  const [history, setHistory] = useState<EncounterHistory[]>([]);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [hist, rank] = await Promise.all([
          getStampHistory(id),
          getStampRanking(id),
        ]);
        setHistory(hist);
        setRanking(rank);
      } catch {
        setError('データの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const rankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}位`;
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    border: 'none',
    borderBottom: active ? '3px solid #4A90E2' : '3px solid transparent',
    background: 'white',
    color: active ? '#4A90E2' : '#888',
    fontWeight: active ? 700 : 400,
    fontSize: '15px',
    cursor: 'pointer',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: 'calc(16px + env(safe-area-inset-top)) 16px 0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => navigate(`/circles/${id}`)}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: '4px' }}
          >
            ←
          </button>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>🎫 なかまスタンプ</p>
        </div>
        <div style={{ display: 'flex' }}>
          <button style={tabStyle(tab === 'ranking')} onClick={() => setTab('ranking')}>
            ランキング
          </button>
          <button style={tabStyle(tab === 'history')} onClick={() => setTab('history')}>
            スタンプ履歴
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
            <p>読み込み中...</p>
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#e74c3c' }}>
            <p>{error}</p>
          </div>
        )}

        {/* Ranking tab */}
        {!loading && !error && tab === 'ranking' && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              今月のポイントランキング
            </p>
            {ranking.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎫</p>
                <p>まだスタンプがありません</p>
              </div>
            ) : ranking.map((entry) => (
              <div key={entry.userId} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                border: entry.userId === myUserId ? '2px solid #4A90E2' : 'none',
              }}>
                <div style={{ width: '36px', textAlign: 'center', fontSize: entry.rank <= 3 ? '22px' : '15px', fontWeight: 700, color: '#666' }}>
                  {rankMedal(entry.rank)}
                </div>
                {entry.photoUrl ? (
                  <img src={entry.photoUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4A90E2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                    {entry.name?.[0] ?? '?'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: entry.userId === myUserId ? 700 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name ?? '(名前なし)'}{entry.userId === myUserId ? ' (自分)' : ''}
                  </p>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f39c12', flexShrink: 0 }}>
                  {entry.totalPoints}pt
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History tab */}
        {!loading && !error && tab === 'history' && (
          <div>
            <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              過去1年間のスタンプ履歴
            </p>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
                <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎫</p>
                <p>まだスタンプがありません</p>
              </div>
            ) : history.map((item) => (
              <div key={item.encounterId} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {item.partnerPhotoUrl ? (
                  <img src={item.partnerPhotoUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#4A90E2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {item.partnerName?.[0] ?? '?'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.partnerName ?? '(名前なし)'}
                    {item.firstMeeting && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#4A90E2', fontWeight: 400 }}>初対面</span>}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>{formatDate(item.metAt)}</p>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f39c12', flexShrink: 0 }}>
                  +{item.firstMeeting ? 5 : 1}pt
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
