# 정부 공공데이터 api를 통해 정부의 농약상세 DB를 Django 커스텀 커맨드를 만들어 나의 데이터베이스와 동기화를 수행하는 코드
# command : python manage.py sync_publicApi_pesticide_detail

from django.core.management.base import BaseCommand
from api.models import PesticideDetail
import requests
import os
from datetime import datetime


class Command(BaseCommand):
    help = '식품안전나라 농약 등록정보 데이터를 동기화합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            default='20170101',
            help='동기화 기준일자 (YYYYMMDD 형식, 기본값: 20170101)'
        )

    def handle(self, *args, **options):
        start_time = datetime.now()
        self.stdout.write(self.style.SUCCESS(f'데이터 동기화를 시작합니다... ({start_time})'))

        api_key = os.getenv('PESTICIDE_API_KEY')
        service_id = 'I1910'
        chng_dt = options['date']

        # 초기 데이터 확인을 위한 API 호출
        url = f'http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/json/1/1/CHNG_DT={chng_dt}'
        self.stdout.write(f'초기 요청 URL: {url}')

        try:
            response = requests.get(url)
            data = response.json()

            if 'I1910' not in data or 'total_count' not in data['I1910']:
                self.stdout.write(self.style.ERROR('API 응답 형식이 올바르지 않습니다.'))
                return

            if 'I1910' in data and 'total_count' in data['I1910']:
                total_count = int(data['I1910']['total_count'])
                self.stdout.write(self.style.SUCCESS(f'총 {total_count:,}개의 데이터를 동기화합니다.'))
            else:
                self.stdout.write(self.style.ERROR('total_count를 찾을 수 없습니다.'))

            # 기존 데이터 삭제
            deleted_count = PesticideDetail.objects.all().delete()[0]
            self.stdout.write(f'기존 데이터 {deleted_count:,}개가 삭제되었습니다.')

            # 1000건씩 데이터 수집
            success_count = 0
            error_count = 0

            for start in range(1, total_count + 1, 1000):
                end = min(start + 999, total_count)
                url = f'http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/json/{start}/{end}/CHNG_DT={chng_dt}'

                try:
                    response = requests.get(url)
                    chunk_data = response.json()

                    if 'I1910' not in chunk_data or 'row' not in chunk_data['I1910']:
                        raise ValueError('잘못된 응답 형식')

                    rows = chunk_data['I1910']['row']

                    # 벌크 생성용 객체 리스트
                    objects = [
                        PesticideDetail(
                            reg_yn_nm=row['REG_YN_NM'],
                            use_pprtm=row['USE_PPRTM'],
                            prdlst_reg_no=row['PRDLST_REG_NO'],
                            prdlst_reg_dt=row['PRDLST_REG_DT'],
                            prdlst_reg_vald_dt=row['PRDLST_REG_VALD_DT'],
                            mnf_incm_dvs_nm=row['MNF_INCM_DVS_NM'],
                            persn_lvstck_toxcty=row['PERSN_LVSTCK_TOXCTY'],
                            use_tmno=row['USE_TMNO'],
                            cpr_nm=row['CPR_NM'],
                            prdlst_kor_nm=row['PRDLST_KOR_NM'],
                            prdlst_eng_nm=row['PRDLST_ENG_NM'],
                            mdc_shap_nm=row['MDC_SHAP_NM'],
                            sickns_hlsct_nm_weeds_nm=row['SICKNS_HLSCT_NM_WEEDS_NM'],
                            brnd_nm=row['BRND_NM'],
                            crops_nm=row['CROPS_NM'],
                            prpos_dvs_cd_nm=row['PRPOS_DVS_CD_NM'],
                            dilu_drng=row['DILU_DRNG'],
                            eclgy_toxcty=row['ECLGY_TOXCTY']
                        ) for row in rows
                    ]

                    PesticideDetail.objects.bulk_create(objects)
                    success_count += len(objects)
                    self.stdout.write(self.style.SUCCESS(
                        f'처리완료: {start:,}~{end:,} ({success_count:,}/{total_count:,})'
                    ))

                except Exception as e:
                    error_count += 1
                    self.stdout.write(self.style.ERROR(
                        f'Error processing {start:,}~{end:,}: {str(e)}'
                    ))

            end_time = datetime.now()
            duration = end_time - start_time

            self.stdout.write(self.style.SUCCESS(
                f'\n동기화 완료!\n'
                f'시작 시간: {start_time}\n'
                f'종료 시간: {end_time}\n'
                f'소요 시간: {duration}\n'
                f'성공: {success_count:,}개\n'
                f'실패 청크: {error_count}개'
            ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'초기화 중 오류 발생: {str(e)}'))