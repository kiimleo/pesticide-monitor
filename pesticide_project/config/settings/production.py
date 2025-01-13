# pesticide_project/config/settings/production.py

from .base import *
import dj_database_url

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '[::1]',
    '.railway.app',  # Railway 도메인
    '.onrender.com',  # Render 도메인 추가
    *os.getenv('ALLOWED_HOSTS', '').split(',')  # 추가 도메인이 있는 경우
]

# 미들웨어 설정 - 기존 MIDDLEWARE를 완전히 재정의
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # SecurityMiddleware 바로 다음에 위치
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Railway PostgreSQL 설정
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600
    )
}

# 보안 설정
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False') == 'True'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False') == 'True'
CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False') == 'True'

# 정적 파일 설정
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# whitenoise 설정
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS 설정
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://pesticide-monitor.vercel.app',
    'https://pesticide-monitor-git-main-kiimleos-projects.vercel.app',
    'https://pesticide-monitor-nd08jsh0-kiimleos-projects.vercel.app',
    'https://pesticide-monitor-qy4l0l6e-kiimleos-projects.vercel.app'
]

# FRONTEND_URL 환경변수가 설정되어 있을 때만 추가
if os.getenv('FRONTEND_URL'):
    CORS_ALLOWED_ORIGINS.append(os.getenv('FRONTEND_URL'))

# 로깅 설정
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'WARNING'),
            'propagate': False,
        },
    },
}

ROOT_URLCONF = 'config.urls'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # 이 부분이 중요합니다
    ]
}
