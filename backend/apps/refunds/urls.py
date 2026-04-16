from django.urls import path
from . import views
urlpatterns = [
    path('create/', views.CreateRefundView.as_view()),
    path('my/', views.CustomerRefundListView.as_view()),
    path('admin/all/', views.AdminRefundListView.as_view()),
    path('admin/<int:pk>/update/', views.AdminUpdateRefundView.as_view()),
    path('<int:pk>/choose-method/', views.CustomerChooseRefundMethodView.as_view()),
]
