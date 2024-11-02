from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer
from .models import User
from rest_framework.filters import SearchFilter
from django.db.models import Q  # 추가
from .models import LimitConditionCode, PesticideLimit
from .serializers import LimitConditionCodeSerializer, PesticideLimitSerializer


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


class PesticideLimitViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PesticideLimit.objects.all()
    serializer_class = PesticideLimitSerializer
    filter_backends = [SearchFilter]
    search_fields = ['pesticide_name_kr', 'pesticide_name_en', 'food_name']

    def get_queryset(self):
        queryset = PesticideLimit.objects.all()

        # 농약명 필터 (한글명 또는 영문명)
        pesticide = self.request.query_params.get('pesticide', None)
        if pesticide:
            queryset = queryset.filter(
                Q(pesticide_name_kr__icontains=pesticide) |
                Q(pesticide_name_en__icontains=pesticide)
            )

        # 식품명 필터
        food = self.request.query_params.get('food', None)
        if food:
            # queryset = queryset.filter(food_name__icontains=food)   # 식품명이 포함되면 모두 검색
            queryset = queryset.filter(food_name__iexact=food)  # 식품명이 정확히 일치해야 검색

        return queryset