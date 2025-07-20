# path of this code : pesticide_project/config/settings/local.py

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'findpest.kr', 'www.findpest.kr']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('PGDATABASE', default=''),
        'USER': env('PGUSER', default=''),
        'PASSWORD': env('PGPASSWORD', default=''),
        'HOST': env('PGHOST', default='localhost'),
        'PORT': env('PGPORT', default='5432'),
    }
}

# CORS settings for local development - 모든 오리진 허용
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# 로컬 개발환경에서의 정적 파일 설정
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# 로컬 개발환경에서의 미디어 파일 설정
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Email settings for development (콘솔에 이메일 출력)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 개발 환경에서의 로깅 설정
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
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}

# 개발 편의를 위한 Django Debug Toolbar 설정 (선택사항)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']