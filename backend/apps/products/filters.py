import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    min_discount = django_filters.NumberFilter(field_name='discount_percentage', lookup_expr='gte')
    category = django_filters.NumberFilter(field_name='category__id')
    gender = django_filters.CharFilter(field_name='gender')
    color = django_filters.CharFilter(field_name='variants__color', lookup_expr='icontains')
    size = django_filters.CharFilter(field_name='variants__size')

    class Meta:
        model = Product
        fields = ['gender', 'category', 'is_featured']
