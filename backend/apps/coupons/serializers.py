from rest_framework import serializers
from django.utils import timezone
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

    def validate_code(self, value):
        if value is None:
            raise serializers.ValidationError('Code is required.')
        value = value.strip().upper()
        if not value:
            raise serializers.ValidationError('Code is required.')
        return value

    def validate(self, attrs):
        if self.instance is None or 'discount_value' in attrs:
            discount_value = attrs.get('discount_value')
            if discount_value is not None and discount_value <= 0:
                raise serializers.ValidationError({'discount_value': 'Must be greater than 0.'})

        if self.instance is None or 'min_order_value' in attrs:
            min_order_value = attrs.get('min_order_value')
            if min_order_value is not None and min_order_value < 0:
                raise serializers.ValidationError({'min_order_value': 'Must be 0 or greater.'})

        if self.instance is None or 'max_discount' in attrs:
            max_discount = attrs.get('max_discount')
            if max_discount is not None and max_discount <= 0:
                raise serializers.ValidationError({'max_discount': 'Must be greater than 0.'})

        if self.instance is None or 'usage_limit' in attrs:
            usage_limit = attrs.get('usage_limit')
            if usage_limit is not None and usage_limit <= 0:
                raise serializers.ValidationError({'usage_limit': 'Must be greater than 0.'})

        if self.instance is None or 'expiry_date' in attrs:
            expiry_date = attrs.get('expiry_date')
            if expiry_date is not None and expiry_date <= timezone.now():
                raise serializers.ValidationError({'expiry_date': 'Must be in the future.'})

        return attrs
