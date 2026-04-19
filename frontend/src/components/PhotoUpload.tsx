import { useRef } from 'react';
import { compressImage } from '../utils/imageUtils';

interface Props {
  value: string | null;
  onChange: (base64: string) => void;
}

export default function PhotoUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    onChange(base64);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2.5px dashed #4A90E2',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f0f6ff',
          flexShrink: 0,
        }}
      >
        {value ? (
          <img src={value} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '32px' }}>📷</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          padding: '7px 20px',
          background: 'white',
          border: '1.5px solid #4A90E2',
          color: '#4A90E2',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {value ? '画像を変更' : '画像を選択'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
