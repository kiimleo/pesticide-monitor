from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
from .serializers import UserSerializer
from .models import User, SearchLog
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

    def get_queryset(self):
        queryset = PesticideLimit.objects.all()

        # 검색어 파라미터 가져오기
        pesticide = self.request.query_params.get('pesticide', None)
        food = self.request.query_params.get('food', None)

        # 농약명 필터 (한글명 또는 영문명)
        if pesticide:
            queryset = queryset.filter(
                Q(pesticide_name_kr__icontains=pesticide) |
                Q(pesticide_name_en__icontains=pesticide)
            )

        # 식품명 필터
        if food:
            queryset = queryset.filter(food_name__iexact=food)  # 식품명이 정확히 일치해야 검색

        # 검색 결과 개수
        results_count = queryset.count()

        # 검색 로그 기록
        if pesticide or food:
            self._log_search(pesticide, food, results_count)

        return queryset

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

def index(request):
    """루트 경로에 접근할 때 표시되는 기본 인덱스 뷰"""
    return HttpResponse("Welcome to the pesticide monitoring application!")

def health_check(request):
    return JsonResponse({"status": "ok"}, status=200)

@csrf_exempt
def create_admin(request):
    User = get_user_model()
    if not User.objects.filter(email='3brothers_daddy@naver.com').exists():
        User.objects.create_superuser(
            email='3brothers_daddy@naver.com',
            password='원하는비밀번호'
        )
        return JsonResponse({"message": "Admin user created successfully"})
    return JsonResponse({"message": "Admin user already exists"})