from django.urls import path
from . import views
urlpatterns = [path('', views.WalletView.as_view())]
