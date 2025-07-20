# path of this code : pesticide_project/api/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.db.models import Q, Count, Case, When
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserSerializer, UserSignupSerializer, UserLoginSerializer,
    PasswordResetRequestSerializer, PasswordResetSerializer
)
from .models import User, SearchLog, FoodCategory, PasswordResetToken
from rest_framework.filters import SearchFilter
from .models import LimitConditionCode, PesticideLimit, PesticideDetail
from .serializers import LimitConditionCodeSerializer, PesticideLimitSerializer
from django.http import HttpResponse
from django.http import JsonResponse

from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['signup', 'login', 'password_reset_request', 'password_reset']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'signup':
            return UserSignupSerializer
        elif self.action == 'login':
            return UserLoginSerializer
        elif self.action == 'password_reset_request':
            return PasswordResetRequestSerializer
        elif self.action == 'password_reset':
            return PasswordResetSerializer
        return UserSerializer

    @action(detail=False, methods=['post'])
    def signup(self, request):
        """회원가입"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # 토큰 생성
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'message': '회원가입이 완료되었습니다.',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'organization': user.organization
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        """로그인"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'message': '로그인이 완료되었습니다.',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'organization': user.organization
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """로그아웃"""
        if request.user.is_authenticated:
            try:
                request.user.auth_token.delete()
            except:
                pass
        return Response({'message': '로그아웃이 완료되었습니다.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def password_reset_request(self, request):
        """비밀번호 재설정 요청"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # 기존 토큰 무효화
            PasswordResetToken.objects.filter(user=user, used=False).update(used=True)
            
            # 새 토큰 생성
            reset_token = PasswordResetToken.objects.create(user=user)
            
            # 이메일 전송
            reset_url = f"https://findpest.kr/password-reset/{reset_token.token}"
            
            try:
                send_mail(
                    subject='[FindPest] 비밀번호 재설정',
                    message=f'''안녕하세요, {user.organization}의 {user.email}님

비밀번호 재설정을 요청하셨습니다.
아래 링크를 클릭하여 새 비밀번호를 설정해주세요.

{reset_url}

이 링크는 24시간 동안 유효합니다.
만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시해주세요.

---
FindPest 팀''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return Response({
                    'message': '비밀번호 재설정 링크가 이메일로 전송되었습니다.'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'error': '이메일 전송에 실패했습니다.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def password_reset(self, request):
        """비밀번호 재설정 (토큰 필요)"""
        token_str = request.data.get('token')
        if not token_str:
            return Response({
                'error': '토큰이 필요합니다.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token_str)
            if not reset_token.is_valid():
                return Response({
                    'error': '유효하지 않거나 만료된 토큰입니다.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                user = reset_token.user
                
                # 기존 비밀번호와 동일한지 확인
                new_password = serializer.validated_data['new_password']
                if user.check_password(new_password):
                    return Response({
                        'error': '기존 비밀번호와 동일합니다. 다른 비밀번호를 사용해주세요.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # 비밀번호 변경
                user.set_password(new_password)
                user.save()
                
                # 토큰 사용 처리
                reset_token.used = True
                reset_token.save()
                
                return Response({
                    'message': '비밀번호가 성공적으로 변경되었습니다.'
                }, status=status.HTTP_200_OK)
                
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': '유효하지 않은 토큰입니다.'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """현재 사용자 정보"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class LimitConditionCodeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LimitConditionCode.objects.all()
    serializer_class = LimitConditionCodeSerializer
    pass

def format_log_message(type, **kwargs):
    time = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
    if type == 'search':
        return f"🔍 [Search] {time}, Pesticide: {kwargs['pesticide']}, Food: {kwargs['food']}"
    elif type == 'autocomplete':
        return f"⌨️  [Autocomplete] {time}, Query: {kwargs['query']}"
    elif type == 'detail':
        return f"📋 [Detail] {time}, Pesticide: {kwargs['pesticide']}, Food: {kwargs['food']}"
    return ""


class PesticideLimitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PesticideLimit.objects.all()
    serializer_class = PesticideLimitSerializer
    filter_backends = [SearchFilter]
    search_fields = ['pesticide_name_kr', 'pesticide_name_en', 'food_name']
    permission_classes = [IsAuthenticated]  # 로그인 필수

    def list(self, request):
        pesticide = request.query_params.get('pesticide', '').strip()
        food = request.query_params.get('food', '').strip()
        get_all_foods = request.query_params.get('getAllFoods', '').lower() == 'true'

        # 검색 로그 출력
        if pesticide and food:
            print(format_log_message('search', pesticide=pesticide, food=food))

        pesticide_query = Q(pesticide_name_kr__icontains=pesticide) | Q(pesticide_name_en__icontains=pesticide)
        # queryset = self.queryset.filter(pesticide_query)
        queryset = self.queryset.filter(pesticide_query).select_related('condition_code')

        if get_all_foods and pesticide:
            queryset = queryset.order_by('food_name')
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        if not pesticide or not food:
            raise ValidationError("Both pesticide and food parameters are required")

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
            # 검색 결과가 있는 경우 로깅
            self._log_search(pesticide, food, direct_matches.count())
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

        # 검색 결과가 없는 경우도 로깅 (results_count=0)
        self._log_search(pesticide, food, 0)

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
        try:
            pesticide = request.query_params.get('pesticide')
            food = request.query_params.get('food')

            # 상세정보 로그 출력
            if pesticide and food:
                print(format_log_message('detail', pesticide=pesticide, food=food))

            # 기본 쿼리 실행
            details = PesticideDetail.objects.filter(
                prdlst_kor_nm__icontains=pesticide,
                crops_nm__icontains=food
            ).order_by('-prdlst_reg_dt')

            # 농약성분명으로 그룹화된 데이터 구성
            grouped_data = {}
            for detail in details:
                prdlst_kor_nm = detail.prdlst_kor_nm
                if prdlst_kor_nm not in grouped_data:
                    grouped_data[prdlst_kor_nm] = {
                        'pesticide_name': prdlst_kor_nm,
                        'products': []
                    }

                grouped_data[prdlst_kor_nm]['products'].append({
                    'brand_name': detail.brnd_nm,
                    'purpose': detail.prpos_dvs_cd_nm,
                    'target_pest': detail.sickns_hlsct_nm_weeds_nm,
                    'company': detail.cpr_nm,
                    'reg_date': detail.prdlst_reg_dt
                })

            # 리스트로 변환
            result = list(grouped_data.values())
            return Response(result)

        except Exception as e:
            print(f"Error in get_detail: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _log_search(self, pesticide, food, results_count):
        """검색 로그를 기록하는 내부 메서드"""
        try:
            # 클라이언트 IP 가져오기
            x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = self.request.META.get('REMOTE_ADDR')

            # User Agent 정보 가져오기
            user_agent = self.request.META.get('HTTP_USER_AGENT', '')

            # 검색어 조합
            search_term = f"농약: {pesticide}, 식품: {food}"

            # 검색 로그 저장
            SearchLog.objects.create(
                search_term=search_term,
                pesticide_term=pesticide,
                food_term=food,
                results_count=results_count,
                ip_address=ip,
                user_agent=user_agent
            )

            print(f"Search logged - IP: {ip}, Terms: {search_term}, Results: {results_count}")

        except Exception as e:
            print(f"Error logging search: {str(e)}")

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

        # 자동완성 로그 출력
        if len(query) >= 2:
            print(format_log_message('autocomplete', query=query))

        if len(query) < 2:
            return Response([])

        results = PesticideLimit.objects.filter(
            Q(pesticide_name_kr__icontains=query) |
            Q(pesticide_name_en__icontains=query)
        ).values('pesticide_name_kr', 'pesticide_name_en').distinct()[:10]

        return Response(results)

    @action(detail=False, methods=['GET'])
    def food_autocomplete(self, request):
        query = request.query_params.get('query', '').strip()

        # 자동완성 로그 출력
        if len(query) >= 1: # 한글만 입력해도 자동완성 시도
            print(format_log_message('autocomplete', query=query))

        if len(query) < 1:
            return Response([])

        # PesticideLimit 모델에서 food_name 필드를 검색하여 자동완성 결과 제공
        results = PesticideLimit.objects.filter(
            food_name__icontains=query
        ).values_list('food_name', flat=True).distinct().order_by('food_name')[:10]

        return Response(list(results))

    @action(detail=False, methods=['GET'])
    def find_similar_foods(self, request):
        """파싱된 품목명과 유사한 DB 품목들을 검색하여 반환"""
        parsed_food = request.query_params.get('food', '').strip()
        
        if not parsed_food:
            return Response({'error': '검색할 품목명이 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. 정확한 매칭 먼저 시도
        exact_match = PesticideLimit.objects.filter(
            food_name__iexact=parsed_food
        ).values_list('food_name', flat=True).distinct().first()
        
        if exact_match:
            return Response({
                'exact_match': True,
                'food_name': exact_match
            })
        
        # 2. 부분 매칭으로 유사한 품목들 찾기
        similar_foods = []
        
        # 키워드 추출 및 검색
        import re
        
        # 전체 단어로 검색
        matches = PesticideLimit.objects.filter(
            food_name__icontains=parsed_food
        ).values_list('food_name', flat=True).distinct()[:20]
        
        for match in matches:
            if match not in similar_foods:
                similar_foods.append(match)
        
        # 개별 글자로도 검색 (특히 "열무" -> "무" 같은 경우)
        for char in parsed_food:
            if len(char.strip()) > 0:  # 빈 문자가 아닌 경우
                char_matches = PesticideLimit.objects.filter(
                    food_name__icontains=char
                ).values_list('food_name', flat=True).distinct()[:10]
                
                for match in char_matches:
                    if match not in similar_foods:
                        similar_foods.append(match)
        
        # 키워드 추출 (공백, 특수문자로 분리) - 기존 로직 유지
        keywords = re.findall(r'[가-힣a-zA-Z]+', parsed_food)
        
        for keyword in keywords:
            if len(keyword) >= 2:  # 2글자 이상 키워드만 검색
                keyword_matches = PesticideLimit.objects.filter(
                    food_name__icontains=keyword
                ).values_list('food_name', flat=True).distinct()[:20]
                
                for match in keyword_matches:
                    if match not in similar_foods:
                        similar_foods.append(match)
        
        # 중복 제거 및 정렬
        similar_foods = sorted(list(set(similar_foods)))[:10]
        
        return Response({
            'exact_match': False,
            'parsed_food': parsed_food,
            'similar_foods': similar_foods
        })

    @action(detail=False, methods=['GET'])
    def search_logs(self, request):
        """검색 로그를 조회하는 엔드포인트"""
        # 관리자만 접근 가능하도록 설정
        if not request.user.is_staff:
            return Response({"error": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

        try:
            # 최근 100개 로그 조회
            logs = SearchLog.objects.all().order_by('-timestamp')[:100]

            data = [{
                'timestamp': log.timestamp,
                'ip_address': log.ip_address,
                'search_term': log.search_term,
                'pesticide_term': log.pesticide_term,
                'food_term': log.food_term,
                'results_count': log.results_count,
                'user_agent': log.user_agent
            } for log in logs]

            return Response(data)

        except Exception as e:
            return Response(
                {"error": f"로그 조회 중 오류가 발생했습니다: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def index(request):
    """루트 경로에 접근할 때 표시되는 기본 인덱스 뷰"""
    return HttpResponse("Welcome to the pesticide monitoring application!")

def health_check(request):
    return JsonResponse({"status": "ok"}, status=200)
