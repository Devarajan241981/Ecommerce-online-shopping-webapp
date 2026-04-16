from rest_framework import serializers
from .models import SupportChatSession, SupportChatMessage


class SupportChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportChatMessage
        fields = ['id', 'sender', 'text', 'payload', 'created_at']


class SupportChatSessionSerializer(serializers.ModelSerializer):
    messages = SupportChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = SupportChatSession
        fields = ['id', 'is_active', 'created_at', 'updated_at', 'messages']

