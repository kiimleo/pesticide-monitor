import os
import django
import json

# Django 설정 로드
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from api.models import PesticideLimit, LimitConditionCode

# 모델 필드 출력
print("PesticideLimit fields:", [field.name for field in PesticideLimit._meta.fields])
print("\nLimitConditionCode fields:", [field.name for field in LimitConditionCode._meta.fields])

# 샘플 데이터 출력
sample_limit = LimitConditionCode.objects.first()
if sample_limit:
    print("\nSample LimitConditionCode data fields:")
    for field in LimitConditionCode._meta.fields:
        print(f"{field.name}: {getattr(sample_limit, field.name)}")