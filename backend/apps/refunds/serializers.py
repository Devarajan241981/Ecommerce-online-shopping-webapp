from rest_framework import serializers
from .models import Refund, RefundImage

class RefundImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RefundImage
        fields = '__all__'

class RefundSerializer(serializers.ModelSerializer):
    images = RefundImageSerializer(many=True, read_only=True)
    class Meta:
        model = Refund
        fields = '__all__'
        read_only_fields = ['user','status','refund_method','admin_notes','created_at','updated_at']
