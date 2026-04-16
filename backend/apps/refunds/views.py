from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Refund, RefundImage
from .serializers import RefundSerializer
from apps.orders.models import Order
from apps.wallet.models import Wallet

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class CreateRefundView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id, user=request.user)
        refund = Refund.objects.create(
            order=order, user=request.user,
            reason=request.data.get('reason', ''),
            amount=request.data.get('amount', order.total_amount)
        )
        for img in request.FILES.getlist('images'):
            RefundImage.objects.create(refund=refund, image=img)
        return Response(RefundSerializer(refund).data, status=201)

class CustomerRefundListView(generics.ListAPIView):
    serializer_class = RefundSerializer
    def get_queryset(self):
        return Refund.objects.filter(user=self.request.user).order_by('-created_at')

class AdminRefundListView(generics.ListAPIView):
    queryset = Refund.objects.all().order_by('-created_at')
    serializer_class = RefundSerializer
    permission_classes = [IsAdminUser]

class AdminUpdateRefundView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        refund = get_object_or_404(Refund, pk=pk)
        status_val = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')
        refund_method = request.data.get('refund_method')
        if status_val:
            refund.status = status_val
        if admin_notes:
            refund.admin_notes = admin_notes
        if refund_method:
            refund.refund_method = refund_method
        refund.save()
        if status_val == 'processed' and refund_method == 'wallet':
            wallet, _ = Wallet.objects.get_or_create(user=refund.user)
            wallet.credit(refund.amount, f"Refund for Order #{refund.order.order_number}", f"REFUND-{refund.id}")
        return Response(RefundSerializer(refund).data)

class CustomerChooseRefundMethodView(APIView):
    def post(self, request, pk):
        refund = get_object_or_404(Refund, pk=pk, user=request.user, status='approved')
        method = request.data.get('method')
        refund.customer_choice = method
        refund.refund_method = method
        refund.save()
        return Response({'message': f'Refund method set to {method}. Will be processed in 5-7 business days.'})
