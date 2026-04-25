# なかまっぷ

仲間とつながる地図アプリ。サークル単位でメンバーの居住地をマップ上に表示し、お互いの近さを可視化する。

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|----------|------|-----------|
| フロントエンド | React + TypeScript | React 19 / TS 6 |
| ビルドツール | Vite | 8 |
| 状態管理 | Zustand | 5 |
| マップ | React Leaflet / Leaflet | 5 / 1.9 |
| HTTP クライアント | Axios | 1 |
| バックエンド | Spring Boot | 3.5 / Java 17 |
| 認証 | Spring Security + JWT (jjwt) | 0.12 |
| ORM | Spring Data JPA | - |
| DBマイグレーション | Flyway | - |
| データベース | PostgreSQL | 16 |
| インフラ | Render (Static Site + Web Service + PostgreSQL) | - |

---

## 技術選定理由

**React**
モダンなSPAとしてマップ操作・パネル開閉・リアルタイム更新など状態管理の複雑なUIを扱いやすいため。フロントエンドのデファクトになりつつあり、エコシステムも充実している。

**Spring Boot**
業務での使用実績があり、セキュリティ対応・ドキュメント・障害時の情報量の観点で枯れた安心感がある。Spring Security との親和性も高くJWT認証を簡潔に実装できる。

**PostgreSQL**
クエリプランナーの精度が高く、インデックス活用の賢さがMySQLより優れている印象。将来的に位置情報検索（PostGIS）への拡張も視野に入れている。

---

## アーキテクチャ

```
[ブラウザ / スマホ (PWA)]
        ↕ HTTPS / REST API
[Render Static Site]     [Render Web Service (Docker)]
  React SPA                Spring Boot API
                                  ↕ JDBC
                         [Render PostgreSQL]
```

認証フロー：ログイン → JWTトークン発行 → 以降のリクエストに `Authorization: Bearer <token>` を付与。セッションレス（STATELESS）。

---

## ディレクトリ構成

```
nakamap/
├── frontend/                         # React フロントエンド
│   ├── public/                       # 静的ファイル（PWAマニフェスト・アイコン等）
│   ├── src/
│   │   ├── api/                      # バックエンドAPIクライアント（axios）
│   │   ├── components/               # 再利用コンポーネント（マップ・パネル等）
│   │   ├── pages/                    # 画面単位のコンポーネント
│   │   ├── store/                    # グローバル状態管理（Zustand）
│   │   └── types/                    # 型定義
│   └── index.html
│
├── backend/                          # Spring Boot バックエンド
│   └── src/main/java/com/nakamap/backend/
│       ├── controller/               # REST エンドポイント（リクエスト受付）
│       ├── service/                  # ビジネスロジック
│       ├── domain/
│       │   ├── entity/               # JPA エンティティ（DBテーブルのマッピング）
│       │   └── repository/           # Spring Data リポジトリ（DB操作）
│       ├── dto/
│       │   ├── request/              # リクエストDTO（入力バリデーション含む）
│       │   └── response/             # レスポンスDTO
│       ├── security/                 # JWT認証フィルター・UserDetailsService
│       ├── config/                   # Security・CORS設定
│       └── exception/                # 例外定義・グローバルハンドラー
│   └── src/main/resources/
│       ├── application.yaml          # DB接続・JWT等の設定
│       └── db/migration/             # Flywayマイグレーションスクリプト
│
├── infra/
│   └── docker-compose.yml            # ローカル開発環境（DB + バックエンド + フロントエンド）
├── docker-compose.yml                # DBのみのシンプル起動用
├── start.sh                          # ローカル開発一括起動スクリプト
└── stop.sh                           # ローカル開発一括停止スクリプト
```

---

## DBスキーマ

```
users          サービス共通のユーザー情報（メール・パスワードハッシュ・アイコン）
circles        サークル（名前・招待コード）
memberships    users ↔ circles の中間テーブル（role: admin / member）
profiles       サークルごとのプロフィール（趣味・コメント）
locations      サークルごとの居住地（緯度・経度）
```

`profiles` と `locations` はサークルスコープ。同一ユーザーが複数サークルに参加した場合、それぞれ独立したプロフィール・位置情報を持つ。

---

## ローカル開発環境

```bash
# DB起動
cd infra && docker compose up -d

# バックエンド
cd backend && ./mvnw spring-boot:run

# フロントエンド
cd frontend && npm install && npm run dev
```

`backend/src/main/resources/application.yaml.example` をコピーして `application.yaml` を作成し、DB接続情報を設定する。

---

## API エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|----------|------|------|------|
| POST | `/auth/register` | ユーザー登録 | 不要 |
| POST | `/auth/login` | ログイン・JWT発行 | 不要 |
| GET | `/circles` | 自分のサークル一覧 | 必要 |
| POST | `/circles` | サークル作成 | 必要 |
| POST | `/circles/join` | サークル参加 | 必要 |
| GET | `/circles/:id` | サークル詳細 | 必要 |
| PATCH | `/circles/:id` | サークル名変更（admin） | 必要 |
| DELETE | `/circles/:id` | サークル削除（admin） | 必要 |
| GET | `/circles/:id/locations` | メンバー位置一覧 | 必要 |
| GET | `/circles/:id/locations/me` | 自分の位置取得 | 必要 |
| POST | `/circles/:id/locations` | 位置登録 | 必要 |
| PUT | `/circles/:id/locations/me` | 位置更新 | 必要 |
| GET | `/circles/:id/profiles/:userId` | プロフィール取得 | 必要 |
| POST | `/circles/:id/profiles` | プロフィール登録 | 必要 |
| PUT | `/circles/:id/profiles` | プロフィール更新 | 必要 |
