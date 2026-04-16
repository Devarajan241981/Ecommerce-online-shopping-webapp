from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.RegisterView.as_view()),
    path('send-otp/', views.SendOTPView.as_view()),
    path('verify-otp/', views.VerifyOTPView.as_view()),
    path('customer/login/', views.CustomerLoginView.as_view()),
    path('admin/login/', views.AdminLoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('profile/', views.ProfileView.as_view()),
    path('addresses/', views.AddressListCreateView.as_view()),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view()),
    path('admin/customers/', views.AllCustomersView.as_view()),
]
