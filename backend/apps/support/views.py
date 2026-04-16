from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction

from .models import SupportChatSession, SupportChatMessage
from .serializers import SupportChatSessionSerializer, SupportChatMessageSerializer
from .babu import generate_babu_response


class ChatSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        session = (
            SupportChatSession.objects.filter(user=request.user, is_active=True)
            .prefetch_related('messages')
            .order_by('-updated_at')
            .first()
        )
        created = False
        if not session:
            created = True
            session = SupportChatSession.objects.create(user=request.user, is_active=True)
            greeting = generate_babu_response(user=request.user, text='', action='menu')
            SupportChatMessage.objects.create(
                session=session,
                sender='babu',
                text=greeting['text'],
                payload={'options': [o for o in greeting.get('options', []) if o], 'meta': greeting.get('meta', {})},
            )
            session.refresh_from_db()

        data = SupportChatSessionSerializer(session).data
        data['created'] = created
        return Response(data)


class SendMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        text = (request.data.get('text') or '').strip()
        action = (request.data.get('action') or '').strip() or None

        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        session = SupportChatSession.objects.filter(id=session_id, user=request.user, is_active=True).first()
        if not session:
            return Response({'error': 'Invalid session'}, status=status.HTTP_400_BAD_REQUEST)

        if not text and not action:
            return Response({'error': 'text or action is required'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            if text:
                SupportChatMessage.objects.create(session=session, sender='user', text=text, payload={})

            reply = generate_babu_response(user=request.user, text=text, action=action)
            babu_msg = SupportChatMessage.objects.create(
                session=session,
                sender='babu',
                text=reply.get('text', ''),
                payload={'options': [o for o in reply.get('options', []) if o], 'meta': reply.get('meta', {})},
            )
            session.save()  # updates updated_at

        return Response({
            'message': SupportChatMessageSerializer(babu_msg).data,
        }, status=201)


class ClearChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        session = (
            SupportChatSession.objects.filter(user=request.user, is_active=True)
            .order_by('-updated_at')
            .first()
        )
        if session:
            session.is_active = False
            session.save(update_fields=['is_active', 'updated_at'])
        new_session = SupportChatSession.objects.create(user=request.user, is_active=True)
        greeting = generate_babu_response(user=request.user, text='', action='menu')
        SupportChatMessage.objects.create(
            session=new_session,
            sender='babu',
            text=greeting['text'],
            payload={'options': [o for o in greeting.get('options', []) if o], 'meta': greeting.get('meta', {})},
        )
        return Response(SupportChatSessionSerializer(new_session).data, status=201)

