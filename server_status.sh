#!/bin/bash

echo "=== Django 서버 상태 확인 ==="
echo ""

echo "🔍 실행 중인 Django 서버들:"
ps aux | grep "manage.py runserver" | grep -v grep | while read line; do
    echo "  $line"
done

echo ""
echo "🌐 포트 사용 상태:"
lsof -i :8000 2>/dev/null | head -2 || echo "  Port 8000: 사용되지 않음"
lsof -i :8001 2>/dev/null | head -2 || echo "  Port 8001: 사용되지 않음"

echo ""
echo "📡 접속 테스트:"
echo "  Production (8000): curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/"
echo "  Development (8001): curl -s -o /dev/null -w '%{http_code}' http://localhost:8001/"

echo ""
echo "🔗 접속 URL:"
echo "  Production:  https://findpest.kr (외부 접속)"
echo "  Production:  http://localhost:8000 (로컬 접속)"
echo "  Development: http://localhost:8001 (로컬 전용)"