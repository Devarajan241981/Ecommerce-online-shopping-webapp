from django.urls import path
from . import views
urlpatterns = [
    path('dashboard/', views.DashboardStatsView.as_view()),
    path('revenue/', views.RevenueChartView.as_view()),
    path('orders-status/', views.OrderStatusChartView.as_view()),
    path('top-products/', views.TopProductsView.as_view()),
    path('monthly-sales/', views.MonthlySalesView.as_view()),
    path('category-sales/', views.CategorySalesView.as_view()),
]
