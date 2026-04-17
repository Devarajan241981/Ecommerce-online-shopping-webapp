import os
from pathlib import Path
# load .env into environment so settings can read environment variables
try:
    import environ
    BASE_DIR = Path(__file__).resolve().parent.parent
    ENV = environ.Env()
    # read backend/.env if present
    env_path = BASE_DIR / '.env'
    if env_path.exists():
        # Load local .env but do NOT overwrite existing process environment
        # variables (for example those provided by Docker env_file) so
        # container/service env vars take precedence.
        ENV.read_env(str(env_path), overwrite=False)
except Exception:
    # If django-environ isn't available or reading fails, fall back to os.environ
    BASE_DIR = Path(__file__).resolve().parent.parent
    ENV = None
from datetime import timedelta

# BASE_DIR is set above (either in try or except)

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-clothstore-secret-key-change-in-production')

def _env_truthy(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return str(raw).strip().lower() in {'1', 'true', 't', 'yes', 'y', 'on'}

DEBUG = (ENV.bool('DEBUG', default=False) if ENV is not None else _env_truthy('DEBUG', False))
ALLOWED_HOSTS = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'apps.users',
    'apps.products',
    'apps.orders',
    'apps.payments',
    'apps.coupons',
    'apps.reviews',
    'apps.refunds',
    'apps.wallet',
    'apps.analytics',
    'apps.support',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
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

if ENV is not None:
    _sqlite_default = f"sqlite:///{(BASE_DIR / 'db.sqlite3').as_posix()}"
    DATABASES = {'default': ENV.db('DATABASE_URL', default=_sqlite_default)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# If you have large numbers of uploaded images, you can offload media to Cloudinary.
# Set CLOUDINARY_URL in the environment (example: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)
if ENV is not None:
    CLOUDINARY_URL = ENV.str('CLOUDINARY_URL', default=None)
else:
    CLOUDINARY_URL = os.environ.get('CLOUDINARY_URL')

if CLOUDINARY_URL:
    # add required apps if not already present
    try:
        INSTALLED_APPS += ['cloudinary', 'cloudinary_storage']
    except Exception:
        pass

    # Use Cloudinary for media storage
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    # Optional: you can set a custom media URL, but Cloudinary will serve remote URLs
    MEDIA_URL = '/media/'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# (Production security flags like SECURE_SSL_REDIRECT, HSTS, cookies etc.)
# Configure these via environment or a production settings module when deploying to AWS/GCP.

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

if ENV is not None:
    _default_cors = ['http://localhost:3000', 'http://127.0.0.1:3000']
    CORS_ALLOWED_ORIGINS = ENV.list('CORS_ALLOWED_ORIGINS', default=_default_cors)
    CSRF_TRUSTED_ORIGINS = ENV.list('CSRF_TRUSTED_ORIGINS', default=[])
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
CORS_ALLOW_CREDENTIALS = True

# Ensure FRONTEND_URL (if provided via env) is allowed for CORS
try:
    if ENV is not None:
        frontend_origin = ENV.str('FRONTEND_URL', default=None)
    else:
        frontend_origin = os.environ.get('FRONTEND_URL')
    if frontend_origin:
        frontend_origin = frontend_origin.rstrip('/')
        if frontend_origin not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(frontend_origin)
except Exception:
    pass
# Razorpay
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

# Twilio
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')

FRONTEND_URL = (ENV.str('FRONTEND_URL', default='http://localhost:3000') if ENV is not None else os.environ.get('FRONTEND_URL', 'http://localhost:3000'))

# Comma-separated list of phone numbers (E.164 or local) that are allowed to repeatedly
# re-register / request OTP during development. Example: TEST_PHONE_NUMBERS=+19995551234,9663397727
# Allow a default test number for local development (useful while testing OTP).
# You can override via the environment variable TEST_PHONE_NUMBERS (comma-separated).
_test_nums = [p.strip() for p in os.environ.get('TEST_PHONE_NUMBERS', '').split(',') if p.strip()]
if not _test_nums:
    _test_nums = ['9663397727']
TEST_PHONE_NUMBERS = _test_nums
