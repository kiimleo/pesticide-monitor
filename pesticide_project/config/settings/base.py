# path of this code : pesticide_project/config/settings/base.py

import environ
import os
from pathlib import Path

# Initialize environ
env = environ.Env()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Read .env.production file
env_path = BASE_DIR / '.env.production'
environ.Env.read_env(env_path)

# Security settings
SECRET_KEY = env('SECRET_KEY')
PESTICIDE_API_KEY = env('PESTICIDE_API_KEY')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # DRF
    'rest_framework.authtoken',  # Token 인증
    'corsheaders',  # CORS
    'api',  # 우리가 만든 api 앱
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'config.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
AUTH_USER_MODEL = 'api.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}

# Allowed hosts
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', 'findpest.kr', 'www.findpest.kr']

# CORS 기본 설정 (로컬 환경에서는 local.py에서 덮어씀)
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
    'accept',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')    # Gmail 주소
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')    # Gmail 앱 비밀번호 <-- https://myaccount.google.com/apppasswords 여기서생성
DEFAULT_FROM_EMAIL = env('EMAIL_HOST_USER')

# Logging settings - PDF 파싱 라이브러리 로그 완전 제거
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        # pdfminer 관련 모든 로거 비활성화
        'pdfminer': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
        'pdfminer.pdfpage': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
        'pdfminer.pdfinterp': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
        'pdfminer.converter': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
        'pdfminer.layout': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
        'pdfminer.cmapdb': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
        'pdfplumber': {
            'handlers': [],
            'level': 'CRITICAL',
            'propagate': False,
        },
    },
}