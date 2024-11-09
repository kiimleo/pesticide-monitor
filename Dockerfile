# 베이스 이미지로 Python 3.7.6 사용
FROM python:3.7.6-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 종속성 파일만 먼저 복사하여 캐시 활용
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# 나머지 프로젝트 파일 복사
COPY . .

ENV PORT=8000
ENV PYTHONUNBUFFERED=1

CMD ["waitress-serve", "--port=$PORT", "--call=pesticide_project.pesticide_project.wsgi:application"]