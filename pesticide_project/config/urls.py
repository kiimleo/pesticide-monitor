"""config URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import LimitConditionCodeViewSet, PesticideLimitViewSet, UserViewSet, index, health_check, create_admin
from django.conf import settings

# Debug Toolbar import 추가
if settings.DEBUG:
    import debug_toolbar

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'conditions', LimitConditionCodeViewSet)
router.register(r'pesticides', PesticideLimitViewSet, basename='pesticide')

# urlpatterns 초기화
urlpatterns = [
    path('health/', health_check),
    path('api/auth/', include('rest_framework.urls')),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('', index, name='index'),  # 루트 URL에 대한 경로 추가
    path('create-admin/', create_admin, name='create_admin'),
]

# DEBUG 모드에서만 Debug Toolbar 추가
if settings.DEBUG:
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
