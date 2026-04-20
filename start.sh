#!/bin/bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"

echo "🚀 なかまっぷ を起動します..."

# PostgreSQL
echo "📦 PostgreSQL を起動中..."
docker-compose -f "$ROOT/docker-compose.yml" up -d postgres

echo "⏳ PostgreSQL の起動を待っています..."
until docker exec nakamap_postgres_1 pg_isready -U nakamap -q 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL 起動完了"

# バックエンド
echo "☕ バックエンドを起動中..."
cd "$ROOT/backend"
nohup ./mvnw spring-boot:run > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "⏳ バックエンドの起動を待っています..."
until grep -q "Started BackendApplication" "$LOG_DIR/backend.log" 2>/dev/null; do
  sleep 2
done
echo "✅ バックエンド起動完了 (PID: $BACKEND_PID)"

# フロントエンド
echo "⚛️  フロントエンドを起動中..."
cd "$ROOT/frontend"
nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
sleep 3
echo "✅ フロントエンド起動完了 (PID: $FRONTEND_PID)"

echo ""
echo "=============================="
echo "🗺️  なかまっぷ 起動完了！"
echo "   👉 http://localhost:5173"
echo "=============================="
echo ""
echo "ログの確認:"
echo "  バックエンド: tail -f $LOG_DIR/backend.log"
echo "  フロントエンド: tail -f $LOG_DIR/frontend.log"
echo ""
echo "停止するには: ./stop.sh"
