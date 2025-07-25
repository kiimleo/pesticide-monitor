#!/bin/bash

echo "Starting deployment..."

# Git에서 최신 코드 가져오기
git pull origin production

# React 앱 빌드
echo "Building React app..."
cd frontend
npm install
npm run build

# Django 정적 파일 수집 (필요한 경우)
cd ../pesticide_project
python manage.py collectstatic --noinput

# 서버 재시작 (필요한 경우)
# sudo systemctl restart your-service

echo "Deployment completed!"