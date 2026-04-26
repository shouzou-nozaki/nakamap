import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { getStampQr, scanStamp } from '../api/stamps';
import { playStampSound } from '../utils/sound';
import type { ScanResult } from '../types';

interface Props {
  circleId: number;
  onClose: () => void;
}

type Tab = 'show' | 'scan';

export default function StampModal({ circleId, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('show');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'stamp-qr-scanner';

  useEffect(() => {
    if (tab === 'show') {
      loadQr();
    }
    return () => { stopScanner(); };
  }, [tab]);

  // div が DOM に存在してから起動する
  useEffect(() => {
    if (!cameraActive) return;
    const scanner = new Html5Qrcode(scannerDivId);
    scannerRef.current = scanner;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      async (decodedText) => {
        await stopScanner();
        await handleScanSuccess(decodedText);
      },
      () => {}
    ).catch(() => {
      scannerRef.current = null;
      setCameraActive(false);
      setError('カメラの起動に失敗しました。ブラウザのカメラ許可を確認してください。');
    });
  }, [cameraActive]);

  const loadQr = async () => {
    setQrLoading(true);
    setError(null);
    try {
      const token = await getStampQr(circleId);
      setQrToken(token);
    } catch {
      setError('QRコードの取得に失敗しました');
    } finally {
      setQrLoading(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* already stopped */ }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const handleScanSuccess = async (token: string) => {
    setError(null);
    try {
      const result = await scanStamp(circleId, token);
      playStampSound();
      setScanResult(result);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 409) {
        setError('📅 ' + (msg ?? '本日分はスキャン済みです'));
      } else {
        setError(msg ?? 'スキャンに失敗しました');
      }
    }
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    border: 'none',
    background: active ? '#4A90E2' : '#f0f0f0',
    color: active ? 'white' : '#666',
    fontWeight: active ? 700 : 400,
    fontSize: '14px',
    cursor: 'pointer',
  });

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100 }}
      />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: '16px', zIndex: 1200,
        width: 'min(360px, 94vw)', maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
          <p style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>🎫 なかまスタンプ</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', margin: '12px 20px 0', borderRadius: '8px', overflow: 'hidden' }}>
          <button style={tabStyle(tab === 'show')} onClick={() => { stopScanner(); setTab('show'); }}>
            QR表示
          </button>
          <button style={tabStyle(tab === 'scan')} onClick={() => { setScanResult(null); setError(null); setTab('scan'); }}>
            スキャン
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Show QR tab */}
          {tab === 'show' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
                相手にこのQRコードを読み取ってもらうと<br />スタンプが押されます（5分間有効）
              </p>
              {qrLoading && <p style={{ color: '#888' }}>読み込み中...</p>}
              {error && <p style={{ color: '#e74c3c', fontSize: '13px' }}>{error}</p>}
              {qrToken && !qrLoading && (
                <div style={{ display: 'inline-block', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                  <QRCodeSVG value={qrToken} size={200} />
                </div>
              )}
              <br />
              <button
                onClick={loadQr}
                style={{ marginTop: '12px', padding: '8px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
              >
                更新
              </button>
            </div>
          )}

          {/* Scan tab */}
          {tab === 'scan' && (
            <div style={{ textAlign: 'center' }}>
              {/* スキャナー div は常に DOM に存在させる（cameraActive 時のみ表示） */}
              <div
                id={scannerDivId}
                style={{ borderRadius: '8px', overflow: 'hidden', display: cameraActive ? 'block' : 'none' }}
              />

              {cameraActive && (
                <>
                  <p style={{ margin: '12px 0 8px', fontSize: '13px', color: '#666' }}>QRコードをカメラに向けてください</p>
                  <button
                    onClick={stopScanner}
                    style={{ padding: '8px 20px', background: '#f0f0f0', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    キャンセル
                  </button>
                </>
              )}

              {!cameraActive && !scanResult && (
                <>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#666' }}>
                    相手のQRコードをスキャンしてスタンプを押しましょう
                  </p>
                  {error && <p style={{ color: '#e74c3c', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                  <button
                    onClick={() => { setError(null); setCameraActive(true); }}
                    style={{ padding: '12px 28px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    📷 カメラを起動
                  </button>
                </>
              )}

              {scanResult && (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                    {scanResult.firstMeeting ? '🎉' : '✅'}
                  </div>
                  {scanResult.targetPhotoUrl ? (
                    <img src={scanResult.targetPhotoUrl} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#4A90E2', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 8px' }}>
                      {scanResult.targetName?.[0] ?? '?'}
                    </div>
                  )}
                  <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '16px' }}>{scanResult.targetName}</p>
                  {scanResult.firstMeeting && <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4A90E2', fontWeight: 600 }}>✨ はじめまして！</p>}
                  <p style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700, color: '#f39c12' }}>+{scanResult.pointsEarned}pt</p>
                  {scanResult.allMembersBonus && (
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#27ae60', fontWeight: 600 }}>🏆 全員達成ボーナス +20pt 含む！</p>
                  )}
                  <button
                    onClick={() => { setScanResult(null); setError(null); }}
                    style={{ marginTop: '16px', padding: '10px 24px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    続けてスキャン
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
