# api/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import SearchLog
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=SearchLog)
def notify_external_search(sender, instance, created, **kwargs):
    """
    외부 사용자(127.0.0.1이 아닌 IP)가 검색할 때 이메일 알림 전송
    """
    if created and instance.ip_address and instance.ip_address != '127.0.0.1':
        try:
            # 이메일 제목
            subject = f'[FindPest] 외부 사용자 검색 알림 - {instance.search_term}'
            
            # 이메일 내용
            message = f"""
외부 사용자가 FindPest에서 검색을 수행했습니다.

=== 검색 정보 ===
검색어: {instance.search_term}
농약명: {instance.pesticide_term or 'N/A'}
식품명: {instance.food_term or 'N/A'}
결과 수: {instance.results_count}개
검색 시간: {instance.timestamp.strftime('%Y-%m-%d %H:%M:%S')}

=== 사용자 정보 ===
IP 주소: {instance.ip_address}
User Agent: {instance.user_agent or 'N/A'}

=== 링크 ===
관리자 페이지: https://findpest.kr/api/admin/api/searchlog/
검색 로그 상세: https://findpest.kr/api/admin/api/searchlog/{instance.id}/change/

---
FindPest 모니터링 시스템
            """.strip()
            
            # 이메일 전송
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['kingleo.kim@gmail.com'],
                fail_silently=False,
            )
            
            logger.info(f"External search notification sent for IP: {instance.ip_address}, Search: {instance.search_term}")
            
        except Exception as e:
            logger.error(f"Failed to send external search notification: {str(e)}")