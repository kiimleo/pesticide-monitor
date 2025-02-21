# path of this code : pesticide_project/config/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
   LimitConditionCodeViewSet,
   PesticideLimitViewSet,
   UserViewSet,
   index,
   health_check
)
from django.conf import settings

# Debug Toolbar import 추가
if settings.DEBUG:
    import debug_toolbar

# 라우터 설정
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'conditions', LimitConditionCodeViewSet)
router.register(r'pesticides', PesticideLimitViewSet, basename='pesticide')

# 디버그 출력 코드 제거

urlpatterns = [
    path('health/', health_check),
    path('api/auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
    path('api/admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API 라우터 포함
    path('', index, name='index'),
]

# DEBUG 모드에서만 Debug Toolbar 추가
if settings.DEBUG:
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

# 디버그 출력 코드 제거