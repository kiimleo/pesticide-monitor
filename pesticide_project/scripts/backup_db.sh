#!/bin/bash

# 백업 설정
BACKUP_DIR="$(dirname $(dirname $0))/backups"  # 프로젝트 루트의 backups 폴더
BACKUP_NAME="pesticide_db_$(date +%Y%m%d_%H%M%S).sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# 환경변수 설정 (Django의 .env 파일과 동일한 정보 사용)
export PGDATABASE="pesticide_db"
export PGUSER="postgres"  # 실제 DB 사용자명으로 변경
export PGPASSWORD="952151"  # 실제 DB 비밀번호로 변경
export PGHOST="localhost"
export PGPORT="5432"

# 백업 디렉토리 생성
mkdir -p $BACKUP_DIR

# 백업 실행
pg_dump -Fc > "$BACKUP_DIR/$BACKUP_NAME"

# Google Drive에 백업 파일 업로드
rclone copy "$BACKUP_DIR/$BACKUP_NAME" gdrive:pesticide_backups/

# 30일 이상 된 백업 파일 삭제
find $BACKUP_DIR -name "pesticide_db_*.sql" -mtime +30 -delete

# 로그 기록
echo "Backup completed and uploaded to Google Drive: $(date)" >> $LOG_FILE

