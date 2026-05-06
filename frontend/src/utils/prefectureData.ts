export interface PrefectureInfo {
  id: number;
  name: string;
  lat: number;
  lng: number;
  color: string;
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
  { id:  1, name: '北海道', lat: 43.46, lng: 142.84, color: C.blue   },
  { id:  2, name: '青森',   lat: 40.82, lng: 140.74, color: C.green  },
  { id:  3, name: '岩手',   lat: 39.70, lng: 141.20, color: C.yellow },
  { id:  4, name: '宮城',   lat: 38.40, lng: 141.00, color: C.orange },
  { id:  5, name: '秋田',   lat: 39.70, lng: 140.10, color: C.pink   },
  { id:  6, name: '山形',   lat: 38.50, lng: 140.30, color: C.teal   },
  { id:  7, name: '福島',   lat: 37.50, lng: 140.20, color: C.purple },
  { id:  8, name: '茨城',   lat: 36.30, lng: 140.45, color: C.orange },
  { id:  9, name: '栃木',   lat: 36.60, lng: 139.90, color: C.green  },
  { id: 10, name: '群馬',   lat: 36.50, lng: 139.00, color: C.blue   },
  { id: 11, name: '埼玉',   lat: 35.86, lng: 139.65, color: C.teal   },
  { id: 12, name: '千葉',   lat: 35.50, lng: 140.10, color: C.pink   },
  { id: 13, name: '東京',   lat: 35.69, lng: 139.40, color: C.red    },
  { id: 14, name: '神奈川', lat: 35.45, lng: 139.50, color: C.yellow },
  { id: 15, name: '新潟',   lat: 37.50, lng: 138.90, color: C.red    },
  { id: 16, name: '富山',   lat: 36.70, lng: 137.21, color: C.green  },
  { id: 17, name: '石川',   lat: 36.59, lng: 136.63, color: C.orange },
  { id: 18, name: '福井',   lat: 35.95, lng: 136.19, color: C.teal   },
  { id: 19, name: '山梨',   lat: 35.60, lng: 138.57, color: C.purple },
  { id: 20, name: '長野',   lat: 36.40, lng: 138.18, color: C.blue   },
  { id: 21, name: '岐阜',   lat: 35.80, lng: 137.00, color: C.pink   },
  { id: 22, name: '静岡',   lat: 34.90, lng: 138.38, color: C.green  },
  { id: 23, name: '愛知',   lat: 35.18, lng: 137.10, color: C.yellow },
  { id: 24, name: '三重',   lat: 34.50, lng: 136.51, color: C.blue   },
  { id: 25, name: '滋賀',   lat: 35.20, lng: 136.22, color: C.orange },
  { id: 26, name: '京都',   lat: 35.25, lng: 135.50, color: C.teal   },
  { id: 27, name: '大阪',   lat: 34.69, lng: 135.50, color: C.red    },
  { id: 28, name: '兵庫',   lat: 35.00, lng: 134.80, color: C.purple },
  { id: 29, name: '奈良',   lat: 34.40, lng: 135.83, color: C.pink   },
  { id: 30, name: '和歌山', lat: 33.94, lng: 135.17, color: C.green  },
  { id: 31, name: '鳥取',   lat: 35.50, lng: 134.00, color: C.yellow },
  { id: 32, name: '島根',   lat: 35.30, lng: 133.05, color: C.blue   },
  { id: 33, name: '岡山',   lat: 34.66, lng: 133.93, color: C.orange },
  { id: 34, name: '広島',   lat: 34.60, lng: 132.70, color: C.teal   },
  { id: 35, name: '山口',   lat: 34.19, lng: 131.47, color: C.pink   },
  { id: 36, name: '徳島',   lat: 33.84, lng: 134.54, color: C.blue   },
  { id: 37, name: '香川',   lat: 34.34, lng: 134.04, color: C.red    },
  { id: 38, name: '愛媛',   lat: 33.84, lng: 132.77, color: C.green  },
  { id: 39, name: '高知',   lat: 33.56, lng: 133.53, color: C.purple },
  { id: 40, name: '福岡',   lat: 33.70, lng: 130.80, color: C.yellow },
  { id: 41, name: '佐賀',   lat: 33.25, lng: 130.30, color: C.teal   },
  { id: 42, name: '長崎',   lat: 32.90, lng: 129.87, color: C.orange },
  { id: 43, name: '熊本',   lat: 32.79, lng: 130.74, color: C.blue   },
  { id: 44, name: '大分',   lat: 33.24, lng: 131.61, color: C.pink   },
  { id: 45, name: '宮崎',   lat: 32.30, lng: 131.42, color: C.green  },
  { id: 46, name: '鹿児島', lat: 31.56, lng: 130.56, color: C.red    },
  { id: 47, name: '沖縄',   lat: 26.35, lng: 127.80, color: C.teal   },
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
