#!/usr/bin/env bash
set -o errexit  # 오류 발생 시 스크립트 종료

pip install -r requirements.txt
python pesticide_project/manage.py collectstatic --no-input
python pesticide_project/manage.py migrate
