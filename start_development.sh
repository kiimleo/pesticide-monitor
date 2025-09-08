#!/bin/bash

echo "🔧 Starting Development Server..."

cd /Users/leokim/PPJT/pesticide-monitor/pesticide_project

# 기존 development 서버가 있다면 종료
pkill -f "runserver 127.0.0.1:8001"

echo "🚀 Starting Development Server on http://127.0.0.1:8001"
echo "⚠️  Use Ctrl+C to stop this server"
echo "🔄 Auto-reload enabled for development"
echo ""

# Development 서버 실행 (포그라운드)
/Users/leokim/PPJT/pesticide-monitor/pesticide_venv/bin/python manage.py runserver 127.0.0.1:8001 --settings=config.settings.local