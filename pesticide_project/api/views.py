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

        # 입력된 식품명이 상위분류인지 확인
        is_category = FoodCategory.objects.filter(
            Q(main_category__iexact=food) | Q(sub_category__iexact=food)
        ).exists()

        if is_category:
            # 상위분류명으로 직접 검색
            category_matches = queryset.filter(food_name__iexact=food)
            if category_matches.exists():
                for match in category_matches:
                    match.matching_type = 'direct'
                    match.original_food = food
                serializer = self.get_serializer(category_matches, many=True)
                return Response(serializer.data)

        # 일반 식품명으로 처리
        food_exists = FoodCategory.objects.filter(food_name__iexact=food).exists()

        if not pesticide_exists or not food_exists:
            return Response({
                "error": "no_match",
                "error_type": "input_error",
                "message": "해당하는 잔류허용기준이 없습니다. 입력하신 내용을 다시 확인해 주세요.",
                "details": {
                    "pesticide_exists": pesticide_exists,
                    "food_exists": food_exists,
                    "searched_pesticide": pesticide,
                    "searched_food": food
                }
            }, status=status.HTTP_404_NOT_FOUND)

        # base_food_name = food.split('(')[0] if '(' in food else food
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

        try:
            category = FoodCategory.objects.get(food_name__iexact=food)
            if category.sub_category:
                sub_matches = queryset.filter(food_name__iexact=category.sub_category)
                if sub_matches.exists():
                    for match in sub_matches:
                        match.matching_type = 'sub'
                        match.original_food_name = food  # original_food -> original_food_name으로 수정
                    serializer = self.get_serializer(sub_matches, many=True)
                    return Response(serializer.data)

            if category.main_category:
                main_matches = queryset.filter(food_name__iexact=category.main_category)
                if main_matches.exists():
                    for match in main_matches:  # <- 여기에 추가
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