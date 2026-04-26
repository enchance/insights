import os, environ  # noqa
from datetime import timedelta
from pathlib import Path
from corsheaders.defaults import default_headers


BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
  DJANGO_DEBUG=(bool, False),
  DJANGO_SECRET_KEY=(str, "changeme"),
  DJANGO_ALLOWED_HOSTS=(str, "*"),
)
environ.Env.read_env(os.path.join(BASE_DIR.parent, ".env"))

SECRET_KEY = env("DJANGO_SECRET_KEY")
DEBUG = env("DJANGO_DEBUG")
ALLOWED_HOSTS = [h.strip() for h in env("DJANGO_ALLOWED_HOSTS").split(",")]

INSTALLED_APPS = [
  "django.contrib.admin",
  "django.contrib.auth",
  "django.contrib.contenttypes",
  "django.contrib.sessions",
  "django.contrib.messages",
  "django.contrib.staticfiles",
  "rest_framework",
  "drf_spectacular",  # noqa
  "insights",
  'authentication',
]

MIDDLEWARE = [
  "corsheaders.middleware.CorsMiddleware",
  "django.middleware.security.SecurityMiddleware",
  "django.contrib.sessions.middleware.SessionMiddleware",
  "django.middleware.common.CommonMiddleware",
  "django.middleware.csrf.CsrfViewMiddleware",
  "django.contrib.auth.middleware.AuthenticationMiddleware",
  "django.contrib.messages.middleware.MessageMiddleware",
  "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "project.urls"
WSGI_APPLICATION = "project.wsgi.application"

DATABASES = {
  "default": {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": "db.sqlite3",
  }
}

TEMPLATES = [
  {
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {
      "context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
      ],
    },
  },
]

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / 'static'

REST_FRAMEWORK = {
  "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
  'DEFAULT_AUTHENTICATION_CLASSES': [
    'rest_framework_simplejwt.authentication.JWTAuthentication',
    # 'rest_framework.authentication.SessionAuthentication',
    # 'rest_framework.authentication.BasicAuthentication',
  ],
  'DEFAULT_PERMISSION_CLASSES': [
    'rest_framework.permissions.IsAuthenticated',
  ],
  'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
  'PAGE_SIZE': 10,
  'DEFAULT_FILTER_BACKENDS': [
    'django_filters.rest_framework.DjangoFilterBackend',
    'rest_framework.filters.SearchFilter',
    'rest_framework.filters.OrderingFilter',
  ],
  'DEFAULT_RENDERER_CLASSES': [
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
  ],
  'DEFAULT_PARSER_CLASSES': [
    'rest_framework.parsers.JSONParser',
    'rest_framework.parsers.FormParser',
    'rest_framework.parsers.MultiPartParser',
  ],
  'DEFAULT_THROTTLE_CLASSES': [
    'rest_framework.throttling.AnonRateThrottle',
    'rest_framework.throttling.UserRateThrottle',
  ],
  'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',
    'user': '1000/hour',
  },
  'DATETIME_FORMAT': '%Y-%m-%dT%H:%M:%S%z',
  'DATE_FORMAT': '%Y-%m-%d',
  'TIME_FORMAT': '%H:%M:%S',
  'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}

SIMPLE_JWT = {
  'ACCESS_TOKEN_LIFETIME': timedelta(hours=3),
  'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

DJOSER = {
  'TOKEN_MODEL': None,
  'SERIALIZERS': {
    'current_user': 'authentication.serializers.AccountSerializer',
  },
}

SPECTACULAR_SETTINGS = {
  "TITLE": "Insights API",
  "DESCRIPTION": "Minimal API for the take-home exercise skeleton",
  "VERSION": "0.1.0",
}

# CORS
CORS_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "http://localhost:1212",
]

# If you need to send/receive cookies (session auth), enable credentials:
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = (
  "DELETE",
  "GET",
  "OPTIONS",
  "PATCH",
  "POST",
  # "PUT",
)
CORS_ALLOW_HEADERS = (
  *default_headers,
)
