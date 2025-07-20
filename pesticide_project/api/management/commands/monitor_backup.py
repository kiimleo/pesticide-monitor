# path : api/management/commands/monitor_backup.py

from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import os
import subprocess
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Monitor database backup status'

    def handle(self, *args, **options):
        # 상대 경로 사용 (더 유연함)
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        google_drive_dir = "gdrive:pesticide_backups"
        min_size = 1000000  # 최소 1MB
        alerts = []

        try:
            # 디버깅용 로그 추가
            self.stdout.write("모니터링 시작...")

            # 1. 로컬 백업 확인
            if not os.path.exists(backup_dir):
                alerts.append(f"백업 디렉토리가 존재하지 않습니다: {backup_dir}")
                return

            files = [f for f in os.listdir(backup_dir) if f.endswith('.sql')]
            if not files:
                alerts.append("백업 파일이 존재하지 않습니다!")
            else:
                latest_backup = max(files, key=lambda x: os.path.getctime(os.path.join(backup_dir, x)))
                backup_path = os.path.join(backup_dir, latest_backup)

                # timezone 관련 수정 및 디버깅 로그
                current_time = timezone.now()
                naive_backup_time = datetime.fromtimestamp(os.path.getctime(backup_path))
                backup_time = timezone.make_aware(naive_backup_time, timezone.get_default_timezone())
                backup_time = backup_time.astimezone(timezone.utc)
                time_difference = current_time - backup_time

                self.stdout.write(f"현재 시간: {current_time}")
                self.stdout.write(f"백업 시간: {backup_time}")
                self.stdout.write(f"시간 차이: {time_difference}")

                if time_difference > timedelta(hours=24):
                    alerts.append(f"최근 백업이 너무 오래되었습니다. 마지막 백업: {backup_time}")

                # 파일 크기 체크
                file_size = os.path.getsize(backup_path)
                self.stdout.write(f"백업 파일 크기: {file_size} bytes")

                if file_size < min_size:
                    alerts.append(f"백업 파일 크기가 너무 작습니다: {file_size} bytes")

                # Google Drive 백업 확인 (rclone이 설치된 경우만)
                try:
                    # rclone 설치 여부 확인
                    rclone_check = subprocess.run(['which', 'rclone'], capture_output=True)
                    if rclone_check.returncode == 0:
                        self.stdout.write("Google Drive 백업 확인 중...")
                        result = subprocess.run(['rclone', 'ls', f"{google_drive_dir}/{latest_backup}"],
                                                capture_output=True, text=True)
                        self.stdout.write(f"rclone 결과: {result.returncode}")
                        if result.returncode != 0:
                            alerts.append(f"Google Drive에 최신 백업 파일이 없습니다: {latest_backup}")
                    else:
                        alerts.append("rclone이 설치되지 않아 Google Drive 백업을 확인할 수 없습니다")
                except Exception as e:
                    alerts.append(f"Google Drive 백업 확인 중 오류 발생: {str(e)}")

            # 디버깅용 로그 추가
            self.stdout.write(f"감지된 문제: {len(alerts)}개")

            # 알림 발송
            if alerts:
                alert_message = "\n".join(alerts)
                self.stdout.write(self.style.ERROR(alert_message))

                # 이메일 발송
                self.stdout.write("이메일 발송 시도...")
                send_mail(
                    subject='[findpest.kr] 백업 모니터링 알림',
                    message=f"다음과 같은 문제가 발생했습니다:\n\n{alert_message}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=['kingleo.kim@gmail.com'],
                    fail_silently=False,
                )
                self.stdout.write("이메일 발송 완료")

        except Exception as e:
            error_message = f"모니터링 중 오류 발생: {str(e)}"
            self.stdout.write(self.style.ERROR(error_message))

            send_mail(
                subject='[findpest.kr] 백업 모니터링 오류',
                message=error_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['kingleo.kim@gmail.com'],
                fail_silently=False,
            )