from django.urls import path
from .views import ChatSessionView, SendMessageView, ClearChatView


urlpatterns = [
    path('chat/', ChatSessionView.as_view()),
    path('chat/message/', SendMessageView.as_view()),
    path('chat/clear/', ClearChatView.as_view()),
]

