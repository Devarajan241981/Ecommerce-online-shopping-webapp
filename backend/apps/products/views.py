from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Category, Product, ProductImage, ProductVariant, SizeChart
from .serializers import *
from .filters import ProductFilter
from apps.users.models import User
from django.db import transaction
from django.core.files.storage import default_storage

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True).order_by('order')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class CategoryCreateView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'tags', 'brand', 'category__name']
    ordering_fields = ['base_price', 'discount_percentage', 'created_at', 'avg_rating']
    ordering = ['-created_at']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants', 'reviews')

class FeaturedProductsView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(is_active=True, is_featured=True)[:12]

class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True)

class AdminProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAdminUser]

class AdminProductCreateView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # Ensure DB state is atomic and cleanup uploaded files on failure.
        serializer = ProductCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        created_images = []
        product = None
        try:
            with transaction.atomic():
                product = serializer.save()
                images = request.FILES.getlist('images')
                for i, img in enumerate(images):
                    pi = ProductImage.objects.create(product=product, image=img, is_primary=(i == 0), order=i)
                    created_images.append(pi)
                variants_data = request.data.get('variants', '[]')
                import json
                if isinstance(variants_data, str):
                    variants_data = json.loads(variants_data)
                for v in variants_data:
                    ProductVariant.objects.create(product=product, **v)
                # If we reach here, everything saved successfully
                return Response(ProductDetailSerializer(product).data, status=201)
        except Exception as e:
            # rollback DB changes and remove any uploaded files to avoid orphaned media files
            # delete created ProductImage model instances' files
            for pi in created_images:
                try:
                    if pi.image:
                        default_storage.delete(pi.image.name)
                except Exception:
                    pass
                try:
                    pi.delete()
                except Exception:
                    pass
            # delete product record if created
            if product:
                try:
                    product.delete()
                except Exception:
                    pass
            return Response({'detail': str(e)}, status=500)

class AdminProductUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAdminUser]

class AddProductImageView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        images = request.FILES.getlist('images')
        created = []
        for i, img in enumerate(images):
            pi = ProductImage.objects.create(product=product, image=img, order=i)
            created.append(ProductImageSerializer(pi).data)
        return Response(created, status=201)

class DeleteProductImageView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        img = get_object_or_404(ProductImage, pk=pk)
        img.delete()
        return Response(status=204)

class ProductVariantView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def delete(self, request, product_id, variant_id=None):
        v = get_object_or_404(ProductVariant, id=variant_id, product_id=product_id)
        v.delete()
        return Response(status=204)

class SizeChartView(APIView):
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        import json
        chart_data = request.data.get('chart_data', '{}')
        if isinstance(chart_data, str):
            chart_data = json.loads(chart_data)
        sc, _ = SizeChart.objects.update_or_create(
            product=product,
            defaults={'chart_data': chart_data, 'chart_image': request.FILES.get('chart_image')}
        )
        return Response(SizeChartSerializer(sc).data)
