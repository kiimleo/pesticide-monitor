from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
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

    # PDF 파일 형식 검증
    if not pdf_file.name.endswith('.pdf'):
        return Response({'error': 'PDF 파일만 업로드 가능합니다.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # PDF 파싱
        parsing_result = parse_certificate_pdf(pdf_file)

        if not parsing_result:
            return Response({'error': 'PDF 파싱에 실패했습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 검증 수행
        verification_result = verify_pesticide_results(parsing_result)

        # 결과 저장
        saved_data = save_certificate_data(parsing_result, verification_result, pdf_file)

        return Response({
            'message': '검정증명서가 성공적으로 업로드되었습니다.',
            'parsing_result': parsing_result,
            'verification_result': verification_result,
            'saved_data': saved_data
        }, status=status.HTTP_201_CREATED)

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
        test_dates = extract_test_dates(text)
        pesticide_results = extract_pesticide_results(text)

        result = {
            'certificate_number': certificate_number,
            'applicant_name': applicant_info.get('name'),
            'applicant_id_number': applicant_info.get('id_number'),
            'applicant_address': applicant_info.get('address'),
            'applicant_tel': applicant_info.get('tel'),
            'analytical_purpose': test_info.get('purpose'),
            'sample_description': test_info.get('sample'),
            'producer_info': test_info.get('producer'),
            'analyzed_items': test_info.get('items'),
            'sample_quantity': test_info.get('quantity'),
            'test_start_date': test_dates.get('start_date'),
            'test_end_date': test_dates.get('end_date'),
            'analytical_method': test_info.get('method'),
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
    텍스트에서 신청인 정보 추출
    """
    name_pattern = r'신청인.*?성명\(법인의 경우에는 명칭\):\s*([^\n]+)'
    id_pattern = r'법인등록번호:\s*([^\n]+)'
    address_pattern = r'주소\(Address\):\s*([^\n]+)'
    tel_pattern = r'전화번호\(Tel\.\):\s*([^\n]+)'

    info = {}

    name_match = re.search(name_pattern, text, re.DOTALL)
    if name_match:
        info['name'] = name_match.group(1).strip()

    id_match = re.search(id_pattern, text)
    if id_match:
        info['id_number'] = id_match.group(1).strip()

    address_match = re.search(address_pattern, text)
    if address_match:
        info['address'] = address_match.group(1).strip()

    tel_match = re.search(tel_pattern, text)
    if tel_match:
        info['tel'] = tel_match.group(1).strip()

    return info


def extract_test_info(text):
    """
    텍스트에서 검정 정보 추출
    """
    purpose_pattern = r'검정 목적.*?([^\n]+)'
    sample_pattern = r'검정 품목.*?([^\n]+)'
    producer_pattern = r'성명/수거지:\s*([^\n]+)'
    items_pattern = r'검정 항목.*?([^\n]+)'
    quantity_pattern = r'시료 점수 및 중량.*?([^\n]+)'
    method_pattern = r'검정 방법.*?([^\n]+)'

    info = {}

    purpose_match = re.search(purpose_pattern, text)
    if purpose_match:
        info['purpose'] = purpose_match.group(1).strip()

    sample_match = re.search(sample_pattern, text)
    if sample_match:
        info['sample'] = sample_match.group(1).strip()

    producer_match = re.search(producer_pattern, text)
    if producer_match:
        info['producer'] = producer_match.group(1).strip()

    items_match = re.search(items_pattern, text)
    if items_match:
        info['items'] = items_match.group(1).strip()

    quantity_match = re.search(quantity_pattern, text)
    if quantity_match:
        info['quantity'] = quantity_match.group(1).strip()

    method_match = re.search(method_pattern, text)
    if method_match:
        info['method'] = method_match.group(1).strip()

    return info


def extract_test_dates(text):
    """
    텍스트에서 검정 기간 추출
    """
    dates_pattern = r'검정 기간.*?(\d{4}\.\d{2}\.\d{2}\.)\s*~\s*(\d{4}\.\d{2}\.\d{2}\.)'
    dates_match = re.search(dates_pattern, text)

    dates = {}
    if dates_match:
        start_date_str = dates_match.group(1).strip()
        end_date_str = dates_match.group(2).strip()

        # 날짜 형식 변환 (2024.11.14. -> 2024-11-14)
        start_date = start_date_str.replace('.', '-').strip('-')
        end_date = end_date_str.replace('.', '-').strip('-')

        dates['start_date'] = start_date
        dates['end_date'] = end_date

    return dates


def extract_pesticide_results(text):
    """
    텍스트에서 농약 검출 결과 추출
    """
    # 결과 섹션 추출
    results_section_pattern = r'검정\s+결과.*?결과.*?검출량.*?잔류허용기준.*?\n(.*?)※'
    results_section_match = re.search(results_section_pattern, text, re.DOTALL)

    if not results_section_match:
        return []

    results_text = results_section_match.group(1).strip()

    # 개별 결과 추출
    results = []

    # 패턴: 농약명, 검출량, 한국MRL, (수출국MRL), 검토의견
    result_pattern = r'([A-Za-z]+)\s+([\d.]+)\s+([\d.]+)\s+-\s+(적합|부적합)'

    for match in re.finditer(result_pattern, results_text):
        pesticide_name = match.group(1).strip()
        detection_value = match.group(2).strip()
        korea_mrl = match.group(3).strip()
        result_opinion = match.group(4).strip()

        results.append({
            'pesticide_name': pesticide_name,
            'detection_value': detection_value,
            'korea_mrl': korea_mrl,
            'export_country': None,  # 이 샘플에는 수출국 정보가 없음
            'export_mrl': None,  # 이 샘플에는 수출국 MRL 정보가 없음
            'result_opinion': result_opinion
        })

    return results


def verify_pesticide_results(parsing_result):
    """
    파싱된 농약 검출 결과 검증
    """
    if not parsing_result or 'pesticide_results' not in parsing_result:
        return []

    verification_results = []

    for result in parsing_result['pesticide_results']:
        detection_value = decimal.Decimal(result['detection_value'])
        korea_mrl = decimal.Decimal(result['korea_mrl'])

        # 적합/부적합 계산 - 한국 MRL 기준
        calculated_result = '적합' if detection_value <= korea_mrl else '부적합'

        # PDF의 검토의견과 계산된 결과 비교
        is_consistent = (calculated_result == result['result_opinion'])

        verification_results.append({
            'pesticide_name': result['pesticide_name'],
            'detection_value': detection_value,
            'korea_mrl': korea_mrl,
            'export_country': result['export_country'],
            'export_mrl': result['export_mrl'],
            'pdf_result': result['result_opinion'],
            'calculated_result': calculated_result,
            'is_consistent': is_consistent
        })

    return verification_results


def save_certificate_data(parsing_result, verification_result, pdf_file):
    """
    파싱 및 검증 결과를 데이터베이스에 저장
    """
    try:
        # 검정증명서 정보 저장
        certificate = CertificateOfAnalysis(
            certificate_number=parsing_result['certificate_number'],
            applicant_name=parsing_result['applicant_name'],
            applicant_id_number=parsing_result['applicant_id_number'],
            applicant_address=parsing_result['applicant_address'],
            applicant_tel=parsing_result['applicant_tel'],
            analytical_purpose=parsing_result['analytical_purpose'],
            sample_description=parsing_result['sample_description'],
            producer_info=parsing_result['producer_info'],
            analyzed_items=parsing_result['analyzed_items'],
            sample_quantity=parsing_result['sample_quantity'],
            test_start_date=parsing_result['test_start_date'],
            test_end_date=parsing_result['test_end_date'],
            analytical_method=parsing_result['analytical_method'],
            original_file=pdf_file
        )
        certificate.save()

        # 농약 검출 결과 정보 저장
        for result in verification_result:
            pesticide_result = PesticideResult(
                certificate=certificate,
                pesticide_name=result['pesticide_name'],
                detection_value=result['detection_value'],
                korea_mrl=result['korea_mrl'],
                export_country=result['export_country'],
                export_mrl=result['export_mrl'],
                pdf_result=result['pdf_result'],
                calculated_result=result['calculated_result'],
                is_consistent=result['is_consistent']
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