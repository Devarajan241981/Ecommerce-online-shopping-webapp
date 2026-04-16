from django.urls import path
from . import views
urlpatterns = [
    path('product/<int:product_id>/', views.ProductReviewsView.as_view()),
    path('product/<int:product_id>/create/', views.CreateReviewView.as_view()),
]
