# pesticide_project/config/settings/production.py

from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '[::1]',
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
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# CORS 설정
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
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