from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Review, ReviewImage
from .serializers import ReviewSerializer
from apps.products.models import Product
from apps.orders.models import Order

class ProductReviewsView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['product_id'], is_approved=True).order_by('-created_at')

class CreateReviewView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        is_purchased = Order.objects.filter(user=request.user, items__product=product, payment_status='paid').exists()
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(user=request.user, product=product, is_verified_purchase=is_purchased)
            for img in request.FILES.getlist('images'):
                ReviewImage.objects.create(review=review, image=img)
            return Response(ReviewSerializer(review).data, status=201)
        return Response(serializer.errors, status=400)
