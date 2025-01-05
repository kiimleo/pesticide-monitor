# path of this code : C:\Users\leo\pesticide\pesticide_project\api\views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count, Case, When
from django.db.models.functions import Collate
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer
from .models import User, SearchLog, FoodCategory
from rest_framework.filters import SearchFilter
from .models import LimitConditionCode, PesticideLimit
from .serializers import LimitConditionCodeSerializer, PesticideLimitSerializer
from django.http import HttpResponse
from django.http import JsonResponse
from urllib.parse import quote
import requests
from django.conf import settings
import os
import json

from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'signup']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'])
    def signup(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': '회원가입이 완료되었습니다.',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class LimitConditionCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LimitConditionCode.objects.all()
    serializer_class = LimitConditionCodeSerializer
    pass


class PesticideLimitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PesticideLimit.objects.all()
    serializer_class = PesticideLimitSerializer
    filter_backends = [SearchFilter]
    search_fields = ['pesticide_name_kr', 'pesticide_name_en', 'food_name']

    def list(self, request):
        pesticide = request.query_params.get('pesticide', '').strip().replace(' ', '')
        food = request.query_params.get('food', '').strip()
        get_all_foods = request.query_params.get('getAllFoods', '').lower() == 'true'

        pesticide_query = Q(pesticide_name_kr__icontains=pesticide) | Q(pesticide_name_en__icontains=pesticide)
        queryset = self.queryset.filter(pesticide_query)

        if get_all_foods and pesticide:
            queryset = queryset.order_by('food_name')
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        if not pesticide or not food:
            return Response([])

        pesticide_exists = queryset.exists()

        # 먼저 직접 매칭 시도
        direct_matches = queryset.filter(food_name__iexact=food).order_by(
            Case(
                When(food_name__iexact=food, then=0),
                default=1
            ),
            'food_name'
        )

        if direct_matches.exists():
            serializer = self.get_serializer(direct_matches, many=True)
            return Response(serializer.data)

        # 직접 매칭이 없는 경우에만 FoodCategory 확인
        try:
            category = FoodCategory.objects.get(food_name__iexact=food)
            if category.sub_category:
                sub_matches = queryset.filter(food_name__iexact=category.sub_category)
                if sub_matches.exists():
                    for match in sub_matches:
                        match.matching_type = 'sub'
                        match.original_food_name = food
                    serializer = self.get_serializer(sub_matches, many=True)
                    return Response(serializer.data)

            if category.main_category:
                main_matches = queryset.filter(food_name__iexact=category.main_category)
                if main_matches.exists():
                    for match in main_matches:
                        match.matching_type = 'main'
                        match.original_food_name = food
                    serializer = self.get_serializer(main_matches, many=True)
                    return Response(serializer.data)

        except FoodCategory.DoesNotExist:
            pass

        pesticide_info = queryset.first()
        return Response({
            "error": "no_match",
            "error_type": "not_permitted",
            "message": f"'{pesticide}'은(는) '{food}'에 사용이 허가되지 않은 농약성분입니다.",
            "searched_pesticide": pesticide,
            "pesticide_name_kr": pesticide_info.pesticide_name_kr if pesticide_info else pesticide,
            "pesticide_name_en": pesticide_info.pesticide_name_en if pesticide_info else pesticide,
            "searched_food": food
        }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['GET'], url_path='detail')
    def get_detail(self, request):
        pesticide = request.query_params.get('pesticide')  # 한글 농약명
        food = request.query_params.get('food')  # 한글 작물명

        # 영문 농약명 조회
        english_name = PesticideLimit.objects.filter(
            pesticide_name_kr=pesticide
        ).values_list('pesticide_name_en', flat=True).first()

        # API 키 및 설정
        api_key = os.getenv('PESTICIDE_API_KEY')
        service_id = 'I1910'
        base_url = f'http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/json/1/5'

        # URL 구성
        query_params = []
        if pesticide:
            query_params.append(f'PRDLST_KOR_NM={quote(pesticide)}')  # 한글 농약명
        if food:
            query_params.append(f'CROPS_NM={quote(food)}')  # 작물명

        # 최종 URL 생성
        url = f"{base_url}/{'&'.join(query_params)}"

        print(f"Generated URL: {url}")  # 디버깅용 로그

        try:
            # API 호출
            response = requests.get(url)
            response.encoding = 'utf-8'  # UTF-8 설정

            if response.status_code == 200:
                data = response.json()
                print(f"API Response: {data}")  # 응답 데이터 확인
                if 'I1910' in data and 'row' in data['I1910']:
                    return Response(data['I1910']['row'])
                return Response({'message': 'No data found', 'details': data})
            else:
                return Response({'error': f'API error: {response.status_code}'}, status=response.status_code)

        except Exception as e:
            print(f"Exception occurred: {e}")
            return Response({'error': str(e)}, status=500)

    # @action(detail=False, methods=['GET'], url_path='detail')
    # def get_detail(self, request):
    #     pesticide = request.query_params.get('pesticide')
    #     food = request.query_params.get('food')
    #
    #     english_name = PesticideLimit.objects.filter(
    #         pesticide_name_kr=pesticide
    #     ).values_list('pesticide_name_en', flat=True).first()
    #
    #     api_key = os.getenv('PESTICIDE_API_KEY')
    #     service_id = 'I1910'
    #     url = f'http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/json/1/5'
    #
    #     if english_name and food:
    #         url = f'{url}?PRDLST_KOR_NM={quote(english_name)}&CROPS_NM={quote(food)}'
    #     try:
    #         response = requests.get(url)
    #         response.encoding = 'utf-8'
    #
    #         if response.status_code == 200:
    #             data = response.json()
    #             if 'I1910' in data and 'row' in data['I1910']:
    #                 return Response(data['I1910']['row'])
    #             return Response(data)  # 전체 응답 반환
    #         return Response({'error': f'API error: {response.status_code}'}, status=response.status_code)
    #     except Exception as e:
    #         return Response({'error': str(e)}, status=500)

    def _log_search(self, pesticide, food, results_count):
        """검색 로그를 기록하는 내부 메서드"""
        # 클라이언트 IP 가져오기
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')

        # 검색어 조합
        search_term = f"농약: {pesticide if pesticide else '-'}, 식품: {food if food else '-'}"

        # 검색 로그 저장
        SearchLog.objects.create(
            search_term=search_term,
            pesticide_term=pesticide,  # 농약명 입력
            food_term=food,  # 식품명 입력
            results_count=results_count,  # 검색 결과 개수 입력
            ip_address=ip,
            user_agent=self.request.META.get('HTTP_USER_AGENT')
        )

    @action(detail=False, methods=['GET'])
    def search_statistics(self, request):
        """검색 통계를 제공하는 엔드포인트"""
        # 최근 7일간의 데이터만 조회
        last_week = timezone.now() - timedelta(days=7)

        stats = {
            'total_searches': SearchLog.objects.count(),
            'unique_terms': SearchLog.objects.values('search_term').distinct().count(),
            'recent_searches': SearchLog.objects.filter(
                timestamp__gte=last_week
            ).count(),
            'popular_terms': list(SearchLog.objects.values('search_term')
                                  .annotate(count=Count('search_term'))
                                  .order_by('-count')[:10]
                                  ),
            'daily_searches': list(SearchLog.objects.filter(
                timestamp__gte=last_week
            ).values('timestamp__date')
                                   .annotate(count=Count('id'))
                                   .order_by('timestamp__date')
                                   )
        }

        return Response(stats)

    @action(detail=False, methods=['GET'])
    def autocomplete(self, request):
        query = request.query_params.get('query', '').strip()
        if len(query) < 2:
            return Response([])

        results = PesticideLimit.objects.filter(
            Q(pesticide_name_kr__icontains=query) |
            Q(pesticide_name_en__icontains=query)
        ).values('pesticide_name_kr', 'pesticide_name_en').distinct()[:10]

        return Response(results)


def index(request):
    """루트 경로에 접근할 때 표시되는 기본 인덱스 뷰"""
    return HttpResponse("Welcome to the pesticide monitoring application!")

def health_check(request):
    return JsonResponse({"status": "ok"}, status=200)


@csrf_exempt
def create_admin(request):
    try:
        print("Starting admin creation process...")
        User = get_user_model()

        if not User.objects.filter(email='challaforce@gmail.com').exists():
            user = User.objects.create_superuser(
                username='leo',  # username 추가
                email='challaforce@gmail.com',
                password='!q2w3e4r5t'
            )
            return JsonResponse({"message": "Admin user created successfully"})
        return JsonResponse({"message": "Admin user already exists"})

    except Exception as e:
        return JsonResponse({
            "error": str(e),
            "type": type(e).__name__
        }, status=500)
