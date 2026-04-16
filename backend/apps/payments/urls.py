from django.urls import path
from . import views
urlpatterns = [
    path('create-order/', views.CreateRazorpayOrderView.as_view()),
    path('verify/', views.VerifyPaymentView.as_view()),
    path('admin/all/', views.AdminPaymentsView.as_view()),
]
