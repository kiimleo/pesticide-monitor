from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import PesticideLimit
import PyPDF2
import re
import logging
import os
import decimal
from datetime import datetime
from api.models import CertificateOfAnalysis, PesticideResult
from api.serializers import CertificateOfAnalysisSerializer, PesticideResultSerializer

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_certificate(request):
    """
    검정증명서 PDF 업로드 및 파싱 엔드포인트
    """
    if 'file' not in request.FILES:
        return Response({'error': '파일을 업로드해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    pdf_file = request.FILES['file']

    # 덮어쓰기 옵션 확인
    overwrite = request.data.get('overwrite', 'false').lower() == 'true'
    logger.info(f"덮어쓰기 옵션: {overwrite}")

    # PDF 파일 형식 검증
    if not pdf_file.name.endswith('.pdf'):
        return Response({'error': 'PDF 파일만 업로드 가능합니다.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # PDF 파싱
        parsing_result = parse_certificate_pdf(pdf_file)

        if not parsing_result:
            return Response({'error': 'PDF 파싱에 실패했습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 이미 존재하는 증명서인지 확인
        certificate_number = parsing_result.get('certificate_number')
        existing_certificate = CertificateOfAnalysis.objects.filter(certificate_number=certificate_number).first()

        if existing_certificate and not overwrite:
            # 덮어쓰기 옵션이 없으면 기존 증명서 반환
            logger.info(f"기존 증명서 반환: {certificate_number} (덮어쓰기 없음)")
            verification_result = list(existing_certificate.pesticide_results.all().values())
            return Response({
                'message': '이미 업로드된 검정증명서입니다.',
                'parsing_result': CertificateOfAnalysisSerializer(existing_certificate).data,
                'verification_result': verification_result,
                'saved_data': {
                    'certificate_id': existing_certificate.id,
                    'certificate_number': existing_certificate.certificate_number,
                    'sample_description': existing_certificate.sample_description,
                    'pesticide_count': existing_certificate.pesticide_results.count()
                }
            }, status=status.HTTP_200_OK)
        elif existing_certificate and overwrite:
            # 덮어쓰기 옵션이 있으면 기존 증명서 삭제
            logger.info(f"기존 증명서 삭제: {certificate_number} (덮어쓰기)")

            # 기존 파일 경로 가져오기
            old_file_path = existing_certificate.original_file.path if existing_certificate.original_file else None

            # 기존 증명서 및 관련된 농약 검출 결과 삭제
            existing_certificate.delete()

            # 파일 시스템에서 파일 삭제 (필요한 경우)
            if old_file_path and os.path.exists(old_file_path):
                try:
                    os.remove(old_file_path)
                    logger.info(f"기존 파일 삭제 성공: {old_file_path}")
                except Exception as e:
                    logger.warning(f"기존 파일 삭제 실패: {old_file_path}, 오류: {str(e)}")

        # 검증 수행
        verification_result = verify_pesticide_results(parsing_result)

        # just for debugging
        logger.info(f"파싱 결과의 pesticide_results 키 존재: {'pesticide_results' in parsing_result}")
        logger.info(f"파싱 결과의 pesticide_results 항목 수: {len(parsing_result.get('pesticide_results', []))}")

        # 검증 결과 로깅
        logger.info(
            f"{'새 증명서' if not existing_certificate or overwrite else '기존 증명서'} 검증 완료: {certificate_number}, 결과 수: {len(verification_result)}")
        logger.info(f"검증 결과 샘플: {verification_result[:1] if verification_result else '없음'}")

        # 결과 저장
        saved_data = save_certificate_data(parsing_result, verification_result, pdf_file)

        response_data = {
            'message': '검정증명서가 성공적으로 업로드되었습니다.',
            'parsing_result': parsing_result,
            'verification_result': verification_result,
            'saved_data': saved_data
        }

        # 디버깅을 위한 응답 구조 로깅
        logger.info(f"API 응답 구조: parsing_result 키 존재: {'parsing_result' in response_data}")
        logger.info(f"API 응답 구조: verification_result 키 존재: {'verification_result' in response_data}")
        logger.info(f"API 응답 구조: verification_result 항목 수: {len(verification_result)}")

        return Response(response_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"PDF 처리 중 오류 발생: {str(e)}")
        return Response({'error': f'PDF 처리 중 오류가 발생했습니다: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def parse_certificate_pdf(pdf_file):
    """
    검정증명서 PDF 파일에서 정보 파싱
    """
    try:
        # PDF 텍스트 추출
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()

        # 기본 정보 추출
        certificate_number = extract_certificate_number(text)
        applicant_info = extract_applicant_info(text)
        test_info = extract_test_info(text)
        pesticide_results = extract_pesticide_results(text)

        logger.info(f"추출된 pesticide_results: {pesticide_results}")

        result = {
            'certificate_number': certificate_number,
            'applicant_name': applicant_info.get('name'),
            'applicant_id_number': applicant_info.get('id_number'),
            'applicant_address': applicant_info.get('address'),
            'applicant_tel': applicant_info.get('tel'),
            'analytical_purpose': test_info.get('analytical_purpose'),
            'sample_description': test_info.get('sample_description'),
            'producer_info': test_info.get('producer_info'),
            'analyzed_items': test_info.get('analyzed_items'),
            'sample_quantity': test_info.get('sample_quantity'),
            'test_start_date': test_info.get('test_start_date'),  # 직접 test_info에서 가져옴
            'test_end_date': test_info.get('test_end_date'),  # 직접 test_info에서 가져옴
            'analytical_method': test_info.get('analytical_method'),
            'pesticide_results': pesticide_results
        }

        return result

    except Exception as e:
        logger.error(f"PDF 파싱 중 오류 발생: {str(e)}")
        return None


def extract_certificate_number(text):
    """
    텍스트에서 증명서 번호 추출
    """
    pattern = r'제\s+(\d{4}-\d{5})\s+호'
    match = re.search(pattern, text)
    if match:
        return match.group(1)
    return None


def extract_applicant_info(text):
    """
    텍스트에서 신청인 정보 추출 - 개선 버전
    """
    name_pattern = r'성명\(법인의 경우에는 명칭\):\s*([^\n]+)'
    alt_name_pattern = r'성명\(법인의\s+경우에는\s+명칭\):\s*([^\n]+)'
    id_pattern = r'법인등록번호:\s*([^\n]+)'
    address_pattern = r'주소\(Address\):\s*([^\n]+)'
    tel_pattern = r'전화번호[^:]*:\s*([^\n]+)'

    info = {}

    name_match = re.search(name_pattern, text, re.DOTALL)
    if not name_match:
        name_match = re.search(alt_name_pattern, text, re.DOTALL)

    if name_match:
        info['name'] = name_match.group(1).strip()
    else:
        # 테이블 기반 추출 시도
        table_match = re.search(r'성명\(법인의\s+경우에는\s+명칭\)[^:]*:\s*([^\n\r]+)', text)
        if table_match:
            info['name'] = table_match.group(1).strip()

    id_match = re.search(id_pattern, text)
    if id_match:
        info['id_number'] = id_match.group(1).strip()
    else:
        info['id_number'] = "미상"  # 기본값 제공

    address_match = re.search(address_pattern, text)
    if address_match:
        info['address'] = address_match.group(1).strip()

    tel_match = re.search(tel_pattern, text)
    if tel_match:
        info['tel'] = tel_match.group(1).strip()
    else:
        info['tel'] = "미제공"  # 기본값 설정

    return info


def extract_test_info(text):
    """
    검정증명서 PDF에서 추출한 텍스트에서 필요한 정보를 추출 - 개선된 버전
    """
    logger.info(f"텍스트 추출 시작: 길이 {len(text)} 글자")

    # 정확한 패턴 정의 (새로운 양식에 맞춰 업데이트)
    patterns = {
        'certificate_number': r'제\s+(\d{4}-\d{5})\s+호|제\s+(\d{4}-\d{5})|Certificate\s+Number[:：]?\s*(\d{4}-\d{5})',
        'analytical_purpose': r'검정\s*목적[^가-힣\s]*\s*[:：]?\s*([^\n\r]+)|Analytical\s+Purpose[^A-Za-z\s]*\s*[:：]?\s*([^\n\r]+)',
        'sample_description': r'검정\s*품목[^가-힣\s]*\s*[:：]?\s*([^\n\r]+)|Sample\s+Description[^A-Za-z\s]*\s*[:：]?\s*([^\n\r]+)',
        'producer_info': r'성명/수거지\s*[:：]?\s*([^\n\r]+)',
        'analyzed_items': r'검정\s*항목[^가-힣\s]*\s*[:：]?\s*([^\n\r]+)|Analyzed\s+Items[^A-Za-z\s]*\s*[:：]?\s*([^\n\r]+)',
        'sample_quantity': r'시료\s+점수\s+및\s+중량[^가-힣\s]*\s*[:：]?\s*([^\n\r]+)|Quantity\s+of\s+Samples[^A-Za-z\s]*\s*[:：]?\s*([^\n\r]+)',
        'test_period': r'검정\s*기간[^가-힣\s]*\s*[:：]?\s*([^\n\r]+)|Date\s+of\s+Test[^A-Za-z\s]*\s*[:：]?\s*([^\n\r]+)',
        'analytical_method': r'검정\s*방법[^가-힣\s]*\s*[:：]?\s*([^\n\r]+)|Analytical\s+Method\s+used[^A-Za-z\s]*\s*[:：]?\s*([^\n\r]+)'
    }

    results = {}

    # 각 필드의 정규식 패턴으로 정보 추출
    for field, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            # 첫 번째 매칭 그룹이 없으면 두 번째 그룹 사용 (영문/한글 대응)
            value = next((g for g in match.groups() if g), None)
            if value:
                # 괄호로 둘러싸인 레이블 제거 (예: "(Sample Description)모과" -> "모과")
                cleaned_value = re.sub(r'\([^)]*\)', '', value).strip()
                results[field] = cleaned_value
                logger.info(f"'{field}' 추출 성공: {results[field]}")
            else:
                logger.warning(f"'{field}' 패턴은 매칭됐지만 값이 없음")
        else:
            logger.warning(f"'{field}' 패턴 매칭 실패")

    # 검정 기간에서 시작일/종료일 분리
    if 'test_period' in results:
        # 기존 형식(YYYY.MM.DD. ~ YYYY.MM.DD.)
        dates_match = re.search(r'(\d{4}\.\d{2}\.\d{2}\.?)\s*~\s*(\d{4}\.\d{2}\.\d{2}\.?)', results['test_period'])
        if dates_match:
            results['test_start_date'] = dates_match.group(1).replace('.', '-').rstrip('-')
            results['test_end_date'] = dates_match.group(2).replace('.', '-').rstrip('-')
            logger.info(f"검정 기간 분리: 시작일={results['test_start_date']}, 종료일={results['test_end_date']}")
        else:
            # 새로운 형식(YYYY.MM.DD~YYYY.MM.DD) 처리
            dates_match = re.search(r'(\d{4}\.\d{2}\.\d{2})~(\d{4}\.\d{2}\.\d{2})', results['test_period'])
            if dates_match:
                results['test_start_date'] = dates_match.group(1).replace('.', '-')
                results['test_end_date'] = dates_match.group(2).replace('.', '-')
                logger.info(f"검정 기간 분리(새 형식): 시작일={results['test_start_date']}, 종료일={results['test_end_date']}")

    # 결과 매핑
    result = {
        'certificate_number': results.get('certificate_number'),
        'analytical_purpose': results.get('analytical_purpose'),
        'sample_description': results.get('sample_description'),
        'producer_info': results.get('producer_info'),
        'analyzed_items': results.get('analyzed_items'),
        'sample_quantity': results.get('sample_quantity'),
        'test_start_date': results.get('test_start_date'),
        'test_end_date': results.get('test_end_date'),
        'analytical_method': results.get('analytical_method')
    }

    # 결과 로깅
    for key, value in result.items():
        if value:
            logger.info(f"최종 '{key}': {value}")
        else:
            logger.warning(f"최종 '{key}': 값 없음")

    return result


def extract_pesticide_results(text):
    """
    텍스트에서 농약 검출 결과 추출 - 검정증명서 형식에 최적화 (개선된 버전)
    """
    logger.info("농약 검출 결과 추출 시작")

    # 결과 테이블 패턴 - 여러 형식에 대응
    table_patterns = [
        r'결과\s*검출량.*?잔류허용기준.*?\n(.*?)※',
        r'Results\s*검출량.*?MRL.*?\n(.*?)※',
        r'결과.*?\(Results\).*?검출량.*?잔류허용기준.*?\n(.*?)※',
        r'검정결과.*?\n.*?결과.*?검출량.*?잔류허용기준.*?\n(.*?)확인',
        r'결과\s*\(Results\).*?검출량\s*\(mg\/kg\).*?검토의견.*?\n(.*?)확인'
    ]

    results_text = None
    for pattern in table_patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            results_text = match.group(1).strip()
            logger.info(f"결과 테이블 매칭 성공: 길이 {len(results_text)} 글자")
            logger.info(f"결과 테이블 내용: {results_text}")
            break

    if not results_text:
        # 전체 텍스트에서 직접 농약 결과 행 패턴 검색
        logger.warning("결과 테이블 매칭 실패, 전체 텍스트에서 농약 결과 검색")

        # 농약 결과 행을 직접 찾는 패턴
        direct_row_pattern = r'([A-Za-z][\w-]+)\s+([\d.]+)\s+([^\n\r]*?)\s+([^\n\r]+?)$'
        results = []

        for line in text.split('\n'):
            # 각 줄마다 농약 검출 결과 패턴 검색
            match = re.search(direct_row_pattern, line.strip())
            if match and re.match(r'[A-Za-z]', match.group(1)):  # 첫 글자가 영문인지 확인
                try:
                    pesticide_name = match.group(1).strip()
                    detection_value = match.group(2).strip()

                    # MRL 값과 검토의견 추출 시도
                    rest_of_line = match.group(3).strip() + " " + match.group(4).strip()

                    # MRL 값 찾기
                    mrl_match = re.search(r'([\d.]+)', rest_of_line)
                    korea_mrl = mrl_match.group(1) if mrl_match else None
                    korea_mrl_text = korea_mrl if korea_mrl else "-"

                    # 검토의견 찾기 (일반적으로 '적합' 또는 '-' 등)
                    opinion_match = re.search(r'(적합|부적합|-)', rest_of_line)
                    result_opinion = opinion_match.group(1) if opinion_match else "-"

                    logger.info(
                        f"농약 결과 발견: {pesticide_name}, 검출량: {detection_value}, MRL 값: {korea_mrl}, 검토의견: {result_opinion}")

                    results.append({
                        'pesticide_name': pesticide_name,
                        'detection_value': detection_value,
                        'korea_mrl': korea_mrl,
                        'korea_mrl_text': korea_mrl_text,
                        'export_country': None,
                        'export_mrl': None,
                        'result_opinion': result_opinion
                    })
                except Exception as e:
                    logger.error(f"행 직접 파싱 중 오류: {str(e)}, 행: {line}")

        logger.info(f"직접 검색으로 추출된 농약 결과 수: {len(results)}")
        return results

    # 기존 형식에 맞는 행 패턴
    row_patterns = [
        # 기존 패턴 1: 농약명 검출량 MRL값 - 적합
        r'([A-Za-z][\w-]+)\s+([\d.]+)\s+([^\n\r-]+)\s+-\s+(\S+)',

        # 기존 패턴 2: 농약명 검출량 MRL값 검토의견
        r'([A-Za-z][\w-]+)\s+([\d.]+)\s+([^\n\r-]+)\s+(\S+)',

        # 새 패턴: 새로운 형식 (농약명 검출량 MRL값 - - -)
        r'([A-Za-z][\w-]+)\s+([\d.]+)\s+(-)\s+(-)\s+(-)'
    ]

    results = []
    found_match = False

    for pattern in row_patterns:
        matches = re.finditer(pattern, results_text, re.MULTILINE)
        for match in matches:
            try:
                pesticide_name = match.group(1).strip()
                detection_value = match.group(2).strip()

                # 패턴에 따라 다른 그룹에서 값을 추출
                if pattern == row_patterns[0]:  # 첫 번째 패턴: 농약명 검출량 MRL값 - 적합
                    korea_mrl_raw = match.group(3).strip()
                    result_opinion = match.group(4).strip()
                elif pattern == row_patterns[1]:  # 두 번째 패턴: 농약명 검출량 MRL값 검토의견
                    korea_mrl_raw = match.group(3).strip()
                    result_opinion = match.group(4).strip()
                else:  # 세 번째 패턴: 농약명 검출량 - - -
                    korea_mrl_raw = "-"
                    result_opinion = "-"

                # MRL 값에서 숫자만 추출 (계산용)
                mrl_value_match = re.search(r'([\d.]+)', korea_mrl_raw)
                korea_mrl_value = mrl_value_match.group(1) if mrl_value_match else None

                # 전체 MRL 텍스트 유지 (표시용)
                korea_mrl_text = korea_mrl_raw

                logger.info(
                    f"농약 결과 발견: {pesticide_name}, 검출량: {detection_value}, MRL 값: {korea_mrl_value}, MRL 전체: {korea_mrl_text}, 결과: {result_opinion}")

                results.append({
                    'pesticide_name': pesticide_name,
                    'detection_value': detection_value,
                    'korea_mrl': korea_mrl_value,
                    'korea_mrl_text': korea_mrl_text,
                    'export_country': None,
                    'export_mrl': None,
                    'result_opinion': result_opinion
                })
                found_match = True
            except Exception as e:
                logger.error(f"행 파싱 중 오류: {str(e)}, 행: {match.group(0) if match else 'None'}")

    # 어떤 패턴도 매칭되지 않았다면 직접 텍스트 분석 시도
    if not found_match:
        logger.warning("패턴 매칭 실패, 직접 텍스트 분석 시도")
        lines = results_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line or line.startswith('(') or not re.match(r'^[A-Za-z]', line):
                continue

            parts = re.split(r'\s+', line)
            if len(parts) >= 2 and re.match(r'^[A-Za-z]', parts[0]) and re.match(r'^[\d.]+$', parts[1]):
                try:
                    pesticide_name = parts[0]
                    detection_value = parts[1]

                    # 나머지 부분을 분석하여 MRL 값과 검토의견 추출 시도
                    rest_parts = parts[2:]
                    korea_mrl_value = next((p for p in rest_parts if re.match(r'^[\d.]+$', p)), None)
                    korea_mrl_text = korea_mrl_value if korea_mrl_value else "-"

                    # 검토의견 찾기 (일반적으로 '적합' 또는 '-' 등)
                    result_opinion = next((p for p in rest_parts if re.match(r'^(적합|부적합|-|해당없음)$', p)), "-")

                    logger.info(
                        f"직접 분석으로 농약 결과 발견: {pesticide_name}, 검출량: {detection_value}, MRL: {korea_mrl_value}, 검토의견: {result_opinion}")

                    results.append({
                        'pesticide_name': pesticide_name,
                        'detection_value': detection_value,
                        'korea_mrl': korea_mrl_value,
                        'korea_mrl_text': korea_mrl_text,
                        'export_country': None,
                        'export_mrl': None,
                        'result_opinion': result_opinion
                    })
                except Exception as e:
                    logger.error(f"직접 분석 중 오류: {str(e)}, 행: {line}")

    logger.info(f"추출된 농약 결과 수: {len(results)}")
    # 중복 제거를 위한 집합
    unique_pesticides = set()
    unique_results = []

    # 각 패턴 처리 후
    for result in results:
        # 농약성분명과 검출량으로 고유 식별자 생성
        pesticide_key = f"{result['pesticide_name']}_{result['detection_value']}"

        # 중복이 아닌 경우에만 추가
        if pesticide_key not in unique_pesticides:
            unique_pesticides.add(pesticide_key)
            unique_results.append(result)

    logger.info(f"중복 제거 후 농약 결과 수: {len(unique_results)}")
    return unique_results


def verify_pesticide_results(parsing_result):
    """
    파싱된 농약 검출 결과 검증 - 수정
    """

    if not parsing_result or 'pesticide_results' not in parsing_result:
        return []

    # 품목명 매핑 사전 - 검정증명서 품목명 -> DB 품목명
    FOOD_NAME_MAPPING = {
        '깻잎': '들깻잎',
        # 다른 매핑 추가 가능
    }

    # 친환경 검정인지 확인
    is_eco_friendly = False
    analytical_purpose = parsing_result.get('analytical_purpose', '')
    if analytical_purpose and '친환경' in analytical_purpose:
        is_eco_friendly = True
        logger.info(f"친환경 검정 감지: {analytical_purpose}")

    verification_results = []
    sample_description = parsing_result.get('sample_description', '')
    mapped_sample_description = FOOD_NAME_MAPPING.get(sample_description, sample_description)

    # 로그 추가
    if sample_description != mapped_sample_description:
        logger.info(f"품목명 매핑: '{sample_description}' → '{mapped_sample_description}'")

    # 로그 추가
    logger.info(f"검정 품목: {sample_description}")

    for result in parsing_result['pesticide_results']:
        pesticide_name = result['pesticide_name']
        detection_value = decimal.Decimal(result['detection_value'])

        # PDF에서 추출한 MRL 값
        pdf_korea_mrl = decimal.Decimal(result['korea_mrl']) if result['korea_mrl'] else None

        # 데이터베이스에서 정보 조회
        db_pesticide_info = None
        standard_pesticide_name = None
        db_korea_mrl = None
        pesticide_name_match = False

        try:
            # 1. 농약성분명으로 표준명 찾기
            pesticide_info = PesticideLimit.objects.filter(
                pesticide_name_en__iexact=pesticide_name
            ).first()

            if pesticide_info:
                standard_pesticide_name = pesticide_info.pesticide_name_en
                pesticide_name_match = pesticide_name.lower() == standard_pesticide_name.lower()
                logger.info(f"농약성분명 찾음: {pesticide_name} → {standard_pesticide_name}")

                # 2. 검정 품목을 기반으로 잔류허용기준 찾기
                if sample_description:
                    # 직접 매칭 시도
                    direct_match = PesticideLimit.objects.filter(
                        pesticide_name_en__iexact=standard_pesticide_name,
                        food_name__iexact = mapped_sample_description  # 매핑된 이름 사용
                    ).first()

                    # 기존 내부 API 호출 방식 부분을 제거하고 직접 API 호출 방식으로 변경
                    if direct_match:
                        db_korea_mrl = direct_match.max_residue_limit
                        # 여기에 db_korea_mrl_display 설정 코드 추가
                        formatted_value = f"{db_korea_mrl:.1f}"
                        db_korea_mrl_display = formatted_value
                        logger.info(f"직접 매칭 성공: {standard_pesticide_name} + {sample_description} → {db_korea_mrl}")
                    # 직접 매칭이 없는 경우에만 API를 호출하여 값을 가져옴
                    if not direct_match:
                        try:
                            # 현재 서버의 API 엔드포인트를 호출
                            import requests
                            from django.conf import settings

                            # 서버 주소와 포트 설정
                            host = 'localhost'
                            port = '8000'  # Django 서버 포트

                            # API 엔드포인트 URL 구성
                            api_url = f"http://{host}:{port}/api/pesticides/?pesticide={standard_pesticide_name}&food={mapped_sample_description}"  # 매핑된 이름 사용

                            # API 호출
                            response = requests.get(api_url)

                            if response.status_code == 200:
                                data = response.json()
                                if data and len(data) > 0:
                                    # API 응답에서 값 추출
                                    db_korea_mrl = decimal.Decimal(data[0].get('max_residue_limit', 0))
                                    db_korea_mrl_text = data[0].get('food_name', '')

                                    # 조건 코드 정보 추출 (T 등 특수 기호)
                                    condition_code = data[0].get('condition_code_symbol', '')
                                    condition_desc = data[0].get('condition_code_description', '')

                                    # 완전한 형식의 허용기준 텍스트 구성
                                    if condition_code:
                                        formatted_value = f"{db_korea_mrl:.1f}"
                                        db_korea_mrl_display = f"{db_korea_mrl}{condition_code}"
                                    else:
                                        formatted_value = f"{db_korea_mrl:.1f}"
                                        db_korea_mrl_display = f"{db_korea_mrl}"

                                    logger.info(
                                        f"API 호출 성공: {standard_pesticide_name} + {sample_description} → {db_korea_mrl_display}")
                                else:
                                    # 결과가 없으면 PDF에서 추출한 값을 사용 (수정된 부분)
                                    if pdf_korea_mrl is not None:
                                        db_korea_mrl = pdf_korea_mrl
                                        db_korea_mrl_display = result.get('korea_mrl_text', '')
                                        logger.info(f"API 결과 없음: PDF 값 사용 - {db_korea_mrl_display}")
                                    else:
                                        # PDF에도 없는 경우 PLS 기본값 사용
                                        db_korea_mrl = decimal.Decimal('0.01')
                                        db_korea_mrl_display = "PLS 0.01"
                                        logger.info(f"API 결과 없음, PDF 값도 없음: PLS 적용")
                            else:
                                # API 호출 실패 시 PDF 값 사용
                                if pdf_korea_mrl is not None:
                                    db_korea_mrl = pdf_korea_mrl
                                    db_korea_mrl_display = result.get('korea_mrl_text', '')
                                    logger.info(f"API 호출 실패: PDF 값 사용 - {db_korea_mrl_display}")
                                else:
                                    logger.error(f"API 호출 실패({response.status_code}), PDF 값도 없음")
                        except Exception as api_error:
                            # 예외 발생 시 PDF 값 사용
                            if pdf_korea_mrl is not None:
                                db_korea_mrl = pdf_korea_mrl
                                db_korea_mrl_display = result.get('korea_mrl_text', '')
                                logger.error(f"API 호출 오류({str(api_error)}): PDF 값 사용 - {db_korea_mrl_display}")
                            else:
                                logger.error(f"API 호출 오류({str(api_error)}), PDF 값도 없음")
            else:
                # 유사한 이름 검색 (첫 4글자로 유사 검색)
                similar_pesticides = PesticideLimit.objects.filter(
                    pesticide_name_en__icontains=pesticide_name[:4]
                ).values('pesticide_name_en', 'pesticide_name_kr').distinct()

                if similar_pesticides.exists():
                    standard_pesticide_name = similar_pesticides.first()['pesticide_name_en']
                    pesticide_name_match = pesticide_name.lower() == standard_pesticide_name.lower()
                    logger.info(f"유사 농약성분명: {pesticide_name} → {standard_pesticide_name}")

                    # 유사한 농약성분에 대한 MRL 값 조회
                    if sample_description:
                        similar_limit = PesticideLimit.objects.filter(
                            pesticide_name_en__iexact=standard_pesticide_name,
                            food_name__icontains=sample_description
                        ).first()

                        if similar_limit:
                            db_korea_mrl = similar_limit.max_residue_limit
                            logger.info(f"유사 농약 MRL 값: {db_korea_mrl}")
                        elif pdf_korea_mrl is not None:
                            # 유사 매칭 실패 시 PDF에서 추출한 값 사용
                            db_korea_mrl = pdf_korea_mrl
                            logger.info(f"유사 농약 매칭 실패, PDF 값 사용: {pdf_korea_mrl}")
                else:
                    standard_pesticide_name = pesticide_name
                    pesticide_name_match = False

                    # 매칭 실패 시 PDF에서 추출한 값 사용
                    if pdf_korea_mrl is not None:
                        db_korea_mrl = pdf_korea_mrl
                        logger.info(f"매칭 실패, PDF 값 사용: {pdf_korea_mrl}")
        except Exception as e:
            logger.error(f"검증 중 DB 조회 오류: {str(e)}")
            standard_pesticide_name = pesticide_name
            pesticide_name_match = False

            # 오류 발생 시에도 PDF 값 사용
            if pdf_korea_mrl is not None:
                db_korea_mrl = pdf_korea_mrl
                logger.info(f"오류 발생, PDF 값 사용: {pdf_korea_mrl}")

        # 친환경 검정인 경우 (친환경인증용)
        if is_eco_friendly:
            # 친환경 검정의 경우 검출량이 0.01 미만이어야 적합
            eco_friendly_threshold = decimal.Decimal('0.01')
            pdf_calculated_result = '적합' if detection_value < eco_friendly_threshold else '부적합'
            logger.info(
                f"친환경 기준 적용: 검출량 {detection_value} vs 기준 {eco_friendly_threshold}, 결과: {pdf_calculated_result}")
        else:
            # 일반 검정의 경우 MRL 값 사용
            # PDF MRL로 적합/부적합 계산
            pdf_calculated_result = '적합' if detection_value <= pdf_korea_mrl else '부적합'

        # DB MRL로 적합/부적합 계산
        if db_korea_mrl is not None:
            db_calculated_result = '적합' if detection_value <= db_korea_mrl else '부적합'
        else:
            # 최후의 수단으로 PDF에서 추출한 값 사용
            db_korea_mrl = pdf_korea_mrl
            db_calculated_result = pdf_calculated_result if pdf_korea_mrl is not None else '확인불가'

        # PDF의 검토의견과 계산된 결과 비교
        is_pdf_consistent = (pdf_calculated_result == result['result_opinion'])

        verification_results.append({
            'pesticide_name': pesticide_name,
            'standard_pesticide_name': standard_pesticide_name,
            'pesticide_name_match': pesticide_name_match,
            'detection_value': detection_value,
            'pdf_korea_mrl': pdf_korea_mrl,
            'pdf_korea_mrl_text': result.get('korea_mrl_text', ''),
            'db_korea_mrl': db_korea_mrl,
            'db_korea_mrl_display': db_korea_mrl_display if 'db_korea_mrl_display' in locals() else '',  # 표시용 문자열
            'export_country': result.get('export_country'),
            'export_mrl': result.get('export_mrl'),
            'pdf_result': result['result_opinion'],
            'pdf_calculated_result': pdf_calculated_result,
            'db_calculated_result': db_calculated_result,
            'is_pdf_consistent': is_pdf_consistent,
            'is_eco_friendly': is_eco_friendly,  # 친환경 여부 추가
        })

    return verification_results


def save_certificate_data(parsing_result, verification_result, pdf_file):
    """
    파싱 및 검증 결과를 데이터베이스에 저장
    """
    try:
        # 파일 정보 로깅 추가
        logger.info(f"Saving file: {pdf_file.name}, Size: {pdf_file.size} bytes")

        # 저장 전 파일 경로 확인
        from django.conf import settings
        import os
        expected_path = os.path.join(settings.MEDIA_ROOT, 'certificates', os.path.basename(pdf_file.name))
        logger.info(f"Expected file path: {expected_path}")

        # 검정증명서 정보 저장
        certificate = CertificateOfAnalysis(
            certificate_number=parsing_result.get('certificate_number', '미상'),
            applicant_name=parsing_result.get('applicant_name', '미상'),
            applicant_id_number=parsing_result.get('applicant_id_number', '미상'),
            applicant_address=parsing_result.get('applicant_address', '미상'),
            applicant_tel=parsing_result.get('applicant_tel', '미상'),
            analytical_purpose=parsing_result.get('analytical_purpose', '미상'),
            sample_description=parsing_result.get('sample_description', '미상'),
            producer_info=parsing_result.get('producer_info', '미상'),
            analyzed_items=parsing_result.get('analyzed_items', '미상'),
            sample_quantity=parsing_result.get('sample_quantity', '미상'),
            test_start_date=parsing_result.get('test_start_date'),
            test_end_date=parsing_result.get('test_end_date'),
            analytical_method=parsing_result.get('analytical_method', '미상'),
            original_file=pdf_file
        )
        certificate.save()

        # 저장 후 파일 경로 확인
        actual_path = certificate.original_file.path
        logger.info(f"Actual saved file path: {actual_path}")
        logger.info(f"File exists: {os.path.exists(actual_path)}")

        # 농약 검출 결과 정보 저장
        for result in verification_result:
            pesticide_result = PesticideResult(
                certificate=certificate,
                pesticide_name=result['pesticide_name'],
                standard_pesticide_name=result['standard_pesticide_name'],
                pesticide_name_match=result['pesticide_name_match'],
                detection_value=result['detection_value'],
                pdf_korea_mrl=result['pdf_korea_mrl'],
                pdf_korea_mrl_text=result.get('pdf_korea_mrl_text', ''),
                db_korea_mrl=result['db_korea_mrl'],
                export_country=result['export_country'],
                export_mrl=result['export_mrl'],
                pdf_result=result['pdf_result'],
                pdf_calculated_result=result['pdf_calculated_result'],
                db_calculated_result=result['db_calculated_result'],
                is_pdf_consistent=result['is_pdf_consistent']
            )
            pesticide_result.save()

        return {
            'certificate_id': certificate.id,
            'certificate_number': certificate.certificate_number,
            'sample_description': certificate.sample_description,
            'pesticide_count': len(verification_result)
        }

    except Exception as e:
        logger.error(f"검정증명서 저장 중 오류 발생: {str(e)}")
        raise