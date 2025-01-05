# 로컬 DB에 저장된 DB를 Django 라이브 DB로 옮기기 위한 코드
# 잔류농약 스팩 csv를 수동으로 만든 후에 이 코드로 json으로 저장
# 같은 디렉토리에서 다음 명령어로 실행하면 잔류농약데이터에 대한 json이 생성됨: python convert_csv_to_json.py

import pandas as pd
import json
from datetime import datetime
import os
from django.utils import timezone

def convert_csv_to_json():
    # 현재 스크립트의 경로
    current_dir = os.path.dirname(__file__)

    # CSV 파일 경로
    csv_file = os.path.join(current_dir, '3차가공_pesticide_spec_20241114.csv')

    # dumped_data 디렉토리 경로
    dump_dir = os.path.join(current_dir, '..', 'dumped_data')

    # CSV 읽기
    df = pd.read_csv(csv_file)

    # condition_codes 관련 코드 주석 처리
    # condition_codes = []
    # unique_codes = df['condition_code'].dropna().unique()

    # for code in unique_codes:
    #     condition_codes.append({
    #         'model': 'api.limitconditioncode',
    #         'fields': {
    #             'code': code,
    #             'description': f'Condition {code}',
    #             'created_at': datetime.now().isoformat()
    #         }
    #     })

    # pesticide_limits 데이터 생성
    pesticide_limits = []
    error_rows = []  # 에러가 발생한 행 정보를 저장할 리스트

    for idx, row in df.iterrows():
        # max_residue_limit 값 검증
        try:
            max_residue = row['max_residue_limit']
            if pd.isna(max_residue) or str(max_residue) == '#VALUE!':
                error_info = {
                    'row_number': idx + 2,  # Excel 행 번호 (헤더 + 1 고려)
                    'pesticide_name_kr': row['농약명(한글)'],
                    'food_name': row['식품명'],
                    'max_residue_value': str(max_residue)
                }
                error_rows.append(error_info)
                raise ValueError(f"Invalid max_residue_limit value: {max_residue}")

            max_residue = str(float(max_residue))

            pesticide_limits.append({
                'model': 'api.pesticidelimit',
                'fields': {
                    'pesticide_name_kr': row['농약명(한글)'],
                    'pesticide_name_en': row['농약명(영어)'],
                    'food_name': row['식품명'],
                    'max_residue_limit': max_residue,
                    'condition_code': row['condition_code'] if pd.notna(row['condition_code']) else None,
                    'created_at': datetime.now(timezone.utc).isoformat()
                }
            })
        except (ValueError, TypeError) as e:
            continue

    # 에러 정보 출력
    if error_rows:
        print("\n=== 잔류허용기준 값 오류 발생 위치 ===")
        print("CSV 파일의 다음 행들을 확인해주세요:")
        for error in error_rows:
            print(f"\nExcel 행 번호: {error['row_number']}")
            print(f"농약명(한글): {error['pesticide_name_kr']}")
            print(f"식품명: {error['food_name']}")
            print(f"문제되는 값: {error['max_residue_value']}")

        print(f"\n총 {len(error_rows)}개의 오류가 발견되었습니다.")
        print("위의 오류들을 수정한 후 다시 실행해주세요.")
        return  # JSON 파일 생성하지 않고 종료

    # 오류가 없는 경우에만 JSON 파일 생성
    with open(os.path.join(dump_dir, 'pesticide_limits.json'), 'w', encoding='utf-8') as f:
        json.dump(pesticide_limits, f, ensure_ascii=False, indent=2)

    print("Pesticide limits data successfully converted to JSON!")


if __name__ == '__main__':
    convert_csv_to_json()
