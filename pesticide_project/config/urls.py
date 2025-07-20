# path of this code : pesticide_project/config/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
   LimitConditionCodeViewSet,
   PesticideLimitViewSet,
   UserViewSet,
   index,
   health_check,
   csrf_token_view,
   test_cors
)
from django.conf import settings
from api import certificate_parser


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
    path('api/csrf/', csrf_token_view, name='csrf-token'),  # CSRF 토큰 엔드포인트
    path('api/test-cors/', test_cors, name='test-cors'),  # CORS 테스트 엔드포인트
    path('api/auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
    path('api/admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API 라우터 포함
    path('api/certificates/upload/', certificate_parser.upload_certificate, name='upload-certificate'),
    
    # React 앱 라우팅 (API 경로가 아닌 모든 경로를 React 앱으로 전달)
    re_path(r'^statistics/?$', TemplateView.as_view(template_name='index.html'), name='statistics'),
    re_path(r'^certificate-analysis/?$', TemplateView.as_view(template_name='index.html'), name='certificate-analysis'),
    
    # 기본 루트 경로
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
]

# 정적 파일 서빙 (React 빌드 파일)
urlpatterns += static('/static/', document_root=settings.STATIC_ROOT)

# DEBUG 모드에서만 Debug Toolbar 추가
if settings.DEBUG:
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns