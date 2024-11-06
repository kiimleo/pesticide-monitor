# Python 3.7 이미지를 베이스로 사용
FROM python:3.7

# 작업 디렉토리를 /app으로 설정
WORKDIR /app

# 현재 디렉토리의 모든 파일을 /app 디렉토리로 복사
COPY . /app

# 패키지 설치 (requirements.txt 파일에 정의된 라이브러리)
RUN pip install --no-cache-dir -r requirements.txt

# 포트 설정 (Railway가 사용하려는 환경 변수와 일치)
ENV PORT 8000

# 서버 실행 명령어 (waitress를 사용하여 WSGI 애플리케이션 실행)
CMD ["waitress-serve", "--port=${PORT}", "pesticide_project.wsgi:application"]
