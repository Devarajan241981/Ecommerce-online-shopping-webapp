from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/refunds/', include('apps.refunds.urls')),
    path('api/wallet/', include('apps.wallet.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/support/', include('apps.support.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
