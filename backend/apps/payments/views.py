from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import F
from .models import Payment
from apps.orders.models import Order, OrderTracking
from apps.coupons.models import Coupon
import razorpay
import hmac, hashlib


def _count_coupon_usage_if_needed(order):
    if not order.coupon_code or not order.discount_amount or order.discount_amount <= 0:
        return
    try:
        Coupon.objects.filter(code__iexact=order.coupon_code).update(used_count=F('used_count') + 1)
    except Exception:
        # Don't fail payment flow because of coupon counter issues.
        return

class CreateRazorpayOrderView(APIView):
    def post(self, request):
        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id, user=request.user)
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        amount_paise = int(order.total_amount * 100)
        if amount_paise == 0:
            if order.payment_status == 'paid':
                return Response({'zero_payment': True, 'order_number': order.order_number})
            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()
            _count_coupon_usage_if_needed(order)
            OrderTracking.objects.create(order=order, status='confirmed', description='Order confirmed. Paid via wallet.')
            return Response({'zero_payment': True, 'order_number': order.order_number})
        rz_order = client.order.create({'amount': amount_paise, 'currency': 'INR', 'receipt': order.order_number})
        payment, _ = Payment.objects.get_or_create(order=order)
        payment.razorpay_order_id = rz_order['id']
        payment.amount = order.total_amount
        payment.save()
        return Response({
            'razorpay_order_id': rz_order['id'],
            'amount': amount_paise,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'order_number': order.order_number,
            'name': request.user.name,
            'email': request.user.email,
            'phone': request.user.phone,
        })

class VerifyPaymentView(APIView):
    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            if payment.status == 'paid':
                return Response({'success': True, 'order_number': payment.order.order_number})
            body = razorpay_order_id + "|" + razorpay_payment_id
            expected_sig = hmac.new(settings.RAZORPAY_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
            if expected_sig == razorpay_signature:
                with transaction.atomic():
                    payment.razorpay_payment_id = razorpay_payment_id
                    payment.razorpay_signature = razorpay_signature
                    payment.status = 'paid'
                    payment.save()
                    order = payment.order
                    if order.payment_status != 'paid':
                        order.payment_status = 'paid'
                        order.status = 'confirmed'
                        order.save()
                        _count_coupon_usage_if_needed(order)
                        OrderTracking.objects.create(order=order, status='confirmed', description='Payment successful. Order confirmed.')
                return Response({'success': True, 'order_number': payment.order.order_number})
            else:
                payment.status = 'failed'
                payment.save()
                return Response({'success': False, 'error': 'Signature mismatch'}, status=400)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=404)

class AdminPaymentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if request.user.role != 'admin':
            return Response(status=403)
        payments = Payment.objects.all().order_by('-created_at')[:100]
        from .serializers import PaymentSerializer
        return Response(PaymentSerializer(payments, many=True).data)
