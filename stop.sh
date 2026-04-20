#!/bin/bash

echo "🛑 なかまっぷ を停止します..."

# フロントエンド・バックエンドを停止
pkill -f "spring-boot:run" 2>/dev/null && echo "✅ バックエンド停止"
pkill -f "vite" 2>/dev/null && echo "✅ フロントエンド停止"

# PostgreSQL停止
docker-compose -f "$(cd "$(dirname "$0")" && pwd)/docker-compose.yml" stop postgres 2>/dev/null && echo "✅ PostgreSQL停止"

echo "完了しました。"
