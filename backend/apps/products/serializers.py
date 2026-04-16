from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant, SizeChart

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    class Meta:
        model = Category
        fields = '__all__'
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = '__all__'
        extra_kwargs = {
            'product': {'read_only': True},
        }

class SizeChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = SizeChart
        fields = '__all__'

class ProductListSerializer(serializers.ModelSerializer):
    discounted_price = serializers.ReadOnlyField()
    avg_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    primary_image = ProductImageSerializer(read_only=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id','name','slug','category','category_name','gender','base_price',
                  'discount_percentage','discounted_price','is_featured','avg_rating',
                  'review_count','primary_image','brand','created_at']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else ''

class ProductDetailSerializer(serializers.ModelSerializer):
    discounted_price = serializers.ReadOnlyField()
    avg_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    size_chart = SizeChartSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        exclude = ['slug', 'created_at', 'updated_at']
