#!/bin/bash

echo "🚀 Starting Production Server..."

cd /Users/leokim/PPJT/pesticide-monitor/pesticide_project

# 기존 production 서버가 있다면 종료
pkill -f "runserver 0.0.0.0:8000"

# Production 서버 백그라운드 실행
nohup /Users/leokim/PPJT/pesticide-monitor/pesticide_venv/bin/python manage.py runserver 0.0.0.0:8000 --settings=config.settings.production > production.log 2>&1 &

sleep 2

echo "✅ Production Server started on 0.0.0.0:8000"
echo "📝 Logs: /Users/leokim/PPJT/pesticide-monitor/pesticide_project/production.log"
echo "🌐 Access: https://findpest.kr or http://localhost:8000"

# 프로세스 ID 표시
ps aux | grep "runserver 0.0.0.0:8000" | grep -v grep | awk '{print "📍 PID: " $2}'