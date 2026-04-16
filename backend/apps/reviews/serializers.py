from rest_framework import serializers
from .models import Review, ReviewImage
from apps.users.serializers import UserSerializer

class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    images = ReviewImageSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = ['id','user','user_name','product','rating','title','comment',
                  'is_verified_purchase','helpful_count','images','created_at']
        read_only_fields = ['user','is_verified_purchase','helpful_count','created_at']

    def get_user_name(self, obj):
        return obj.user.name
