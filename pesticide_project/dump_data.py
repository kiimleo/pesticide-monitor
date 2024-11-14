# 로컬 DB에 저장된 DB를 Django 라이브 DB로 옮기기 위한 코드
# Windows에서의 인코딩 문제를 해결하기 위해 다른 접근 방법을 시도해보겠습니다.
# Python 스크립트를 만들어서 데이터를 직접 추출하고 저장

import os
import django
import json

# Django 설정 로드
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from api.models import PesticideLimit, LimitConditionCode

# PesticideLimit 데이터 추출
pesticide_data = []
for item in PesticideLimit.objects.all():
    pesticide_data.append({
        'model': 'api.pesticidelimit',
        'pk': item.id,
        'fields': {
            'pesticide_name_kr': item.pesticide_name_kr,
            'pesticide_name_en': item.pesticide_name_en,
            'food_name': item.food_name,
            'max_residue_limit': str(item.max_residue_limit),
            'condition_code': item.condition_code.code if item.condition_code else None,
            'created_at': item.created_at.isoformat()
        }
    })

# LimitConditionCode 데이터 추출
condition_data = []
for item in LimitConditionCode.objects.all():
    condition_data.append({
        'model': 'api.limitconditioncode',
        'fields': {
            'code': item.code,
            'description': item.description,
            'created_at': item.created_at.isoformat()
        }
    })

# 데이터 저장
with open('pesticide_limits.json', 'w', encoding='utf-8') as f:
    json.dump(pesticide_data, f, ensure_ascii=False, indent=2)

with open('condition_codes.json', 'w', encoding='utf-8') as f:
    json.dump(condition_data, f, ensure_ascii=False, indent=2)

print("Data dump completed!")