# pesticide_project/config/settings/production.py

from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    'findpest.kr',
    'www.findpest.kr',
    'localhost',
    '127.0.0.1',
    '[::1]',
    '192.168.0.50',  # 내부고정 ip
    '115.139.147.225',  # 외부에서 조회되는 내서버의 고정 ip
    '0.0.0.0'
]


# CORS 설정에 외부 접속 허용
CORS_ALLOWED_ORIGINS = [
    'https://findpest.kr',
    'https://www.findpest.kr',
    'http://localhost:3000',
]

# 미들웨어 설정
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# PostgreSQL 설정
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('PGDATABASE', default='pesticide_db'),
        'USER': env('PGUSER', default=''),
        'PASSWORD': env('PGPASSWORD', default=''),
        'HOST': env('PGHOST', default='localhost'),
        'PORT': env('PGPORT', default='5432'),
    }
}

# 정적 파일 설정
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# React 빌드 파일 경로 추가
REACT_BUILD_DIR = os.path.join(os.path.dirname(BASE_DIR), 'frontend', 'build')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
    os.path.join(REACT_BUILD_DIR, 'static'),  # React 빌드된 정적 파일
]

# 템플릿 설정
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            REACT_BUILD_DIR,  # React 빌드 디렉토리
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

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
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

ROOT_URLCONF = 'config.urls'

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@findpest.kr')

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}