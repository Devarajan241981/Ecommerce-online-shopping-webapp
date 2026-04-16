from django.urls import path
from . import views
urlpatterns = [
    path('validate/', views.ValidateCouponView.as_view()),
    path('admin/', views.AdminCouponListCreateView.as_view()),
    path('admin/<int:pk>/', views.AdminCouponDetailView.as_view()),
]
