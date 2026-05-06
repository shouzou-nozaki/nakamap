export interface PrefectureInfo {
  id: number;
  name: string;
  lat: number;
  lng: number;
  color: string;
  seaDeg: number; // 海方向の角度（コンパス：0=北, 90=東, 180=南, 270=西）
}

// パステルカラー8色（隣接する都道府県で色が重ならないよう手動割り当て）
const C = {
  blue:   '#B3DAFF',
  green:  '#B3F0C8',
  yellow: '#FFF5B3',
  orange: '#FFD9B3',
  pink:   '#FFB3D1',
  purple: '#D9B3FF',
  teal:   '#B3EFE8',
  red:    '#FFB3B3',
};

export const PREFECTURES: PrefectureInfo[] = [
  { id:  1, name: '北海道', lat: 43.46, lng: 142.84, color: C.blue,   seaDeg:  90 }, // 太平洋（東）
  { id:  2, name: '青森',   lat: 40.82, lng: 140.74, color: C.green,  seaDeg:   0 }, // 津軽海峡（北）
  { id:  3, name: '岩手',   lat: 39.70, lng: 141.20, color: C.yellow, seaDeg:  90 }, // 太平洋（東）
  { id:  4, name: '宮城',   lat: 38.40, lng: 141.00, color: C.orange, seaDeg:  90 }, // 太平洋（東）
  { id:  5, name: '秋田',   lat: 39.70, lng: 140.10, color: C.pink,   seaDeg: 270 }, // 日本海（西）
  { id:  6, name: '山形',   lat: 38.50, lng: 140.30, color: C.teal,   seaDeg: 270 }, // 日本海（西）
  { id:  7, name: '福島',   lat: 37.50, lng: 140.20, color: C.purple, seaDeg:  90 }, // 太平洋（東）
  { id:  8, name: '茨城',   lat: 36.30, lng: 140.45, color: C.orange, seaDeg:  90 }, // 太平洋（東）
  { id:  9, name: '栃木',   lat: 36.60, lng: 139.90, color: C.green,  seaDeg:  90 }, // 太平洋方向（東）
  { id: 10, name: '群馬',   lat: 36.50, lng: 139.00, color: C.blue,   seaDeg:  45 }, // 内陸→北東方向の隙間
  { id: 11, name: '埼玉',   lat: 35.86, lng: 139.65, color: C.teal,   seaDeg: 135 }, // 東京湾方向（南東）
  { id: 12, name: '千葉',   lat: 35.50, lng: 140.10, color: C.pink,   seaDeg:  90 }, // 太平洋（東）
  { id: 13, name: '東京',   lat: 35.69, lng: 139.40, color: C.red,    seaDeg: 180 }, // 東京湾（南）
  { id: 14, name: '神奈川', lat: 35.45, lng: 139.50, color: C.yellow, seaDeg: 180 }, // 相模湾（南）
  { id: 15, name: '新潟',   lat: 37.50, lng: 138.90, color: C.red,    seaDeg:   0 }, // 日本海（北）
  { id: 16, name: '富山',   lat: 36.70, lng: 137.21, color: C.green,  seaDeg:   0 }, // 富山湾（北）
  { id: 17, name: '石川',   lat: 36.59, lng: 136.63, color: C.orange, seaDeg: 315 }, // 日本海（北西）
  { id: 18, name: '福井',   lat: 35.95, lng: 136.19, color: C.teal,   seaDeg: 270 }, // 日本海（西）
  { id: 19, name: '山梨',   lat: 35.60, lng: 138.57, color: C.purple, seaDeg: 180 }, // 内陸→太平洋方向（南）
  { id: 20, name: '長野',   lat: 36.40, lng: 138.18, color: C.blue,   seaDeg:  90 }, // 内陸→太平洋方向（東）
  { id: 21, name: '岐阜',   lat: 35.80, lng: 137.00, color: C.pink,   seaDeg: 180 }, // 内陸→伊勢湾方向（南）
  { id: 22, name: '静岡',   lat: 34.90, lng: 138.38, color: C.green,  seaDeg: 180 }, // 太平洋（南）
  { id: 23, name: '愛知',   lat: 35.18, lng: 137.10, color: C.yellow, seaDeg: 180 }, // 伊勢・三河湾（南）
  { id: 24, name: '三重',   lat: 34.50, lng: 136.51, color: C.blue,   seaDeg: 135 }, // 太平洋・熊野灘（南東）
  { id: 25, name: '滋賀',   lat: 35.20, lng: 136.22, color: C.orange, seaDeg: 330 }, // 内陸→日本海方向（北北西）
  { id: 26, name: '京都',   lat: 35.25, lng: 135.50, color: C.teal,   seaDeg:   0 }, // 日本海（北）
  { id: 27, name: '大阪',   lat: 34.69, lng: 135.50, color: C.red,    seaDeg: 180 }, // 大阪湾（南）
  { id: 28, name: '兵庫',   lat: 35.00, lng: 134.80, color: C.purple, seaDeg: 210 }, // 播磨灘・瀬戸内海（南南西）
  { id: 29, name: '奈良',   lat: 34.40, lng: 135.83, color: C.pink,   seaDeg: 180 }, // 内陸→太平洋方向（南）
  { id: 30, name: '和歌山', lat: 33.94, lng: 135.17, color: C.green,  seaDeg: 180 }, // 太平洋・紀伊水道（南）
  { id: 31, name: '鳥取',   lat: 35.50, lng: 134.00, color: C.yellow, seaDeg:   0 }, // 日本海（北）
  { id: 32, name: '島根',   lat: 35.30, lng: 133.05, color: C.blue,   seaDeg: 315 }, // 日本海（北西）
  { id: 33, name: '岡山',   lat: 34.66, lng: 133.93, color: C.orange, seaDeg: 180 }, // 瀬戸内海（南）
  { id: 34, name: '広島',   lat: 34.60, lng: 132.70, color: C.teal,   seaDeg: 180 }, // 瀬戸内海（南）
  { id: 35, name: '山口',   lat: 34.19, lng: 131.47, color: C.pink,   seaDeg: 270 }, // 日本海・関門海峡（西）
  { id: 36, name: '徳島',   lat: 33.84, lng: 134.54, color: C.blue,   seaDeg: 135 }, // 太平洋（南東）
  { id: 37, name: '香川',   lat: 34.34, lng: 134.04, color: C.red,    seaDeg:   0 }, // 瀬戸内海（北）
  { id: 38, name: '愛媛',   lat: 33.84, lng: 132.77, color: C.green,  seaDeg: 270 }, // 伊予灘（西）
  { id: 39, name: '高知',   lat: 33.56, lng: 133.53, color: C.purple, seaDeg: 180 }, // 太平洋（南）
  { id: 40, name: '福岡',   lat: 33.70, lng: 130.80, color: C.yellow, seaDeg: 315 }, // 玄界灘（北西）
  { id: 41, name: '佐賀',   lat: 33.25, lng: 130.30, color: C.teal,   seaDeg: 270 }, // 有明海・玄界灘（西）
  { id: 42, name: '長崎',   lat: 32.90, lng: 129.87, color: C.orange, seaDeg: 270 }, // 東シナ海（西）
  { id: 43, name: '熊本',   lat: 32.79, lng: 130.74, color: C.blue,   seaDeg: 270 }, // 天草・有明海（西）
  { id: 44, name: '大分',   lat: 33.24, lng: 131.61, color: C.pink,   seaDeg:  90 }, // 伊予灘・豊後水道（東）
  { id: 45, name: '宮崎',   lat: 32.30, lng: 131.42, color: C.green,  seaDeg:  90 }, // 太平洋（東）
  { id: 46, name: '鹿児島', lat: 31.56, lng: 130.56, color: C.red,    seaDeg: 180 }, // 太平洋・東シナ海（南）
  { id: 47, name: '沖縄',   lat: 26.35, lng: 127.80, color: C.teal,   seaDeg:  90 }, // 太平洋（東）
];

export const PREFECTURE_COLOR_MAP: Record<number, string> =
  Object.fromEntries(PREFECTURES.map(p => [p.id, p.color]));

export const PREFECTURE_MAP: Record<number, PrefectureInfo> =
  Object.fromEntries(PREFECTURES.map(p => [p.id, p]));

export function findNearestPrefecture(lat: number, lng: number): PrefectureInfo {
  let nearest = PREFECTURES[0];
  let minDist = Infinity;
  for (const p of PREFECTURES) {
    const dist = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (dist < minDist) { minDist = dist; nearest = p; }
  }
  return nearest;
}
