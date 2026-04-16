from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.CartView.as_view()),
    path('cart/clear/', views.ClearCartView.as_view()),
    path('create/', views.CreateOrderView.as_view()),
    path('', views.OrderListView.as_view()),
    path('<int:pk>/', views.OrderDetailView.as_view()),
    path('<int:pk>/cancel/', views.CancelOrderView.as_view()),
    path('wishlist/', views.WishlistView.as_view()),
    path('wishlist/<int:product_id>/toggle/', views.WishlistToggleView.as_view()),
    path('admin/all/', views.AdminOrderListView.as_view()),
    path('admin/<int:pk>/', views.AdminOrderDetailView.as_view()),
    path('admin/<int:pk>/status/', views.AdminUpdateOrderStatusView.as_view()),
]
