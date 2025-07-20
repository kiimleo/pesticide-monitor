#!/bin/bash

# 에러 발생 시 스크립트 중단
set -e

# 백업 설정
BACKUP_DIR="$(dirname $(dirname $0))/backups"  # 프로젝트 루트의 backups 폴더
BACKUP_NAME="pesticide_db_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
LOG_FILE="$BACKUP_DIR/backup.log"

# 환경변수 설정 (Django의 .env.production 파일과 동일한 정보 사용)
export PGDATABASE="pesticide_db"
export PGUSER="postgres"  # 실제 DB 사용자명으로 변경
export PGPASSWORD="952151"  # 실제 DB 비밀번호로 변경
export PGHOST="localhost"
export PGPORT="5432"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# PostgreSQL 연결 테스트
echo "PostgreSQL 연결 테스트 중..." >> $LOG_FILE
if ! pg_isready -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE; then
    echo "ERROR: PostgreSQL 연결 실패 $(date)" >> $LOG_FILE
    exit 1
fi

# 백업 실행 (출력 경로 명시)
echo "백업 시작: $(date)" >> $LOG_FILE
if pg_dump -Fc -f "$BACKUP_PATH"; then
    # 백업 파일 크기 확인
    BACKUP_SIZE=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || echo "0")
    echo "백업 완료. 파일 크기: $BACKUP_SIZE bytes" >> $LOG_FILE
    
    # 최소 크기 확인 (1MB)
    if [ $BACKUP_SIZE -lt 1000000 ]; then
        echo "WARNING: 백업 파일 크기가 너무 작습니다: $BACKUP_SIZE bytes" >> $LOG_FILE
    fi
else
    echo "ERROR: 백업 실패 $(date)" >> $LOG_FILE
    exit 1
fi

# Google Drive에 백업 파일 업로드 (rclone이 설치된 경우만)
if command -v rclone >/dev/null 2>&1; then
    echo "Google Drive 업로드 시작..." >> $LOG_FILE
    if rclone copy "$BACKUP_PATH" gdrive:develop_findpest/pesticide_backups/; then
        echo "Google Drive 업로드 완료: $(date)" >> $LOG_FILE
    else
        echo "WARNING: Google Drive 업로드 실패: $(date)" >> $LOG_FILE
    fi
else
    echo "WARNING: rclone이 설치되지 않음. Google Drive 업로드 건너뜀" >> $LOG_FILE
fi

# 30일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "pesticide_db_*.sql" -mtime +30 -delete

# 로그 기록
echo "Backup completed: $(date)" >> $LOG_FILE

