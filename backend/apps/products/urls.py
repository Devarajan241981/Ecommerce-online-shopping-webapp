from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view()),
    path('categories/create/', views.CategoryCreateView.as_view()),
    path('', views.ProductListView.as_view()),
    path('featured/', views.FeaturedProductsView.as_view()),
    path('<slug:slug>/', views.ProductDetailView.as_view()),
    path('admin/all/', views.AdminProductListView.as_view()),
    path('admin/create/', views.AdminProductCreateView.as_view()),
    path('admin/<int:pk>/update/', views.AdminProductUpdateView.as_view()),
    path('admin/<int:product_id>/images/', views.AddProductImageView.as_view()),
    path('admin/images/<int:pk>/delete/', views.DeleteProductImageView.as_view()),
    path('admin/<int:product_id>/variants/', views.ProductVariantView.as_view()),
    path('admin/<int:product_id>/variants/<int:variant_id>/delete/', views.ProductVariantView.as_view()),
    path('admin/<int:product_id>/sizechart/', views.SizeChartView.as_view()),
]
