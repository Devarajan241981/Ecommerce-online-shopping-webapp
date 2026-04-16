from django.db import models
from django.conf import settings


class SupportChatSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_chat_sessions')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"SupportChatSession({self.id}) for {self.user_id}"


class SupportChatMessage(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('babu', 'BABU'),
    ]

    session = models.ForeignKey(SupportChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    text = models.TextField(blank=True)
    payload = models.JSONField(default=dict, blank=True)  # e.g. {options: [...], meta: {...}}
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self) -> str:
        return f"{self.sender} msg {self.id} (session {self.session_id})"

